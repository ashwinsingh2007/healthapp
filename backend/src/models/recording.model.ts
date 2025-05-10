import { Schema, model } from 'mongoose';

const RecordingSchema = new Schema({
  sessionId: { type: String, required: true },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const RecordingModel = model('Recording', RecordingSchema); 