/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SimulationYear, AssetAllocation } from "../engine/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-MS", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
    notation: value > 1000000 ? "compact" : "standard",
  }).format(value);

const CustomTimelineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E6E6E6] p-4 rounded-xl shadow-sm min-w-[240px] glass-card">
        <p className="text-[10px] text-[#A2A3A5] mb-3 font-bold uppercase tracking-widest border-b border-[#E6E6E6] pb-2">
          Age {label} Financial Snapshot
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
        {payload.length >= 2 && (
          <div className="mt-3 pt-2 border-t border-[#E6E6E6]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#A2A3A5] uppercase font-bold">Net Worth Ratio</span>
              <span className="text-[10px] text-[#44474D] font-mono">
                {((payload.find((p: any) => p.dataKey === 'netWorth')?.value || 0) / 
                  (payload.find((p: any) => p.dataKey === 'inflationAdjustedNetWorth')?.value || 1) * 100).toFixed(0)}% Nominal
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const TimelineChart: React.FC<{ data: SimulationYear[] }> = ({ data }) => {
  return (
    <div className="h-[400px] w-full bg-[#FAFBFC] p-4 rounded-2xl border border-[#E8E8E9]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EB35B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0EB35B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis
            dataKey="age"
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
          <Tooltip content={<CustomTimelineTooltip />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#0EB35B"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNetWorth)"
            name="Net Worth"
          />
          <Line
            type="monotone"
            dataKey="debtBalance"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="Debt Balance"
          />
          <Line
            type="monotone"
            dataKey="inflationAdjustedNetWorth"
            stroke="#6366f1"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="Inflation Adjusted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AllocationPie: React.FC<{ allocation: AssetAllocation }> = ({ allocation }) => {
  const data = [
    { name: "Equity", value: allocation.equity, color: "#0EB35B" },
    { name: "Fixed Income", value: allocation.fixedIncome, color: "#6366f1" },
    { name: "Cash", value: allocation.cash, color: "#f59e0b" },
    { name: "Real Estate", value: allocation.realEstate, color: "#ec4899" },
    { name: "Gold", value: allocation.gold, color: "#eab308" },
  ].filter(d => d.value > 0);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, "Allocation"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
