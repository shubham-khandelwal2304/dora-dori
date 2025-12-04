import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const FabricStatusSection = () => {
  const [stockoutData, setStockoutData] = useState([]);

  useEffect(() => {
    const fetchStockoutRisks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stockout-risks`);
        if (!res.ok) throw new Error("Failed to fetch stockout risks");
        const json = await res.json();
        setStockoutData(json || []);
      } catch (error) {
        console.warn(
          "Stockout risks API unavailable, using static defaults:",
          error
        );
        setStockoutData([
          { styleId: "STY001", styleName: "Classic Cotton Shirt", daysOfCover: 8, atsPooled: 45, dailySales: 5.2 },
          { styleId: "STY002", styleName: "Linen Summer Kurta", daysOfCover: 12, atsPooled: 68, dailySales: 5.7 },
          { styleId: "STY003", styleName: "Rayon Printed Dress", daysOfCover: 15, atsPooled: 95, dailySales: 6.3 },
          { styleId: "STY004", styleName: "Cotton Casual Shorts", daysOfCover: 18, atsPooled: 120, dailySales: 6.7 },
          { styleId: "STY005", styleName: "Polyester Track Pants", daysOfCover: 22, atsPooled: 145, dailySales: 6.6 },
        ]);
      }
    };

    fetchStockoutRisks();
  }, []);

  // Find the maximum days of cover for scaling (use 30 as threshold)
  const maxDays = 30;

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          Top Stockout Risks
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
          High sellers with less than 30 days of cover
        </p>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {stockoutData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No high-risk styles found
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {stockoutData.map((style, index) => {
              const progressValue = (style.daysOfCover / maxDays) * 100;
              
              return (
                <div
                  key={index}
                  className="p-2.5 sm:p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">
                        {style.styleName}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {style.styleId}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-bold text-sm sm:text-base text-amber-600">
                        {style.daysOfCover} days of cover
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span>
                        ATS: <span className="font-semibold text-foreground">{style.atsPooled}</span>
                      </span>
                      <span>
                        Daily Sales: <span className="font-semibold text-foreground">{style.dailySales.toFixed(1)}</span>
                      </span>
                    </div>
                    <div className="relative w-full h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressValue}%`,
                          backgroundColor: '#A27B5C'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FabricStatusSection;


