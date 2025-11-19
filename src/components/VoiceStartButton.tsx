import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";

interface VoiceStartButtonProps {
  onStart: () => void;
  onSend: (message: string) => void;
}

export const VoiceStartButton = ({ onStart, onSend }: VoiceStartButtonProps) => {
  const { isRecording, isProcessing, startRecording, stopRecording } = useAudioRecorder();
  const [hasStarted, setHasStarted] = useState(false);

  const handleClick = async () => {
    if (!hasStarted) {
      setHasStarted(true);
      onStart();
      await startRecording();
    } else if (isRecording) {
      try {
        const transcription = await stopRecording();
        if (transcription) {
          onSend(transcription);
        }
      } catch (error) {
        console.error('Voice recording error:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
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
          disabled={isProcessing}
          className={cn(
            "relative z-10 h-[280px] w-[280px] rounded-3xl transition-all shadow-2xl flex flex-col gap-6",
            isRecording
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-gradient-to-br from-primary to-spa hover:opacity-90"
          )}
        >
          {isProcessing ? (
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
    </div>
  );
};
