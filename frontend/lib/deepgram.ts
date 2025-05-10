import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

class DeepgramStreamer {
  private client: ReturnType<typeof createClient>;
  private live: any;
  private isConnected = false;

  constructor(apiKey: string) {
    this.client = createClient(apiKey);
  }

  connect(onTranscript: (transcript: string, isFinal?: boolean, words?: any[], fullEvent?: any) => void) {
    this.live = this.client.listen.live({
      model: 'nova-3',
      language: 'en',
      punctuate: true,
      smart_format: true,
      interim_results: true,
      encoding: 'linear16',
      sample_rate: 16000,
      endpointing: 1000,
      diarize: true,
      channels: 1,
    });

    this.live.on(LiveTranscriptionEvents.Open, () => {
      this.isConnected = true;
    });

    this.live.on(LiveTranscriptionEvents.Close, () => {
      this.isConnected = false;
    });

    this.live.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const alternatives =
        data.channel?.alternatives ||
        data.channels?.[0]?.alternatives ||
        data.channel_index?.[0]?.alternatives ||
        [];
      const transcript = alternatives[0]?.transcript || '';
      const isFinal = data.is_final === true;
      const words = alternatives[0]?.words || [];
      onTranscript(transcript, isFinal, words, data);
    });

    this.live.on(LiveTranscriptionEvents.Error, (err: any) => {
      console.error('Deepgram error:', err);
      this.isConnected = false;
    });
  }

  sendAudio(buffer: ArrayBuffer) {
    if (this.isConnected && this.live) {
      this.live.send(buffer);
    }
  }

  disconnect() {
    if (this.live) {
      this.live.requestClose();
      this.isConnected = false;
    }
  }
}

export default DeepgramStreamer;