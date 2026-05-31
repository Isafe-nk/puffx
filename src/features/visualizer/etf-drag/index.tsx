import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  Info,
  Download,
  Briefcase,
  BarChart3,
  LineChart,
  Settings
} from 'lucide-react';
import { FeeOptimizationFrequency } from './types';
import { useSimulator } from './hooks/useSimulator';
import { useExchangeRate } from './hooks/useExchangeRate';
import Sidebar from './components/Sidebar';
import FrictionAlert from './components/FrictionAlert';
import PerformanceCharts from './components/PerformanceCharts';
import TcoMatrix from './components/TcoMatrix';
import KpiCard from '../../../shared/components/KpiCard';
import { formatCurrency } from '../../../shared/utils/format';

export default function App() {
  // Input settings
  const [initialInvestmentRM, setInitialInvestmentRM] = useState<number>(20000);
  const [monthlyContributionRM, setMonthlyContributionRM] = useState<number>(1000);
  const [horizonYears, setHorizonYears] = useState<number>(20);
  
  // Custom Dynamic Ticker overriding states 
  const [tickerA, setTickerA] = useState<string>("SPY");
  const [tickerB, setTickerB] = useState<string>("SPYL");

  // Advanced Tuning states
  const [grossMarketGrowth, setGrossMarketGrowth] = useState<number>(9.0);
  const [marketDividendYield, setMarketDividendYield] = useState<number>(1.3);
  const [usdMyrRate, setUsdMyrRate] = useState<number>(4.42);

  // Live exchange rate from fawazahmed0/exchange-api
  const { rate: liveRate, date: rateDate, isLoading: rateLoading, error: rateError } = useExchangeRate(4.42);

  // Sync live rate into state on first successful fetch
  const [hasAppliedLiveRate, setHasAppliedLiveRate] = useState(false);
  useEffect(() => {
    if (liveRate !== null && !hasAppliedLiveRate) {
      setUsdMyrRate(liveRate);
      setHasAppliedLiveRate(true);
    }
  }, [liveRate, hasAppliedLiveRate]);

  // Custom live parameter tuning states for selected tickers
  const [overridePriceA, setOverridePriceA] = useState<string>("");
  const [overridePriceB, setOverridePriceB] = useState<string>("");
  const [overrideTerA, setOverrideTerA] = useState<string>("");
  const [overrideTerB, setOverrideTerB] = useState<string>("");
  const [overrideSpreadA, setOverrideSpreadA] = useState<string>("");
  const [overrideSpreadB, setOverrideSpreadB] = useState<string>("");

  // Visual/UI states
  const [showInUsd, setShowInUsd] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"performance" | "leakage">("performance");
  const [showTuning, setShowTuning] = useState<boolean>(false);
  const [feeOptimizationFreq, setFeeOptimizationFreq] = useState<FeeOptimizationFrequency>("monthly");
  const [depositDirectUSD, setDepositDirectUSD] = useState<boolean>(true);

  // Sync override visual state inputs when tickers change
  useEffect(() => {
    setOverridePriceA("");
    setOverrideTerA("");
    setOverrideSpreadA("");
  }, [tickerA]);

  useEffect(() => {
    setOverridePriceB("");
    setOverrideTerB("");
    setOverrideSpreadB("");
  }, [tickerB]);

  // Invoke Custom Simulation Hook
  const {
    selectedA,
    selectedB,
    finalPriceA,
    finalPriceB,
    finalTerA,
    finalTerB,
    finalSpreadBpsA,
    finalSpreadBpsB,
    simData,
    latestData,
    portfolioDelta,
    winner,
    absDelta,
    dragRatioA,
    dragRatioB,
    actualFrictionA,
    actualFrictionB,
    showOptimizationWarning,
    advisoryData,
    transactionSumUSD,
    freqMultiplier
  } = useSimulator({
    initialInvestmentRM,
    monthlyContributionRM,
    horizonYears,
    tickerA,
    tickerB,
    grossMarketGrowth,
    marketDividendYield,
    usdMyrRate,
    overridePriceA,
    overridePriceB,
    overrideTerA,
    overrideTerB,
    overrideSpreadA,
    overrideSpreadB,
    feeOptimizationFreq,
    depositDirectUSD
  });

  // Formatting utilities
  const formatVal = useMemo(() => (v: number) => {
    return formatCurrency(v, showInUsd, usdMyrRate, 0);
  }, [showInUsd, usdMyrRate]);

  return (
    <div className="w-full">
      
      {/* Top Premium Status Navigation */}
      <header className="border-b border-[#E6E6E6] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 42 88.4" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ibkr-logo-grad" x1="40.4" y1="86.8" x2="2.7" y2="45.3" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#D91222" />
                    <stop offset="1" stopColor="#971B1E" />
                  </linearGradient>
                </defs>
                <polygon points="40.4,86.8 2.7,86.8 2.7,45.3" fill="url(#ibkr-logo-grad)" />
                <circle cx="35.2" cy="55.5" r="11.3" fill="#D91222" />
                <polygon points="40.4,1.5 2.7,45.3 2.7,86.8" fill="#D91222" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-[#212121] flex items-center gap-2">
                S&P 500 ETF Return Visualizer
                <span className="text-[9px] text-[#A2A3A5] font-mono font-normal uppercase tracking-widest border-l-2 border-[#D91222] pl-2 ml-1">
                  IBKR Tiered
                </span>
              </h1>
              <p className="text-xs text-[#727579] font-sans mt-0.5">
                Total Cost of Ownership (TCO) & Withholding Tax Leakage Optimizer for Malaysian Retail Investors
              </p>
            </div>
          </div>
          
          {/* Quick Stats Block & Action Icons */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-1.5 bg-[#F7F8FA] border border-[#E6E6E6] px-2.5 py-1.5 rounded-lg" title={rateError ? 'Using cached rate — API offline' : 'Source: fawazahmed0/exchange-api'}>
              <span className={`flex h-1.5 w-1.5 rounded-full ${rateLoading ? 'bg-[#F5A623] animate-pulse' : rateError ? 'bg-[#D91222]' : 'bg-[#0EB35B] animate-breathe'}`}></span>
              <span className="text-[10px] text-[#A2A3A5] font-mono">USD/MYR</span>
              <span className="text-xs font-semibold text-[#212121] font-mono">
                {rateLoading && !hasAppliedLiveRate ? '—' : usdMyrRate.toFixed(4)}
              </span>
              {rateDate && (
                <>
                  <span className="w-px h-3 bg-[#D0D1D2]"></span>
                  <span className="text-[9px] text-[#A2A3A5] font-mono">{rateDate}</span>
                </>
              )}
            </div>

            <div className="inline-flex rounded-full p-0.5 bg-[#F3F3F4] border border-[#E6E6E6]">
              <button 
                onClick={() => setShowInUsd(false)}
                className={`px-3 py-1 text-[11px] rounded-full transition-all font-semibold cursor-pointer tracking-wide ${!showInUsd ? 'bg-[#212121] text-white shadow-sm' : 'text-[#A2A3A5] hover:text-[#44474D]'}`}
              >
                RM
              </button>
              <button 
                onClick={() => setShowInUsd(true)}
                className={`px-3 py-1 text-[11px] rounded-full transition-all font-semibold cursor-pointer tracking-wide ${showInUsd ? 'bg-[#212121] text-white shadow-sm' : 'text-[#A2A3A5] hover:text-[#44474D]'}`}
              >
                USD
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR MODULE (4 Columns on Desktop) */}
        <Sidebar 
          initialInvestmentRM={initialInvestmentRM}
          setInitialInvestmentRM={setInitialInvestmentRM}
          monthlyContributionRM={monthlyContributionRM}
          setMonthlyContributionRM={setMonthlyContributionRM}
          horizonYears={horizonYears}
          setHorizonYears={setHorizonYears}
          feeOptimizationFreq={feeOptimizationFreq}
          setFeeOptimizationFreq={setFeeOptimizationFreq}
          tickerA={tickerA}
          setTickerA={setTickerA}
          tickerB={tickerB}
          setTickerB={setTickerB}
          grossMarketGrowth={grossMarketGrowth}
          setGrossMarketGrowth={setGrossMarketGrowth}
          marketDividendYield={marketDividendYield}
          setMarketDividendYield={setMarketDividendYield}
          usdMyrRate={usdMyrRate}
          setUsdMyrRate={setUsdMyrRate}
          overridePriceA={overridePriceA}
          setOverridePriceA={setOverridePriceA}
          overridePriceB={overridePriceB}
          setOverridePriceB={setOverridePriceB}
          overrideTerA={overrideTerA}
          setOverrideTerA={setOverrideTerA}
          overrideTerB={overrideTerB}
          setOverrideTerB={setOverrideTerB}
          overrideSpreadA={overrideSpreadA}
          setOverrideSpreadA={setOverrideSpreadA}
          overrideSpreadB={overrideSpreadB}
          setOverrideSpreadB={setOverrideSpreadB}
          showTuning={showTuning}
          setShowTuning={setShowTuning}
          selectedA={selectedA}
          selectedB={selectedB}
          finalPriceA={finalPriceA}
          finalPriceB={finalPriceB}
          finalTerA={finalTerA}
          finalTerB={finalTerB}
          finalSpreadBpsA={finalSpreadBpsA}
          finalSpreadBpsB={finalSpreadBpsB}
          actualFrictionA={actualFrictionA}
          actualFrictionB={actualFrictionB}
          depositDirectUSD={depositDirectUSD}
          setDepositDirectUSD={setDepositDirectUSD}
        />

        {/* ANALYTICS CANVAS (8 Columns on Desktop) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* HIGH IMPACT METRIC BLOCK */}
          <div className="relative overflow-hidden bg-[#F7F8FA] border border-[#E6E6E6] rounded-2xl p-6 lg:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel">
            <div className="space-y-3 z-10 flex-1">
              <div className="inline-flex items-center gap-2 text-[10px] text-[#727579] font-semibold uppercase tracking-[0.15em]">
                <span className="w-0.5 h-4 bg-[#D91222] rounded-full"></span>
                Simulation Result
              </div>
              
              <h2 className="text-xl md:text-2xl font-black font-display text-[#212121] tracking-tight">
                {winner === "B" ? (
                  portfolioDelta > 0 ? (
                    <span>Choosing <span className="text-[#D91222]">{selectedB.ticker}</span> over <span className="text-[#727579]">{selectedA.ticker}</span> yields {formatVal(absDelta)} extra</span>
                  ) : (
                    <span>Portfolio assets return identical long-term yields</span>
                  )
                ) : (
                  <span>Choosing <span className="text-[#D91222]">{selectedA.ticker}</span> over <span className="text-[#727579]">{selectedB.ticker}</span> yields {formatVal(absDelta)} extra</span>
                )}
              </h2>
              
              <p className="text-xs text-[#727579] max-w-xl leading-relaxed">
                By investing over {horizonYears} years with a {feeOptimizationFreq} execution schedule, total compounding dividend withholding tax drag, brokerage ticks, and product expense ratios generate this structural capital delta.
              </p>
            </div>

            {/* Giant Metric Display */}
            <KpiCard 
              label="Compounded Saving" 
              value={formatVal(absDelta)} 
              subtitle="In display currency" 
              valueColor="text-[#0EB35B]" 
            />

            {/* Faint decorative gradient */}
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#D91222]/3 to-transparent pointer-events-none z-0" />
          </div>

          {/* DYNAMIC ADVISOR WARNING BANNER */}
          <FrictionAlert 
            showOptimizationWarning={showOptimizationWarning}
            feeOptimizationFreq={feeOptimizationFreq}
            monthlyContributionRM={monthlyContributionRM}
            freqMultiplier={freqMultiplier}
            transactionSumUSD={transactionSumUSD}
            selectedA={selectedA}
            selectedB={selectedB}
            actualFrictionA={actualFrictionA}
            actualFrictionB={actualFrictionB}
            usdMyrRate={usdMyrRate}
            formatVal={formatVal}
            depositDirectUSD={depositDirectUSD}
          />

          {/* HIGH-FIDELITY CHART CANVAS WRAPPER */}
          <PerformanceCharts 
            simData={simData}
            selectedA={selectedA}
            selectedB={selectedB}
            showInUsd={showInUsd}
            usdMyrRate={usdMyrRate}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            finalTerA={finalTerA}
            finalTerB={finalTerB}
          />

          {/* COMPOSITE COMPARATIVE TABLE */}
          <TcoMatrix 
            selectedA={selectedA}
            selectedB={selectedB}
            latestData={latestData}
            dragRatioA={dragRatioA}
            dragRatioB={dragRatioB}
            grossMarketGrowth={grossMarketGrowth}
            marketDividendYield={marketDividendYield}
            finalTerA={finalTerA}
            finalTerB={finalTerB}
            finalSpreadBpsA={finalSpreadBpsA}
            finalSpreadBpsB={finalSpreadBpsB}
            formatVal={formatVal}
          />

          {/* Footer containing source matrices & disclaimers */}
          <footer className="mt-16 bg-[#F7F8FA] border border-[#E6E6E6] rounded-2xl p-6 space-y-8 glass-panel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#727579]">
              
              {/* Tariff Reference Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#44474D] flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#D91222]" />
                  IBKR Tiered Tariff Reference Matrix
                </h4>
                <div className="space-y-1.5 text-[11px] text-[#727579] leading-normal">
                  <p>• <strong>US NYSE Stock Purchases:</strong> $0.0035 per share commission (Min: $0.35 USD, Max: 1.0% of trade value).</p>
                  <p>• <strong>UK London Stock Exchange (LSE UCITS) Tiered:</strong> 0.05% IBKR commission (min $1.70) + 0.0045% exchange fee (min ~$0.13) + ~$0.08 clearing = <strong>~$1.91 all-in minimum</strong>.</p>
                  <p>• <strong>Spot FX Currency Conversions:</strong> 0.002% conversion rate fee (Min: $2.00 USD flat fee).</p>
                </div>
                <p className="text-[10px] text-[#A2A3A5] font-mono">Source: Interactive Brokers Official Commissions Matrix</p>
              </div>

              {/* Treaty & Domicile Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#44474D] flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FFB300]" />
                  Tax Treaty & Domicile Guidelines
                </h4>
                <div className="space-y-1.5 text-[11px] text-[#727579] leading-normal">
                  <p>• <strong>Dividend Optimization:</strong> Internal dividend tax rate is optimized of 15% under the US-Ireland Bilateral Treaty for Ireland-domiciled structures (CSPX/VUAA/SPYL), compared to 30% for US domiciled ETFs.</p>
                  <p>• <strong>Estate Protection Shield:</strong> Ireland domicile assets are completely exempt from US Federal Estate Tax (up to 40% on US-domiciled asset values exceeding $60,000 for non-resident aliens).</p>
                </div>
                <p className="text-[10px] text-[#A2A3A5] font-mono">Source: US-Ireland double Tax treaty Protocol & IRS Sec. 2102</p>
              </div>

            </div>

            {/* Tech stack & Copyright status */}
            <div className="pt-6 border-t border-[#E6E6E6] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#A2A3A5]">
              <p>© 2026 S&P 500 ETF Return Visualizer. Sourced live and adjustable via parameters.</p>
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-[#D91222]/80">Interactive Brokers Support v2</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-[#C01A2F]/80">Tailwind Engine v4</span>
              </div>
            </div>
          </footer>

        </section>

      </main>
    </div>
  );
}
