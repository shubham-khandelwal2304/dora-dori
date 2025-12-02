import { NavLink } from "react-router-dom";
import { LayoutDashboard, Lightbulb, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigationPanel = () => {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card p-6 space-y-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">DD</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Dora Dori AI</h2>
            <p className="text-xs text-muted-foreground">Inventory Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/insights"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Lightbulb className="h-5 w-5" />
          <span className="font-medium">Insights</span>
        </NavLink>

        <NavLink
          to="/master-table"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Database className="h-5 w-5" />
          <span className="font-medium">Master Table</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default NavigationPanel;

