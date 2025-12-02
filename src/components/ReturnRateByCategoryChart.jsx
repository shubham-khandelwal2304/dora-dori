import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * @typedef {Object} ReturnRateCategoryRow
 * @property {string} category - e.g. "Kurtas", "Bottomwear"
 * @property {number} returnRatePct - e.g. 8.5 (percentage)
 */

const fetchReturnRateByCategory = async () => {
  const response = await fetch(`${API_BASE_URL}/trends/return-rate-by-category`);
  if (!response.ok) throw new Error("Failed to fetch return rate by category data");
  return response.json();
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-sm mb-2">{data.category}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#A27B5C" }}></div>
          <span className="text-muted-foreground">Return Rate:</span>
          <span className="font-medium">{data.returnRatePct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const ReturnRateByCategoryChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['return-rate-by-category'],
    queryFn: fetchReturnRateByCategory,
    refetchInterval: 60000,
    retry: 1,
    staleTime: 30000,
  });

  // Sort by return rate descending (worst first)
  const chartData = data 
    ? [...data].sort((a, b) => b.returnRatePct - a.returnRatePct)
    : [];

  // Calculate insights
  const worstCategory = chartData.length > 0 ? chartData[0] : null;
  const bestCategory = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const avgReturnRate = chartData.length > 0 
    ? (chartData.reduce((sum, item) => sum + item.returnRatePct, 0) / chartData.length).toFixed(1)
    : "0";

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Return Rate by Category (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {isLoading ? (
          <div className="h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center">
            <div className="text-muted-foreground text-xs sm:text-sm">Loading return rates...</div>
          </div>
        ) : isError ? (
          <div className="h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center">
            <div className="text-destructive text-xs sm:text-sm">Failed to load data. Please try again.</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center">
            <div className="text-muted-foreground text-xs sm:text-sm">No return rate data available</div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : window.innerWidth < 768 ? 240 : 280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="category" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Return Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="returnRatePct" 
                  fill="#A27B5C" 
                  name="Return Rate (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-amber-600">ⓘ</span>
              <span>
                {worstCategory 
                  ? `${worstCategory.category} has the highest return rate at ${worstCategory.returnRatePct.toFixed(1)}%. `
                  : ""}
                {bestCategory 
                  ? `${bestCategory.category} performs best with ${bestCategory.returnRatePct.toFixed(1)}% returns. `
                  : ""}
                Average return rate across all categories: {avgReturnRate}%
              </span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReturnRateByCategoryChart;

