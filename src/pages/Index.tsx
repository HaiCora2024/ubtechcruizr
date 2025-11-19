import { HotelChat } from "@/components/HotelChat";
import { Mountain } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[95vh]">
        <HotelChat />
      </div>
    </div>
  );
};

export default Index;
