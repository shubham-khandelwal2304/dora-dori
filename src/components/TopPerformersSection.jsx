import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ChevronRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const TopPerformersSection = () => {
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    const fetchTopSkus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/top-skus`);
        if (!res.ok) throw new Error("Failed to fetch top SKUs");
        const json = await res.json();
        setTopPerformers(json || []);
      } catch (error) {
        console.warn("Top SKUs API unavailable, using static defaults:", error);
        setTopPerformers([
          {
            styleId: "STY001",
            styleName: "Floral Maxi Dress",
            primaryPlatform: "Myntra",
            oneMonthSalesUnits: 540,
          },
          {
            styleId: "STY002",
            styleName: "Cotton Kurta Set",
            primaryPlatform: "Nykaa",
            oneMonthSalesUnits: 420,
          },
          {
            styleId: "STY003",
            styleName: "Silk Co-ord",
            primaryPlatform: "Myntra",
            oneMonthSalesUnits: 380,
          },
          {
            styleId: "STY004",
            styleName: "Printed Top",
            primaryPlatform: "Nykaa",
            oneMonthSalesUnits: 320,
          },
        ]);
      }
    };

    fetchTopSkus();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              Top Performing SKUs
            </CardTitle>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Sorted by 30-day STR
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {topPerformers.slice(0, 5).map((item, index) => (
            <button
              key={index}
              type="button"
              className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-left"
              onClick={() => console.log("Open top performer", item.name)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">
                  {item.styleName || item.name}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  {item.primaryPlatform || item.platform}
                </div>
                {item.oneMonthSalesUnits !== undefined && (
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                    1-month sales:{" "}
                    <span className="font-semibold text-foreground">
                      {item.oneMonthSalesUnits} units
                    </span>
                  </div>
                )}
              </div>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformersSection;


