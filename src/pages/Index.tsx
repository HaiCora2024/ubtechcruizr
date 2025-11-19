import { HotelChat } from "@/components/HotelChat";
import { Mountain } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gradient-to-b from-primary/20 to-background overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 right-0 h-1/2">
            <Mountain className="w-full h-full text-primary" />
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-spa bg-clip-text text-transparent">
            Hotel Panorama & Spa
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Twój luksusowy wypoczynek w sercu Zakopanego
          </p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="container mx-auto px-4 -mt-20 pb-12 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="h-[600px]">
            <HotelChat />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-soft">
            <div className="text-4xl mb-3">🏔️</div>
            <h3 className="font-semibold mb-2">Lokalizacja</h3>
            <p className="text-sm text-muted-foreground">
              Idealna lokalizacja w centrum Zakopanego z widokiem na Tatry
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-soft">
            <div className="text-4xl mb-3">💆‍♀️</div>
            <h3 className="font-semibold mb-2">Strefa SPA</h3>
            <p className="text-sm text-muted-foreground">
              Nowoczesne spa z masażami i zabiegami relaksacyjnymi
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-soft">
            <div className="text-4xl mb-3">🎿</div>
            <h3 className="font-semibold mb-2">Atrakcje</h3>
            <p className="text-sm text-muted-foreground">
              Blisko stacji narciarskich i najlepszych atrakcji Zakopanego
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
