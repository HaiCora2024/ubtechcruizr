import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export const VoiceButton = ({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  disabled,
}: VoiceButtonProps) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={cn(
        "h-[100px] w-[100px] rounded-2xl transition-all shadow-lg",
        isRecording
          ? "bg-destructive hover:bg-destructive/90 animate-pulse"
          : "bg-accent hover:bg-accent/90"
      )}
    >
      {isProcessing ? (
        <Loader2 className="w-10 h-10 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-10 h-10" />
      ) : (
        <Mic className="w-10 h-10" />
      )}
    </Button>
  );
};
