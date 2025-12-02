import Header from "@/components/Header";
import NavigationPanel from "@/components/NavigationPanel";
import KPISection from "@/components/KPISection";
import TopPerformersSection from "@/components/TopPerformersSection";
import FabricStatusSection from "@/components/FabricStatusSection";
import TrendsSection from "@/components/TrendsSection";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex min-w-0">
        <NavigationPanel />
        
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 max-w-[1920px] mx-auto">
          <KPISection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <TopPerformersSection />
            <FabricStatusSection />
          </div>
          
          <TrendsSection />
        </main>
      </div>
      
      <ChatBot />
    </div>
  );
};

export default Index;


