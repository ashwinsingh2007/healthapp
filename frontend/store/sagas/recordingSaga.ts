import { takeLatest, put, call } from 'redux-saga/effects';
import { 
  createSession, 
  setError, 
  uploadRecording, 
  uploadRecordingSuccess, 
  uploadRecordingFailure,
  fetchSoapNotes,
  fetchSoapNotesSuccess,
  fetchSoapNotesFailure,
  setTranscription,
  setTranscriptionSuccess,
  setTranscriptionFailure
} from '../features/recordingSlice';
import { SagaIterator } from 'redux-saga';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// API call functions
const createSessionAPI = async (sessionId: string, doctorName: string, patientName: string) => {
  console.log('SAGA: Making API call to create session:', { sessionId, doctorName, patientName });
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, doctorName, patientName })
  });
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
};

const uploadRecordingAPI = async (recordingBlob: Blob, sessionId: string) => {
  console.log('SAGA: Uploading recording for session:', sessionId);
  const formData = new FormData();
  formData.append('recordingBinaryData', recordingBlob);
  formData.append('sessionId', sessionId);

  const response = await fetch(`${API_BASE_URL}/api/recordings`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

const fetchSoapNotesAPI = async (sessionId: string) => {
  console.log('SAGA: Fetching SOAP notes for session:', sessionId);
  const response = await fetch(`${API_BASE_URL}/api/transcriptions/get-soap-notes/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

const saveTranscriptionAPI = async (sessionId: string, transcriptionData: any) => {
  console.log('SAGA: Saving transcription for session:', sessionId);
  const response = await fetch(`${API_BASE_URL}/api/transcriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      transcriptionData
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

// Saga workers
function* handleCreateSession(action: ReturnType<typeof createSession>): SagaIterator {
  try {
    console.log('SAGA: Creating session with data:', action.payload);
    const { sessionId, doctorName, patientName } = action.payload;
    
    // Call API
    const result = yield call(createSessionAPI, sessionId, doctorName, patientName);
    console.log('SAGA: Session created successfully:', result);
    
  } catch (error) {
    console.error('SAGA: Error creating session:', error);
    yield put(setError(error instanceof Error ? error.message : 'Failed to create session'));
  }
}

function* handleUploadRecording(action: ReturnType<typeof uploadRecording>): SagaIterator {
  try {
    console.log('SAGA: Starting recording upload');
    const { recordingBlob, sessionId } = action.payload;
    
    // Call API
    const result = yield call(uploadRecordingAPI, recordingBlob, sessionId);
    console.log('SAGA: Recording uploaded successfully:', result);
    
    // Dispatch success action
    yield put(uploadRecordingSuccess());
    
  } catch (error) {
    console.error('SAGA: Error uploading recording:', error);
    yield put(uploadRecordingFailure(error instanceof Error ? error.message : 'Failed to upload recording'));
  }
}

function* handleFetchSoapNotes(action: ReturnType<typeof fetchSoapNotes>): SagaIterator {
  try {
    console.log('SAGA: Starting SOAP notes fetch');
    const sessionId = action.payload;
    
    // Call API
    const result = yield call(fetchSoapNotesAPI, sessionId);
    console.log('SAGA: SOAP notes fetched successfully:', result);
    
    // Dispatch success action
    yield put(fetchSoapNotesSuccess(result));
    
  } catch (error) {
    console.error('SAGA: Error fetching SOAP notes:', error);
    yield put(fetchSoapNotesFailure(error instanceof Error ? error.message : 'Failed to fetch SOAP notes'));
  }
}

function* handleSetTranscription(action: ReturnType<typeof setTranscription>): SagaIterator {
  try {
    console.log('SAGA: Starting transcription save');
    const { sessionId, transcriptionData } = action.payload;
    
    // Call API
    const result = yield call(saveTranscriptionAPI, sessionId, transcriptionData);
    console.log('SAGA: Transcription saved successfully:', result);
    
    // Dispatch success action
    yield put(setTranscriptionSuccess());
    
  } catch (error) {
    console.error('SAGA: Error saving transcription:', error);
    yield put(setTranscriptionFailure(error instanceof Error ? error.message : 'Failed to save transcription'));
  }
}

// Root saga
export function* recordingSaga(): SagaIterator {
  console.log('SAGA: recordingSaga initialized');
  yield takeLatest(createSession.type, handleCreateSession);
  yield takeLatest(uploadRecording.type, handleUploadRecording);
  yield takeLatest(fetchSoapNotes.type, handleFetchSoapNotes);
  yield takeLatest(setTranscription.type, handleSetTranscription);
} 