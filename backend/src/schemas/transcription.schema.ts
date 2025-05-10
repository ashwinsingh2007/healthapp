import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Transcription extends Document {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ type: [Object], required: true, default: [] })
  transcriptionData: any[];
}

export const TranscriptionSchema = SchemaFactory.createForClass(Transcription); 