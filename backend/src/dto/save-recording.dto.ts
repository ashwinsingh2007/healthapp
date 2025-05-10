import { IsString, IsArray } from 'class-validator';

export class SaveRecordingDto {
  @IsString()
  sessionId: string;

  @IsArray()
  speakerNames: { role: string; name: string }[];
} 