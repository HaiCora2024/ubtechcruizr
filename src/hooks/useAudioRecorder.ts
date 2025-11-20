import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      });
      
      // Try different audio formats in order of preference
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk received:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        }
      };

      // Start with timeslice to get data chunks regularly
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      console.log('Recording started with mimeType:', mimeType);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Błąd",
        description: "Nie można uzyskać dostępu do mikrofonu",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        reject(new Error('No media recorder'));
        return;
      }

      // Check minimum recording duration
      const recordingDuration = Date.now() - recordingStartTimeRef.current;
      const MIN_RECORDING_DURATION = 500; // 500ms minimum
      
      if (recordingDuration < MIN_RECORDING_DURATION) {
        toast({
          title: "Zbyt krótkie nagranie",
          description: "Powiedz jeszcze raz, proszę.",
          variant: "destructive",
        });
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        reject(new Error('Recording too short'));
        return;
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          console.log('Total audio chunks:', audioChunksRef.current.length);
          
          if (audioChunksRef.current.length === 0) {
            throw new Error('No audio data recorded');
          }

          const mimeType = mediaRecorder.mimeType;
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log('Audio blob created - size:', audioBlob.size, 'type:', mimeType);

          if (audioBlob.size < 100) {
            throw new Error('Recording too short or empty');
          }

          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            if (!base64Audio) {
              throw new Error('Failed to convert audio to base64');
            }

            console.log('Sending audio to transcription service, size:', base64Audio.length);

            // Send to Whisper API
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });

            setIsProcessing(false);

            if (error) {
              console.error('Transcription error:', error);
              toast({
                title: "Błąd transkrypcji",
                description: "Powiedz jeszcze raz, proszę.",
                variant: "destructive",
              });
              reject(error);
              return;
            }

            console.log('Transcription result:', data.text);
            resolve(data.text);
          };

          reader.onerror = () => {
            setIsProcessing(false);
            reject(new Error('Failed to read audio file'));
          };
        } catch (error) {
          setIsProcessing(false);
          console.error('Error processing audio:', error);
          toast({
            title: "Błąd",
            description: "Powiedz jeszcze raz, proszę.",
            variant: "destructive",
          });
          reject(error);
        }
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
};
