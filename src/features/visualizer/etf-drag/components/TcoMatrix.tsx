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
    <div className="bg-surface border border-[#DCE0D2] rounded-lg p-5 lg:p-6 space-y-4">
      
      <div className="flex items-center gap-2 border-b border-[#DCE0D2] pb-3">
        <Scale className="text-[#3E7355] w-4 h-4" />
        <h3 className="text-sm font-semibold text-[#243129] font-display">
          Detailed Total Cost of Ownership (TCO) Comparison Matrix
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#75806F] border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#DCE0D2] text-[#243129] font-semibold bg-[#F6F4EC] font-display">
              <th className="py-3 px-3 sticky left-0 z-10 bg-[#F6F4EC]">Evaluation Parameter</th>
              <th className="py-3 px-3 border-l border-[#DCE0D2] text-[#4A544C] font-mono text-right">{selectedA.ticker} ({selectedA.domicile})</th>
              <th className="py-3 px-3 border-l border-[#DCE0D2] text-[#3E7355] font-mono text-right">{selectedB.ticker} ({selectedB.domicile})</th>
              <th className="py-3 px-3 border-l border-[#DCE0D2] text-[#4A544C] font-mono text-right">Perfect Baseline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE0D2] font-mono">
            <tr className="border-b border-[#DCE0D2] hover:bg-[#F6F4EC] transition-colors">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#4A544C]">Total Ringgit Contributed</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right">{formatVal(latestData.contribA)}</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right">{formatVal(latestData.contribB)}</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right font-semibold text-[#4A544C]">{formatVal(latestData.contribBench)}</td>
            </tr>
            <tr className="border-b border-[#DCE0D2] hover:bg-[#F6F4EC] transition-colors">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#4A544C]">Terminal Portfolio Valuation</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C] font-bold">{formatVal(latestData.valueA)}</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355] font-bold">{formatVal(latestData.valueB)}</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C] font-bold">{formatVal(latestData.valueBench)}</td>
            </tr>
            <tr className="border-b border-[#DCE0D2] hover:bg-[#F6F4EC] transition-colors bg-[#F6F4EC]/50">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#4A544C] font-medium">Accumulated Dividend WHT Paid</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C] font-semibold">{formatVal(latestData.taxA)} <span className="text-[10px] text-[#9AA394]">({selectedA.domicile === "US" ? 30 : 15}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355] font-semibold">{formatVal(latestData.taxB)} <span className="text-[10px] text-[#3E7355]/70">({selectedB.domicile === "US" ? 30 : 15}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#9AA394]">{formatVal(0)} (0%)</td>
            </tr>
            <tr className="border-b border-[#DCE0D2] hover:bg-[#F6F4EC] transition-colors">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#4A544C]">Total Expense Ratio Fees (TER)</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355]">{formatVal(latestData.terA)} <span className="text-[10px] text-[#9AA394]">({(finalTerA * 100).toFixed(3)}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355]">{formatVal(latestData.terB)} <span className="text-[10px] text-[#9AA394]">({(finalTerB * 100).toFixed(3)}%)</span></td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#9AA394]">{formatVal(0)} (0.00%)</td>
            </tr>
            <tr className="border-b border-[#DCE0D2] hover:bg-[#F6F4EC] transition-colors bg-[#F6F4EC]/50">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#4A544C]">ETF Bid-Ask Spread Cost</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C]">{formatVal(latestData.spreadA)} <span className="text-[10px] text-[#9AA394]">({finalSpreadBpsA} bps)</span></td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C]">{formatVal(latestData.spreadB)} <span className="text-[10px] text-[#9AA394]">({finalSpreadBpsB} bps)</span></td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#9AA394]">{formatVal(0)} (0 bps)</td>
            </tr>
            <tr className="border-b border-[#DCE0D2] hover:bg-[#F6F4EC] transition-colors">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#4A544C]">Total Brokerage Buy & FX Commissions</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C]">{formatVal(latestData.feesA)}</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C]">{formatVal(latestData.feesB)}</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#9AA394]">{formatVal(0)}</td>
            </tr>
            <tr className="border-b border-[#3E7355]/20 hover:bg-[#F6F4EC] transition-colors bg-[#3E7355]/5 font-semibold text-[#243129]">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#243129]">Total Structural Cash Drag Loss</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C] font-bold">{formatVal(latestData.totalDragA)} ({dragRatioA.toFixed(1)}%)</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355] font-bold">{formatVal(latestData.totalDragB)} ({dragRatioB.toFixed(1)}%)</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355] font-bold">{formatVal(0)} (0%)</td>
            </tr>
            <tr className="hover:bg-[#F6F4EC] transition-colors">
              <td className="py-2.5 px-3 sticky left-0 z-10 bg-white font-sans text-[#4A544C]">Net Compounded IRR (Annualized)</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#4A544C]">{(grossMarketGrowth + marketDividendYield - (finalTerA * 100) - (marketDividendYield * (selectedA.domicile === "US" ? 30 : 15) / 100)).toFixed(2)}%</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355] font-bold">{(grossMarketGrowth + marketDividendYield - (finalTerB * 100) - (marketDividendYield * (selectedB.domicile === "US" ? 30 : 15) / 100)).toFixed(2)}%</td>
              <td className="py-2.5 px-3 border-l border-[#DCE0D2] text-right text-[#3E7355] font-bold">{(grossMarketGrowth + marketDividendYield).toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2.5 text-[10px] text-[#75806F] leading-normal mt-1 bg-[#F6F4EC] p-3.5 rounded-lg border border-[#DCE0D2]">
        <Info className="w-3.5 h-3.5 text-[#3E7355] shrink-0 mt-0.5" />
        <span>
          <strong>TCO Mathematical Formula Applied: </strong> 
          Net Annual Return = Gross Growth ({grossMarketGrowth}%) + Dividend Yield ({marketDividendYield}%) - [Expense TER + (Dividend Yield * Domicile WHT rate)]. US Domiciled assets (SPY/IVV/VOO) pay an unavoidable 30% tax on dividends, whereas Irish Domiciled UCITS (CSPX/VUAA/SPYL) optimize this automatically via the US-Ireland Bilateral Double Tax Treaty down to 15%. This creates a 15% absolute withholding tax savings compound benefit over time.
        </span>
      </div>

    </div>
  );
}
