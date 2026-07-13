/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from "recharts";
import { ShieldAlert, Zap, TrendingUp, Info, Gauge, Activity, Layers, ShieldCheck } from "lucide-react";
import SliderInput from "../../../../shared/components/SliderInput";
import { AssetAllocation } from "../engine/types";

interface RiskProfileProps {
  stats: {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
    riskLevel: string;
  };
  allocation: AssetAllocation;
}

export const RiskProfile: React.FC<RiskProfileProps> = ({ stats, allocation }) => {
  // Scenario definitions (estimated impacts based on asset class historical behavior)
  const scenarios = [
    {
      name: "2008 Crisis",
      impact: -(allocation.equity * 0.50 + allocation.realEstate * 0.40) + (allocation.fixedIncome * 0.05 + allocation.gold * 0.05),
      color: "#C4453C",
      desc: "Global Financial Crisis"
    },
    {
      name: "2020 COVID",
      impact: -(allocation.equity * 0.34 + allocation.realEstate * 0.25) + (allocation.fixedIncome * 0.02 + allocation.gold * 0.10),
      color: "#D99A2B",
      desc: "Pandemic Crash"
    },
    {
      name: "Flat Market",
      impact: (allocation.equity * 0.02 + allocation.fixedIncome * 0.03 + allocation.realEstate * 0.01 - allocation.gold * 0.02),
      color: "#4E7A96",
      desc: "Sideways Year"
    },
    {
      name: "Bull Market",
      impact: (allocation.equity * 0.25 + allocation.fixedIncome * 0.02 + allocation.realEstate * 0.15 + allocation.gold * 0.05),
      color: "#3E7355",
      desc: "Strong Growth"
    }
  ];

  const formatPercent = (v: number) => `${(v * 100).toFixed(1)}%`;

  const CustomStressTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#DCE0D2] p-4 rounded-lg min-w-[220px]">
          <p className="text-[10px] text-[#9AA394] mb-3 font-bold uppercase tracking-widest border-b border-[#DCE0D2] pb-2">
            Scenario Analysis
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-[#75806F] font-medium">Event</span>
              <span className="text-[11px] font-bold text-[#243129]">{data.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-[#75806F] font-medium">Estimated Impact</span>
              <span className={`text-[11px] font-mono font-bold ${data.impact < 0 ? 'text-[#3E7355]' : 'text-[#3E7355]'}`}>
                {data.impact > 0 ? '+' : ''}{formatPercent(data.impact)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DCE0D2]">
            <p className="text-[10px] text-[#9AA394] italic leading-relaxed">
              {data.desc}: Based on your current asset allocation of {formatPercent(allocation.equity)} equity and {formatPercent(allocation.fixedIncome)} fixed income.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Risk Level Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Classification Card */}
        <div className="bg-gradient-to-br from-[#FDFCF7] to-white p-5 rounded-lg border border-[#DCE0D2] flex flex-col justify-between hover:border-[#C7CDBB] transition-all duration-300 relative overflow-hidden group">
          {/* Accent decoration */}
          <div className={`absolute top-0 left-0 w-1 h-full ${
            stats.riskLevel === 'Aggressive' ? 'bg-[#3E7355]' : 
            stats.riskLevel === 'Moderate' ? 'bg-[#D99A2B]' : 
            'bg-[#3E7355]'
          }`} />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider mb-1">Portfolio profile</p>
              <h4 className="text-xs font-semibold text-[#4A544C] flex items-center gap-1.5">
                <Gauge size={13} className="text-[#9AA394] shrink-0" /> Classification
              </h4>
            </div>
            <span className={`px-2 py-0.5 text-[8px] rounded-full font-bold uppercase tracking-widest shrink-0 ${
              stats.riskLevel === 'Aggressive' ? 'bg-[#3E7355]/10 text-[#3E7355] border border-[#3E7355]/20' : 
              stats.riskLevel === 'Moderate' ? 'bg-[#D99A2B]/10 text-[#D99A2B] border border-[#D99A2B]/20' : 
              'bg-[#3E7355]/10 text-[#3E7355] border border-[#3E7355]/20'
            }`}>
              {stats.riskLevel}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`text-xl font-black tracking-tight ${
              stats.riskLevel === 'Aggressive' ? 'text-[#3E7355]' : 
              stats.riskLevel === 'Moderate' ? 'text-[#D99A2B]' : 
              'text-[#3E7355]'
            }`}>
              {stats.riskLevel}
            </span>
            <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
              stats.riskLevel === 'Aggressive' ? 'bg-[#3E7355]' : 
              stats.riskLevel === 'Moderate' ? 'bg-[#D99A2B]' : 
              'bg-[#3E7355]'
            }`} />
          </div>
          <p className="text-[10.5px] text-[#9AA394] mt-2 leading-relaxed">
            Derived from current asset volatility weights.
          </p>
        </div>
        
        {/* Sharpe Ratio Card */}
        <div className="bg-gradient-to-br from-[#FDFCF7] to-white p-5 rounded-lg border border-[#DCE0D2] flex flex-col justify-between hover:border-[#C7CDBB] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#4E7A96]" />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider mb-1">Efficiency index</p>
              <h4 className="text-xs font-semibold text-[#4A544C] flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[#9AA394] shrink-0" /> Sharpe Ratio
              </h4>
            </div>
            <span className={`px-2 py-0.5 text-[8px] rounded-full font-bold uppercase tracking-widest shrink-0 ${
              stats.sharpeRatio > 1 ? 'bg-[#3E7355]/10 text-[#3E7355] border border-[#3E7355]/20' :
              stats.sharpeRatio > 0.5 ? 'bg-[#4E7A96]/10 text-[#4E7A96] border border-[#4E7A96]/20' :
              'bg-[#DCE0D2]/50 text-[#75806F] border border-[#DCE0D2]'
            }`}>
              {stats.sharpeRatio > 1 ? 'Excellent' : stats.sharpeRatio > 0.5 ? 'Good' : 'Sub-Optimal'}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#4E7A96] tracking-tight">
              {stats.sharpeRatio.toFixed(2)}
            </span>
            <span className="text-[#9AA394] text-[10px] font-medium font-mono">Index</span>
          </div>
          <p className="text-[10.5px] text-[#9AA394] mt-2 leading-relaxed">
            Risk-adjusted relative performance versus cash rate.
          </p>
        </div>

        {/* Annual Volatility Card */}
        <div className="bg-gradient-to-br from-[#FDFCF7] to-white p-5 rounded-lg border border-[#DCE0D2] flex flex-col justify-between hover:border-[#C7CDBB] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D99A2B]" />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider mb-1">Risk magnitude</p>
              <h4 className="text-xs font-semibold text-[#4A544C] flex items-center gap-1.5">
                <Activity size={13} className="text-[#9AA394] shrink-0" /> Volatility
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[8px] bg-[#D99A2B]/10 text-[#D99A2B] border border-[#D99A2B]/20 rounded-full font-bold uppercase tracking-widest shrink-0">
              Annualized
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#D99A2B] tracking-tight">
              {formatPercent(stats.volatility)}
            </span>
            <span className="text-[#9AA394] text-[10px] font-medium font-mono">σ</span>
          </div>
          <p className="text-[10.5px] text-[#9AA394] mt-2 leading-relaxed">
            Historical portfolio standard deviation swings.
          </p>
        </div>

        {/* Diversification Benefit Card */}
        <div className="bg-gradient-to-br from-[#FDFCF7] to-white p-5 rounded-lg border border-[#DCE0D2] flex flex-col justify-between hover:border-[#C7CDBB] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#3E7355]" />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider mb-1">Asset synergy</p>
              <h4 className="text-xs font-semibold text-[#4A544C] flex items-center gap-1.5">
                <Layers size={13} className="text-[#9AA394] shrink-0" /> Benefit
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[8px] bg-[#3E7355]/10 text-[#3E7355] border border-[#3E7355]/20 rounded-full font-bold uppercase tracking-widest shrink-0">
              Correlation
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#3E7355] tracking-tight">
              {formatPercent(
                (allocation.equity * 0.15 +
                 allocation.fixedIncome * 0.05 +
                 allocation.realEstate * 0.09 +
                 allocation.gold * 0.12) - stats.volatility
              )}
            </span>
            <span className="text-[#9AA394] text-[10px] font-medium font-mono">Saved</span>
          </div>
          <p className="text-[10.5px] text-[#9AA394] mt-2 leading-relaxed">
            Risk negated by non-correlation of assets.
          </p>
        </div>
      </div>

      {/* Stress Test Chart */}
      <div className="bg-white p-6 rounded-lg border border-[#DCE0D2]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-[#4A544C] flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert size={16} className="text-[#3E7355]" /> Portfolio Stress Test
          </h3>
          <div className="px-2 py-1 bg-[#EDF3EC] border border-[#DCE0D2] rounded text-[10px] text-[#9AA394] flex items-center gap-1">
            <Info size={10} /> Estimated Historical Impact
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarios} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF3EC" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                domain={[-0.6, 0.6]} 
                hide 
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#9AA394" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomStressTooltip />} />
              <ReferenceLine x={0} stroke="#C7CDBB" />
              <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {scenarios.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#3E7355]/5 border border-[#3E7355]/10 rounded-lg flex gap-3">
          <Zap size={20} className="text-[#3E7355] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#3E7355] uppercase mb-1">Tail Risk</h4>
            <p className="text-[11px] text-[#75806F] leading-relaxed">
              In a severe market crash, your portfolio could lose up to <span className="text-[#3E7355] font-bold">{formatPercent(Math.abs(scenarios[0].impact))}</span>. 
              Ensure you have at least 6 months of cash to avoid selling at the bottom.
            </p>
          </div>
        </div>
        <div className="p-4 bg-[#3E7355]/5 border border-[#3E7355]/10 rounded-lg flex gap-3">
          <TrendingUp size={20} className="text-[#3E7355] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#3E7355] uppercase mb-1">Efficiency</h4>
            <p className="text-[11px] text-[#75806F] leading-relaxed">
              Your Sharpe Ratio of <span className="text-[#3E7355] font-bold">{stats.sharpeRatio.toFixed(2)}</span> indicates 
              {stats.sharpeRatio > 1 ? ' excellent ' : stats.sharpeRatio > 0.5 ? ' good ' : ' moderate '} 
              risk-adjusted returns. {stats.sharpeRatio < 0.5 && 'Consider diversifying into uncorrelated assets.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
