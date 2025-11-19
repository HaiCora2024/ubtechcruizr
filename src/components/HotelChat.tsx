import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { VoiceStartButton } from "./VoiceStartButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import hotelData from "@/data/hotel-data.json";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const HotelChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Witaj w Hotelu Panorama & Spa! 🏔️ Jestem tutaj, aby odpowiedzieć na Twoje pytania. Jak mogę Ci pomóc?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();
  const { speak, isSpeaking } = useTextToSpeech();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message: string) => {
    setShowChat(true);
    const userMessage: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('hotel-chat', {
        body: { 
          message,
          hotelData 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response if enabled
      if (autoSpeak) {
        await speak(data.response);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessage = "Przepraszam, wystąpił błąd. Spróbuj ponownie.";
      
      if (error.message?.includes('429')) {
        errorMessage = "Osiągnięto limit zapytań. Proszę spróbować za chwilę.";
      } else if (error.message?.includes('402')) {
        errorMessage = "Usługa tymczasowo niedostępna. Skontaktuj się z recepcją.";
      }
      
      toast({
        title: "Błąd",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showChat) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-mountain rounded-2xl shadow-2xl border border-border/50">
        <VoiceStartButton onStart={() => setShowChat(true)} onSend={handleSend} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-mountain rounded-2xl shadow-2xl overflow-hidden border border-border/50">
      <div className="bg-gradient-to-r from-primary to-spa p-6 text-primary-foreground">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Hotel Panorama & Spa</h2>
            <p className="text-sm opacity-90 mt-1">Zakopane • Wirtualny Asystent</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
            title={autoSpeak ? "Wyłącz automatyczne odpowiedzi głosowe" : "Włącz automatyczne odpowiedzi głosowe"}
          >
            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))}
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};
