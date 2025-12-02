import Header from "@/components/Header";
import NavigationPanel from "@/components/NavigationPanel";
import InsightsSection from "@/components/InsightsSection";
import ChatBot from "@/components/ChatBot";

const Insights = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex min-w-0">
        <NavigationPanel />
        
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 max-w-[1920px] mx-auto">
          <InsightsSection />
        </main>
      </div>
      
      <ChatBot />
    </div>
  );
};

export default Insights;

