import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, UtensilsCrossed, Droplet, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { invokeFunction } from "@/integrations/backend/invoke";
import hotelBackground from "@/assets/hotel-background.webp";
import { RestaurantMenu } from "./RestaurantMenu";
import { SpaMenu } from "./SpaMenu";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceStartButtonProps {
  onSend?: (message: string) => void;
  isLoading?: boolean;
  lastMessage?: Message | null;
}

type ViewMode = "main" | "restaurant" | "spa";

export const VoiceStartButton = ({ isLoading }: VoiceStartButtonProps) => {
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("main");
  // ⭐ НОВОЕ: История разговора для контекста
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
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
      console.error("Error monitoring audio level:", error);
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

        // ⭐ ИЗМЕНЕНО: Передаём историю разговора
        const { data, error } = await invokeFunction<any>("hotel-chat", {
          message: transcribedText,
          history: conversationHistory, // ← Передаём весь контекст!
        });

        if (error) throw error;

        // Parse response - может быть JSON с gesture
        let assistantMessage = "";
        let gesture = "talk1"; // default

        if (typeof data.message === "string") {
          assistantMessage = data.message;
        } else {
          assistantMessage = data.message || data.text || "Przepraszam, nie zrozumiałem.";
        }

        // Если есть gesture в ответе - используем его
        if (data.gesture) {
          gesture = data.gesture;
        }

        setCurrentTranscript(assistantMessage);

        // ⭐ НОВОЕ: Сохраняем историю разговора
        const newHistory = [
          ...conversationHistory,
          { role: "user", content: transcribedText },
          { role: "assistant", content: assistantMessage },
        ];
        setConversationHistory(newHistory);

        console.log("Conversation history updated:", newHistory.length, "messages");

        // Передаём gesture в speak()
        await speak(assistantMessage, "alloy", gesture);

        setTimeout(() => setCurrentTranscript(""), 5000);
      } catch (error) {
        console.error("Error processing voice:", error);
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

  // Handle view mode changes
  if (viewMode === "restaurant") {
    return <RestaurantMenu onBack={() => setViewMode("main")} />;
  }

  if (viewMode === "spa") {
    return <SpaMenu onBack={() => setViewMode("main")} />;
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${hotelBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header - Logo centered at top */}
      <div className="flex flex-col items-center gap-2 pt-6 pb-4">
        <h1 className="text-4xl font-bold text-white text-center">Hotel Gołębiewski Mikołajki</h1>
        <p className="text-lg text-white/90 text-center">Wirtualny Asystent Recepcji</p>
      </div>

      {/* Main content area */}
      <div className="flex items-center justify-center gap-12 flex-1 px-8">
        {/* Left button - Restauracja */}
        <Button
          onClick={() => setViewMode("restaurant")}
          className="h-32 w-32 rounded-full bg-primary/90 hover:bg-primary flex flex-col gap-2 shadow-2xl hover-scale"
        >
          <UtensilsCrossed className="w-12 h-12 text-white" />
          <span className="text-white font-semibold">Restauracja</span>
        </Button>

        {/* Center - Main microphone button */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {(isRecording || isSpeaking) && (
              <>
                <div
                  className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave"
                  style={{ animationDelay: "0.3s" }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave"
                  style={{ animationDelay: "0.6s" }}
                />
              </>
            )}

            <Button
              onClick={handleToggleRecording}
              disabled={isLoading || isProcessing}
              className={cn(
                "relative z-10 h-48 w-48 rounded-full transition-all shadow-2xl flex flex-col gap-3 border-4",
                isRecording && "bg-destructive hover:bg-destructive/90 border-orange-500",
                isProcessing && "bg-amber-500 hover:bg-amber-500/90 border-orange-500",
                !isRecording && !isProcessing && "bg-primary hover:bg-primary/90 border-orange-500",
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

            {/* Green checkmark badge — hints user to tap again to finish */}
            {isRecording && (
              <div className="absolute -bottom-1 -right-1 z-20 bg-green-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          <p className={cn("text-xl font-semibold transition-colors text-white", getStatusColor())}>
            {getStatusText()}
          </p>
        </div>

        {/* Right button - Spa & Wellness */}
        <Button
          onClick={() => setViewMode("spa")}
          className="h-32 w-32 rounded-full bg-primary/90 hover:bg-primary flex flex-col gap-2 shadow-2xl hover-scale"
        >
          <Droplet className="w-12 h-12 text-white" />
          <span className="text-white font-semibold">Spa & Wellness</span>
        </Button>
      </div>

      {/* Transcript at bottom */}
      <div className="px-8 pb-6 flex justify-center">
        {currentTranscript && (
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border max-w-2xl">
            <p className="text-base text-foreground leading-relaxed text-center">{currentTranscript}</p>
          </div>
        )}
      </div>
    </div>
  );
};
