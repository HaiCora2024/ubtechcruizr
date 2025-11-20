import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";

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
        toast({
          title: "Błąd",
          description: "Nie udało się przetworzyć zapytania",
          variant: "destructive",
        });
      }
    } else if (!isProcessing && !isSpeaking) {
      await startRecording();
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "Przetwarzam...";
    if (isRecording) return "Nagrywam...";
    return "Naciśnij, aby mówić";
  };

  const getStatusColor = () => {
    if (isProcessing) return "text-amber-500";
    if (isRecording) return "text-destructive";
    return "text-primary";
  };

  return (
    <div className="flex items-center justify-between h-full gap-6 px-8 py-4">
      {/* Left side: Logo and Eyes */}
      <div className="flex flex-col items-center gap-3 w-64">
        <h1 className="text-3xl font-bold text-primary text-center">
          Hotel Panorama & Spa
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Wirtualny Asystent Recepcji
        </p>
        
        {/* Cat Ears - smaller */}
        <div className="flex gap-24 items-center justify-center mt-2">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-foreground/60 transform -rotate-12" />
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-foreground/60 transform rotate-12" />
        </div>

        {/* Cat Eyes - separated */}
        <div className="flex gap-20 items-center justify-center">
          <div className="w-12 h-12 bg-foreground/60 rounded-full flex items-center justify-center">
            <div className={cn(
              "w-6 h-6 bg-background rounded-full transition-all duration-300",
              isSpeaking && "animate-pulse"
            )} />
          </div>
          <div className="w-12 h-12 bg-foreground/60 rounded-full flex items-center justify-center">
            <div className={cn(
              "w-6 h-6 bg-background rounded-full transition-all duration-300",
              isSpeaking && "animate-pulse"
            )} />
          </div>
        </div>
      </div>

      {/* Center: Button with audio indicator */}
      <div className="flex flex-col items-center gap-4 flex-1">
        <div className="relative">
          {(isRecording || isSpeaking) && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-wave" style={{ animationDelay: '0s' }} />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-wave" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-wave" style={{ animationDelay: '0.6s' }} />
            </>
          )}
          
          <Button
            onClick={handleToggleRecording}
            disabled={isLoading || isProcessing}
            className={cn(
              "relative z-10 h-40 w-40 rounded-full transition-all shadow-2xl flex flex-col gap-3",
              isRecording && "bg-destructive hover:bg-destructive/90",
              isProcessing && "bg-amber-500 hover:bg-amber-500/90",
              !isRecording && !isProcessing && "bg-primary hover:bg-primary/90"
            )}
          >
            {isLoading || isProcessing ? (
              <Loader2 className="w-16 h-16 animate-spin text-white" />
            ) : (
              <>
                <Mic className="w-16 h-16 text-white" />
                {isRecording && (
                  <div className="flex gap-1 items-end justify-center h-8">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-white rounded-full transition-all duration-150"
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

        <p className={cn("text-lg font-semibold transition-colors", getStatusColor())}>
          {getStatusText()}
        </p>
      </div>

      {/* Right side: Transcript */}
      <div className="w-80 flex items-center">
        {currentTranscript && (
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border">
            <p className="text-sm text-foreground leading-relaxed">
              {currentTranscript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
