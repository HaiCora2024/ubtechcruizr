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
            "relative z-10 h-[280px] w-[280px] rounded-3xl transition-all shadow-2xl flex flex-col gap-6",
            isRecording
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-gradient-to-br from-primary to-spa hover:opacity-90"
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
