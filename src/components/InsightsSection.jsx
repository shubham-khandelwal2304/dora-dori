import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  TrendingDown, 
  PackageX, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  RotateCcw, 
  Sparkles, 
  XCircle,
  Lightbulb,
  ChevronRight
} from "lucide-react";

const AI_INSIGHTS_WEBHOOK =
  "https://n8n-excollo.azurewebsites.net/webhook/inventory-dashboard";
const INSIGHTS_CACHE_KEY = "dora_dori_insights_cache_v1";

const insightsData = [
  {
    type: "low-days-cover",
    title: "Priority Replenishment – Stockout risk",
    icon: AlertTriangle,
    priority: "high",
    style: { styleId: "ST123", styleName: "Blue Floral Kurta" },
    metrics: {
      daysOfCover: 9,
      dailySales: 7.8,
      platforms: ["Myntra", "Nykaa"]
    },
    recommendation: "Plan production or inbound stock for this style within the next 7–10 days to avoid stockout and loss of rank."
  },
  {
    type: "low-days-cover",
    title: "Priority Replenishment – Stockout risk",
    icon: AlertTriangle,
    priority: "high",
    style: { styleId: "ST156", styleName: "Pink Anarkali Dress" },
    metrics: {
      daysOfCover: 7,
      dailySales: 5.2,
      platforms: ["Myntra"]
    },
    recommendation: "Urgent replenishment needed within 5 days to prevent stockout."
  },
  {
    type: "low-days-cover",
    title: "Priority Replenishment – Stockout risk",
    icon: AlertTriangle,
    priority: "high",
    style: { styleId: "ST189", styleName: "White Cotton Kurta" },
    metrics: {
      daysOfCover: 6,
      dailySales: 9.1,
      platforms: ["Myntra", "Nykaa"]
    },
    recommendation: "Critical stock level. Expedite production immediately."
  },
  {
    type: "overstock",
    title: "Slow-moving Inventory – Potential overstock",
    icon: TrendingDown,
    priority: "medium",
    style: { styleId: "ST245", styleName: "Solid Black Palazzo" },
    metrics: {
      ats: 320,
      dailySales: 1.2,
      sellThrough: 8,
      launchDate: "6 months ago"
    },
    recommendation: "Consider increasing the discount, using this style in promotions, or reducing future buying/production."
  },
  {
    type: "overstock",
    title: "Slow-moving Inventory – Potential overstock",
    icon: TrendingDown,
    priority: "medium",
    style: { styleId: "ST267", styleName: "Grey Straight Pants" },
    metrics: {
      ats: 280,
      dailySales: 0.9,
      sellThrough: 5,
      launchDate: "8 months ago"
    },
    recommendation: "Consider clearance sale or promotional bundles to move inventory."
  },
  {
    type: "broken-sizes",
    title: "Broken Sizes – Fix before next traffic spike",
    icon: PackageX,
    priority: "high",
    style: { styleId: "ST301", styleName: "Sage Green Kurta Set" },
    metrics: {
      myntraBroken: 2,
      nykaaBroken: 1,
      brokenSizes: ["M", "L"],
      dailyDemand: 5.3
    },
    recommendation: "Prioritize replenishing M and L for this style. You're losing potential sales because popular sizes are missing."
  },
  {
    type: "broken-sizes",
    title: "Broken Sizes – Fix before next traffic spike",
    icon: PackageX,
    priority: "high",
    style: { styleId: "ST345", styleName: "Red Floral Kurti" },
    metrics: {
      myntraBroken: 3,
      nykaaBroken: 2,
      brokenSizes: ["S", "M", "XL"],
      dailyDemand: 4.8
    },
    recommendation: "Multiple sizes missing. Immediate restocking required for S, M, and XL."
  },
  {
    type: "fabric-bottleneck",
    title: "Fabric Bottleneck",
    icon: Layers,
    priority: "high",
    fabric: { type: "Cotton Slub (White)" },
    metrics: {
      remainingMeters: 420,
      unitsPossible: 190,
      topConsumers: [
        { styleId: "ST110", styleName: "White Embroidered Kurta", dailySales: 6.2 },
        { styleId: "ST124", styleName: "White Straight Kurta", dailySales: 4.5 }
      ]
    },
    recommendation: "If you want to keep selling these styles at the current pace for the next 45–60 days, plan a fabric reorder for Cotton Slub (White) in this week's purchase cycle."
  },
  {
    type: "high-potential",
    title: "High-Potential Winner – Keep In Stock & Promote",
    icon: TrendingUp,
    priority: "low",
    style: { styleId: "ST412", styleName: "Maroon Anarkali" },
    metrics: {
      sellThrough: 54,
      dailySales: 6.0,
      contributionMargin: 18,
      ats: 75,
      daysOfCover: 12
    },
    recommendation: "This is a strong, profitable style. Ensure continuous fabric and production planning, and consider modest ad push instead of heavy discounting."
  },
  {
    type: "discount-opportunity",
    title: "Discount Lever – Clearance Candidate",
    icon: DollarSign,
    priority: "medium",
    style: { styleId: "ST198", styleName: "Printed Short Kurti" },
    metrics: {
      launchDate: "9 months ago",
      sellThrough: 5,
      ats: 260,
      currentDiscount: 22
    },
    recommendation: "Consider taking the discount to 35–40% for the next 2–3 weeks to clear inventory and free up working capital."
  },
  {
    type: "ad-spend-inefficiency",
    title: "Ad Spend Inefficiency – Review Campaign",
    icon: BarChart3,
    priority: "high",
    style: { styleId: "ST275", styleName: "Navy Straight Pant" },
    metrics: {
      roas: 1.4,
      contributionMargin: 3,
      revenue30d: 120000,
      adSpend: 86000
    },
    recommendation: "Revisit creatives/targeting for this style or shift ad budget to higher-ROAS, higher-margin styles."
  },
  {
    type: "high-returns",
    title: "Quality / Fit Concern – High Returns",
    icon: RotateCcw,
    priority: "high",
    style: { styleId: "ST330", styleName: "Beige Chikan Kurta" },
    metrics: {
      sales30d: 180,
      returns: 26,
      returnRate: 14.4,
      mostReturnedSize: "M",
      sizeReturnPercentage: 48
    },
    recommendation: "Investigate sizing, product photos, and description for this style, especially for size M. Consider temporarily pausing ads until the issue is resolved."
  },
  {
    type: "new-launch",
    title: "Strong New Launch – Scale Up Carefully",
    icon: Sparkles,
    priority: "low",
    style: { styleId: "ST501", styleName: "Pastel Co-ord Set" },
    metrics: {
      launchDate: "10 days ago",
      totalSales: 42,
      dailySales: 4.2,
      sellThrough: 28,
      ats: 108,
      daysOfCover: 26
    },
    recommendation: "Monitor closely this week. If the trend continues, consider planning a second production run and light ad support."
  },
  {
    type: "dead-stock",
    title: "No Movement – Exit / Liquidation Candidate",
    icon: XCircle,
    priority: "medium",
    style: { styleId: "ST092", styleName: "Olive Straight Pants" },
    metrics: {
      launchDate: "7 months ago",
      sales30d: 0,
      ats: 85
    },
    recommendation: "Consider liquidation, bundle offers, or B2B bulk sale. Avoid producing this style again without design/fit changes."
  }
];

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "default";
  }
};

const InsightDetailRow = ({ insight }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors">
      {insight.style && (
        <div className="text-sm">
          <span className="text-muted-foreground">Style: </span>
          <span className="font-mono text-xs">{insight.style.styleId}</span>
          <span className="font-medium ml-2">{insight.style.styleName}</span>
        </div>
      )}
      
      {insight.fabric && (
        <div className="text-sm">
          <span className="text-muted-foreground">Fabric: </span>
          <span className="font-medium">{insight.fabric.type}</span>
        </div>
      )}

      <div className="space-y-1.5 text-xs">
        {insight.metrics.daysOfCover !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days of cover:</span>
            <span className="font-semibold">{insight.metrics.daysOfCover} days (total)</span>
          </div>
        )}
        {insight.metrics.dailySales !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sales:</span>
            <span className="font-semibold">{insight.metrics.dailySales} units/day (last 30 days)</span>
          </div>
        )}
        {insight.metrics.platforms && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platforms:</span>
            <span className="font-semibold">{insight.metrics.platforms.join(" & ")}</span>
          </div>
        )}
        {insight.metrics.ats !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">ATS:</span>
            <span className="font-semibold">{insight.metrics.ats} units</span>
          </div>
        )}
        {insight.metrics.sellThrough !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total sell-through (30 days):</span>
            <span className="font-semibold">{insight.metrics.sellThrough}%</span>
          </div>
        )}
        {insight.metrics.launchDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Launched:</span>
            <span className="font-semibold">{insight.metrics.launchDate}</span>
          </div>
        )}
        {insight.metrics.brokenSizes && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Broken sizes:</span>
            <span className="font-semibold">{insight.metrics.brokenSizes.join(", ")}</span>
          </div>
        )}
        {insight.metrics.myntraBroken !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Myntra:</span>
            <span className="font-semibold">Broken in {insight.metrics.myntraBroken} size{insight.metrics.myntraBroken > 1 ? 's' : ''}</span>
          </div>
        )}
        {insight.metrics.nykaaBroken !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nykaa:</span>
            <span className="font-semibold">Broken in {insight.metrics.nykaaBroken} size{insight.metrics.nykaaBroken > 1 ? 's' : ''}</span>
          </div>
        )}
        {insight.metrics.remainingMeters !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining fabric:</span>
            <span className="font-semibold">{insight.metrics.remainingMeters} meters</span>
          </div>
        )}
        {insight.metrics.unitsPossible !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Approx. units possible:</span>
            <span className="font-semibold">{insight.metrics.unitsPossible} units across all styles</span>
          </div>
        )}
        {insight.metrics.topConsumers && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-muted-foreground mb-1">Top consumers:</div>
            {insight.metrics.topConsumers.map((consumer, idx) => (
              <div key={idx} className="text-xs ml-2">
                <span className="font-mono">{consumer.styleId}</span> – {consumer.styleName} ({consumer.dailySales} units/day)
              </div>
            ))}
          </div>
        )}
        {insight.metrics.contributionMargin !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contribution margin:</span>
            <span className="font-semibold">{insight.metrics.contributionMargin}%</span>
          </div>
        )}
        {insight.metrics.roas !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">ROAS:</span>
            <span className="font-semibold">{insight.metrics.roas}x</span>
          </div>
        )}
        {insight.metrics.returnRate !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Return rate:</span>
            <span className="font-semibold">{insight.metrics.returnRate}%</span>
          </div>
        )}
        {insight.metrics.mostReturnedSize && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Most returned size:</span>
            <span className="font-semibold">{insight.metrics.mostReturnedSize} ({insight.metrics.sizeReturnPercentage}% of returns)</span>
          </div>
        )}
        {insight.metrics.currentDiscount !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current average discount:</span>
            <span className="font-semibold">{insight.metrics.currentDiscount}%</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t">
        <div className="text-xs font-semibold text-muted-foreground mb-1">Recommendation:</div>
        <div className="text-xs text-foreground leading-relaxed">
          {insight.recommendation}
        </div>
      </div>
    </div>
  );
};

const InsightsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [queryResults, setQueryResults] = useState([]);

  // Map existing dashboard insight types to AI insight queryIndex values
  const aiInsightIndexByType = {
    "low-days-cover": 1,         // Stable cover / stock cover
    overstock: 2,                // Underperforming / overstock risk
    "broken-sizes": 3,           // Risk of size sells out / broken sizes
    "fabric-bottleneck": 4,      // Fabric supply / bottlenecks
    "high-potential": 5,         // Well-performing styles
    "discount-opportunity": 6,   // Aggressive discounting
    "ad-spend-inefficiency": 7,  // Inventory bottlenecks / operational checks
    "high-returns": 8,           // High returns styles
    "new-launch": 9,             // No styles flagged / performance stability
    "dead-stock": 10             // No recent issues / data checks
  };

  const fetchAiInsights = useCallback(async () => {
    try {
      setAiLoading(true);
      setAiError(null);

      const response = await fetch(AI_INSIGHTS_WEBHOOK);
      if (!response.ok) {
        throw new Error(`Failed to load AI insights (${response.status})`);
      }

      // Read raw text first because webhook may return JSON wrapped as a string
      const rawText = await response.text();

      let parsed;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (e) {
        console.error("AI insights raw response (non‑JSON):", rawText);
        throw new Error("AI webhook did not return valid JSON.");
      }

      let aiOutput = [];
      let allresults = [];

      if (Array.isArray(parsed)) {
        const root = parsed[0] || {};
        if (Array.isArray(root.output)) {
          aiOutput = root.output;
        }
        if (Array.isArray(root.allresults)) {
          allresults = root.allresults;
        }
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.output)) {
          aiOutput = parsed.output;
        }
        if (Array.isArray(parsed.allresults)) {
          allresults = parsed.allresults;
        }
      }

      setAiInsights(aiOutput);
      setQueryResults(allresults);

      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(
            INSIGHTS_CACHE_KEY,
            JSON.stringify({
              aiInsights: aiOutput,
              queryResults: allresults,
              fetchedAt: new Date().toISOString(),
            })
          );
        }
      } catch (storageError) {
        console.error("Failed to cache insights data:", storageError);
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setAiError("Unable to load AI insights right now. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  }, []);

  // On mount: try to hydrate from cache; if none, fetch once.
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const cached = window.localStorage.getItem(INSIGHTS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (
            parsed &&
            Array.isArray(parsed.aiInsights) &&
            Array.isArray(parsed.queryResults)
          ) {
            setAiInsights(parsed.aiInsights);
            setQueryResults(parsed.queryResults);
            return; // use cached data; don't auto-refresh
          }
        }
      }
    } catch (e) {
      console.error("Failed to read cached insights:", e);
    }

    fetchAiInsights();
  }, [fetchAiInsights]);

  // Group insights by type
  const groupedInsights = insightsData.reduce((acc, insight) => {
    if (!acc[insight.type]) {
      acc[insight.type] = {
        title: insight.title,
        icon: insight.icon,
        priority: insight.priority,
        items: []
      };
    }
    acc[insight.type].items.push(insight);
    return acc;
  }, {});

  const handleViewMore = (type) => {
    setSelectedCategory({ type, ...groupedInsights[type] });
    setDialogOpen(true);
  };

  const getQueryResultForType = (type) => {
    if (!type) return [];
    const queryIndex = aiInsightIndexByType[type];
    if (!queryIndex) return [];

    const entry =
      queryResults.find(
        (item) => Number(item.queryIndex) === Number(queryIndex)
      ) || null;

    if (!entry || !Array.isArray(entry.QueryResult)) return [];

    return entry.QueryResult;
  };

  const getSelectedAiInsight = () => {
    if (!selectedCategory) return null;
    const queryIndex = aiInsightIndexByType[selectedCategory.type];
    if (!queryIndex) return null;
    return (
      aiInsights.find(
        (item) => Number(item.queryIndex) === Number(queryIndex)
      ) || null
    );
  };

  const selectedSqlRows = selectedCategory
    ? getQueryResultForType(selectedCategory.type)
    : [];
  const selectedMappedIndex = selectedCategory
    ? aiInsightIndexByType[selectedCategory.type]
    : null;
  const selectedCount = selectedMappedIndex
    ? selectedSqlRows.length
    : selectedCategory?.items?.length ?? 0;

  const isInitialLoading =
    aiLoading && !aiError && queryResults.length === 0 && aiInsights.length === 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-3">
        <h2 className="text-base sm:text-base font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
          Dashboard Insights
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 sm:h-8 text-xs"
            onClick={fetchAiInsights}
            disabled={aiLoading}
          >
            <RotateCcw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{aiLoading ? "Refreshing..." : "Refresh"}</span>
            <span className="inline xs:hidden">Sync</span>
          </Button>
        </div>
      </div>
      
      {isInitialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 space-y-4 animate-pulse bg-muted/30"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-40 bg-muted rounded" />
                <div className="h-5 w-12 bg-muted rounded-full" />
              </div>
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-5/6 bg-muted rounded" />
                <div className="h-3 w-4/6 bg-muted rounded" />
              </div>
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedInsights).map(([type, categoryData]) => {
          const Icon = categoryData.icon;
          const firstItem = categoryData.items[0];
          const queryRowsForType = getQueryResultForType(type);
          const firstRow = queryRowsForType[0];
          const mappedIndex = aiInsightIndexByType[type];
          const hasSqlMapping = !!mappedIndex;
          const stylesCount = hasSqlMapping
            ? (queryRowsForType && queryRowsForType.length) || 0
            : categoryData.items.length;

          // Special colors for specific cards:
          // - "high-potential"    -> red (destructive)
          // - "new-launch"        -> yellow (warning)
          const borderLeftColor =
            type === "high-potential"
              ? "hsl(var(--destructive))"
              : type === "new-launch"
              ? "hsl(var(--warning))"
              : categoryData.priority === "high"
              ? "hsl(var(--destructive))"
              : categoryData.priority === "medium"
              ? "hsl(var(--warning))"
              : "hsl(var(--muted))";
          
          return (
            <Card 
              key={type} 
              className="hover:shadow-lg transition-shadow border-l-4 cursor-pointer"
              style={{ borderLeftColor }}
              onClick={() => handleViewMore(type)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                      <Icon
                        className={`h-5 w-5 mt-0.5 ${
                          categoryData.priority === "high"
                            ? "text-destructive"
                            : categoryData.priority === "medium"
                            ? "text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    <CardTitle className="text-base font-semibold leading-tight">
                      {categoryData.title}
                    </CardTitle>
                  </div>
                    <Badge
                      variant={getPriorityColor(categoryData.priority)}
                      className="text-xs shrink-0"
                    >
                    {categoryData.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">
                      {stylesCount} {stylesCount === 1 ? "style" : "styles"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleViewMore(type)}
                  >
                    View More
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                  {/* Prefer live SQL example if available; if mapped but 0 styles, don't show dummy sample */}
                  {firstRow ? (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {(firstRow.styleId || firstRow.styleName) && (
                        <div>
                          Style:{" "}
                          {firstRow.styleId && (
                            <span className="font-mono">{firstRow.styleId}</span>
                          )}
                          {firstRow.styleName && (
                            <span className="ml-1 text-foreground font-medium">
                              {firstRow.styleName}
                            </span>
                          )}
                        </div>
                      )}
                      {firstRow.category && (
                        <div>
                          Category:{" "}
                          <span className="text-foreground font-medium">
                            {firstRow.category}
                          </span>
                        </div>
                      )}
                      {firstRow.dailyTotalSales !== undefined && (
                        <div>
                          Daily sales:{" "}
                          <span className="text-foreground font-medium">
                            {firstRow.dailyTotalSales} units/day
                          </span>
                        </div>
                      )}
                      {firstRow.totalDaysOfCover !== undefined && (
                        <div>
                          Days of cover:{" "}
                          <span className="text-foreground font-medium">
                            {firstRow.totalDaysOfCover} days
                          </span>
                        </div>
                      )}
                      {firstRow.atsPooled !== undefined && (
                        <div>
                          ATS pooled:{" "}
                          <span className="text-foreground font-medium">
                            {firstRow.atsPooled} units
                          </span>
                        </div>
                      )}
                      {firstRow.returnAveragePercent !== undefined && (
                        <div>
                          Avg return rate:{" "}
                          <span className="text-foreground font-medium">
                            {firstRow.returnAveragePercent}%
                          </span>
                        </div>
                      )}
                      {firstRow.roas !== undefined && (
                        <div>
                          ROAS:{" "}
                          <span className="text-foreground font-medium">
                            {firstRow.roas}x
                          </span>
                        </div>
                      )}
                      {(() => {
                        const sizeMeta = [
                          { label: "S", sizeKey: "sizeSBroken", sizeKeySnake: "size_s_broken", mKey: "myntraBrokenS", mKeySnake: "myntra_broken_s", mKeyCamel: "myntraSizeSBroken", nKey: "nykaaBrokenS", nKeySnake: "nykaa_broken_s", nKeyCamel: "nykaaSizeSBroken" },
                          { label: "M", sizeKey: "sizeMBroken", sizeKeySnake: "size_m_broken", mKey: "myntraBrokenM", mKeySnake: "myntra_broken_m", mKeyCamel: "myntraSizeMBroken", nKey: "nykaaBrokenM", nKeySnake: "nykaa_broken_m", nKeyCamel: "nykaaSizeMBroken" },
                          { label: "L", sizeKey: "sizeLBroken", sizeKeySnake: "size_l_broken", mKey: "myntraBrokenL", mKeySnake: "myntra_broken_l", mKeyCamel: "myntraSizeLBroken", nKey: "nykaaBrokenL", nKeySnake: "nykaa_broken_l", nKeyCamel: "nykaaSizeLBroken" },
                          { label: "XL", sizeKey: "sizeXlBroken", sizeKeySnake: "size_xl_broken", mKey: "myntraBrokenXl", mKeySnake: "myntra_broken_xl", mKeyCamel: "myntraSizeXlBroken", nKey: "nykaaBrokenXl", nKeySnake: "nykaa_broken_xl", nKeyCamel: "nykaaSizeXlBroken" },
                        ];

                        const truthy = (val) =>
                          val === true ||
                          val === "true" ||
                          val === "t" ||
                          val === "1" ||
                          val === 1;

                        const brokenSizes = sizeMeta
                          .map((size) => {
                            const sizeBroken =
                              truthy(firstRow[size.sizeKey]) ||
                              truthy(firstRow[size.sizeKeySnake]) ||
                              truthy(firstRow[size.mKeyCamel]) ||
                              truthy(firstRow[size.mKey]) ||
                              truthy(firstRow[size.mKeySnake]) ||
                              truthy(firstRow[size.nKeyCamel]) ||
                              truthy(firstRow[size.nKey]) ||
                              truthy(firstRow[size.nKeySnake]);

                            if (!sizeBroken) return null;

                            const platforms = [];
                            if (truthy(firstRow[size.mKeyCamel] ?? firstRow[size.mKey] ?? firstRow[size.mKeySnake])) {
                              platforms.push("Myntra");
                            }
                            if (truthy(firstRow[size.nKeyCamel] ?? firstRow[size.nKey] ?? firstRow[size.nKeySnake])) {
                              platforms.push("Nykaa");
                            }

                            if (!platforms.length) return null;

                            return { label: size.label, platforms };
                          })
                          .filter(Boolean);

                        if (!brokenSizes.length) return null;

                        return (
                          <div>
                            Broken sizes:{" "}
                            <span className="text-foreground font-medium">
                              {brokenSizes
                                .map((s) =>
                                  s.platforms.length
                                    ? `${s.label} (${s.platforms.join(", ")})`
                                    : s.label
                                )
                                .join("; ")}
                            </span>
                          </div>
                        );
                      })()}
                      {(() => {
                        const fabricType = firstRow.fabricType ?? firstRow.fabric_type;
                        const fabricRemaining =
                          firstRow.totalFabricRemainingMeters ??
                          firstRow.total_fabric_remaining_meters;

                        return (
                          <>
                            {fabricType && (
                              <div>
                                Fabric:{" "}
                                <span className="text-foreground font-medium">
                                  {fabricType}
                                </span>
                              </div>
                            )}
                            {fabricRemaining !== undefined && (
                              <div>
                                Fabric remaining:{" "}
                                <span className="text-foreground font-medium">
                                  {fabricRemaining} m
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : hasSqlMapping ? (
                    <div className="text-xs text-muted-foreground">
                      No styles currently flagged from live data for this insight.
                    </div>
                  ) : (
                    <>
                {firstItem.style && (
                  <div className="text-xs text-muted-foreground">
                          Example:{" "}
                          <span className="font-mono">
                            {firstItem.style.styleId}
                          </span>{" "}
                          - {firstItem.style.styleName}
                  </div>
                )}

                {firstItem.fabric && (
                  <div className="text-xs text-muted-foreground">
                          Fabric:{" "}
                          <span className="font-medium text-foreground">
                            {firstItem.fabric.type}
                          </span>
                  </div>
                      )}
                    </>
                )}

                <Separator />

                <div className="pt-1">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      General Recommendation:
                    </div>
                  <div className="text-xs text-foreground leading-relaxed line-clamp-3">
                    {firstItem.recommendation}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
              {selectedCategory && (
                <>
                  {(() => {
                    const Icon = selectedCategory.icon;
                    return <Icon className={`h-5 w-5 ${
                      selectedCategory.priority === "high" ? "text-destructive" : 
                      selectedCategory.priority === "medium" ? "text-warning" : 
                      "text-muted-foreground"
                    }`} />;
                  })()}
                  {selectedCategory.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedCount} {selectedCount === 1 ? "style requires" : "styles require"} attention
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4">
            {/* Left: SQL results only – if none, show an empty-state message, not sample data */}
            <ScrollArea className="h-[calc(85vh-170px)] pr-4">
            <div className="space-y-4">
                {selectedSqlRows && selectedSqlRows.length > 0 ? (
                  selectedSqlRows.map((row, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors text-xs"
                      >
                        {(row.styleId || row.styleName) && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Style: </span>
                            {row.styleId && (
                              <span className="font-mono text-xs">
                                {row.styleId}
                              </span>
                            )}
                            {row.styleName && (
                              <span className="font-medium ml-2">
                                {row.styleName}
                              </span>
                            )}
                          </div>
                        )}

                        {row.fabricType || row.fabric_type ? (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Fabric: </span>
                            <span className="font-medium">
                              {row.fabricType ?? row.fabric_type}
                            </span>
                          </div>
                        ) : null}

                        <div className="space-y-1.5">
                          {row.dailyTotalSales !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Daily sales:
                              </span>
                              <span className="font-semibold">
                                {row.dailyTotalSales} units/day
                              </span>
                            </div>
                          )}
                          {row.totalDaysOfCover !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Days of cover:
                              </span>
                              <span className="font-semibold">
                                {row.totalDaysOfCover} days
                              </span>
                            </div>
                          )}
                          {row.atsPooled !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                ATS pooled:
                              </span>
                              <span className="font-semibold">
                                {row.atsPooled} units
                              </span>
                            </div>
                          )}
                          {row.totalSellThrough !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Sell-through:
                              </span>
                              <span className="font-semibold">
                                {Math.round(row.totalSellThrough * 100)}%
                              </span>
                            </div>
                          )}
                          {row.returnAveragePercent !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Return rate:
                              </span>
                              <span className="font-semibold">
                                {row.returnAveragePercent}%
                              </span>
                            </div>
                          )}
                          {row.roas !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                ROAS:
                              </span>
                              <span className="font-semibold">
                                {row.roas}x
                              </span>
                            </div>
                          )}
                          {(() => {
                            const fabricRemaining =
                              row.totalFabricRemainingMeters ??
                              row.total_fabric_remaining_meters;
                            return fabricRemaining !== undefined ? (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Fabric remaining:
                              </span>
                              <span className="font-semibold">
                                {fabricRemaining} m
                              </span>
                            </div>
                            ) : null;
                          })()}
                          {row.estDaysOfCover !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Est. days of cover:
                              </span>
                              <span className="font-semibold">
                                {row.estDaysOfCover} days
                              </span>
                            </div>
                          )}
                          {(() => {
                            const sizeMeta = [
                              { label: "S", sizeKey: "sizeSBroken", sizeKeySnake: "size_s_broken", mKey: "myntraBrokenS", mKeySnake: "myntra_broken_s", mKeyCamel: "myntraSizeSBroken", nKey: "nykaaBrokenS", nKeySnake: "nykaa_broken_s", nKeyCamel: "nykaaSizeSBroken" },
                              { label: "M", sizeKey: "sizeMBroken", sizeKeySnake: "size_m_broken", mKey: "myntraBrokenM", mKeySnake: "myntra_broken_m", mKeyCamel: "myntraSizeMBroken", nKey: "nykaaBrokenM", nKeySnake: "nykaa_broken_m", nKeyCamel: "nykaaSizeMBroken" },
                              { label: "L", sizeKey: "sizeLBroken", sizeKeySnake: "size_l_broken", mKey: "myntraBrokenL", mKeySnake: "myntra_broken_l", mKeyCamel: "myntraSizeLBroken", nKey: "nykaaBrokenL", nKeySnake: "nykaa_broken_l", nKeyCamel: "nykaaSizeLBroken" },
                              { label: "XL", sizeKey: "sizeXlBroken", sizeKeySnake: "size_xl_broken", mKey: "myntraBrokenXl", mKeySnake: "myntra_broken_xl", mKeyCamel: "myntraSizeXlBroken", nKey: "nykaaBrokenXl", nKeySnake: "nykaa_broken_xl", nKeyCamel: "nykaaSizeXlBroken" },
                            ];

                            const truthy = (val) =>
                              val === true ||
                              val === "true" ||
                              val === "t" ||
                              val === "1" ||
                              val === 1;

                            const brokenSizes = sizeMeta
                              .map((size) => {
                                const sizeBroken =
                                  truthy(row[size.sizeKey]) ||
                                  truthy(row[size.sizeKeySnake]) ||
                                  truthy(row[size.mKeyCamel]) ||
                                  truthy(row[size.mKey]) ||
                                  truthy(row[size.mKeySnake]) ||
                                  truthy(row[size.nKeyCamel]) ||
                                  truthy(row[size.nKey]) ||
                                  truthy(row[size.nKeySnake]);

                                if (!sizeBroken) return null;

                                const platforms = [];
                                if (truthy(row[size.mKeyCamel] ?? row[size.mKey] ?? row[size.mKeySnake])) {
                                  platforms.push("Myntra");
                                }
                                if (truthy(row[size.nKeyCamel] ?? row[size.nKey] ?? row[size.nKeySnake])) {
                                  platforms.push("Nykaa");
                                }

                                if (!platforms.length) return null;

                                return { label: size.label, platforms };
                              })
                              .filter(Boolean);

                            if (!brokenSizes.length) return null;

                            return (
                              <div className="pt-2 border-t space-y-1.5">
                                <div className="text-muted-foreground">
                                  Broken sizes (raw):
                                </div>
                                {brokenSizes.map((size) => (
                                  <div
                                    key={size.label}
                                    className="text-[11px]"
                                  >
                                    <span className="font-semibold text-foreground">
                                      Size {size.label}
                                    </span>{" "}
                                    <span className="text-destructive">
                                      Broken on {size.platforms.join(", ")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 border rounded-lg text-xs text-muted-foreground bg-muted/30">
                    No styles are currently flagged from the latest data for this
                    insight category.
                  </div>
                )}
            </div>
          </ScrollArea>

            {/* Right: AI insight panel */}
            <div className="border rounded-lg p-4 bg-muted/40 flex flex-col gap-3 h-[calc(85vh-170px)]">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  AI Inventory Summary
                </div>
                <div className="text-sm font-semibold">
                  {selectedCategory ? `For: ${selectedCategory.title}` : "AI insight"}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
                {aiLoading && (
                  <div className="text-muted-foreground text-xs">
                    Loading AI insights...
                  </div>
                )}

                {!aiLoading && aiError && (
                  <div className="text-xs text-destructive">
                    {aiError}
                  </div>
                )}

                {!aiLoading && !aiError && (
                  (() => {
                    const aiInsight = getSelectedAiInsight();

                    if (!aiInsight) {
                      return (
                        <div className="text-xs text-muted-foreground">
                          No specific AI insight mapped for this card yet.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div>
                          <div className="text-[11px] font-semibold text-primary mb-1">
                            {aiInsight.title}
                          </div>
                          <div className="text-xs text-foreground leading-relaxed">
                            {aiInsight.summary}
                          </div>
                        </div>

                        {Array.isArray(aiInsight.insights) && aiInsight.insights.length > 0 && (
                          <div>
                            <div className="text-[11px] font-semibold text-muted-foreground mb-1">
                              Key points
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {aiInsight.insights.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {Array.isArray(aiInsight.recommendedActions) &&
                          aiInsight.recommendedActions.length > 0 && (
                            <div>
                              <div className="text-[11px] font-semibold text-muted-foreground mb-1">
                                Recommended actions
                              </div>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                {aiInsight.recommendedActions.map((action, idx) => (
                                  <li key={idx}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InsightsSection;
