import { useState } from "react";
import Header from "@/components/Header";
import NavigationPanel from "@/components/NavigationPanel";
import MasterTableSection from "@/components/MasterTableSection";
import ChatBot from "@/components/ChatBot";
import { useIsMobile } from "@/hooks/use-mobile";

const MasterTable = () => {
  const isMobile = useIsMobile();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleToggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  const handleCloseNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header onMenuClick={isMobile ? handleToggleNav : undefined} />
      
      <div className="flex flex-1 min-h-0 min-w-0">
        {/* Desktop sidebar */}
        {!isMobile && <NavigationPanel />}
        
        <main className="flex-1 min-w-0 overflow-hidden">
          <MasterTableSection />
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

export default MasterTable;

