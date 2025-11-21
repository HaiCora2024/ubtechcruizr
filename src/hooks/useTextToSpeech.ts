import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

// Select gesture based on text content
const selectGesture = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  // Greetings
  if (lowerText.includes('witaj') || lowerText.includes('cześć') || lowerText.includes('dzień dobry')) {
    return 'swingarm'; // wave
  }
  
  // Positive/celebration
  if (lowerText.includes('gratulacje') || lowerText.includes('świetnie') || lowerText.includes('brawo')) {
    return 'celebrate';
  }
  
  // Questions/searching
  if (lowerText.includes('?') || lowerText.includes('szukam') || lowerText.includes('gdzie')) {
    return 'searching';
  }
  
  // Goodbye
  if (lowerText.includes('do widzenia') || lowerText.includes('żegnaj')) {
    return 'goodbye';
  }
  
  // Directions
  if (lowerText.includes('prawo')) {
    return 'guideright';
  }
  if (lowerText.includes('lewo')) {
    return 'guideleft';
  }
  
  // Surprise
  if (lowerText.includes('wow') || lowerText.includes('niesamowite')) {
    return 'surprise';
  }
  
  // Default talking gestures
  const talkGestures = ['talk1', 'talk2', 'talk3', 'talk5', 'talk8'];
  return talkGestures[Math.floor(Math.random() * talkGestures.length)];
};

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = async (text: string, voice: string = 'alloy') => {
    try {
      setIsSpeaking(true);
      console.log('Generating speech for:', text.substring(0, 50));

      // Turn on lights and perform gesture when starting to speak
      if (typeof window.RobotBridge !== 'undefined' && window.RobotBridge?.turnLightsOn) {
        try {
          console.log('Activating robot gestures');
          window.RobotBridge.turnLightsOn();
          const gesture = selectGesture(text);
          console.log('Selected gesture:', gesture);
          window.RobotBridge.performAction(gesture);
        } catch (error) {
          console.warn('RobotBridge error (non-critical):', error);
        }
      }

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      // Decode base64 and play
      const audioData = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.log('Speech playback finished');
        
        // Turn off lights when speech ends
        if (typeof window.RobotBridge !== 'undefined' && window.RobotBridge?.turnLightsOff) {
          try {
            console.log('Deactivating robot lights');
            window.RobotBridge.turnLightsOff();
          } catch (error) {
            console.warn('RobotBridge error (non-critical):', error);
          }
        }
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error('Error playing audio');
        
        // Turn off lights on error
        if (typeof window.RobotBridge !== 'undefined' && window.RobotBridge?.turnLightsOff) {
          try {
            window.RobotBridge.turnLightsOff();
          } catch (error) {
            console.warn('RobotBridge error (non-critical):', error);
          }
        }
      };

      await audio.play();
      console.log('Playing speech');

    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      
      // Turn off lights on error
      if (typeof window.RobotBridge !== 'undefined' && window.RobotBridge?.turnLightsOff) {
        try {
          window.RobotBridge.turnLightsOff();
        } catch (error) {
          console.warn('RobotBridge error (non-critical):', error);
        }
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
