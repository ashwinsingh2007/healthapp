# AI Medical Scribe Web App

This is an AI-powered medical scribe system that automatically generates SOAP notes from patient-provider conversations.

## Technical Stack

### Frontend
- Next.js for the web application
- Tailwind CSS for styling
- Redux + Redux-Saga for state management
- Deepgram SDK for live audio streaming and transcription

### Backend
- NestJS framework
- MongoDB for data persistence
- OpenAI API for SOAP note generation
- File system storage for audio files (temporary solution)

## Current Limitations

1. **Speaker Identification Issue**: 
   - Deepgram's live audio streaming has a known bug where speaker identification always returns as "0"
   - This affects the ability to distinguish between doctor and patient in the transcription

## Implementation Flow

1. **Live Recording & Transcription**:
   - User starts recording through the web interface
   - Deepgram SDK streams audio in real-time
   - Transcriptions are sent to backend at regular intervals
   - Audio is saved in the local filesystem (temporary solution until S3 integration)

2. **Post-Recording Processing**:
   - When recording stops, backend processes all saved transcriptions
   - Transcriptions are chunked into 500-word segments
   - Each chunk is processed in parallel:
     - Combined with prompt and example
     - Sent to OpenAI for SOAP note generation
     - Results are aggregated and returned to frontend

3. **Data Management**:
   - Currently not storing OpenAI responses in DB for testing purposes
   - This allows for testing accuracy of the system
   - Future implementation will include response storage for historical data

## Setup

1. Clone the repository:
```bash
git clone git@github.com:ashwinsingh2007/healthapp.git
cd healthapp
```

2. Create environment files:

For backend (`backend/.env`):
```
MONGODB_URI=mongodb://mongodb:27017/asha
OPENAI_API_KEY=<your_openai_api_key>
```

For frontend (`frontend/.env`):
```
NEXT_PUBLIC_DEEPGRAM_API_KEY=<your_deepgram_api_key>
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Build and run the application:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

