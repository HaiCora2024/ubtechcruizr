import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestaurantMenuProps {
  onBack: () => void;
}

const menuItems = [
  {
    category: "Śniadania / Breakfast",
    items: [
      { name: "Jajecznica na maśle", name_en: "Scrambled eggs", price: "28 PLN" },
      { name: "Omlet z warzywami", name_en: "Vegetable omelette", price: "32 PLN" },
      { name: "Naleśniki z serem", name_en: "Pancakes with cheese", price: "26 PLN" },
      { name: "Owsianka z owocami", name_en: "Oatmeal with fruits", price: "24 PLN" },
    ]
  },
  {
    category: "Zupy / Soups",
    items: [
      { name: "Żurek góralski", name_en: "Highland sour soup", price: "22 PLN" },
      { name: "Rosół z makaronem", name_en: "Chicken broth with noodles", price: "20 PLN" },
      { name: "Krem z pieczarek", name_en: "Mushroom cream soup", price: "24 PLN" },
    ]
  },
  {
    category: "Dania główne / Main courses",
    items: [
      { name: "Schab z kapustą i ziemniakami", name_en: "Pork chop with cabbage", price: "48 PLN" },
      { name: "Filet z łososia na grillu", name_en: "Grilled salmon fillet", price: "58 PLN" },
      { name: "Pierogi z mięsem", name_en: "Dumplings with meat", price: "38 PLN" },
      { name: "Gulasz wołowy", name_en: "Beef goulash", price: "52 PLN" },
    ]
  },
  {
    category: "Desery / Desserts",
    items: [
      { name: "Szarlotka z lodami", name_en: "Apple pie with ice cream", price: "22 PLN" },
      { name: "Sernik tradycyjny", name_en: "Traditional cheesecake", price: "20 PLN" },
      { name: "Tiramisu", name_en: "Tiramisu", price: "24 PLN" },
    ]
  },
];

export const RestaurantMenu = ({ onBack }: RestaurantMenuProps) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in">
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
          Restauracja Panorama
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
                "bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border/50 animate-scale-in",
                "hover:shadow-xl transition-shadow duration-300"
              )}
              style={{ animationDelay: `${sectionIdx * 0.1}s` }}
            >
              <h2 className="text-2xl font-bold text-primary mb-4 pb-2 border-b border-primary/30">
                {section.category}
              </h2>
              <div className="space-y-3">
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
    </div>
  );
};
