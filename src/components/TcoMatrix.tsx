import { Scale, Info } from "lucide-react";
import { ETF, SimulationDataPoint } from "../types";

interface TcoMatrixProps {
  selectedA: ETF;
  selectedB: ETF;
  latestData: SimulationDataPoint;
  dragRatioA: number;
  dragRatioB: number;
  grossMarketGrowth: number;
  marketDividendYield: number;
  finalTerA: number;
  finalTerB: number;
  finalSpreadBpsA: number;
  finalSpreadBpsB: number;
  formatVal: (v: number) => string;
}

export default function TcoMatrix({
  selectedA,
  selectedB,
  latestData,
  dragRatioA,
  dragRatioB,
  grossMarketGrowth,
  marketDividendYield,
  finalTerA,
  finalTerB,
  finalSpreadBpsA,
  finalSpreadBpsB,
  formatVal
}: TcoMatrixProps) {
  return (
    <div className="glass-card rounded-3xl p-5 lg:p-6 shadow-sm space-y-4">
      
      <div className="flex items-center gap-2 border-b border-[#E6E6E6] pb-3">
        <Scale className="text-[#D91222] w-4 h-4" />
        <h3 className="text-sm font-semibold text-[#212121] font-display">
          Detailed Total Cost of Ownership (TCO) Comparison Matrix
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#727579] border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#E6E6E6] text-[#212121] font-semibold bg-[#F7F8FA] font-display">
              <th className="py-3 px-3">Evaluation Parameter</th>
              <th className="py-3 px-3 border-l border-[#E8E8E9] text-[#44474D] font-mono text-right">{selectedA.ticker} ({selectedA.domicile})</th>
              <th className="py-3 px-3 border-l border-[#E8E8E9] text-[#D91222] font-mono text-right">{selectedB.ticker} ({selectedB.domicile})</th>
              <th className="py-3 px-3 border-l border-[#E8E8E9] text-[#44474D] font-mono text-right">Perfect Baseline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E9] font-mono">
            <tr className="border-b border-[#E8E8E9] hover:bg-[#F7F8FA] transition-colors">
              <td className="py-2.5 px-3 font-sans text-[#44474D]">Total Ringgit Contributed</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right">{formatVal(latestData.contribA)}</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right">{formatVal(latestData.contribB)}</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right font-semibold text-[#44474D]">{formatVal(latestData.contribBench)}</td>
            </tr>
            <tr className="border-b border-[#E8E8E9] hover:bg-[#F7F8FA] transition-colors">
              <td className="py-2.5 px-3 font-sans text-[#44474D]">Terminal Portfolio Valuation</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D] font-bold">{formatVal(latestData.valueA)}</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#D91222] font-bold">{formatVal(latestData.valueB)}</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D] font-bold">{formatVal(latestData.valueBench)}</td>
            </tr>
            <tr className="border-b border-[#E8E8E9] hover:bg-[#F7F8FA] transition-colors bg-[#F7F8FA]/50">
              <td className="py-2.5 px-3 font-sans text-[#44474D] font-medium">Accumulated Dividend WHT Paid</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D] font-semibold">{formatVal(latestData.taxA)} <span className="text-[10px] text-[#A2A3A5]">({selectedA.domicile === "US" ? 30 : 15}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#D91222] font-semibold">{formatVal(latestData.taxB)} <span className="text-[10px] text-[#D91222]/70">({selectedB.domicile === "US" ? 30 : 15}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#A2A3A5]">{formatVal(0)} (0%)</td>
            </tr>
            <tr className="border-b border-[#E8E8E9] hover:bg-[#F7F8FA] transition-colors">
              <td className="py-2.5 px-3 font-sans text-[#44474D]">Total Expense Ratio Fees (TER)</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#D91222]">{formatVal(latestData.terA)} <span className="text-[10px] text-[#A2A3A5]">({(finalTerA * 100).toFixed(3)}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#D91222]">{formatVal(latestData.terB)} <span className="text-[10px] text-[#A2A3A5]">({(finalTerB * 100).toFixed(3)}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#A2A3A5]">{formatVal(0)} (0.00%)</td>
            </tr>
            <tr className="border-b border-[#E8E8E9] hover:bg-[#F7F8FA] transition-colors bg-[#F7F8FA]/50">
              <td className="py-2.5 px-3 font-sans text-[#44474D]">ETF Bid-Ask Spread Cost</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D]">{formatVal(latestData.spreadA)} <span className="text-[10px] text-[#A2A3A5]">({finalSpreadBpsA} bps)</span></td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D]">{formatVal(latestData.spreadB)} <span className="text-[10px] text-[#A2A3A5]">({finalSpreadBpsB} bps)</span></td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#A2A3A5]">{formatVal(0)} (0 bps)</td>
            </tr>
            <tr className="border-b border-[#E8E8E9] hover:bg-[#F7F8FA] transition-colors">
              <td className="py-2.5 px-3 font-sans text-[#44474D]">Total Brokerage Buy & FX Commissions</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D]">{formatVal(latestData.feesA)}</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D]">{formatVal(latestData.feesB)}</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#A2A3A5]">{formatVal(0)}</td>
            </tr>
            <tr className="border-b border-[#D91222]/20 hover:bg-[#F7F8FA] transition-colors bg-[#D91222]/5 font-semibold text-[#212121]">
              <td className="py-2.5 px-3 font-sans text-[#212121]">Total Structural Cash Drag Loss</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D] font-bold">{formatVal(latestData.totalDragA)} ({dragRatioA.toFixed(1)}%)</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#D91222] font-bold">{formatVal(latestData.totalDragB)} ({dragRatioB.toFixed(1)}%)</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#0EB35B] font-bold">{formatVal(0)} (0%)</td>
            </tr>
            <tr className="hover:bg-[#F7F8FA] transition-colors">
              <td className="py-2.5 px-3 font-sans text-[#44474D]">Net Compounded IRR (Annualized)</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#44474D]">{(grossMarketGrowth + marketDividendYield - (finalTerA * 100) - (marketDividendYield * (selectedA.domicile === "US" ? 30 : 15) / 100)).toFixed(2)}%</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#D91222] font-bold">{(grossMarketGrowth + marketDividendYield - (finalTerB * 100) - (marketDividendYield * (selectedB.domicile === "US" ? 30 : 15) / 100)).toFixed(2)}%</td>
              <td className="py-2.5 px-3 border-l border-[#E8E8E9] text-right text-[#0EB35B] font-bold">{(grossMarketGrowth + marketDividendYield).toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2.5 text-[10px] text-[#727579] leading-normal mt-1 bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E6E6E6]">
        <Info className="w-3.5 h-3.5 text-[#D91222] shrink-0 mt-0.5" />
        <span>
          <strong>TCO Mathematical Formula Applied: </strong> 
          Net Annual Return = Gross Growth ({grossMarketGrowth}%) + Dividend Yield ({marketDividendYield}%) - [Expense TER + (Dividend Yield * Domicile WHT rate)]. US Domiciled assets (SPY/IVV/VOO) pay an unavoidable 30% tax on dividends, whereas Irish Domiciled UCITS (CSPX/VUAA/SPYL) optimize this automatically via the US-Ireland Bilateral Double Tax Treaty down to 15%. This creates a 15% absolute withholding tax savings compound benefit over time.
        </span>
      </div>

    </div>
  );
}
