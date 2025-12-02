import { TrendingUp } from "lucide-react";
import ChannelPerformanceChart from "./ChannelPerformanceChart";
import ReturnRateByCategoryChart from "./ReturnRateByCategoryChart";

const TrendsSection = () => {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
        Performance Trends
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Chart 1: Channel Performance – Ad Spend vs Revenue & ROAS */}
        <ChannelPerformanceChart />

        {/* Chart 2: Return Rate by Category (Last 30 Days) */}
        <ReturnRateByCategoryChart />
      </div>
    </section>
  );
};

export default TrendsSection;


