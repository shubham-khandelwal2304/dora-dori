import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Package, DollarSign, RotateCcw, Layers, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const COLORS = ['#A27B5C', '#D8C3A5', '#8B7355', '#C4A484', '#6B5B4F'];

// Mock data for all charts
const mockChartData = {
  'top-selling-styles': [
    { style_name: 'Floral Maxi Dress', total_units_sold: 1250 },
    { style_name: 'Cotton Kurta Set', total_units_sold: 980 },
    { style_name: 'Silk Co-ord', total_units_sold: 875 },
    { style_name: 'Printed Top', total_units_sold: 720 },
    { style_name: 'Linen Dress', total_units_sold: 650 },
    { style_name: 'Rayon Maxi', total_units_sold: 580 },
    { style_name: 'Cotton Co-ord', total_units_sold: 520 },
    { style_name: 'Silk Kurta', total_units_sold: 480 },
    { style_name: 'Printed Kurta', total_units_sold: 450 },
    { style_name: 'Linen Kurta', total_units_sold: 420 },
  ],
  'category-contribution': [
    { name: 'Dress', value: 3200 },
    { name: 'Kurta', value: 2800 },
    { name: 'Co-ord', value: 1950 },
    { name: 'Top', value: 1200 },
    { name: 'Bottom', value: 800 },
  ],
  'top-colors': [
    { color: 'Navy', units_sold: 1850 },
    { color: 'Beige', units_sold: 1650 },
    { color: 'Maroon', units_sold: 1420 },
    { color: 'Black', units_sold: 1380 },
    { color: 'White', units_sold: 1200 },
    { color: 'Pink', units_sold: 980 },
  ],
  'channel-comparison': [
    { category: 'Dress', myntra: 1800, nykaa: 1400 },
    { category: 'Kurta', myntra: 1600, nykaa: 1200 },
    { category: 'Co-ord', myntra: 1100, nykaa: 850 },
    { category: 'Top', myntra: 700, nykaa: 500 },
    { category: 'Bottom', myntra: 450, nykaa: 350 },
  ],
  'size-demand': [
    { size: 'S', myntra: 450, nykaa: 380 },
    { size: 'M', myntra: 1200, nykaa: 980 },
    { size: 'L', myntra: 1350, nykaa: 1100 },
    { size: 'XL', myntra: 950, nykaa: 750 },
    { size: 'XXL', myntra: 350, nykaa: 280 },
  ],
  'ats-vs-sales': [
    { ats: 120, sales: 850 },
    { ats: 95, sales: 720 },
    { ats: 150, sales: 450 },
    { ats: 80, sales: 980 },
    { ats: 200, sales: 320 },
    { ats: 110, sales: 650 },
    { ats: 75, sales: 1100 },
    { ats: 180, sales: 380 },
  ],
  'low-stock-styles': [
    { style_name: 'Floral Kurta Set', ats: 5, reorder_threshold: 20 },
    { style_name: 'Cotton Co-ord', ats: 8, reorder_threshold: 25 },
    { style_name: 'Silk Maxi Dress', ats: 12, reorder_threshold: 30 },
    { style_name: 'Printed Top', ats: 15, reorder_threshold: 20 },
    { style_name: 'Linen Dress', ats: 18, reorder_threshold: 25 },
  ],
  'size-availability': [
    { size: 'S', availability: [85, 90, 75, 80, 88] },
    { size: 'M', availability: [95, 98, 92, 90, 96] },
    { size: 'L', availability: [88, 85, 90, 87, 89] },
    { size: 'XL', availability: [75, 78, 72, 70, 76] },
    { size: 'XXL', availability: [60, 65, 58, 62, 64] },
  ],
  'ats-by-channel': [
    { category: 'Dress', myntra: 1800, nykaa: 1400 },
    { category: 'Kurta', myntra: 1600, nykaa: 1200 },
    { category: 'Co-ord', myntra: 1100, nykaa: 850 },
    { category: 'Top', myntra: 700, nykaa: 500 },
  ],
  'margin-vs-sales': [
    { margin: 35, sales: 850 },
    { margin: 42, sales: 720 },
    { margin: 28, sales: 450 },
    { margin: 48, sales: 980 },
    { margin: 25, sales: 320 },
    { margin: 38, sales: 650 },
    { margin: 45, sales: 1100 },
    { margin: 30, sales: 380 },
  ],
  'margin-distribution': [
    { range: '0-20%', count: 12 },
    { range: '20-30%', count: 28 },
    { range: '30-40%', count: 45 },
    { range: '40-50%', count: 38 },
    { range: '50%+', count: 15 },
  ],
  'category-margin': [
    { category: 'Dress', avg_margin: 38.5 },
    { category: 'Kurta', avg_margin: 42.2 },
    { category: 'Co-ord', avg_margin: 35.8 },
    { category: 'Top', avg_margin: 40.1 },
    { category: 'Bottom', avg_margin: 33.5 },
  ],
  'return-rate-by-style': [
    { style_name: 'Floral Maxi Dress', return_rate: 5.2 },
    { style_name: 'Cotton Kurta Set', return_rate: 6.8 },
    { style_name: 'Silk Co-ord', return_rate: 4.5 },
    { style_name: 'Printed Top', return_rate: 8.2 },
    { style_name: 'Linen Dress', return_rate: 7.1 },
    { style_name: 'Rayon Maxi', return_rate: 9.5 },
    { style_name: 'Cotton Co-ord', return_rate: 5.8 },
    { style_name: 'Silk Kurta', return_rate: 4.2 },
  ],
  'return-rate-by-category': [
    { category: 'Dress', return_rate: 6.2 },
    { category: 'Kurta', return_rate: 5.8 },
    { category: 'Co-ord', return_rate: 7.5 },
    { category: 'Top', return_rate: 8.1 },
    { category: 'Bottom', return_rate: 6.9 },
  ],
  'return-rate-by-size': [
    { size: 'S', return_rate: 5.5 },
    { size: 'M', return_rate: 6.2 },
    { size: 'L', return_rate: 7.8 },
    { size: 'XL', return_rate: 8.5 },
    { size: 'XXL', return_rate: 9.2 },
  ],
  'fabric-inventory': [
    { fabric_name: 'Cotton Voile', available_meters: 150 },
    { fabric_name: 'Silk Blend', available_meters: 450 },
    { fabric_name: 'Linen', available_meters: 280 },
    { fabric_name: 'Rayon', available_meters: 180 },
    { fabric_name: 'Cotton', available_meters: 320 },
  ],
  'fabric-shortage': [
    { fabric_name: 'Cotton Voile', available_meters: 150, reorder_point: 200, shortage: 50 },
    { fabric_name: 'Rayon', available_meters: 180, reorder_point: 200, shortage: 20 },
  ],
  'fabric-consumption': [
    { fabric_name: 'Cotton Voile', available: 150, consumed: 75 },
    { fabric_name: 'Silk Blend', available: 450, consumed: 62 },
    { fabric_name: 'Linen', available: 280, consumed: 53 },
    { fabric_name: 'Rayon', available: 180, consumed: 72 },
  ],
  'ageing-buckets': [
    { bucket: '0-30 days', count: 85 },
    { bucket: '30-60 days', count: 120 },
    { bucket: '60-120 days', count: 35 },
    { bucket: '120+ days', count: 7 },
  ],
  'slow-movers': [
    { style_name: 'Style A', ats: 200, sales: 50 },
    { style_name: 'Style B', ats: 180, sales: 45 },
    { style_name: 'Style C', ats: 165, sales: 60 },
    { style_name: 'Style D', ats: 150, sales: 55 },
    { style_name: 'Style E', ats: 140, sales: 48 },
  ],
};

// API fetch functions
const fetchChartData = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}/charts/${endpoint}`);
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return response.json();
  } catch (error) {
    // Return mock data if API fails
    console.warn(`API unavailable for ${endpoint}, using mock data:`, error);
    return mockChartData[endpoint] || [];
  }
};

const ChartsSection = () => {
  // Sales Charts
  const { data: topSelling } = useQuery({ 
    queryKey: ['top-selling'], 
    queryFn: () => fetchChartData('top-selling-styles'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: categoryContribution } = useQuery({ 
    queryKey: ['category-contribution'], 
    queryFn: () => fetchChartData('category-contribution'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: topColors } = useQuery({ 
    queryKey: ['top-colors'], 
    queryFn: () => fetchChartData('top-colors'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: channelComparison } = useQuery({ 
    queryKey: ['channel-comparison'], 
    queryFn: () => fetchChartData('channel-comparison'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: sizeDemand } = useQuery({ 
    queryKey: ['size-demand'], 
    queryFn: () => fetchChartData('size-demand'),
    retry: false,
    staleTime: Infinity,
  });

  // Inventory Charts
  const { data: atsVSSales } = useQuery({ 
    queryKey: ['ats-vs-sales'], 
    queryFn: () => fetchChartData('ats-vs-sales'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: lowStockStyles } = useQuery({ 
    queryKey: ['low-stock'], 
    queryFn: () => fetchChartData('low-stock-styles'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: sizeAvailability } = useQuery({ 
    queryKey: ['size-availability'], 
    queryFn: () => fetchChartData('size-availability'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: atsByChannel } = useQuery({ 
    queryKey: ['ats-by-channel'], 
    queryFn: () => fetchChartData('ats-by-channel'),
    retry: false,
    staleTime: Infinity,
  });

  // Profitability Charts
  const { data: marginVSSales } = useQuery({ 
    queryKey: ['margin-vs-sales'], 
    queryFn: () => fetchChartData('margin-vs-sales'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: marginDistribution } = useQuery({ 
    queryKey: ['margin-distribution'], 
    queryFn: () => fetchChartData('margin-distribution'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: categoryMargin } = useQuery({ 
    queryKey: ['category-margin'], 
    queryFn: () => fetchChartData('category-margin'),
    retry: false,
    staleTime: Infinity,
  });

  // Returns Charts
  const { data: returnRateByStyle } = useQuery({ 
    queryKey: ['return-rate-style'], 
    queryFn: () => fetchChartData('return-rate-by-style'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: returnRateByCategory } = useQuery({ 
    queryKey: ['return-rate-category'], 
    queryFn: () => fetchChartData('return-rate-by-category'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: returnRateBySize } = useQuery({ 
    queryKey: ['return-rate-size'], 
    queryFn: () => fetchChartData('return-rate-by-size'),
    retry: false,
    staleTime: Infinity,
  });

  // Fabric Charts
  const { data: fabricInventory } = useQuery({ 
    queryKey: ['fabric-inventory'], 
    queryFn: () => fetchChartData('fabric-inventory'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: fabricShortage } = useQuery({ 
    queryKey: ['fabric-shortage'], 
    queryFn: () => fetchChartData('fabric-shortage'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: fabricConsumption } = useQuery({ 
    queryKey: ['fabric-consumption'], 
    queryFn: () => fetchChartData('fabric-consumption'),
    retry: false,
    staleTime: Infinity,
  });

  // Ageing Charts
  const { data: ageingBuckets } = useQuery({ 
    queryKey: ['ageing-buckets'], 
    queryFn: () => fetchChartData('ageing-buckets'),
    retry: false,
    staleTime: Infinity,
  });
  const { data: slowMovers } = useQuery({ 
    queryKey: ['slow-movers'], 
    queryFn: () => fetchChartData('slow-movers'),
    retry: false,
    staleTime: Infinity,
  });

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    padding: "8px",
  };

  return (
    <div className="space-y-8">
      {/* SALES VISUALIZATIONS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Sales Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Selling Styles</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSelling || mockChartData['top-selling-styles']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="style_name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total_units_sold" fill="#A27B5C" name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryContribution || mockChartData['category-contribution']}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(categoryContribution || mockChartData['category-contribution']).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Colors Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topColors || mockChartData['top-colors']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="color" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="units_sold" fill="#D8C3A5" name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Myntra vs Nykaa Sales Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelComparison || mockChartData['channel-comparison']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="myntra" fill="#A27B5C" name="Myntra" />
                  <Bar dataKey="nykaa" fill="#D8C3A5" name="Nykaa" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Size-Level Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sizeDemand || mockChartData['size-demand']}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="myntra" stackId="a" fill="#A27B5C" name="Myntra" />
                <Bar dataKey="nykaa" stackId="a" fill="#D8C3A5" name="Nykaa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* INVENTORY VISUALIZATIONS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
          <Package className="h-6 w-6" />
          Inventory Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ATS vs Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={atsVSSales || mockChartData['ats-vs-sales']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="ats" name="ATS" stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="number" dataKey="sales" name="Sales" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                  <Scatter name="Styles" data={atsVSSales || mockChartData['ats-vs-sales']} fill="#A27B5C" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Low Stock Styles</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lowStockStyles || mockChartData['low-stock-styles']} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="style_name" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="ats" fill="#D8C3A5" name="ATS" />
                  <Bar dataKey="reorder_threshold" fill="#A27B5C" name="Reorder Threshold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Size Availability Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(sizeAvailability || mockChartData['size-availability'])?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">{item.size}</div>
                    <div className="flex-1 flex gap-1">
                      {item.availability.map((avail, i) => (
                        <div
                          key={i}
                          className="flex-1 h-8 rounded"
                          style={{
                            backgroundColor: avail > 50 ? '#A27B5C' : avail > 20 ? '#D8C3A5' : '#F5E6D3',
                            opacity: avail / 100,
                          }}
                          title={`${avail}%`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ATS by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={atsByChannel || mockChartData['ats-by-channel']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="myntra" fill="#A27B5C" name="Myntra ATS" />
                  <Bar dataKey="nykaa" fill="#D8C3A5" name="Nykaa ATS" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PROFITABILITY VISUALS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Profitability Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Margin vs Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={marginVSSales || mockChartData['margin-vs-sales']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="margin" name="Margin %" stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="number" dataKey="sales" name="Sales" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                  <Scatter name="Styles" data={marginVSSales || mockChartData['margin-vs-sales']} fill="#8B7355" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Margin Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marginDistribution || mockChartData['margin-distribution']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#C4A484" name="Style Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category-Level Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryMargin || mockChartData['category-margin']}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="avg_margin" fill="#6B5B4F" name="Avg Margin %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* RETURN ANALYSIS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
          <RotateCcw className="h-6 w-6" />
          Return Analysis
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Return Rate by Style</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(returnRateByStyle || mockChartData['return-rate-by-style'])?.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="style_name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="return_rate" fill="#A27B5C" name="Return Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Return Rate by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={returnRateByCategory || mockChartData['return-rate-by-category']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="return_rate" fill="#D8C3A5" name="Return Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Return Rate by Size</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={returnRateBySize || mockChartData['return-rate-by-size']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="return_rate" fill="#8B7355" name="Return Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FABRIC VISUALS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
          <Layers className="h-6 w-6" />
          Fabric Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fabric Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fabricInventory || mockChartData['fabric-inventory']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="fabric_name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="available_meters" fill="#A27B5C" name="Available (m)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fabric Consumption vs Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fabricConsumption || mockChartData['fabric-consumption']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="fabric_name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="available" fill="#A27B5C" name="Available (m)" />
                  <Bar dataKey="consumed" fill="#D8C3A5" name="Consumed (m)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fabric Shortage Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fabric Name</TableHead>
                    <TableHead>Available (m)</TableHead>
                    <TableHead>Reorder Point (m)</TableHead>
                    <TableHead>Shortage (m)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(fabricShortage || mockChartData['fabric-shortage'])?.map((fabric, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{fabric.fabric_name}</TableCell>
                      <TableCell>{fabric.available_meters}</TableCell>
                      <TableCell>{fabric.reorder_point}</TableCell>
                      <TableCell>{fabric.shortage}</TableCell>
                      <TableCell>
                        <Badge variant={fabric.shortage > 0 ? "destructive" : "default"}>
                          {fabric.shortage > 0 ? "Critical" : "OK"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No fabric shortages
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* AGEING / LIFECYCLE */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Ageing & Lifecycle Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ageing Buckets</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageingBuckets || mockChartData['ageing-buckets']}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#A27B5C" name="Style Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slow Movers</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={slowMovers || mockChartData['slow-movers']} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="style_name" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="ats" fill="#D8C3A5" name="ATS" />
                  <Bar dataKey="sales" fill="#A27B5C" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ChartsSection;

