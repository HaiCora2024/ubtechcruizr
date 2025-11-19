import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceStartButtonProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  lastMessage: Message | null;
}

export const VoiceStartButton = ({ onSend, isLoading, lastMessage }: VoiceStartButtonProps) => {
  const { isRecording, isProcessing, startRecording, stopRecording } = useAudioRecorder();

  const handleClick = async () => {
    if (isRecording) {
      try {
        const transcription = await stopRecording();
        if (transcription) {
          onSend(transcription);
        }
      } catch (error) {
        console.error('Voice recording error:', error);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-spa bg-clip-text text-transparent">
          Hotel Panorama & Spa
        </h1>
        <p className="text-xl text-muted-foreground">
          Wirtualny Asystent Recepcji
        </p>
      </div>

      {/* Cat Ears */}
      <div className="flex gap-32 items-center justify-center mb-[-20px]">
        <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-foreground" />
        <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-foreground" />
      </div>

      {/* Cat Eyes */}
      <div className="flex gap-16 items-center justify-center mb-4">
        <div className="relative">
          <div className={cn(
            "w-20 h-20 bg-foreground rounded-full flex items-center justify-center",
            !isRecording && "animate-blink"
          )}>
            <div className={cn(
              "w-10 h-10 bg-background rounded-full transition-all duration-300",
              isRecording && "animate-pulse"
            )} />
          </div>
        </div>
        <div className="relative">
          <div className={cn(
            "w-20 h-20 bg-foreground rounded-full flex items-center justify-center",
            !isRecording && "animate-blink"
          )}>
            <div className={cn(
              "w-10 h-10 bg-background rounded-full transition-all duration-300",
              isRecording && "animate-pulse"
            )} />
          </div>
        </div>
      </div>
      
      {/* Cat Nose Button */}
      <div className="relative">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-3xl bg-destructive/30 animate-wave" style={{ animationDelay: '0s' }} />
            <div className="absolute inset-0 rounded-3xl bg-destructive/30 animate-wave" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 rounded-3xl bg-destructive/30 animate-wave" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        <Button
          onClick={handleClick}
          disabled={isProcessing || isLoading}
          className={cn(
            "relative z-10 h-[280px] w-[280px] transition-all shadow-2xl flex flex-col gap-6",
            isRecording
              ? "bg-destructive hover:bg-destructive/90 rounded-[50%]"
              : "bg-gradient-to-br from-primary to-spa hover:opacity-90 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
          )}
        >
          {isProcessing || isLoading ? (
            <Loader2 className="w-24 h-24 animate-spin" />
          ) : (
            <>
              <Mic className="w-24 h-24" />
              <span className="text-2xl font-semibold">
                {isRecording ? "Tap to Stop" : "TAP HERE"}
              </span>
            </>
          )}
        </Button>
        
        {/* Cat Whiskers */}
        {!isRecording && (
          <>
            <div className="absolute left-[-80px] top-1/2 w-16 h-1 bg-foreground/30 rounded-full" />
            <div className="absolute left-[-70px] top-[45%] w-14 h-1 bg-foreground/30 rounded-full" />
            <div className="absolute right-[-80px] top-1/2 w-16 h-1 bg-foreground/30 rounded-full" />
            <div className="absolute right-[-70px] top-[45%] w-14 h-1 bg-foreground/30 rounded-full" />
          </>
        )}
      </div>

      {isRecording && (
        <p className="text-lg text-muted-foreground animate-pulse">
          Słucham...
        </p>
      )}

      {lastMessage && lastMessage.role === "assistant" && (
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
            <div className="overflow-hidden">
              <p className="text-lg text-foreground animate-marquee whitespace-nowrap">
                {lastMessage.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
