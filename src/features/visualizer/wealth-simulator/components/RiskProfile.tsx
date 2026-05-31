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
      color: "#ef4444",
      desc: "Global Financial Crisis"
    },
    {
      name: "2020 COVID",
      impact: -(allocation.equity * 0.34 + allocation.realEstate * 0.25) + (allocation.fixedIncome * 0.02 + allocation.gold * 0.10),
      color: "#f97316",
      desc: "Pandemic Crash"
    },
    {
      name: "Flat Market",
      impact: (allocation.equity * 0.02 + allocation.fixedIncome * 0.03 + allocation.realEstate * 0.01 + allocation.cash * 0.02 - allocation.gold * 0.02),
      color: "#6366f1",
      desc: "Sideways Year"
    },
    {
      name: "Bull Market",
      impact: (allocation.equity * 0.25 + allocation.fixedIncome * 0.02 + allocation.realEstate * 0.15 + allocation.gold * 0.05 + allocation.cash * 0.02),
      color: "#10b981",
      desc: "Strong Growth"
    }
  ];

  const formatPercent = (v: number) => `${(v * 100).toFixed(1)}%`;

  const CustomStressTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-2xl min-w-[220px]">
          <p className="text-[10px] text-zinc-500 mb-3 font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            Scenario Analysis
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-zinc-400 font-medium">Event</span>
              <span className="text-[11px] font-bold text-white">{data.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-zinc-400 font-medium">Estimated Impact</span>
              <span className={`text-[11px] font-mono font-bold ${data.impact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {data.impact > 0 ? '+' : ''}{formatPercent(data.impact)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5">
            <p className="text-[10px] text-zinc-500 italic leading-relaxed">
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
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-5 rounded-xl border border-white/5 shadow-xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300 relative overflow-hidden group">
          {/* Accent decoration */}
          <div className={`absolute top-0 left-0 w-1 h-full ${
            stats.riskLevel === 'Aggressive' ? 'bg-gradient-to-b from-red-500 to-red-600' : 
            stats.riskLevel === 'Moderate' ? 'bg-gradient-to-b from-amber-500 to-amber-600' : 
            'bg-gradient-to-b from-emerald-500 to-emerald-600'
          }`} />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Portfolio profile</p>
              <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Gauge size={13} className="text-zinc-500 shrink-0" /> Classification
              </h4>
            </div>
            <span className={`px-2 py-0.5 text-[8px] rounded-full font-bold uppercase tracking-widest shrink-0 ${
              stats.riskLevel === 'Aggressive' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
              stats.riskLevel === 'Moderate' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
              'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}>
              {stats.riskLevel}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`text-xl font-black tracking-tight ${
              stats.riskLevel === 'Aggressive' ? 'text-red-400' : 
              stats.riskLevel === 'Moderate' ? 'text-amber-400' : 
              'text-emerald-400'
            }`}>
              {stats.riskLevel}
            </span>
            <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
              stats.riskLevel === 'Aggressive' ? 'bg-red-500' : 
              stats.riskLevel === 'Moderate' ? 'bg-amber-500' : 
              'bg-emerald-500'
            }`} />
          </div>
          <p className="text-[10.5px] text-zinc-500 mt-2 leading-relaxed">
            Derived from current asset volatility weights.
          </p>
        </div>
        
        {/* Sharpe Ratio Card */}
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-5 rounded-xl border border-white/5 shadow-xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-indigo-600" />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Efficiency index</p>
              <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-zinc-500 shrink-0" /> Sharpe Ratio
              </h4>
            </div>
            <span className={`px-2 py-0.5 text-[8px] rounded-full font-bold uppercase tracking-widest shrink-0 ${
              stats.sharpeRatio > 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              stats.sharpeRatio > 0.5 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
              'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
            }`}>
              {stats.sharpeRatio > 1 ? 'Excellent' : stats.sharpeRatio > 0.5 ? 'Good' : 'Sub-Optimal'}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-indigo-400 tracking-tight">
              {stats.sharpeRatio.toFixed(2)}
            </span>
            <span className="text-zinc-500 text-[10px] font-medium font-mono">Index</span>
          </div>
          <p className="text-[10.5px] text-zinc-500 mt-2 leading-relaxed">
            Risk-adjusted relative performance versus cash rate.
          </p>
        </div>

        {/* Annual Volatility Card */}
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-5 rounded-xl border border-white/5 shadow-xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600" />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Risk magnitude</p>
              <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Activity size={13} className="text-zinc-500 shrink-0" /> Volatility
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-widest shrink-0">
              Annualized
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-400 tracking-tight">
              {formatPercent(stats.volatility)}
            </span>
            <span className="text-zinc-500 text-[10px] font-medium font-mono">σ</span>
          </div>
          <p className="text-[10.5px] text-zinc-500 mt-2 leading-relaxed">
            Historical portfolio standard deviation swings.
          </p>
        </div>

        {/* Diversification Benefit Card */}
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-5 rounded-xl border border-white/5 shadow-xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
          
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Asset synergy</p>
              <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Layers size={13} className="text-zinc-500 shrink-0" /> Benefit
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold uppercase tracking-widest shrink-0">
              Correlation
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-400 tracking-tight">
              {formatPercent(
                (allocation.equity * 0.15 + 
                 allocation.fixedIncome * 0.05 + 
                 allocation.cash * 0.01 + 
                 allocation.realEstate * 0.09 + 
                 allocation.gold * 0.12) - stats.volatility
              )}
            </span>
            <span className="text-zinc-500 text-[10px] font-medium font-mono">Saved</span>
          </div>
          <p className="text-[10.5px] text-zinc-500 mt-2 leading-relaxed">
            Risk negated by non-correlation of assets.
          </p>
        </div>
      </div>

      {/* Stress Test Chart */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert size={16} className="text-red-400" /> Portfolio Stress Test
          </h3>
          <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-500 flex items-center gap-1">
            <Info size={10} /> Estimated Historical Impact
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarios} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                domain={[-0.6, 0.6]} 
                hide 
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomStressTooltip />} />
              <ReferenceLine x={0} stroke="#444" />
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
        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex gap-3">
          <Zap size={20} className="text-red-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-red-400 uppercase mb-1">Tail Risk</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              In a severe market crash, your portfolio could lose up to <span className="text-red-400 font-bold">{formatPercent(Math.abs(scenarios[0].impact))}</span>. 
              Ensure you have at least 6 months of cash to avoid selling at the bottom.
            </p>
          </div>
        </div>
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-3">
          <TrendingUp size={20} className="text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">Efficiency</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Your Sharpe Ratio of <span className="text-emerald-400 font-bold">{stats.sharpeRatio.toFixed(2)}</span> indicates 
              {stats.sharpeRatio > 1 ? ' excellent ' : stats.sharpeRatio > 0.5 ? ' good ' : ' moderate '} 
              risk-adjusted returns. {stats.sharpeRatio < 0.5 && 'Consider diversifying into uncorrelated assets.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
