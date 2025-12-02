import Header from "@/components/Header";
import NavigationPanel from "@/components/NavigationPanel";
import MasterTableSection from "@/components/MasterTableSection";
import ChatBot from "@/components/ChatBot";

const MasterTable = () => {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex flex-1 min-h-0 min-w-0">
        <NavigationPanel />
        
        <main className="flex-1 min-w-0 overflow-hidden">
          <MasterTableSection />
        </main>
      </div>
      
      <ChatBot />
    </div>
  );
};

export default MasterTable;

