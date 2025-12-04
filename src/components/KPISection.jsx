import { TrendingUp, TrendingDown, Package, AlertTriangle, IndianRupee, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const mockKPIData = {
  totalActiveStyles: 247,
  totalActiveStylesChange: "+12",
  stylesAtRiskCount: 58,
  stylesAtRiskChange: "+5",
  revenueLast30d: 1250000,
  revenueLast30dChange: "+85000",
  averageReturnRate: 7.2,
  averageReturnRateChange: "-0.8%",
};

// Format number in Indian numeral system with abbreviations
const formatIndianCurrency = (num) => {
  if (!num) return "₹0";
  
  const absNum = Math.abs(num);
  
  // Crore (10,000,000)
  if (absNum >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }
  // Lakh (100,000)
  else if (absNum >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  // Thousand
  else if (absNum >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  
  return `₹${num.toFixed(0)}`;
};

const fetchKPIs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/kpis`);
    if (!response.ok) throw new Error("Failed to fetch KPIs");
    return response.json();
  } catch (error) {
    console.warn("API unavailable, using mock data:", error);
    return mockKPIData;
  }
};

const KPISection = () => {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: fetchKPIs,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry on failure, use mock data
    staleTime: Infinity, // Use cached/mock data
  });

  // Use mock data if API data is not available
  const displayData = kpiData || mockKPIData;

  const Subtitle = () => null;

  if (isLoading && !kpiData) {
    return (
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-foreground">Overview</h2>
          <Subtitle />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const kpis = [
    {
      title: "Total Active Styles",
      value: displayData?.totalActiveStyles?.toLocaleString() || "0",
      change: displayData?.totalActiveStylesChange || "+0",
      trend: displayData?.totalActiveStylesChange?.startsWith('+') ? "up" : "down",
      icon: Package,
      description: "Count of unique style_id with inventory or sales",
    },
    {
      title: "Styles at Risk (30 days or less)",
      value: displayData?.stylesAtRiskCount?.toLocaleString() || "0",
      change: displayData?.stylesAtRiskChange || "+0",
      trend: displayData?.stylesAtRiskChange?.startsWith('-') ? "up" : "down",
      icon: AlertTriangle,
      description: "Styles with < 15 days of cover",
    },
    {
      title: "Revenue (Last 30 Days)",
      value: formatIndianCurrency(displayData?.revenueLast30d),
      change: displayData?.revenueLast30dChange || "+0",
      trend: displayData?.revenueLast30dChange?.startsWith('+') ? "up" : "down",
      icon: IndianRupee,
      description: "Total revenue in last 30 days",
    },
    {
      title: "Average Return Rate",
      value: (displayData?.averageReturnRate?.toFixed(1) || "0") + "%",
      change: displayData?.averageReturnRateChange || "+0%",
      trend: displayData?.averageReturnRateChange?.startsWith('-') ? "up" : "down",
      icon: RotateCcw,
      description: "Average return rate across all styles",
    },
  ];

  const getDeltaLabel = (title) => {
    if (title === "Average Return Rate") return "vs last 30 days";
    return "vs last 30 days";
  };

  const handleCardClick = (title) => {
    console.log("KPI card clicked:", title);
    // Placeholder: navigate or filter when routes/logic are available
  };

  return (
    <section className="mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
          Overview
        </h2>
        <Subtitle />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow border-border/60 cursor-pointer"
              onClick={() => handleCardClick(kpi.title)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-3xl font-bold text-foreground">
                    {kpi.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default KPISection;


