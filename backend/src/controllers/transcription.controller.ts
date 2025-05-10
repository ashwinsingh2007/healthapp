import { Controller, Post, Body, BadRequestException, Param, Get, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcription } from '../schemas/transcription.schema';
import { OpenAI } from 'openai';
import { Response } from 'express';
import { createSoapNotePrompt, exampleTranscript, exampleOutputObj } from '../prompts/soapNotePrompt';

interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word: string;
}

interface TranscriptionData {
  transcript: string;
  confidence: number;
  words: TranscriptionWord[];
  is_final: boolean;
}

@Controller('api/transcriptions')
export class TranscriptionController {
  constructor(
    @InjectModel(Transcription.name) private transcriptionModel: Model<Transcription>,
  ) { }

  @Post()
  async saveTranscription(@Body() body: { sessionId: string; transcriptionData: any }) {
    console.log('Received transcription data:', body);
    const { sessionId, transcriptionData } = body;
    if (!sessionId || !transcriptionData) {
      throw new Error('sessionId and transcriptionData are required');
    }

    // Only save if channel.alternatives[0].words.length > 0
    const words = transcriptionData?.channel?.alternatives?.[0]?.words;
    if (!Array.isArray(words) || words.length === 0) {
      return { message: 'No words to save, skipping transcription.' };
    }

    // Try to find existing transcription by sessionId
    let transcription = await this.transcriptionModel.findOne({ sessionId });
    if (transcription) {
      // Append to transcriptionData array
      transcription.transcriptionData.push(transcriptionData);
      await transcription.save();
    } else {
      // Create new document
      transcription = new this.transcriptionModel({
        sessionId,
        transcriptionData: [transcriptionData],
      });
      await transcription.save();
    }
    return transcription;
  }

  @Get('get-soap-notes/:sessionId')
  async getSoapNotes(@Param('sessionId') sessionId: string, @Res() res: Response) {
    if (!sessionId) {
      throw new BadRequestException('sessionId is required');
    }

    const transcription = await this.transcriptionModel.findOne({ sessionId });
    if (!transcription) {
      throw new BadRequestException('No transcription data found for this sessionId');
    }

    const allWords: string[] = [];
    for (const chunk of transcription.transcriptionData) {
      const chunkWords = chunk?.channel?.alternatives?.[0]?.words;
      if (Array.isArray(chunkWords)) {
        allWords.push(...chunkWords.map((w: any) => w.word));
      }
    }

    // Split into chunks of 500 words
    const wordChunks: string[][] = [];
    for (let i = 0; i < allWords.length; i += 500) {
      wordChunks.push(allWords.slice(i, i + 500));
    }

    const fields = [
      "Chief Complaint",
      "History of Present Illness",
      "Past Medical History",
      "Family History",
      "Social History",
      "Allergies",
      "Medications",
      "Review of Systems",
      "Vitals",
      "General Appearance",
      "Physical Exam",
      "Additional Observations",
      "Summary of findings",
      "Differential diagnosis",
      "Primary diagnosis"
    ];

    const fallbackJson = Object.fromEntries(
      fields.map((field) => [field, { soapNote: "N/A", transcriptionMapping: "N/A" }])
    );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      console.log('wordChunks', wordChunks.length);
      // Call OpenAI for each chunk in parallel
      const results = await Promise.all(
        wordChunks.map(chunk => openai.chat.completions.create({
          model: 'gpt-4',
          stream: false,
          messages: [
            {
              role: 'system',
              content: 'You are a medical assistant. Your job is to return a JSON object with 15 SOAP fields. For each field, output "soapNote" (a summary) and "transcriptionMapping" (verbatim sentence from transcript).'
            },
            {
              role: 'user',
              content: 'Here is a sample transcript:'
            },
            {
              role: 'assistant',
              content: exampleTranscript
            },
            {
              role: 'user',
              content: 'Here is the correct JSON output for that sample:'
            },
            {
              role: 'assistant',
              content: JSON.stringify(exampleOutputObj, null, 2)
            },
            {
              role: 'user',
              content: createSoapNotePrompt(chunk.join(' '))
            }
          ]
        })))


      // Process results
      const merged = { ...fallbackJson };
      for (const field of fields) {
        for (const result of results) {
          const output = result.choices[0].message.content;
          let json: any;
          try {
            json = JSON.parse(output || '{}');
          } catch {
            continue;
          }
          if (
            json &&
            json[field] &&
            json[field].soapNote !== "N/A" &&
            json[field].transcriptionMapping !== "N/A"
          ) {
            merged[field] = json[field];
            break;
          }
        }
      }

      res.status(200).json(merged);
    } catch (err) {
      console.error('OpenAI API error:', err);
      res.status(500).json({ error: 'Failed to generate SOAP note.' });
    }
  }
}
