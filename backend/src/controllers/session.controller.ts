import {
  Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';
import { SaveRecordingDto } from '../dto/save-recording.dto';
import { SaveDeepgramEventDto } from '../dto/save-deepgram-event.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/sessions')
export class SessionController {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  @Post('recording')
  @UseInterceptors(FileInterceptor('audio'))
  async saveRecording(
    @UploadedFile() file: any,
    @Body() body: any
  ) {
    if (!file) throw new BadRequestException('No audio file provided');
    const { sessionId, speakerNames } = body;
    if (!sessionId || !speakerNames) throw new BadRequestException('Missing sessionId or speakerNames');
    const audioFilePath = path.join('recordings', `${sessionId}.webm`);
    fs.mkdirSync('recordings', { recursive: true });
    fs.writeFileSync(audioFilePath, file.buffer);
    // Save or update session
    let session = await this.sessionModel.findOne({ sessionId });
    if (!session) {
      session = new this.sessionModel({
        sessionId,
        speakerNames: JSON.parse(speakerNames),
        audioFilePath,
        transcriptionData: [],
      });
    } else {
      session.audioFilePath = audioFilePath;
      session.speakerNames = JSON.parse(speakerNames);
    }
    await session.save();
    return { success: true, sessionId };
  }

  @Post('deepgram')
  async saveDeepgramEvent(@Body() body: SaveDeepgramEventDto) {
    const { sessionId, deepgramEvent } = body;
    if (!sessionId || !deepgramEvent) throw new BadRequestException('Missing sessionId or deepgramEvent');
    const session = await this.sessionModel.findOne({ sessionId });
    if (!session) throw new BadRequestException('Session not found');
    session.transcriptionData.push(deepgramEvent);
    await session.save();
    return { success: true };
  }

  @Post()
  async createSession(@Body() body: any) {
    const { sessionId, doctorName, patientName } = body;
    if (!sessionId || !doctorName || !patientName) {
      throw new BadRequestException('Missing sessionId, doctorName, or patientName');
    }
    const session = new this.sessionModel({
      sessionId,
      speakerNames: [
        { role: 'doctor', name: doctorName },
        { role: 'patient', name: patientName }
      ],
      transcriptionData: [],
    });
    await session.save();
    return { success: true, sessionId };
  }
} 