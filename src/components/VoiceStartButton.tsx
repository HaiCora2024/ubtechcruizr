import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import { useToast } from "@/hooks/use-toast";

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
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const chatRef = useRef<RealtimeChat | null>(null);
  const { toast } = useToast();

  const handleMessage = (event: any) => {
    console.log('Received message type:', event.type);
    
    if (event.type === 'response.audio_transcript.delta') {
      setCurrentTranscript(prev => prev + event.delta);
      setIsSpeaking(true);
    } else if (event.type === 'response.audio_transcript.done') {
      setIsSpeaking(false);
    } else if (event.type === 'response.done') {
      setTimeout(() => setCurrentTranscript(""), 3000);
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(
        handleMessage,
        () => {
          setIsConnected(true);
          toast({
            title: "Подключено",
            description: "Говорите с ассистентом",
          });
        },
        () => {
          setIsConnected(false);
          setIsSpeaking(false);
          setCurrentTranscript("");
        }
      );
      
      await chatRef.current.init();
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось начать разговор',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
  };

  const handleClick = () => {
    if (isConnected) {
      endConversation();
    } else {
      startConversation();
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
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-wave" style={{ animationDelay: '0s' }} />
            <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-wave" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-wave" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        {/* Shadow under nose */}
        {!isConnected && (
          <div className="absolute top-[240px] left-1/2 -translate-x-1/2 w-[200px] h-[60px] bg-foreground/10 rounded-[50%] blur-xl" />
        )}
        
        <Button
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "relative z-10 h-[280px] w-[280px] transition-all shadow-2xl flex flex-col gap-6",
            isConnected
              ? "bg-destructive hover:bg-destructive/90 rounded-[50%]"
              : "bg-gradient-to-br from-zinc-700 via-zinc-600 to-pink-400 hover:opacity-90 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-24 h-24 animate-spin text-white" />
          ) : (
            <>
              <Mic className="w-24 h-24 text-white" />
              <span className="text-2xl font-semibold text-white">
                {isConnected ? "STOP" : "TAP HERE"}
              </span>
            </>
          )}
        </Button>
        
        {/* Cat Whiskers */}
        {!isConnected && (
          <>
            <div className="absolute left-[-80px] top-1/2 w-16 h-1 bg-foreground/30 rounded-full" />
            <div className="absolute left-[-70px] top-[45%] w-14 h-1 bg-foreground/30 rounded-full" />
            <div className="absolute right-[-80px] top-1/2 w-16 h-1 bg-foreground/30 rounded-full" />
            <div className="absolute right-[-70px] top-[45%] w-14 h-1 bg-foreground/30 rounded-full" />
          </>
        )}
      </div>

      {isSpeaking && (
        <p className="text-lg text-muted-foreground animate-pulse">
          Говорит...
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
