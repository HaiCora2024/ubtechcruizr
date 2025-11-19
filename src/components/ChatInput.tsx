import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { VoiceButton } from "./VoiceButton";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { isRecording, isProcessing, startRecording, stopRecording } = useAudioRecorder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceRecording = async () => {
    try {
      const transcription = await stopRecording();
      if (transcription) {
        onSend(transcription);
      }
    } catch (error) {
      console.error('Voice recording error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-border bg-background/80 backdrop-blur-sm">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Zadaj pytanie o hotel... (lub użyj mikrofonu)"
        disabled={disabled || isRecording || isProcessing}
        className="min-h-[100px] resize-none text-lg"
        rows={3}
      />
      <VoiceButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onStartRecording={startRecording}
        onStopRecording={handleVoiceRecording}
        disabled={disabled}
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={!message.trim() || disabled || isRecording || isProcessing}
        className="h-[100px] w-[100px] rounded-2xl bg-gradient-to-br from-primary to-spa hover:opacity-90 transition-opacity shadow-lg"
      >
        {disabled ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : (
          <Send className="w-10 h-10" />
        )}
      </Button>
    </form>
  );
};
