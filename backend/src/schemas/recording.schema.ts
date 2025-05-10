import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Recording extends Document {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  originalAudioUrl: string;

  @Prop({ type: Object })
  rawTranscription: {
    chunks: Array<{
      startTime: number;
      endTime: number;
      text: string;
      words: Array<{
        word: string;
        start: number;
        end: number;
        confidence: number;
      }>;
    }>;
  };

  @Prop({ type: Object })
  combinedTranscription: {
    text: string;
    words: Array<{
      word: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  };

  @Prop({ type: Object })
  transcriptionWithSpeakers: {
    segments: Array<{
      speaker: string;
      startTime: number;
      endTime: number;
      text: string;
      confidence: number;
    }>;
  };

  @Prop({ type: Object })
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    sourceSegments: Array<{
      section: string;
      text: string;
      sourceSegments: Array<{
        startTime: number;
        endTime: number;
        text: string;
      }>;
    }>;
  };

  @Prop({ type: Boolean, default: false })
  isProcessed: boolean;

  @Prop({ type: Date })
  processedAt: Date;
}

export const RecordingSchema = SchemaFactory.createForClass(Recording); 