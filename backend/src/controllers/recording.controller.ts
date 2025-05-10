import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recording } from '../schemas/recording.schema';

@Controller('api/recordings')
export class RecordingController {
  private readonly tempDir = './temp';

  constructor(
    @InjectModel(Recording.name) private recordingModel: Model<Recording>
  ) {
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('recordingBinaryData', {
    storage: multer.memoryStorage(),
  }))
  async uploadRecording(
    @UploadedFile() file: any,
    @Body() body: any
  ): Promise<{ message: string; soapNote: any }> {
    const { sessionId } = body;
    if (!sessionId || !file || !file.buffer) {
      throw new BadRequestException('Missing sessionId or recordingBinaryData');
    }

    try {
      const audioUrl = await this.saveAudioFile(sessionId, file.buffer);
      // Save sessionId and audioUrl (file path) in MongoDB
      const recording = new this.recordingModel({
        sessionId,
        filePath: audioUrl,
        originalAudioUrl: audioUrl
      });
      await recording.save();
      const soapNote = { subjective: 'Patient reported symptoms', objective: 'No visible issues', assessment: 'Initial assessment', plan: 'Follow up in 2 weeks' };
      return {
        message: `Audio file saved at ${audioUrl}`,
        soapNote,
      };
    } catch (error) {
      throw new BadRequestException('Error saving audio file: ' + error.message);
    }
  }

  private async saveAudioFile(sessionId: string, audioBuffer: Buffer): Promise<string> {
    try {
      const fileName = `${sessionId}-${Date.now()}.webm`;
      const filePath = path.join(this.tempDir, fileName);
      // Write the file to the temp directory using the buffer
      await fs.promises.writeFile(filePath, audioBuffer);
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save audio file: ${error.message}`);
    }
  }
} 