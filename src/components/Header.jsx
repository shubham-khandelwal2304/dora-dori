import { User, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = ({ onMenuClick }) => {
  const isMobile = useIsMobile();
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {isMobile && onMenuClick && (
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={onMenuClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dora Dori AI</h1>
              <p className="text-xs text-muted-foreground">Inventory Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden lg:block">
              {currentDate}
            </span>
            <Avatar className="h-9 w-9 border-2 border-accent">
              <AvatarFallback className="bg-accent text-accent-foreground">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


