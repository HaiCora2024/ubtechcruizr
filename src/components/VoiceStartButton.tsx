import { useState } from "react";
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
  const { toast } = useToast();
  const { isRecording, isProcessing, startRecording, stopRecording } = useAudioRecorder();
  const { speak, isSpeaking } = useTextToSpeech();

  const handleStartTalking = async () => {
    if (!isRecording && !isProcessing && !isSpeaking) {
      await startRecording();
    }
  };

  const handleStopTalking = async () => {
    if (isRecording) {
      try {
        const transcribedText = await stopRecording();
        setCurrentTranscript(transcribedText);
        
        // Send to chat
        const { data, error } = await supabase.functions.invoke('hotel-chat', {
          body: { message: transcribedText }
        });

        if (error) throw error;

        const assistantMessage = data.message;
        setCurrentTranscript(assistantMessage);
        
        // Speak the response
        await speak(assistantMessage);
        
        setTimeout(() => setCurrentTranscript(""), 3000);
      } catch (error) {
        console.error('Error processing voice:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось обработать запрос",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-cyan-500">
          Hotel Panorama & Spa
        </h1>
        <p className="text-xl text-muted-foreground">
          Wirtualny Asystent Recepcji
        </p>
      </div>

      {/* Cat Ears */}
      <div className="flex gap-48 items-center justify-center mb-[-20px]">
        <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-foreground transform -rotate-12" />
        <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-foreground transform rotate-12" />
      </div>

      {/* Cat Eyes */}
      <div className="flex gap-16 items-center justify-center mb-4">
        <div className="relative">
          <div className="w-20 h-20 bg-foreground rounded-full flex items-center justify-center">
            <div className={cn(
              "w-10 h-10 bg-background rounded-full transition-all duration-300",
              isSpeaking && "animate-pulse"
            )} />
          </div>
        </div>
        <div className="relative">
          <div className="w-20 h-20 bg-foreground rounded-full flex items-center justify-center">
            <div className={cn(
              "w-10 h-10 bg-background rounded-full transition-all duration-300",
              isSpeaking && "animate-pulse"
            )} />
          </div>
        </div>
      </div>
      
      {/* Cat Nose Button */}
      <div className="relative">
        {(isRecording || isSpeaking) && (
          <>
            <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-wave" style={{ animationDelay: '0s' }} />
            <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-wave" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-wave" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        {/* Shadow under nose */}
        <div className="absolute top-[240px] left-1/2 -translate-x-1/2 w-[200px] h-[60px] bg-foreground/10 rounded-[50%] blur-xl" />
        
        <Button
          onMouseDown={handleStartTalking}
          onMouseUp={handleStopTalking}
          onMouseLeave={handleStopTalking}
          onTouchStart={handleStartTalking}
          onTouchEnd={handleStopTalking}
          disabled={isLoading || isProcessing}
          className={cn(
            "relative z-10 h-[280px] w-[280px] transition-all shadow-2xl flex flex-col gap-6 select-none",
            isRecording
              ? "bg-destructive hover:bg-destructive/90 rounded-[50%]"
              : "bg-gradient-to-br from-zinc-700 via-zinc-600 to-pink-400 hover:opacity-90 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
          )}
        >
          {isLoading || isProcessing ? (
            <Loader2 className="w-24 h-24 animate-spin text-white" />
          ) : (
            <>
              <Mic className="w-24 h-24 text-white" />
              <span className="text-2xl font-semibold text-white">
                {isRecording ? "ГОВОРЮ..." : "ДЕРЖИ"}
              </span>
            </>
          )}
        </Button>
      </div>

      {isRecording && (
        <p className="text-lg text-primary font-semibold animate-pulse">
          Слушаю...
        </p>
      )}

      {isProcessing && (
        <p className="text-lg text-muted-foreground animate-pulse">
          Обрабатываю...
        </p>
      )}

      {isSpeaking && (
        <p className="text-lg text-muted-foreground animate-pulse">
          Отвечает...
        </p>
      )}

      {currentTranscript && (
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50 max-w-4xl mx-auto">
            <p className="text-lg text-foreground text-center">
              {currentTranscript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
