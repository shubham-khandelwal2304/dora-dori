import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * @typedef {Object} ChannelPerformanceRow
 * @property {string} adsPlatform - e.g. "Meta", "Google", "Myntra", "Nykaa"
 * @property {number} totalAdSpend - in ₹
 * @property {number} totalClicks - total clicks
 * @property {number} globalAov - global average order value
 * @property {number} assumedCvr - assumed conversion rate (0.02 = 2%)
 * @property {number} estimatedOrders - estimated orders
 * @property {number} revenue30d - estimated revenue in ₹
 * @property {number|null} roasX - estimated ROAS, e.g. 3.8
 */

const fetchChannelPerformance = async () => {
  const response = await fetch(`${API_BASE_URL}/trends/channel-performance`);
  if (!response.ok) throw new Error("Failed to fetch channel performance data");
  return response.json();
};

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
      <p className="font-semibold text-sm mb-2">{data.adsPlatform}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#8B5E34" }}></div>
            <span className="text-muted-foreground">Ad Spend:</span>
          </div>
          <span className="font-medium">{formatCurrency(data.totalAdSpend)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground ml-5">Clicks:</span>
          <span className="font-medium">{(data.totalClicks || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#A27B5C" }}></div>
            <span className="text-muted-foreground">Est. Revenue:</span>
          </div>
          <span className="font-medium">{formatCurrency(data.revenue30d)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground ml-5">Est. Orders:</span>
          <span className="font-medium">{Math.round(data.estimatedOrders || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D4A574" }}></div>
            <span className="text-muted-foreground">Est. ROAS:</span>
          </div>
          <span className="font-medium">
            {data.roasX !== null ? `${data.roasX.toFixed(1)}x` : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/50">
          <span className="text-muted-foreground text-[10px]">CVR (assumed):</span>
          <span className="font-medium text-[10px]">{((data.assumedCvr || 0) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

const ChannelPerformanceChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['channel-performance'],
    queryFn: fetchChannelPerformance,
    refetchInterval: 60000,
    retry: 1,
    staleTime: 30000,
  });

  const chartData = data || [];

  // Calculate insights
  const bestROAS = chartData.length > 0 
    ? chartData.reduce((max, item) => 
        item.roasX !== null && (max === null || item.roasX > max.roasX) ? item : max
      , chartData[0])
    : null;

  const totalSpend = chartData.reduce((sum, item) => sum + item.totalAdSpend, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue30d, 0);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Channel Performance – Ad Spend vs Est. Revenue & ROAS</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {isLoading ? (
          <div className="h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center">
            <div className="text-muted-foreground text-xs sm:text-sm">Loading channel performance...</div>
          </div>
        ) : isError ? (
          <div className="h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center">
            <div className="text-destructive text-xs sm:text-sm">Failed to load data. Please try again.</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center">
            <div className="text-muted-foreground text-xs sm:text-sm">No channel performance data available</div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : window.innerWidth < 768 ? 240 : 280}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="adsPlatform" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatCurrency}
                  label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }}
                  label={{ value: 'ROAS (x)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="totalAdSpend" 
                  fill="#8B5E34" 
                  name="Ad Spend"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue30d" 
                  fill="#A27B5C" 
                  name="Est. Revenue (30d)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="roasX"
                  stroke="#D4A574"
                  strokeWidth={2.5}
                  name="Est. ROAS"
                  dot={{ r: 5, fill: "#D4A574" }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-amber-600">ⓘ</span>
              <span>
                {bestROAS && bestROAS.roasX !== null
                  ? `${bestROAS.adsPlatform} shows the highest estimated ROAS at ${bestROAS.roasX.toFixed(1)}x. `
                  : ""}
                Total ad spend: {formatCurrency(totalSpend)}, Est. revenue: {formatCurrency(totalRevenue)}.
                {totalSpend > 0 && ` Overall est. ROAS: ${(totalRevenue / totalSpend).toFixed(1)}x. `}
                <span className="text-[10px] opacity-75">Revenue estimated using 2% CVR & global AOV.</span>
              </span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelPerformanceChart;

