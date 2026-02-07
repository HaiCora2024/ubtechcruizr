import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import foodBreakfast from "@/assets/food-breakfast.jpg";
import foodSoup from "@/assets/food-soup.jpg";
import foodMain from "@/assets/food-main.jpg";
import foodDessert from "@/assets/food-dessert.jpg";

interface RestaurantMenuProps {
  onBack: () => void;
}

const menuItems = [
  {
    category: "Śniadania / Breakfast",
    image: foodBreakfast,
    items: [
      { name: "Jajecznica na maśle", name_en: "Scrambled eggs", price: "28 PLN" },
      { name: "Omlet z warzywami", name_en: "Vegetable omelette", price: "32 PLN" },
      { name: "Naleśniki z serem", name_en: "Pancakes with cheese", price: "26 PLN" },
      { name: "Owsianka z owocami", name_en: "Oatmeal with fruits", price: "24 PLN" },
    ]
  },
  {
    category: "Zupy / Soups",
    image: foodSoup,
    items: [
      { name: "Żurek góralski", name_en: "Highland sour soup", price: "22 PLN" },
      { name: "Rosół z makaronem", name_en: "Chicken broth with noodles", price: "20 PLN" },
      { name: "Krem z pieczarek", name_en: "Mushroom cream soup", price: "24 PLN" },
    ]
  },
  {
    category: "Dania główne / Main courses",
    image: foodMain,
    items: [
      { name: "Schab z kapustą i ziemniakami", name_en: "Pork chop with cabbage", price: "48 PLN" },
      { name: "Filet z łososia na grillu", name_en: "Grilled salmon fillet", price: "58 PLN" },
      { name: "Pierogi z mięsem", name_en: "Dumplings with meat", price: "38 PLN" },
      { name: "Gulasz wołowy", name_en: "Beef goulash", price: "52 PLN" },
    ]
  },
  {
    category: "Desery / Desserts",
    image: foodDessert,
    items: [
      { name: "Szarlotka z lodami", name_en: "Apple pie with ice cream", price: "22 PLN" },
      { name: "Sernik tradycyjny", name_en: "Traditional cheesecake", price: "20 PLN" },
      { name: "Tiramisu", name_en: "Tiramisu", price: "24 PLN" },
    ]
  },
];

export const RestaurantMenu = ({ onBack }: RestaurantMenuProps) => {
  const [currentTranscript, setCurrentTranscript] = useState("");
  const { isRecording, isProcessing, startRecording, stopRecording } = useAudioRecorder();
  const { speak, isSpeaking } = useTextToSpeech();

  const handleToggleRecording = async () => {
    if (isRecording) {
      try {
        const transcribedText = await stopRecording();
        setCurrentTranscript(transcribedText);
        
        const { data, error } = await supabase.functions.invoke('hotel-chat', {
          body: { message: transcribedText }
        });

        if (error) throw error;

        const assistantMessage = data.message;
        setCurrentTranscript(assistantMessage);
        
        await speak(assistantMessage);
        
        setTimeout(() => setCurrentTranscript(""), 5000);
      } catch (error) {
        console.error('Error processing voice:', error);
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-primary/10 backdrop-blur-sm border-b border-primary/20">
        <Button
          onClick={onBack}
          variant="ghost"
          className="gap-2 text-primary hover:bg-primary/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Powrót
        </Button>
        <h1 className="text-3xl font-bold text-primary">
          Restauracja Gołębiewski
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <span>7:00 - 22:00</span>
        </div>
      </div>

      {/* Menu Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {menuItems.map((section, sectionIdx) => (
            <div 
              key={section.category}
              className={cn(
                "bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-border/50 animate-scale-in",
                "hover:shadow-xl transition-shadow duration-300"
              )}
              style={{ animationDelay: `${sectionIdx * 0.1}s` }}
            >
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={section.image} 
                  alt={section.category}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/50 to-transparent" />
                <h2 className="absolute bottom-4 left-6 text-3xl font-bold text-white drop-shadow-lg">
                  {section.category}
                </h2>
              </div>

              {/* Menu Items */}
              <div className="p-6 space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className="flex justify-between items-start group hover:bg-accent/50 p-3 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.name_en}
                      </p>
                    </div>
                    <div className="text-xl font-bold text-primary ml-4">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-card/50 backdrop-blur-sm border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>Wszystkie dania przygotowywane są ze świeżych, lokalnych produktów</p>
        <p className="mt-1">All dishes are prepared with fresh, local ingredients</p>
      </div>

      {/* Voice Assistant Button - Fixed Bottom Left */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col items-center gap-3">
        {currentTranscript && (
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border max-w-xs mb-2 animate-fade-in">
            <p className="text-sm text-foreground leading-relaxed">
              {currentTranscript}
            </p>
          </div>
        )}
        
        <div className="relative">
          {(isRecording || isSpeaking) && (
            <>
              <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave" style={{ animationDelay: '0s' }} />
              <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-wave" style={{ animationDelay: '0.3s' }} />
            </>
          )}
          
          <Button
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className={cn(
              "relative z-10 h-20 w-20 rounded-full transition-all shadow-2xl border-2",
              isRecording && "bg-destructive hover:bg-destructive/90 border-orange-500",
              isProcessing && "bg-amber-500 hover:bg-amber-500/90 border-orange-500",
              !isRecording && !isProcessing && "bg-primary hover:bg-primary/90 border-orange-500"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </Button>
        </div>
        
        <p className="text-xs font-semibold text-white drop-shadow-lg">
          {getStatusText()}
        </p>
      </div>
    </div>
  );
};
