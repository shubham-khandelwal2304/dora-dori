import { useState } from "react";
import Header from "@/components/Header";
import NavigationPanel from "@/components/NavigationPanel";
import KPISection from "@/components/KPISection";
import TopPerformersSection from "@/components/TopPerformersSection";
import FabricStatusSection from "@/components/FabricStatusSection";
import TrendsSection from "@/components/TrendsSection";
import ChatBot from "@/components/ChatBot";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleToggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  const handleCloseNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={isMobile ? handleToggleNav : undefined} />
      
      <div className="flex min-w-0">
        {/* Desktop sidebar */}
        {!isMobile && <NavigationPanel />}
        
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 max-w-[1920px] mx-auto">
          <KPISection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <TopPerformersSection />
            <FabricStatusSection />
          </div>
          
          <TrendsSection />
        </main>
      </div>

      {/* Mobile navigation drawer */}
      {isMobile && isNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={handleCloseNav}
        >
          <div
            className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NavigationPanel />
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
};

export default Index;


