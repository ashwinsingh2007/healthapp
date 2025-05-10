import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ type: [{ role: String, name: String }], required: true })
  speakerNames: { role: string; name: string }[];

  @Prop()
  audioFilePath: string;

  @Prop({ type: [Object], default: [] })
  transcriptionData: any[];
}

export const SessionSchema = SchemaFactory.createForClass(Session); 