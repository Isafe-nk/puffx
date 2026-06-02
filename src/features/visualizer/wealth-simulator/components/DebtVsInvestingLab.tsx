/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import SliderInput from "../../../../shared/components/SliderInput";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, CreditCard, ShieldCheck, Zap, BarChart3, Target, AlertCircle } from "lucide-react";

interface StrategyResult {
  month: number;
  debtBalance: number;
  investmentBalance: number;
  netWorth: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-MS", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
    notation: value > 100000 ? "compact" : "standard",
  }).format(value);

const CustomLabTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E6E6E6] p-4 rounded-xl shadow-sm min-w-[240px] glass-card">
        <p className="text-[10px] text-[#A2A3A5] mb-3 font-bold uppercase tracking-widest border-b border-[#E6E6E6] pb-2">
          Year {label} Strategy Snapshot
        </p>
        <div className="space-y-3">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || item.stroke }} />
                <span className="text-[11px] text-[#727579] font-medium">{item.name}</span>
              </div>
              <span className="text-[11px] font-mono font-bold" style={{ color: item.color || item.stroke }}>
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const DebtVsInvestingLab: React.FC = () => {
  const [debtAmount, setDebtAmount] = useState(50000);
  const [debtRate, setDebtRate] = useState(0.06);
  const [investRate, setInvestRate] = useState(0.08);
  const [extraMonthly, setExtraMonthly] = useState(1000);
  const [years, setYears] = useState(10);
  const [activeStrategy, setActiveStrategy] = useState<'debt_first' | 'invest_first' | 'split'>('debt_first');

  const simulate = (strategy: 'debt_first' | 'invest_first' | 'split') => {
    const results: StrategyResult[] = [];
    let currentDebt = debtAmount;
    let currentInvest = 0;
    const monthlyDebtRate = debtRate / 12;
    const monthlyInvestRate = investRate / 12;

    for (let month = 0; month <= years * 12; month++) {
      results.push({
        month,
        debtBalance: currentDebt,
        investmentBalance: currentInvest,
        netWorth: currentInvest - currentDebt,
      });

      if (month === years * 12) break;

      currentDebt *= (1 + monthlyDebtRate);
      currentInvest *= (1 + monthlyInvestRate);

      let toDebt = 0;
      let toInvest = 0;

      if (strategy === 'debt_first') {
        if (currentDebt > 0) {
          toDebt = Math.min(extraMonthly, currentDebt);
          toInvest = extraMonthly - toDebt;
        } else {
          toInvest = extraMonthly;
        }
      } else if (strategy === 'invest_first') {
        toInvest = extraMonthly;
      } else {
        const half = extraMonthly / 2;
        if (currentDebt > 0) {
          toDebt = Math.min(half, currentDebt);
          toInvest = extraMonthly - toDebt;
        } else {
          toInvest = extraMonthly;
        }
      }

      currentDebt = Math.max(0, currentDebt - toDebt);
      currentInvest += toInvest;
    }
    return results;
  };

  const simulationData = useMemo(() => simulate(activeStrategy), [debtAmount, debtRate, investRate, extraMonthly, years, activeStrategy]);
  
  const chartData = simulationData.map((d) => ({
    year: (d.month / 12).toFixed(1),
    "Debt Balance": -d.debtBalance,
    "Investment Assets": d.investmentBalance,
    "Net Worth": d.netWorth,
  }));

  const spread = (investRate - debtRate) * 100;
  const arbitrageOpportunity = spread > 0;

  return (
    <div className="space-y-8">
      {/* Executive Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-[#E6E6E6] flex items-center glass-card gap-6">
          <div className={`p-4 rounded-2xl shrink-0 ${arbitrageOpportunity ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
            <Target className={arbitrageOpportunity ? 'text-[#0EB35B]' : 'text-amber-400'} size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#212121] mb-1">Capital Allocation Strategy</h2>
            <p className="text-sm text-[#727579]">
              Current market spread is <span className={arbitrageOpportunity ? 'text-[#0EB35B] font-bold' : 'text-amber-400 font-bold'}>{spread.toFixed(1)}%</span>. 
              {arbitrageOpportunity 
                ? " An arbitrage opportunity exists; however, risk-adjusted returns must be considered." 
                : " Debt reduction is the mathematically superior risk-free return."}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E6E6E6] flex flex-col justify-center text-center glass-card shadow-sm">
          <p className="text-[10px] text-[#A2A3A5] uppercase font-bold mb-1">Efficiency Score</p>
          <p className="text-2xl font-bold text-indigo-400">{(spread / 2 + 5).toFixed(1)}/10</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Strategy Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6E6E6] shadow-sm glass-card">
            <h3 className="text-sm font-semibold text-[#44474D] flex items-center gap-2 uppercase tracking-wider mb-6">
              <Zap size={16} className="text-yellow-500" /> Strategic Inputs
            </h3>
            
            <div className="space-y-6">
              <SliderInput 
                label="Total Liabilities" 
                value={debtAmount} 
                min={0} max={200000} step={1000}
                format={formatCurrency}
                onChange={setDebtAmount} 
              />
              <SliderInput 
                label="Cost of Debt (APR)" 
                value={debtRate * 100} 
                min={0} max={25} step={0.1}
                format={(v) => `${v.toFixed(1)}%`}
                onChange={(v) => setDebtRate(v / 100)} 
              />
              <SliderInput 
                label="Target Portfolio Return" 
                value={investRate * 100} 
                min={0} max={15} step={0.1}
                format={(v) => `${v.toFixed(1)}%`}
                onChange={(v) => setInvestRate(v / 100)} 
              />
              <SliderInput 
                label="Monthly Capital Surplus" 
                value={extraMonthly} 
                min={100} max={10000} step={100}
                format={formatCurrency}
                onChange={setExtraMonthly} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6E6E6] glass-card">
            <h3 className="text-sm font-semibold text-[#44474D] uppercase tracking-wider mb-4">Select Strategy</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'debt_first', label: 'Debt Avalanche', icon: CreditCard, desc: 'Minimize interest expense' },
                { id: 'invest_first', label: 'Growth Maximizer', icon: TrendingUp, desc: 'Leverage market returns' },
                { id: 'split', label: 'Balanced Allocation', icon: BarChart3, desc: 'Psychological middle ground' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStrategy(s.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    activeStrategy === s.id 
                      ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/20' 
                      : 'bg-[#F7F8FA] border-[#E6E6E6] hover:border-[#D0D1D2]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <s.icon size={16} className={activeStrategy === s.id ? 'text-indigo-400' : 'text-[#A2A3A5]'} />
                    <span className={`text-sm font-bold ${activeStrategy === s.id ? 'text-[#212121]' : 'text-[#727579]'}`}>{s.label}</span>
                  </div>
                  <p className="text-[10px] text-[#A2A3A5]">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Visualization */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6E6E6] shadow-sm glass-card">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-[#212121]">Balance Sheet Evolution</h3>
                <p className="text-xs text-[#A2A3A5]">Projected asset vs. liability trajectory over {years} years</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-[10px] text-[#A2A3A5] uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Assets
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#A2A3A5] uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Debt
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EB35B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0EB35B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D91222" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D91222" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomLabTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="Investment Assets" 
                    stroke="#0EB35B" 
                    fillOpacity={1} 
                    fill="url(#colorAssets)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Debt Balance" 
                    stroke="#D91222" 
                    fillOpacity={1} 
                    fill="url(#colorDebt)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategic Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-[#F7F8FA] rounded-2xl border border-[#E6E6E6] space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Risk-Adjusted Return</h4>
              </div>
              <p className="text-[11px] text-[#727579] leading-relaxed">
                Paying off debt at <span className="text-[#212121] font-bold">{(debtRate * 100).toFixed(1)}%</span> is equivalent to a guaranteed, tax-free return. 
                To justify investing instead, your portfolio must achieve a <span className="text-[#212121] font-bold">{(debtRate * 1.25 * 100).toFixed(1)}%</span> pre-tax return to account for market volatility and taxes.
              </p>
            </div>
            <div className="p-5 bg-[#F7F8FA] rounded-2xl border border-[#E6E6E6] space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Liquidity Constraint</h4>
              </div>
              <p className="text-[11px] text-[#727579] leading-relaxed">
                Aggressive debt repayment increases your <span className="text-[#212121] font-bold">net worth</span> but reduces <span className="text-[#212121] font-bold">liquidity</span>. 
                Ensure your emergency fund (currently {formatCurrency(extraMonthly * 3)}) is fully capitalized before accelerating debt principal payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
