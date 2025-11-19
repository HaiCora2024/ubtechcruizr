import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import hotelData from "@/data/hotel-data.json";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message: string) => {
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

  return (
    <div className="flex flex-col h-full bg-gradient-mountain rounded-2xl shadow-2xl overflow-hidden border border-border/50">
      <div className="bg-gradient-to-r from-primary to-spa p-6 text-primary-foreground">
        <h2 className="text-2xl font-bold">Hotel Panorama & Spa</h2>
        <p className="text-sm opacity-90 mt-1">Zakopane • Wirtualny Asystent</p>
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
