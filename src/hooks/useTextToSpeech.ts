import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { invokeFunction } from "@/integrations/backend/invoke";

// Extend Window interface for RobotBridge
declare global {
  interface Window {
    RobotBridge?: {
      performAction: (gestureName: string) => void;
      performActionWithRepeat: (gestureName: string, loops: number, delay: number) => void;
      turnLightsOn: () => void;
      turnLightsOff: () => void;
    };
  }
}

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = async (text: string, voice: string = "alloy", gesture?: string) => {
    try {
      setIsSpeaking(true);
      console.log("Generating speech for:", text.substring(0, 50));
      console.log("Using gesture:", gesture);

      // ⭐ Запускаем жесты асинхронно с gesture из параметра
      if (typeof window.RobotBridge !== "undefined" && window.RobotBridge?.turnLightsOn) {
        setTimeout(() => {
          try {
            console.log("Activating robot gestures");
            window.RobotBridge!.turnLightsOn();

            // Используем gesture из параметра или fallback
            const selectedGesture = gesture || "talk1";
            console.log("Selected gesture:", selectedGesture);
            window.RobotBridge!.performAction(selectedGesture);
          } catch (error) {
            console.warn("RobotBridge error (non-critical):", error);
          }
        }, 0);
      }

      const { data, error } = await invokeFunction<{ audioContent: string }>("text-to-speech", { text, voice });

      if (error) throw error;
      if (!data?.audioContent) throw new Error("No audioContent in response");

      // Decode base64 and play
      const audioData = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);

      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.log("Speech playback finished");

        // Turn off lights when speech ends
        if (typeof window.RobotBridge !== "undefined" && window.RobotBridge?.turnLightsOff) {
          setTimeout(() => {
            try {
              console.log("Deactivating robot lights");
              window.RobotBridge!.turnLightsOff();
            } catch (error) {
              console.warn("RobotBridge error (non-critical):", error);
            }
          }, 0);
        }
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error("Error playing audio");

        // Turn off lights on error
        if (typeof window.RobotBridge !== "undefined" && window.RobotBridge?.turnLightsOff) {
          setTimeout(() => {
            try {
              window.RobotBridge!.turnLightsOff();
            } catch (error) {
              console.warn("RobotBridge error (non-critical):", error);
            }
          }, 0);
        }
      };

      await audio.play();
      console.log("Playing speech");
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);

      // Turn off lights on error
      if (typeof window.RobotBridge !== "undefined" && window.RobotBridge?.turnLightsOff) {
        setTimeout(() => {
          try {
            window.RobotBridge!.turnLightsOff();
          } catch (error) {
            console.warn("RobotBridge error (non-critical):", error);
          }
        }, 0);
      }

      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować mowy",
        variant: "destructive",
      });
    }
  };

  return { speak, isSpeaking };
};
