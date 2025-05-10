import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { RecordingController } from './controllers/recording.controller';
import { TranscriptionController } from './controllers/transcription.controller';
import { SessionController } from './controllers/session.controller';
import { Recording, RecordingSchema } from './schemas/recording.schema';
import { Transcription, TranscriptionSchema } from './schemas/transcription.schema';
import { Session, SessionSchema } from './schemas/session.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Recording.name, schema: RecordingSchema },
      { name: Transcription.name, schema: TranscriptionSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    MulterModule.register({
      dest: '/tmp',
    }),
  ],
  controllers: [RecordingController, TranscriptionController, SessionController],
})
export class AppModule {}
