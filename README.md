# AI Medical Scribe Web App

This is an AI-powered medical scribe system that automatically generates SOAP notes from patient-provider conversations.

## Features

- Real-time audio recording of medical consultations
- Automatic transcription using Deepgram
- Speaker identification and attribution
- SOAP note generation using AI
- Efficient handling of long conversations (30-40 minutes)
- MongoDB for data persistence

## Prerequisites

- Docker and Docker Compose
- Deepgram API key
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd medical-scribe
```

2. Create a `.env` file in the root directory with the following variables:
```
DEEPGRAM_API_KEY=your_deepgram_api_key
OPENAI_API_KEY=your_openai_api_key
```

3. Build and run the application:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Architecture

### Frontend (Next.js)
- Real-time audio recording
- WebSocket connection for live transcription
- User interface for recording management
- SOAP note display and editing

### Backend (NestJS)
- Audio processing and chunking
- Deepgram integration for transcription
- OpenAI integration for speaker identification and SOAP note generation
- MongoDB for data persistence

### Data Flow
1. Audio recording starts
2. Audio is chunked and sent to Deepgram
3. Transcriptions are combined and processed
4. Speaker identification is performed
5. SOAP note is generated
6. All data is stored in MongoDB

## Development

To run the application in development mode:

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run start:dev
```

## Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
``` 
4f68d9a90d05e825093c4831126813c9ea54b653