import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface TranscriptionData {
  sessionId: string;
  transcriptionData: any;
}

export interface RecordingState {
  sessionId: string | null;
  doctorName: string;
  patientName: string;
  isRecording: boolean;
  interimTranscript: string;
  finalTranscripts: any[];
  soapNotes: string;
  error: string | null;
  isUploading: boolean;
  isFetchingSoapNotes: boolean;
  soapData: Record<string, { soapNote: string; transcriptionMapping: string }>;
  isSavingTranscription: boolean;
}

// Initial state
const initialState: RecordingState = {
  sessionId: null,
  doctorName: '',
  patientName: '',
  isRecording: false,
  interimTranscript: '',
  finalTranscripts: [],
  soapNotes: '',
  error: null,
  isUploading: false,
  isFetchingSoapNotes: false,
  soapData: {},
  isSavingTranscription: false,
};

// Create slice
const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    createSession: (state, action: PayloadAction<{ sessionId: string; doctorName: string; patientName: string }>) => {
      state.sessionId = action.payload.sessionId;
      state.doctorName = action.payload.doctorName;
      state.patientName = action.payload.patientName;
      state.error = null;
    },
    uploadRecording: (state, action: PayloadAction<{ recordingBlob: Blob; sessionId: string }>) => {
      state.isUploading = true;
      state.error = null;
    },
    uploadRecordingSuccess: (state) => {
      state.isUploading = false;
      state.error = null;
    },
    uploadRecordingFailure: (state, action: PayloadAction<string>) => {
      state.isUploading = false;
      state.error = action.payload;
    },
    fetchSoapNotes: (state, action: PayloadAction<string>) => {
      state.isFetchingSoapNotes = true;
      state.error = null;
    },
    fetchSoapNotesSuccess: (state, action: PayloadAction<Record<string, { soapNote: string; transcriptionMapping: string }>>) => {
      state.isFetchingSoapNotes = false;
      state.soapData = action.payload;
      state.error = null;
    },
    fetchSoapNotesFailure: (state, action: PayloadAction<string>) => {
      state.isFetchingSoapNotes = false;
      state.error = action.payload;
    },
    setTranscription: (state, action: PayloadAction<TranscriptionData>) => {
      state.isSavingTranscription = true;
      state.error = null;
    },
    setTranscriptionSuccess: (state) => {
      state.isSavingTranscription = false;
      state.error = null;
    },
    setTranscriptionFailure: (state, action: PayloadAction<string>) => {
      state.isSavingTranscription = false;
      state.error = action.payload;
    },
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setInterimTranscript: (state, action: PayloadAction<string>) => {
      state.interimTranscript = action.payload;
    },
    setFinalTranscripts: (state, action: PayloadAction<any[]>) => {
      state.finalTranscripts = action.payload;
    },
    setSoapNotes: (state, action: PayloadAction<string>) => {
      state.soapNotes = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  createSession,
  uploadRecording,
  uploadRecordingSuccess,
  uploadRecordingFailure,
  fetchSoapNotes,
  fetchSoapNotesSuccess,
  fetchSoapNotesFailure,
  setTranscription,
  setTranscriptionSuccess,
  setTranscriptionFailure,
  setRecording,
  setInterimTranscript,
  setFinalTranscripts,
  setSoapNotes,
  setError,
} = recordingSlice.actions;

export const recordingReducer = recordingSlice.reducer; 