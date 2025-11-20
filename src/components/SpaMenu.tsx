import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Droplet, Sparkles, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import spaMassage from "@/assets/spa-massage.jpg";
import spaFacial from "@/assets/spa-facial.jpg";
import spaSauna from "@/assets/spa-sauna.jpg";
import spaPackage from "@/assets/spa-package.jpg";

interface SpaMenuProps {
  onBack: () => void;
}

const spaServices = [
  {
    category: "Masaże / Massages",
    icon: Sparkles,
    image: spaMassage,
    items: [
      { 
        name: "Masaż relaksacyjny całego ciała", 
        name_en: "Full body relaxation massage",
        duration: "60 min",
        price: "250 PLN" 
      },
      { 
        name: "Masaż gorącymi kamieniami", 
        name_en: "Hot stone massage",
        duration: "90 min",
        price: "350 PLN" 
      },
      { 
        name: "Masaż aromaterapeutyczny", 
        name_en: "Aromatherapy massage",
        duration: "75 min",
        price: "280 PLN" 
      },
      { 
        name: "Masaż sportowy", 
        name_en: "Sports massage",
        duration: "45 min",
        price: "200 PLN" 
      },
    ]
  },
  {
    category: "Zabiegi na twarz / Facial treatments",
    icon: Sparkles,
    image: spaFacial,
    items: [
      { 
        name: "Oczyszczanie twarzy", 
        name_en: "Deep cleansing facial",
        duration: "60 min",
        price: "180 PLN" 
      },
      { 
        name: "Anti-aging z kolagenem", 
        name_en: "Anti-aging with collagen",
        duration: "75 min",
        price: "320 PLN" 
      },
      { 
        name: "Masaż twarzy kobido", 
        name_en: "Kobido facial massage",
        duration: "50 min",
        price: "220 PLN" 
      },
    ]
  },
  {
    category: "Sauna & Wellness",
    icon: Droplet,
    image: spaSauna,
    items: [
      { 
        name: "Sauna fińska", 
        name_en: "Finnish sauna",
        duration: "60 min",
        price: "80 PLN" 
      },
      { 
        name: "Łaźnia parowa", 
        name_en: "Steam bath",
        duration: "45 min",
        price: "70 PLN" 
      },
      { 
        name: "Jacuzzi prywatne", 
        name_en: "Private jacuzzi",
        duration: "30 min",
        price: "120 PLN" 
      },
      { 
        name: "Karnet Wellness (cały dzień)", 
        name_en: "Wellness day pass",
        duration: "cały dzień",
        price: "200 PLN" 
      },
    ]
  },
  {
    category: "Pakiety / Packages",
    icon: Sparkles,
    image: spaPackage,
    items: [
      { 
        name: "Pakiet Relaks (masaż + sauna)", 
        name_en: "Relax package (massage + sauna)",
        duration: "2h",
        price: "290 PLN" 
      },
      { 
        name: "Pakiet Premium (masaż + zabieg na twarz)", 
        name_en: "Premium package (massage + facial)",
        duration: "2.5h",
        price: "480 PLN" 
      },
      { 
        name: "Dzień w SPA (wellness + 2 zabiegi)", 
        name_en: "SPA day (wellness + 2 treatments)",
        duration: "cały dzień",
        price: "550 PLN" 
      },
    ]
  },
];

export const SpaMenu = ({ onBack }: SpaMenuProps) => {
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
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/5 to-accent/10 animate-fade-in relative">
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
        <div className="flex items-center gap-3">
          <Droplet className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">
            SPA & Wellness
          </h1>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <span>9:00 - 21:00</span>
        </div>
      </div>

      {/* SPA Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {spaServices.map((section, sectionIdx) => {
            const Icon = section.icon;
            return (
              <div 
                key={section.category}
                className={cn(
                  "bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-border/50 animate-scale-in",
                  "hover:shadow-xl transition-shadow duration-300"
                )}
                style={{ animationDelay: `${sectionIdx * 0.1}s` }}
              >
                {/* Category Image */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={section.image} 
                    alt={section.category}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <Icon className="w-8 h-8 text-primary drop-shadow-lg" />
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                      {section.category}
                    </h2>
                  </div>
                </div>

                {/* Service Items */}
                <div className="p-6 space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx}
                      className="flex justify-between items-start group hover:bg-accent/50 p-4 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.name_en}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </p>
                      </div>
                      <div className="text-xl font-bold text-primary ml-4">
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-card/50 backdrop-blur-sm border-t border-border/50 text-center text-sm text-muted-foreground space-y-1">
        <p>Rezerwacji można dokonać telefonicznie lub w recepcji</p>
        <p>Reservations can be made by phone or at the reception</p>
        <p className="text-xs mt-2">Tel: +48 123 456 789</p>
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
