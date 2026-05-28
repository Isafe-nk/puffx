import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { LineChart, TrendingUp, AlertCircle } from "lucide-react";
import { ETF, SimulationDataPoint } from "../types";

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

export default function PerformanceCharts({
  simData,
  selectedA,
  selectedB,
  showInUsd,
  usdMyrRate,
  activeTab,
  setActiveTab,
  finalTerA,
  finalTerB
}: PerformanceChartsProps) {
  const chartRef1 = useRef<HTMLCanvasElement | null>(null);
  const chartRef2 = useRef<HTMLCanvasElement | null>(null);
  const chartInstance1 = useRef<Chart | null>(null);
  const chartInstance2 = useRef<Chart | null>(null);

  // Line Chart Effect
  useEffect(() => {
    if (chartRef1.current) {
      if (chartInstance1.current) {
        chartInstance1.current.destroy();
      }
      const ctx = chartRef1.current.getContext('2d');
      if (ctx) {
        chartInstance1.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: simData.map(d => `Year ${d.year}`),
            datasets: [
              {
                label: `${selectedA.ticker} (${selectedA.domicile})`,
                data: simData.map(d => showInUsd ? d.valueA / usdMyrRate : d.valueA),
                borderColor: '#727579',
                backgroundColor: 'rgba(114, 117, 121, 0.06)',
                tension: 0.1,
                fill: true,
                borderWidth: 2,
                pointRadius: simData.length > 25 ? 1 : 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#727579'
              },
              {
                label: `${selectedB.ticker} (${selectedB.domicile})`,
                data: simData.map(d => showInUsd ? d.valueB / usdMyrRate : d.valueB),
                borderColor: '#D91222',
                backgroundColor: 'rgba(217, 18, 34, 0.06)',
                tension: 0.1,
                fill: true,
                borderWidth: 2,
                pointRadius: simData.length > 25 ? 1 : 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#D91222'
              },
              {
                label: 'Benchmark (Un-dragged S&P 500)',
                data: simData.map(d => showInUsd ? d.valueBench / usdMyrRate : d.valueBench),
                borderColor: '#818CF8',
                borderWidth: 1.5,
                borderDash: [6, 6],
                tension: 0.1,
                fill: false,
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#727579',
                  font: { family: 'Inter', size: 12, weight: 'normal' },
                  boxWidth: 12
                }
              },
              tooltip: {
                backgroundColor: '#FFFFFF',
                titleColor: '#212121',
                bodyColor: '#44474D',
                borderColor: '#E6E6E6',
                borderWidth: 1,
                padding: 12,
                titleFont: { family: 'Hanken Grotesk', size: 13, weight: 'bold' },
                bodyFont: { family: 'Inter', size: 12 },
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label.indexOf('Benchmark') !== -1) label = 'Pure Baseline';
                    else label = label.split(' ')[0];
                    if (context.parsed.y !== null) {
                      label += `: ${showInUsd ? '$' : 'RM'}${Number(context.parsed.y).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#A2A3A5', font: { family: 'Inter', size: 11 } }
              },
              y: {
                grid: { color: '#F3F3F4' },
                ticks: { 
                  color: '#A2A3A5', 
                  font: { family: 'Inter', size: 11 },
                  callback: function(value) {
                    return (showInUsd ? '$' : 'RM') + Number(value).toLocaleString();
                  }
                }
              }
            }
          }
        });
      }
    }
  }, [simData, selectedA, selectedB, showInUsd, usdMyrRate]);

  // Stacked Bar Chart Effect
  useEffect(() => {
    if (chartRef2.current) {
      if (chartInstance2.current) {
        chartInstance2.current.destroy();
      }
      const ctx = chartRef2.current.getContext('2d');
      if (ctx) {
        const samplePoints = simData.filter((_, idx) => {
          if (simData.length <= 11) return true;
          const step = Math.ceil((simData.length - 1) / 10);
          return idx === 0 || idx % step === 0 || idx === simData.length - 1;
        });

        chartInstance2.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: samplePoints.map(d => `Year ${d.year}`),
            datasets: [
              // Asset A Stacks
              {
                label: `${selectedA.ticker} Tax Leakage`,
                data: samplePoints.map(d => showInUsd ? d.taxA / usdMyrRate : d.taxA),
                backgroundColor: '#F59E0B',
                stack: 'A'
              },
              {
                label: `${selectedA.ticker} Asset TER`,
                data: samplePoints.map(d => showInUsd ? d.terA / usdMyrRate : d.terA),
                backgroundColor: '#EF4444',
                stack: 'A'
              },
              {
                label: `${selectedA.ticker} Bid-Ask Spread`,
                data: samplePoints.map(d => showInUsd ? d.spreadA / usdMyrRate : d.spreadA),
                backgroundColor: '#8B5CF6',
                stack: 'A'
              },
              {
                label: `${selectedA.ticker} Trade & FX Fees`,
                data: samplePoints.map(d => showInUsd ? d.feesA / usdMyrRate : d.feesA),
                backgroundColor: '#38BDF8',
                stack: 'A'
              },
              // Asset B Stacks
              {
                label: `${selectedB.ticker} Tax Leakage`,
                data: samplePoints.map(d => showInUsd ? d.taxB / usdMyrRate : d.taxB),
                backgroundColor: '#D97706',
                stack: 'B'
              },
              {
                label: `${selectedB.ticker} Asset TER`,
                data: samplePoints.map(d => showInUsd ? d.terB / usdMyrRate : d.terB),
                backgroundColor: '#B91C1C',
                stack: 'B'
              },
              {
                label: `${selectedB.ticker} Bid-Ask Spread`,
                data: samplePoints.map(d => showInUsd ? d.spreadB / usdMyrRate : d.spreadB),
                backgroundColor: '#7C3AED',
                stack: 'B'
              },
              {
                label: `${selectedB.ticker} Trade & FX Fees`,
                data: samplePoints.map(d => showInUsd ? d.feesB / usdMyrRate : d.feesB),
                backgroundColor: '#D91222',
                stack: 'B'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#727579',
                  font: { family: 'Inter', size: 10, weight: 'normal' },
                  boxWidth: 10,
                  padding: 10
                }
              },
              tooltip: {
                backgroundColor: '#FFFFFF',
                titleColor: '#212121',
                bodyColor: '#44474D',
                borderColor: '#E6E6E6',
                borderWidth: 1,
                padding: 12,
                titleFont: { family: 'Hanken Grotesk', size: 13, weight: 'bold' },
                bodyFont: { family: 'Inter', size: 12 },
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    if (context.parsed.y !== null) {
                      return `${label}: ${showInUsd ? '$' : 'RM'}${Number(context.parsed.y).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: '#A2A3A5', font: { family: 'Inter', size: 11 } }
              },
              y: {
                stacked: true,
                grid: { color: '#F3F3F4' },
                ticks: { 
                  color: '#A2A3A5', 
                  font: { family: 'Inter', size: 11 },
                  callback: function(value) {
                    return (showInUsd ? '$' : 'RM') + Number(value).toLocaleString();
                  }
                }
              }
            }
          }
        });
      }
    }
  }, [simData, selectedA, selectedB, showInUsd, usdMyrRate]);

  return (
    <div className="glass-card rounded-3xl p-5 lg:p-6 shadow-sm space-y-4">
      
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
      <div className="relative h-[340px] w-full bg-[#FAFBFC] rounded-2xl p-2 border border-[#E8E8E9]">
        <div className={`w-full h-full ${activeTab === "performance" ? "block" : "hidden"}`}>
          <canvas ref={chartRef1} id="performanceChart" className="w-full h-full" />
        </div>
        <div className={`w-full h-full ${activeTab === "leakage" ? "block" : "hidden"}`}>
          <canvas ref={chartRef2} id="leakageChart" className="w-full h-full" />
        </div>
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

    </div>
  );
}
