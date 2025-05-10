import { IsString, IsObject } from 'class-validator';

export class SaveDeepgramEventDto {
  @IsString()
  sessionId: string;

  @IsObject()
  deepgramEvent: any;
} 