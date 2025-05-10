'use client';

import { useRef, useState } from 'react';
import DeepgramStreamer from '../lib/deepgram';
import { useDispatch, useSelector } from 'react-redux';
import { createSession, uploadRecording, fetchSoapNotes, setTranscription } from '../store/features/recordingSlice';
import { RootState } from '../store';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [speakerNames, setSpeakerNames] = useState<string[]>(['', '']);
  const [nameFormVisible, setNameFormVisible] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscripts, setFinalTranscripts] = useState<any[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [deepgramEvents, setDeepgramEvents] = useState<any[]>([]);
  const [streamingSoapNotes, setStreamingSoapNotes] = useState<string>('');
  const [mappingData, setMappingData] = useState<Record<string, string>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamerRef = useRef<DeepgramStreamer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const dispatch = useDispatch();
  const { soapData } = useSelector((state: RootState) => state.recording);

  const findClosestSegmentIndex = (target: string, segments: string[]) => {
    const normalize = (text: string) => {
      return text.toLowerCase().replace(/[^a-z\s]/g, '').split(' ').filter(Boolean);
    }
  
    const targetWords = new Set(normalize(target));
    let maxMatches = -1;
    let bestIndex = -1;
  
    segments.forEach((segment, index) => {
      const segmentWords = normalize(segment);
      const matches = segmentWords.filter(word => targetWords.has(word)).length;
  
      if (matches > maxMatches) {
        maxMatches = matches;
        bestIndex = index;
      }
    });
  
    return bestIndex;
  }

  const fields = [
    "Chief Complaint",
    "History of Present Illness",
    "Past Medical History",
    "Family History",
    "Social History",
    "Allergies",
    "Medications",
    "Review of Systems",
    "Vitals",
    "General Appearance",
    "Physical Exam",
    "Additional Observations",
    "Summary of findings",
    "Differential diagnosis",
    "Primary diagnosis"
  ];

  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Speaker name form logic
  const handleNameChange = (idx: number, value: string) => {
    setSpeakerNames((prev) => prev.map((n, i) => (i === idx ? value : n)));
  };

  const handleNameFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionId = Date.now().toString();
    setSessionId(sessionId);
    setNameFormVisible(false);
    
    dispatch(createSession({
      sessionId,
      doctorName: speakerNames[0],
      patientName: speakerNames[1]
    }));
  };

  const startRecording = async () => {
    setInterimTranscript('');
    setAudioUrl(null);
    setDeepgramEvents([]);
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '';
    if (!apiKey || !sessionId) {
      alert('Missing Deepgram API key or sessionId');
      return;
    }
    streamerRef.current = new DeepgramStreamer(apiKey);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(blob));
      
      dispatch(uploadRecording({
        recordingBlob: blob,
        sessionId: sessionId || ''
      }));
    };
    mediaRecorder.start();

    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    await audioContext.audioWorklet.addModule('/pcm-processor.js');
    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
    workletNodeRef.current = workletNode;
    workletNode.port.onmessage = (event) => {
      streamerRef.current?.sendAudio(event.data);
    };
    streamerRef.current.connect((transcript, isFinal, words, fullEvent) => {
      setDeepgramEvents((prev) => [...prev, fullEvent]);
      if (isFinal && fullEvent.channel?.alternatives?.[0]?.transcript) {
        setInterimTranscript('');
        setFinalTranscripts((prev) => [...prev, fullEvent]);
        dispatch(setTranscription({ sessionId, transcriptionData: fullEvent }));
      } else {
        setInterimTranscript(transcript);
      }
    });
    source.connect(workletNode).connect(audioContext.destination);

    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
    workletNodeRef.current?.disconnect();
    audioContextRef.current?.close();
    streamerRef.current?.disconnect();

    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);

    dispatch(createSession({
      sessionId: newSessionId,
      doctorName: speakerNames[0],
      patientName: speakerNames[1]
    }));

    if (sessionId) {
      setStreamingSoapNotes('');
      setMappingData({});
      dispatch(fetchSoapNotes(sessionId));
    }
  };

  const soapHeaders = [
    'Chief Complaint',
    'History of Present Illness',
    'Past Medical History',
    'Family History',
    'Social History',
    'Allergies',
    'Medications',
    'Review of Systems',
    'Vitals',
    'General Appearance',
    'Physical Exam',
    'Additional Observations',
    'Summary of findings',
    'Differential Diagnosis',
    'Primary Diagnosis',
    'Diagnostic Plan',
    'Therapeutic Plan',
    'Patient Education',
    'Follow-up',
    'Differential diagnosis',
    'Summary of Findings',
    'Plan',
  ];
  console.log('highlightedField', highlightedField);
  const shouldHighlightIndex = highlightedField && findClosestSegmentIndex(highlightedField, finalTranscripts.map(event => event.channel?.alternatives?.[0]?.transcript || ''))

  const normalize = (str: string) => str.trim().toLowerCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Asha Health</h1>
            <p className="text-blue-100 mt-1">AI-Powered Medical Transcription</p>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {nameFormVisible ? (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleNameFormSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                      <input 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                        value={speakerNames[0]} 
                        onChange={e => handleNameChange(0, e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                      <input 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                        value={speakerNames[1]} 
                        onChange={e => handleNameChange(1, e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 font-medium"
                  >
                    Start Session
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Recording and Transcription */}
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-8 py-4 rounded-full text-white font-bold transform hover:scale-105 transition-all duration-200 ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                      }`}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 shadow-inner h-[600px] flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Live Transcription</h3>
                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                      {finalTranscripts.length === 0 && !interimTranscript && (
                        <p className="text-gray-500 italic">Say something to begin transcription...</p>
                      )}
                      
                      {finalTranscripts.map((event, idx) => {
                        const transcript = event.channel?.alternatives?.[0]?.transcript || '';
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg shadow-sm ${shouldHighlightIndex === idx ? 'bg-yellow-200' : 'bg-white'}`}
                          >
                            <p className="text-gray-800">{transcript}</p>
                          </div>
                        );
                      })}
                      {interimTranscript && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-gray-500 italic">{interimTranscript}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {audioUrl && (
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <audio src={audioUrl} controls className="w-full" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 shadow-inner h-[600px] flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">SOAP Notes</h3>
                    <div className="prose prose-blue max-w-none overflow-y-auto flex-1 custom-scrollbar">
                      {fields.map(field => (
                        <div key={field} className="mb-6">
                          <h3
                            className={`text-lg font-bold text-black cursor-pointer hover:underline rounded`}
                            onClick={() => {
                              if(soapData[field]?.transcriptionMapping && soapData[field]?.transcriptionMapping !== 'N/A') {
                                setHighlightedField(soapData[field]?.transcriptionMapping);
                              } else {
                                setHighlightedField('');
                              }
                            }}
                          >
                            {field}:
                          </h3>
                          <div>
                            {soapData[field]?.soapNote ? (
                              <p className="text-gray-600">{soapData[field]?.soapNote}</p>
                            ) : (
                              <p className="text-gray-400">...</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
