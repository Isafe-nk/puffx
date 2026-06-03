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
  Legend,
} from "recharts";
import { MonteCarloResult } from "../engine/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-MS", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Filter out individual paths and sort by visual priority
    const items = payload
      .filter((item: any) => !item.name.startsWith('path_'))
      .sort((a: any, b: any) => {
        const order = ["Optimistic (Top 10%)", "Median (Typical)", "Pessimistic (Bottom 10%)"];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });

    if (items.length === 0) return null;

    return (
      <div className="bg-white border border-[#E6E6E6] p-3 rounded-xl shadow-sm min-w-[200px] glass-card">
        <p className="text-[10px] text-[#A2A3A5] mb-3 font-bold uppercase tracking-widest border-b border-[#E6E6E6] pb-2">
          Age {label} Projection
        </p>
        <div className="space-y-2.5">
          {items.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-[#727579] font-medium">{item.name.split(' (')[0]}</span>
              </div>
              <span className="text-[11px] font-mono font-bold" style={{ color: item.color }}>
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

export const MonteCarloChart: React.FC<{ result: MonteCarloResult; currentAge: number }> = ({
  result,
  currentAge,
}) => {
  const chartData = result.percentiles.p50.map((_, i) => {
    const dataPoint: any = {
      age: currentAge + i,
      p10: result.percentiles.p10[i],
      p50: result.percentiles.p50[i],
      p90: result.percentiles.p90[i],
    };
    
    // Add individual path data points
    result.paths.forEach((path, pathIdx) => {
      dataPoint[`path_${pathIdx}`] = path[i];
    });
    
    return dataPoint;
  });

  return (
    <div className="h-[450px] w-full bg-[#FAFBFC] p-4 rounded-2xl border border-[#E8E8E9]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F4" vertical={false} />
          <XAxis
            dataKey="age"
            stroke="#A2A3A5"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#A2A3A5"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            content={() => (
              <div className="flex flex-wrap justify-center gap-6 mt-4">
                {[
                  { label: "Optimistic (Top 10%)", color: "#10b981" },
                  { label: "Median (Typical)", color: "#307EF2" },
                  { label: "Pessimistic (Bottom 10%)", color: "#ef4444" }
                ].map((item, index) => (
                  <div key={`item-${index}`} className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-[#727579] uppercase font-bold tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          />
          
          {/* Individual Paths (The Cloud) - Rendered first to be in background */}
          {result.paths.map((_, idx) => (
            <Line
              key={`path-${idx}`}
              type="monotone"
              dataKey={`path_${idx}`}
              stroke="#A2A3A5"
              strokeWidth={0.5}
              strokeOpacity={0.12}
              dot={false}
              activeDot={false}
              connectNulls
              name={`path_${idx}`}
            />
          ))}

          {/* Main Percentile Lines - Ordered Top to Bottom in Legend */}
          <Line
            type="monotone"
            dataKey="p90"
            stroke="#0EB35B"
            strokeWidth={2}
            dot={false}
            name="Optimistic (Top 10%)"
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#307EF2"
            strokeWidth={3}
            dot={false}
            name="Median (Typical)"
          />
          <Line
            type="monotone"
            dataKey="p10"
            stroke="#D91222"
            strokeWidth={2}
            dot={false}
            name="Pessimistic (Bottom 10%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
