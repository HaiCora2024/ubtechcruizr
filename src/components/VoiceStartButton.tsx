import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, UtensilsCrossed, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import alpineBackground from "@/assets/alpine-background.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceStartButtonProps {
  onSend?: (message: string) => void;
  isLoading?: boolean;
  lastMessage?: Message | null;
}

export const VoiceStartButton = ({ isLoading }: VoiceStartButtonProps) => {
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const { toast } = useToast();
  const { isRecording, isProcessing, startRecording, stopRecording } = useAudioRecorder();
  const { speak, isSpeaking } = useTextToSpeech();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isRecording) {
      startAudioLevelMonitoring();
    } else {
      stopAudioLevelMonitoring();
    }
    return () => stopAudioLevelMonitoring();
  }, [isRecording]);

  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
    } catch (error) {
      console.error('Error monitoring audio level:', error);
    }
  };

  const stopAudioLevelMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      try {
        const transcribedText = await stopRecording();
        setCurrentTranscript(transcribedText);
        
        const { data, error } = await supabase.functions.invoke('hotel-chat', {
          body: { message: transcribedText }
        });

        if (error) throw error;

        const assistantMessage = data.message;
        setCurrentTranscript(assistantMessage);
        
        await speak(assistantMessage);
        
        setTimeout(() => setCurrentTranscript(""), 5000);
      } catch (error) {
        console.error('Error processing voice:', error);
        // Error is already handled by useAudioRecorder with Polish message
      }
    } else if (!isProcessing && !isSpeaking) {
      await startRecording();
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "Przetwarzam...";
    if (isRecording) return "Słucham...";
    return "Naciśnij, aby mówić";
  };

  const getStatusColor = () => {
    if (isProcessing) return "";
    if (isRecording) return "";
    return "";
  };

  return (
    <div 
      className="flex flex-col h-full relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${alpineBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Header - Logo centered at top */}
      <div className="flex flex-col items-center gap-2 pt-6 pb-4">
        <h1 className="text-4xl font-bold text-white text-center">
          Hotel Panorama & Spa
        </h1>
        <p className="text-lg text-white/90 text-center">
          Wirtualny Asystent Recepcji
        </p>
      </div>

      {/* Main content area */}
      <div className="flex items-center justify-center gap-12 flex-1 px-8">
        {/* Left button - Restauracja */}
        <Button
          onClick={() => {/* TODO: Navigate to restaurant menu */}}
          className="h-32 w-32 rounded-full bg-primary/90 hover:bg-primary flex flex-col gap-2 shadow-2xl"
        >
          <UtensilsCrossed className="w-12 h-12 text-white" />
          <span className="text-white font-semibold">Restauracja</span>
        </Button>

        {/* Center - Main microphone button */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {(isRecording || isSpeaking) && (
              <>
                <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave" style={{ animationDelay: '0s' }} />
                <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave" style={{ animationDelay: '0.3s' }} />
                <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave" style={{ animationDelay: '0.6s' }} />
              </>
            )}
            
            <Button
              onClick={handleToggleRecording}
              disabled={isLoading || isProcessing}
              className={cn(
                "relative z-10 h-48 w-48 rounded-full transition-all shadow-2xl flex flex-col gap-3 border-4",
                isRecording && "bg-destructive hover:bg-destructive/90 border-orange-500",
                isProcessing && "bg-amber-500 hover:bg-amber-500/90 border-orange-500",
                !isRecording && !isProcessing && "bg-primary hover:bg-primary/90 border-orange-500"
              )}
            >
              {isLoading || isProcessing ? (
                <Loader2 className="w-24 h-24 animate-spin text-white" />
              ) : (
                <>
                  <Mic className="w-24 h-24 text-white" />
                  {isRecording && (
                    <div className="flex gap-1 items-end justify-center h-8">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 bg-white rounded-full transition-all duration-150"
                          style={{
                            height: `${Math.max(8, audioLevel * 32 * (1 + Math.sin(Date.now() / 100 + i) * 0.5))}px`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </Button>
          </div>

          <p className={cn("text-xl font-semibold transition-colors text-white", getStatusColor())}>
            {getStatusText()}
          </p>
        </div>

        {/* Right button - Spa & Wellness */}
        <Button
          onClick={() => {/* TODO: Navigate to spa menu */}}
          className="h-32 w-32 rounded-full bg-primary/90 hover:bg-primary flex flex-col gap-2 shadow-2xl"
        >
          <Droplet className="w-12 h-12 text-white" />
          <span className="text-white font-semibold">Spa & Wellness</span>
        </Button>
      </div>

      {/* Transcript at bottom */}
      <div className="px-8 pb-6 flex justify-center">
        {currentTranscript && (
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border max-w-2xl">
            <p className="text-base text-foreground leading-relaxed text-center">
              {currentTranscript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
