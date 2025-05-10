import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable the default body parser
  });
  
  // Enable CORS for the frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });
  
  // Configure raw body parsing for the recordings endpoint
  app.use('/api/recordings', json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
    type: 'audio/webm',
  }));

  // Enable JSON body parsing for /api/transcriptions and /api/sessions
  app.use('/api/transcriptions', json());
  app.use('/api/sessions', json());
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Start the server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
