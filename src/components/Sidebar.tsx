import {
  Sliders,
  Coins,
  Calendar,
  BadgePercent,
  Settings,
  RefreshCw,
  Flame,
  HelpCircle
} from "lucide-react";
import { ETF, FeeOptimizationFrequency } from "../types";
import { ETF_REGISTRY } from "../constants";

interface SidebarProps {
  initialInvestmentRM: number;
  setInitialInvestmentRM: (v: number) => void;
  monthlyContributionRM: number;
  setMonthlyContributionRM: (v: number) => void;
  horizonYears: number;
  setHorizonYears: (v: number) => void;
  feeOptimizationFreq: FeeOptimizationFrequency;
  setFeeOptimizationFreq: (v: FeeOptimizationFrequency) => void;
  tickerA: string;
  setTickerA: (v: string) => void;
  tickerB: string;
  setTickerB: (v: string) => void;

  // Dynamic tuning
  grossMarketGrowth: number;
  setGrossMarketGrowth: (v: number) => void;
  marketDividendYield: number;
  setMarketDividendYield: (v: number) => void;
  usdMyrRate: number;
  setUsdMyrRate: (v: number) => void;

  // Custom overrides
  overridePriceA: string;
  setOverridePriceA: (v: string) => void;
  overridePriceB: string;
  setOverridePriceB: (v: string) => void;
  overrideTerA: string;
  setOverrideTerA: (v: string) => void;
  overrideTerB: string;
  setOverrideTerB: (v: string) => void;
  overrideSpreadA: string;
  setOverrideSpreadA: (v: string) => void;
  overrideSpreadB: string;
  setOverrideSpreadB: (v: string) => void;

  showTuning: boolean;
  setShowTuning: (v: boolean) => void;

  selectedA: ETF;
  selectedB: ETF;
  finalPriceA: number;
  finalPriceB: number;
  finalTerA: number;
  finalTerB: number;
  finalSpreadBpsA: number;
  finalSpreadBpsB: number;
  actualFrictionA: number;
  actualFrictionB: number;
  depositDirectUSD: boolean;
  setDepositDirectUSD: (v: boolean) => void;
}

export default function Sidebar({
  initialInvestmentRM,
  setInitialInvestmentRM,
  monthlyContributionRM,
  setMonthlyContributionRM,
  horizonYears,
  setHorizonYears,
  feeOptimizationFreq,
  setFeeOptimizationFreq,
  tickerA,
  setTickerA,
  tickerB,
  setTickerB,
  grossMarketGrowth,
  setGrossMarketGrowth,
  marketDividendYield,
  setMarketDividendYield,
  usdMyrRate,
  setUsdMyrRate,
  overridePriceA,
  setOverridePriceA,
  overridePriceB,
  setOverridePriceB,
  overrideTerA,
  setOverrideTerA,
  overrideTerB,
  setOverrideTerB,
  overrideSpreadA,
  setOverrideSpreadA,
  overrideSpreadB,
  setOverrideSpreadB,
  showTuning,
  setShowTuning,
  selectedA,
  selectedB,
  finalPriceA,
  finalPriceB,
  finalTerA,
  finalTerB,
  finalSpreadBpsA,
  finalSpreadBpsB,
  actualFrictionA,
  actualFrictionB,
  depositDirectUSD,
  setDepositDirectUSD
}: SidebarProps) {

  const handleRestorePresets = () => {
    setOverridePriceA("");
    setOverridePriceB("");
    setOverrideTerA("");
    setOverrideTerB("");
    setOverrideSpreadA("");
    setOverrideSpreadB("");
    setGrossMarketGrowth(9.0);
    setMarketDividendYield(1.3);
    setUsdMyrRate(3.97);
    setDepositDirectUSD(true);
  };

  return (
    <section className="lg:col-span-4 flex flex-col gap-6">

      <div className="glass-card rounded-3xl p-5 lg:p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#E6E6E6]">
          <Sliders className="text-[#D91222] w-4 h-4" />
          <h2 className="font-semibold text-sm tracking-wider text-[#212121] uppercase font-display">
            Friction Simulator Core
          </h2>
        </div>

        <div className="flex flex-col gap-5">

          {/* Slider 1: Initial Investment */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-[#727579] border-b border-dashed border-[#D0D1D2] hover:border-[#A2A3A5] cursor-help transition-all relative group py-0.5">
                Initial Capital (RM)
                <span className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-white border border-[#E6E6E6] text-[#44474D] text-[10px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case text-left">
                  The starting lump sum amount you invest into the chosen ETF at Year 0. Subject to initial buy commissions and conversion fees.
                  <span className="absolute top-full left-4 border-4 border-transparent border-t-white"></span>
                </span>
              </span>
              <input
                type="number"
                value={initialInvestmentRM}
                onChange={(e) => setInitialInvestmentRM(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 text-right bg-white border border-[#E6E6E6] focus:outline-none focus:border-[#D91222] focus:ring-1 focus:ring-[#D91222]/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#212121] font-mono"
              />
            </div>
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={initialInvestmentRM}
              onChange={(e) => setInitialInvestmentRM(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#E8E8E9] rounded-lg appearance-none cursor-pointer accent-[#D91222]"
            />
            <div className="flex justify-between text-[10px] text-[#A2A3A5] font-mono mt-0.5">
              <span>RM 1k</span>
              <span>Est. ${(initialInvestmentRM / usdMyrRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
              <span>RM 200k</span>
            </div>
          </div>

          {/* Slider 2: Monthly Contribution */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-[#727579] border-b border-dashed border-[#D0D1D2] hover:border-[#A2A3A5] cursor-help transition-all relative group py-0.5">
                Monthly Allocation (RM)
                <span className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-white border border-[#E6E6E6] text-[#44474D] text-[10px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case text-left">
                  Your recurring monthly investment budget. Accumulated and batched according to your execution frequency choice.
                  <span className="absolute top-full left-4 border-4 border-transparent border-t-white"></span>
                </span>
              </span>
              <input
                type="number"
                value={monthlyContributionRM}
                onChange={(e) => setMonthlyContributionRM(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 text-right bg-white border border-[#E6E6E6] focus:outline-none focus:border-[#D91222] focus:ring-1 focus:ring-[#D91222]/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#212121] font-mono"
              />
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={monthlyContributionRM}
              onChange={(e) => setMonthlyContributionRM(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#E8E8E9] rounded-lg appearance-none cursor-pointer accent-[#D91222]"
            />
            <div className="flex justify-between text-[10px] text-[#A2A3A5] font-mono mt-0.5">
              <span>RM 0</span>
              <span>
                Est. ${(monthlyContributionRM / usdMyrRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
              </span>
              <span>RM 10k+</span>
            </div>
          </div>

          {/* Slider 3: Investment Horizon */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-[#727579] border-b border-dashed border-[#D0D1D2] hover:border-[#A2A3A5] cursor-help transition-all relative group py-0.5">
                Horizon Period
                <span className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-white border border-[#E6E6E6] text-[#44474D] text-[10px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case text-left">
                  The total years of your simulation. Long investment horizons make small recurring fee differences compound into massive portfolio deltas.
                  <span className="absolute top-full left-4 border-4 border-transparent border-t-white"></span>
                </span>
              </span>
              <span className="text-xs font-semibold text-[#D91222] font-mono">
                {horizonYears} Years
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={horizonYears}
              onChange={(e) => setHorizonYears(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#E8E8E9] rounded-lg appearance-none cursor-pointer accent-[#D91222]"
            />
            <div className="flex justify-between text-[10px] text-[#A2A3A5] font-mono mt-0.5">
              <span>1 Year</span>
              <span>Compound Cycle Limit</span>
              <span>40 Years</span>
            </div>
          </div>

          {/* Broker Frequency Settings Optimization Selector */}
          <div className="bg-[#F7F8FA] border border-[#E6E6E6] rounded-2xl p-4 mt-1 text-[#44474D]">
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs text-[#727579] font-medium flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-[#D91222]" />
                Execution Frequency Optimization
              </label>
              <div className="relative group inline-block">
                <HelpCircle className="w-3.5 h-3.5 text-[#A2A3A5] hover:text-[#44474D] cursor-help transition-colors" />
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-white border border-[#E6E6E6] text-[#44474D] text-[10.5px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case">
                  How often you execute buy orders. Batching (e.g., Quarterly) pools RM allocations into larger single USD purchases, slashing recurring fixed FX and brokerage commission minimums.
                  <div className="absolute top-full right-1 -translate-x-1.5 -mt-1 border-4 border-transparent border-t-white"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["monthly", "quarterly", "biannually", "annually"] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFeeOptimizationFreq(freq)}
                  className={`px-2.5 py-2 text-[11px] font-mono rounded-xl border text-center transition-all capitalize cursor-pointer ${feeOptimizationFreq === freq ? 'bg-[#D91222]/10 border-[#D91222] text-[#D91222] font-semibold' : 'bg-white border-[#E6E6E6] text-[#727579] hover:text-[#44474D] hover:border-[#D0D1D2]'}`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Direct USD Deposit Toggle */}
          <div className="bg-[#F7F8FA] border border-[#E6E6E6] rounded-2xl p-4 mt-1 flex items-center justify-between text-[#44474D]">
            <div className="space-y-0.5 flex-1 pr-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#727579] font-medium flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#D91222]" />
                  Direct USD Deposit
                </label>
                <div className="relative group inline-block">
                  <HelpCircle className="w-3.5 h-3.5 text-[#A2A3A5] hover:text-[#44474D] cursor-help transition-colors" />
                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-white border border-[#E6E6E6] text-[#44474D] text-[10.5px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case">
                    Enable this if you transfer USD directly into your Interactive Brokers account (e.g., using Wise, BigPay, or multi-currency wire transfers). Bypasses IBKR's standard spot FX currency conversion charges completely.
                    <div className="absolute top-full right-1 -translate-x-1.5 -mt-1 border-4 border-transparent border-t-white"></div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDepositDirectUSD(!depositDirectUSD)}
              className={`relative inline-flex h-5.5 w-9.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${depositDirectUSD ? 'bg-[#D91222]' : 'bg-[#E8E8E9]'}`}
            >
              <span
                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${depositDirectUSD ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Dropdown Selector: Asset A */}
          <div className="border-t border-[#E6E6E6] pt-4 mt-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-[#727579] flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#727579] shadow-sm"></div>
                Compare ETF A (Baseline Target)
              </span>
            </div>
            <div className="relative">
              <select
                value={tickerA}
                onChange={(e) => setTickerA(e.target.value)}
                className="w-full text-sm bg-white border border-[#E6E6E6] focus:border-[#D91222] text-[#212121] px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D91222]/30 cursor-pointer"
              >
                {ETF_REGISTRY.map((etf) => (
                  <option key={etf.ticker} value={etf.ticker}>
                    {etf.ticker} - {etf.name} ({etf.domicile} domicile)
                  </option>
                ))}
              </select>
            </div>

            {/* Fast Summary Badge Asset A */}
            <div className="grid grid-cols-3 gap-2 mt-2 bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E6E6E6]">
              <div className="text-center border-r border-[#E6E6E6]">
                <div className="text-[10px] text-[#A2A3A5]">Domicile / WHT</div>
                <div className="text-[11px] font-bold text-[#44474D] font-mono">{selectedA.domicile} ({(selectedA.domicile === "US" ? 30 : 15)}%)</div>
              </div>
              <div className="text-center border-r border-[#E6E6E6]">
                <div className="text-[10px] text-[#A2A3A5]">Expense TER</div>
                <div className="text-[11px] font-bold text-[#44474D] font-mono">{(finalTerA * 100).toFixed(3)}%</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-[#A2A3A5]">Structure</div>
                <div className="text-[11px] font-bold text-[#44474D] truncate">{selectedA.structure}</div>
              </div>
            </div>
          </div>

          {/* Dropdown Selector: Compare ETF B */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-[#727579] flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D91222]"></div>
                Compare ETF B (Alternative Target)
              </span>
            </div>
            <div className="relative">
              <select
                value={tickerB}
                onChange={(e) => setTickerB(e.target.value)}
                className="w-full text-sm bg-white border border-[#E6E6E6] focus:border-[#D91222] text-[#212121] px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D91222]/30 cursor-pointer"
              >
                {ETF_REGISTRY.map((etf) => (
                  <option key={etf.ticker} value={etf.ticker}>
                    {etf.ticker} - {etf.name} ({etf.domicile} domicile)
                  </option>
                ))}
              </select>
            </div>

            {/* Fast Summary Badge Asset B */}
            <div className="grid grid-cols-3 gap-2 mt-2 bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E6E6E6]">
              <div className="text-center border-r border-[#E6E6E6]">
                <div className="text-[10px] text-[#A2A3A5]">Domicile / WHT</div>
                <div className="text-[11px] font-bold text-[#44474D] font-mono">{selectedB.domicile} ({(selectedB.domicile === "US" ? 30 : 15)}%)</div>
              </div>
              <div className="text-center border-r border-[#E6E6E6]">
                <div className="text-[10px] text-[#A2A3A5]">Expense TER</div>
                <div className="text-[11px] font-bold text-[#D91222] font-mono">{(finalTerB * 100).toFixed(3)}%</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-[#A2A3A5]">Structure</div>
                <div className="text-[11px] font-bold text-[#44474D] truncate">{selectedB.structure}</div>
              </div>
            </div>
          </div>

          {/* Interactive Advanced Tuning Toggle Wrapper */}
          <div className="border-t border-[#E6E6E6] pt-4">
            <button
              onClick={() => setShowTuning(!showTuning)}
              className="w-full flex items-center justify-between text-[#727579] hover:text-[#212121] transition-colors py-2 px-3 rounded-xl border border-[#E6E6E6] bg-[#F7F8FA] cursor-pointer"
            >
              <span className="text-xs font-semibold flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-[#D91222] animate-spin-hover" />
                IBKR Parameter Overrides
              </span>
              <span className="text-[10px] border border-[#E6E6E6] px-2 py-0.5 rounded text-[#727579] bg-white">
                {showTuning ? "Hide" : "Show Parameters"}
              </span>
            </button>

            {showTuning && (
              <div className="mt-3 flex flex-col gap-4 bg-white p-4 rounded-xl border border-[#E6E6E6]">
                <h3 className="text-xs font-bold text-[#44474D] pb-2 border-b border-[#E6E6E6]">
                  Market Baseline Presets
                </h3>

                {/* Growth Assumption */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-[#727579] border-b border-dashed border-[#D0D1D2] hover:border-[#A2A3A5] cursor-help transition-all relative group py-0.5">
                      Assumed Annual Market Growth
                      <span className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-52 p-2.5 bg-white border border-[#E6E6E6] text-[#44474D] text-[10px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case text-left">
                        Expected long-term annual price appreciation of the S&P 500 index. S&P 500 historical average price growth is ~7-10%.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></span>
                      </span>
                    </span>
                    <span className="text-[11px] font-bold text-[#212121] font-mono">{grossMarketGrowth}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="18"
                    step="0.1"
                    value={grossMarketGrowth}
                    onChange={(e) => setGrossMarketGrowth(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#E8E8E9] rounded-lg appearance-none cursor-pointer accent-[#D91222]"
                  />
                </div>

                {/* Dividend Assumption */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-[#727579] border-b border-dashed border-[#D0D1D2] hover:border-[#A2A3A5] cursor-help transition-all relative group py-0.5">
                      Underlying S&P 500 Dividend Yield
                      <span className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-52 p-2.5 bg-white border border-[#E6E6E6] text-[#44474D] text-[10px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case text-left">
                        Expected annual dividend yield of the index. Subject to dividend withholding taxes (30% for US funds, 15% for Irish UCITS funds).
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></span>
                      </span>
                    </span>
                    <span className="text-[11px] font-bold text-[#212121] font-mono">{marketDividendYield}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={marketDividendYield}
                    onChange={(e) => setMarketDividendYield(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#E8E8E9] rounded-lg appearance-none cursor-pointer accent-[#D91222]"
                  />
                </div>

                {/* FX USD MYR Rate */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] text-[#727579] border-b border-dashed border-[#D0D1D2] hover:border-[#A2A3A5] cursor-help transition-all relative group py-0.5">
                      USD to MYR Spot Rate Converter
                      <span className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-52 p-2.5 bg-white border border-[#E6E6E6] text-[#44474D] text-[10px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case text-left">
                        Spot exchange conversion rate. Used to scale RM inputs into native USD terms for the simulator engine backend.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></span>
                      </span>
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={usdMyrRate}
                    onChange={(e) => setUsdMyrRate(Math.max(1, parseFloat(e.target.value) || 4.42))}
                    className="w-full bg-white border border-[#E6E6E6] focus:outline-none focus:border-[#D91222] text-xs text-[#212121] font-mono px-3 py-2 rounded-xl"
                  />
                </div>

                <h3 className="text-xs font-bold text-[#44474D] pb-1 pt-2 border-b border-[#E6E6E6]">
                  ETF Custom Tuning Overrides
                </h3>
                <p className="text-[10px] text-[#A2A3A5] leading-normal">
                  Dynamically override the registry variables to benchmark hypothetical/arbitrary expense ratios or share pricing.
                </p>

                {/* ETF A custom overrides */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <label className="text-[10px] text-[#727579] block mb-1">
                      {selectedA.ticker} TER (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`${(selectedA.ter * 100).toFixed(2)}`}
                      value={overrideTerA}
                      onChange={(e) => setOverrideTerA(e.target.value)}
                      className="w-full bg-white border border-[#E6E6E6] text-xs text-[#212121] rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#727579] block mb-1">
                      {selectedA.ticker} Price ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder={`${selectedA.defaultPrice}`}
                      value={overridePriceA}
                      onChange={(e) => setOverridePriceA(e.target.value)}
                      className="w-full bg-white border border-[#E6E6E6] text-xs text-[#212121] rounded-xl p-2 font-mono"
                    />
                  </div>
                </div>

                {/* ETF B custom overrides */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#727579] block mb-1">
                      {selectedB.ticker} TER (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`${(selectedB.ter * 100).toFixed(2)}`}
                      value={overrideTerB}
                      onChange={(e) => setOverrideTerB(e.target.value)}
                      className="w-full bg-white border border-[#E6E6E6] text-xs text-[#212121] rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#727579] block mb-1">
                      {selectedB.ticker} Price ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder={`${selectedB.defaultPrice}`}
                      value={overridePriceB}
                      onChange={(e) => setOverridePriceB(e.target.value)}
                      className="w-full bg-white border border-[#E6E6E6] text-xs text-[#212121] rounded-xl p-2 font-mono"
                    />
                  </div>
                </div>

                {/* ETF Bid-Ask Spread Overrides */}
                <h3 className="text-xs font-bold text-[#44474D] pb-1 pt-2 border-b border-[#E6E6E6]">
                  ETF Bid-Ask Spread (bps)
                </h3>
                <p className="text-[10px] text-[#A2A3A5] leading-normal">
                  Override the default bid-ask spread in basis points. Half the spread is applied as implicit cost on each purchase (mid→ask crossing).
                </p>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <label className="text-[10px] text-[#727579] block mb-1">
                      {selectedA.ticker} Spread (bps)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder={`${selectedA.defaultSpreadBps}`}
                      value={overrideSpreadA}
                      onChange={(e) => setOverrideSpreadA(e.target.value)}
                      className="w-full bg-white border border-[#E6E6E6] text-xs text-[#212121] rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#727579] block mb-1">
                      {selectedB.ticker} Spread (bps)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder={`${selectedB.defaultSpreadBps}`}
                      value={overrideSpreadB}
                      onChange={(e) => setOverrideSpreadB(e.target.value)}
                      className="w-full bg-white border border-[#E6E6E6] text-xs text-[#212121] rounded-xl p-2 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRestorePresets}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-[#727579] hover:text-[#212121] bg-[#F7F8FA] border border-[#E6E6E6] rounded-xl hover:bg-[#F3F3F4] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restore Base Presets
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Friction Indicator Box for Sidebar */}
      <div className="glass-card rounded-3xl p-5 shadow-sm relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-display text-[#44474D] uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FFB300]" />
            Purchase Fee Drag
          </h3>

          <div className="relative group inline-block">
            <HelpCircle className="w-3.5 h-3.5 text-[#A2A3A5] hover:text-[#44474D] cursor-help transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-white border border-[#E6E6E6] text-[#44474D] text-[10.5px] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-normal normal-case">
              A high drag state (above 2%) indicates that your investment amount per transaction is too small to overcome IBKR's fixed costs (Min $2.00 FX fee + broker commission of $1.91 all-in for LSE UCITS stocks or $0.35 for US stocks).
              <div className="absolute top-full right-1 -translate-x-1.5 -mt-1 border-4 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-1">
          <div className="bg-[#F7F8FA] p-3 rounded-xl border border-[#E6E6E6]">
            <div className="text-[10px] text-[#A2A3A5] mb-0.5 font-mono">{selectedA.ticker} Drag</div>
            <div className={`text-base font-bold font-mono ${actualFrictionA > 3.5 ? 'text-[#D91222]' : actualFrictionA > 1.5 ? 'text-[#FFB300]' : 'text-[#0EB35B]'}`}>
              {actualFrictionA.toFixed(2)}%
            </div>
          </div>
          <div className="bg-[#F7F8FA] p-3 rounded-xl border border-[#E6E6E6] border-l-2 border-l-[#D91222]">
            <div className="text-[10px] text-[#A2A3A5] mb-0.5 font-mono">{selectedB.ticker} Drag</div>
            <div className={`text-base font-bold font-mono ${actualFrictionB > 3.5 ? 'text-[#D91222]' : actualFrictionB > 1.5 ? 'text-[#FFB300]' : 'text-[#0EB35B]'}`}>
              {actualFrictionB.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
