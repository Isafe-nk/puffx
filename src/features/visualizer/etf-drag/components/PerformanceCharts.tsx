import { useMemo } from "react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { LineChart, TrendingUp, AlertCircle } from "lucide-react";
import { ETF, SimulationDataPoint } from "../types";
import { convertCurrency, formatDisplay } from "../../../../shared/utils/format";
import Card from "../../../../shared/components/Card";

interface PerformanceChartsProps {
  simData: SimulationDataPoint[];
  selectedA: ETF;
  selectedB: ETF;
  showInUsd: boolean;
  usdMyrRate: number;
  activeTab: "performance" | "leakage";
  setActiveTab: (v: "performance" | "leakage") => void;
  finalTerA: number;
  finalTerB: number;
}

const CustomTooltip = ({ active, payload, label, showInUsd }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E6E6E6] rounded-xl p-3 shadow-sm z-50">
        <p className="text-[#212121] font-bold font-display mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[#727579] text-xs">
                  {entry.name === 'Benchmark' ? 'Pure Baseline' : entry.name?.toString().split(' ')[0]}
                </span>
              </div>
              <span className="text-[#212121] text-xs font-mono font-semibold">
                {formatDisplay(entry.value as number, showInUsd, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function PerformanceCharts({
  simData,
  selectedA,
  selectedB,
  showInUsd,
  usdMyrRate,
  activeTab,
  setActiveTab
}: PerformanceChartsProps) {
  
  const chartData = useMemo(() => {
    return simData.map(d => ({
      ...d,
      displayYear: `Year ${d.year}`,
      valueA: convertCurrency(d.valueA, showInUsd, usdMyrRate),
      valueB: convertCurrency(d.valueB, showInUsd, usdMyrRate),
      valueBench: convertCurrency(d.valueBench, showInUsd, usdMyrRate),
      // Stack values
      taxA: convertCurrency(d.taxA, showInUsd, usdMyrRate),
      terA: convertCurrency(d.terA, showInUsd, usdMyrRate),
      spreadA: convertCurrency(d.spreadA, showInUsd, usdMyrRate),
      feesA: convertCurrency(d.feesA, showInUsd, usdMyrRate),
      taxB: convertCurrency(d.taxB, showInUsd, usdMyrRate),
      terB: convertCurrency(d.terB, showInUsd, usdMyrRate),
      spreadB: convertCurrency(d.spreadB, showInUsd, usdMyrRate),
      feesB: convertCurrency(d.feesB, showInUsd, usdMyrRate),
    }));
  }, [simData, showInUsd, usdMyrRate]);

  const samplePoints = useMemo(() => {
    return chartData.filter((_, idx) => {
      if (chartData.length <= 11) return true;
      const step = Math.ceil((chartData.length - 1) / 10);
      return idx === 0 || idx % step === 0 || idx === chartData.length - 1;
    });
  }, [chartData]);

  const yAxisFormatter = (value: number) => {
    if (value >= 1000000) return (showInUsd ? '$' : 'RM') + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (showInUsd ? '$' : 'RM') + (value / 1000).toFixed(0) + 'k';
    return (showInUsd ? '$' : 'RM') + value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <Card className="space-y-4">
      {/* Chart Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6E6E6] pb-4 gap-4">
        <div className="flex items-center gap-2">
          <LineChart className="text-[#D91222] w-4 h-4" />
          <h3 className="text-sm font-semibold text-[#212121] font-display">
            Compounding & Drag Visualizations
          </h3>
        </div>

        {/* Toggle tabs */}
        <div className="inline-flex rounded-xl p-0.5 bg-[#F3F3F4] border border-[#E6E6E6]">
          <button 
            onClick={() => setActiveTab("performance")}
            className={`px-3.5 py-1.5 text-xs rounded-xl transition-all font-medium flex items-center gap-1.5 cursor-pointer ${activeTab === "performance" ? 'bg-white text-[#D91222] border border-[#D91222]/20 shadow-sm font-semibold' : 'text-[#727579] hover:text-[#44474D]'}`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#D91222]" />
            Portfolio Projection
          </button>
          <button 
            onClick={() => setActiveTab("leakage")}
            className={`px-3.5 py-1.5 text-xs rounded-xl transition-all font-medium flex items-center gap-1.5 cursor-pointer ${activeTab === "leakage" ? 'bg-white text-[#D91222] border border-[#D91222]/20 shadow-sm font-semibold' : 'text-[#727579] hover:text-[#44474D]'}`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#FFB300]" />
            Cumulative Lost Cost
          </button>
        </div>
      </div>

      {/* Container for chart rendering */}
      <div className="relative h-[340px] w-full bg-[#FAFBFC] rounded-2xl p-2 md:p-4 border border-[#E8E8E9]">
        {activeTab === "performance" ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F4" />
              <XAxis dataKey="displayYear" tick={{ fontSize: 11, fill: '#A2A3A5', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 11, fill: '#A2A3A5', fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip showInUsd={showInUsd} />} cursor={{ stroke: '#E6E6E6', strokeWidth: 1 }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#727579', fontFamily: 'Inter' }} iconType="circle" />
              <Line type="monotone" dataKey="valueA" name={`${selectedA.ticker} (${selectedA.domicile})`} stroke="#727579" strokeWidth={2} dot={false} activeDot={{ r: 6 }} fillOpacity={0.06} />
              <Line type="monotone" dataKey="valueB" name={`${selectedB.ticker} (${selectedB.domicile})`} stroke="#D91222" strokeWidth={2} dot={false} activeDot={{ r: 6 }} fillOpacity={0.06} />
              <Line type="monotone" dataKey="valueBench" name="Benchmark" stroke="#818CF8" strokeWidth={1.5} strokeDasharray="6 6" dot={false} activeDot={false} />
            </RechartsLineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={samplePoints} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F4" />
              <XAxis dataKey="displayYear" tick={{ fontSize: 11, fill: '#A2A3A5', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 11, fill: '#A2A3A5', fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip showInUsd={showInUsd} />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#727579', fontFamily: 'Inter' }} iconType="circle" />
              
              <Bar dataKey="taxA" name={`${selectedA.ticker} Tax Leakage`} stackId="A" fill="#F59E0B" />
              <Bar dataKey="terA" name={`${selectedA.ticker} Asset TER`} stackId="A" fill="#EF4444" />
              <Bar dataKey="spreadA" name={`${selectedA.ticker} Bid-Ask Spread`} stackId="A" fill="#8B5CF6" />
              <Bar dataKey="feesA" name={`${selectedA.ticker} Trade & FX Fees`} stackId="A" fill="#38BDF8" />

              <Bar dataKey="taxB" name={`${selectedB.ticker} Tax Leakage`} stackId="B" fill="#D97706" />
              <Bar dataKey="terB" name={`${selectedB.ticker} Asset TER`} stackId="B" fill="#B91C1C" />
              <Bar dataKey="spreadB" name={`${selectedB.ticker} Bid-Ask Spread`} stackId="B" fill="#7C3AED" />
              <Bar dataKey="feesB" name={`${selectedB.ticker} Trade & FX Fees`} stackId="B" fill="#D91222" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Legend Explanation Accent */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-[11px] text-[#727579] leading-normal border-t border-[#E6E6E6]">
        <div className="flex items-start gap-2 bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E6E6E6]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#727579] shrink-0 mt-0.5"></span>
          <span>
            <strong>{selectedA.ticker} value</strong> compounds S&P 500 capital minus WHT ({selectedA.domicile === "US" ? "30%" : "15%"}), MER, and execution fees.
          </span>
        </div>
        <div className="flex items-start gap-2 bg-[#F7F8FA] p-2.5 rounded-xl border border-[#D91222]/20">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D91222] shrink-0 mt-0.5"></span>
          <span>
            <strong>{selectedB.ticker} value</strong> incorporates internal WHT optimization ({selectedB.domicile === "US" ? "30%" : "15%"}) under Bilateral Treaties.
          </span>
        </div>
        <div className="flex items-start gap-2 bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E6E6E6]">
          <span className="w-4 h-0.5 border-t border-dashed border-[#818CF8] shrink-0 mt-2"></span>
          <span>
            <strong>Un-dragged Baseline</strong> simulates S&P 500 compounding with zero tax friction, product fees, or spot FX commissions.
          </span>
        </div>
      </div>
    </Card>
  );
}
