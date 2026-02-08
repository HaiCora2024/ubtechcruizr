import { invokeFunction } from "@/integrations/backend/invoke";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private audioTrack: MediaStreamTrack | null = null;

  constructor(
    private onMessage: (message: any) => void,
    private onConnect: () => void,
    private onDisconnect: () => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      console.log('Initializing Realtime chat...');
      
      // Get ephemeral token
      const { data, error } = await invokeFunction<any>("realtime-token");
      
      if (error || !data) {
        throw new Error("Failed to get ephemeral token: " + (error?.message || 'No data'));
      }

      if (!data.client_secret?.value) {
        throw new Error("No client secret in response");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('Got ephemeral token');

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio
      this.pc.ontrack = e => {
        console.log('Received remote audio track');
        this.audioEl.srcObject = e.streams[0];
      };

      // Get microphone but keep it muted initially
      const ms = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioTrack = ms.getTracks()[0];
      this.audioTrack.enabled = false; // Start muted
      this.pc.addTrack(this.audioTrack);
      console.log('Added local audio track (muted)');

      // Set up data channel
      this.dc = this.pc.createDataChannel("oai-events");
      
      this.dc.addEventListener("open", () => {
        console.log('Data channel opened');
        this.onConnect();
      });
      
      this.dc.addEventListener("close", () => {
        console.log('Data channel closed');
        this.onDisconnect();
      });
      
      this.dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Received event:", event.type);
          this.onMessage(event);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      console.log('Created offer');

      // Connect to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

    } catch (error) {
      console.error("Error initializing chat:", error);
      this.onDisconnect();
      throw error;
    }
  }

  enableMicrophone() {
    if (this.audioTrack) {
      this.audioTrack.enabled = true;
      console.log('Microphone enabled');
    }
  }

  disableMicrophone() {
    if (this.audioTrack) {
      this.audioTrack.enabled = false;
      console.log('Microphone disabled');
    }
  }

  disconnect() {
    console.log('Disconnecting...');
    if (this.audioTrack) {
      this.audioTrack.stop();
      this.audioTrack = null;
    }
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
    this.onDisconnect();
  }
}
