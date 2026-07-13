import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ShieldAlert,
  Info,
  Download,
  Briefcase,
  BarChart3,
  LineChart,
  Settings,
  SlidersHorizontal,
  ChevronDown
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
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { useSetWindow } from '../../../context/WindowContext';

export default function App() {
  usePageTitle('ETF Drag');
  // Input settings
  const [initialInvestmentRM, setInitialInvestmentRM] = useState<number>(20000);
  // Mobile-only: the controls collapse into an "Adjust assumptions" panel (UX review C6)
  const [showMobileControls, setShowMobileControls] = useState<boolean>(false);
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
    transactionSumUSD
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

  // The MYR/USD rate is app-private chrome data — it flows through the window
  // context into the window title bar (spec §5), NOT the OS menu bar.
  useSetWindow(
    {
      titleRight: (
        <span
          className="inline-flex items-center gap-1.5"
          title={rateError ? 'Using cached rate — API offline' : 'Live USD/MYR spot rate'}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${rateLoading && !hasAppliedLiveRate ? 'bg-warning animate-pulse' : 'bg-accent'}`} />
          <span className="font-mono">USD/MYR {rateLoading && !hasAppliedLiveRate ? '—' : usdMyrRate.toFixed(4)}</span>
          {rateDate && <span className="font-mono">· {rateDate}</span>}
        </span>
      ),
    },
    [usdMyrRate, rateDate, rateLoading, rateError, hasAppliedLiveRate]
  );

  return (
    <div className="w-full">
      
      {/* Top Premium Status Navigation */}
      <header className="border-b border-[#DCE0D2] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 42 88.4" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ibkr-logo-grad" x1="40.4" y1="86.8" x2="2.7" y2="45.3" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#3E7355" />
                    <stop offset="1" stopColor="#2A5038" />
                  </linearGradient>
                </defs>
                <polygon points="40.4,86.8 2.7,86.8 2.7,45.3" fill="url(#ibkr-logo-grad)" />
                <circle cx="35.2" cy="55.5" r="11.3" fill="#3E7355" />
                <polygon points="40.4,1.5 2.7,45.3 2.7,86.8" fill="#3E7355" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-[#243129] flex items-center gap-2">
                S&P 500 ETF Return Visualizer
                <span className="text-[10px] text-[#75806F] font-mono font-normal uppercase tracking-widest border-l-2 border-[#3E7355] pl-2 ml-1">
                  IBKR Tiered
                </span>
              </h1>
              <p className="text-xs text-[#75806F] font-sans mt-0.5">
                Total Cost of Ownership (TCO) & Withholding Tax Leakage Optimizer for Malaysian Retail Investors
              </p>
            </div>
          </div>
          
          {/* Currency toggle (the FX rate itself now lives in the window title
              bar via useWindow — see useSetWindow above) */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="inline-flex rounded-full p-0.5 bg-[#EDF3EC] border border-[#DCE0D2]">
              <button 
                onClick={() => setShowInUsd(false)}
                className={`px-3 py-1 text-[11px] rounded-full transition-all active:scale-95 font-semibold cursor-pointer tracking-wide ${!showInUsd ? 'bg-[#243129] text-white' : 'text-[#9AA394] hover:text-[#4A544C]'}`}
              >
                RM
              </button>
              <button 
                onClick={() => setShowInUsd(true)}
                className={`px-3 py-1 text-[11px] rounded-full transition-all active:scale-95 font-semibold cursor-pointer tracking-wide ${showInUsd ? 'bg-[#243129] text-white' : 'text-[#9AA394] hover:text-[#4A544C]'}`}
              >
                USD
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Plain-English on-ramp for non-finance users (UX review C1) */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-4 lg:pt-6">
        <p className="bg-white border border-[#DCE0D2] rounded-lg p-4 lg:p-5 text-[13px] text-[#4A544C] leading-relaxed">
          This tool compares two ways to buy the S&amp;P 500 through IBKR: a US-listed ETF and an Ireland-listed (UCITS) one.
          US funds charge a lower annual fee (TER) but lose 30% of every dividend to US withholding tax (WHT); Irish funds lose only 15%.
          Set your numbers in the control panel and the charts show how fees, taxes and bid-ask spreads (quoted in basis points — hundredths of a percent) drag on your final balance.
          {' '}<Link to="/glossary" className="text-[#3E7355] font-semibold hover:underline">All terms are explained in the Glossary</Link>.
        </p>
      </div>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SIDEBAR MODULE (4 cols on desktop; collapsible "Adjust assumptions" panel on mobile) */}
        <div className="lg:col-span-4">
          <button
            type="button"
            onClick={() => setShowMobileControls((v) => !v)}
            aria-expanded={showMobileControls}
            aria-controls="assumption-panel"
            className="lg:hidden w-full flex items-center justify-between bg-white border border-[#DCE0D2] rounded-lg px-4 py-3 text-sm font-semibold text-[#243129] active:scale-[0.99] transition duration-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#3E7355]" />
              Adjust assumptions
            </span>
            <ChevronDown className={`w-4 h-4 text-[#75806F] transition-transform duration-200 ${showMobileControls ? 'rotate-180' : ''}`} />
          </button>
          <div id="assumption-panel" className={`${showMobileControls ? 'block mt-3' : 'hidden'} lg:block lg:mt-0`}>
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
          </div>
        </div>

        {/* ANALYTICS CANVAS (8 Columns on Desktop) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* HIGH IMPACT METRIC BLOCK */}
          <div className="relative overflow-hidden bg-[#F6F4EC] border border-[#DCE0D2] rounded-lg p-6 lg:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 z-10 flex-1">
              <div className="inline-flex items-center gap-2 text-[10px] text-[#75806F] font-semibold uppercase tracking-[0.15em]">
                <span className="w-0.5 h-4 bg-[#3E7355] rounded-full"></span>
                Simulation Result
              </div>
              
              <h2 className="text-xl md:text-2xl font-black font-display text-[#243129] tracking-tight">
                {winner === "B" ? (
                  portfolioDelta > 0 ? (
                    <span>Choosing <span className="text-[#3E7355]">{selectedB.ticker}</span> over <span className="text-[#75806F]">{selectedA.ticker}</span> yields {formatVal(absDelta)} extra</span>
                  ) : (
                    <span>Portfolio assets return identical long-term yields</span>
                  )
                ) : (
                  <span>Choosing <span className="text-[#3E7355]">{selectedA.ticker}</span> over <span className="text-[#75806F]">{selectedB.ticker}</span> yields {formatVal(absDelta)} extra</span>
                )}
              </h2>
              
              <p className="text-xs text-[#75806F] max-w-xl leading-relaxed">
                By investing over {horizonYears} years with a {feeOptimizationFreq} execution schedule, total compounding dividend withholding tax drag, brokerage ticks, and product expense ratios generate this structural capital delta.
              </p>
            </div>

            {/* Giant Metric Display */}
            <KpiCard 
              label="Compounded Saving" 
              value={formatVal(absDelta)} 
              subtitle="In display currency" 
              valueColor="text-[#3E7355]" 
            />

            {/* Faint decorative gradient */}
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#3E7355]/3 to-transparent pointer-events-none z-0" />
          </div>

          {/* DYNAMIC ADVISOR WARNING BANNER */}
          <FrictionAlert 
            showOptimizationWarning={showOptimizationWarning}
            feeOptimizationFreq={feeOptimizationFreq}
            monthlyContributionRM={monthlyContributionRM}
            transactionSumUSD={transactionSumUSD}
            showInUsd={showInUsd}
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
          <footer className="mt-16 bg-[#F6F4EC] border border-[#DCE0D2] rounded-lg p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#75806F]">
              
              {/* Tariff Reference Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4A544C] flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#3E7355]" />
                  IBKR Tiered Tariff Reference Matrix
                </h4>
                <div className="space-y-1.5 text-[11px] text-[#75806F] leading-normal">
                  <p>• <strong>US NYSE Stock Purchases:</strong> $0.0035 per share commission (Min: $0.35 USD, Max: 1.0% of trade value).</p>
                  <p>• <strong>UK London Stock Exchange (LSE UCITS) Tiered:</strong> 0.05% IBKR commission (min $1.70) + 0.0045% exchange fee (min ~$0.13) + ~$0.08 clearing = <strong>~$1.91 all-in minimum</strong>.</p>
                  <p>• <strong>Spot FX Currency Conversions:</strong> 0.002% conversion rate fee (Min: $2.00 USD flat fee).</p>
                </div>
                <p className="text-[10px] text-[#9AA394] font-mono">Source: Interactive Brokers Official Commissions Matrix</p>
              </div>

              {/* Treaty & Domicile Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4A544C] flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D99A2B]" />
                  Tax Treaty & Domicile Guidelines
                </h4>
                <div className="space-y-1.5 text-[11px] text-[#75806F] leading-normal">
                  <p>• <strong>Dividend Optimization:</strong> Internal dividend tax rate is optimized of 15% under the US-Ireland Bilateral Treaty for Ireland-domiciled structures (CSPX/VUAA/SPYL), compared to 30% for US domiciled ETFs.</p>
                  <p>• <strong>Estate Protection Shield:</strong> Ireland domicile assets are completely exempt from US Federal Estate Tax (up to 40% on US-domiciled asset values exceeding $60,000 for non-resident aliens).</p>
                </div>
                <p className="text-[10px] text-[#9AA394] font-mono">Source: US-Ireland double Tax treaty Protocol & IRS Sec. 2102</p>
              </div>

            </div>

            {/* Tech stack & Copyright status */}
            <div className="pt-6 border-t border-[#DCE0D2] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#9AA394]">
              <p>© 2026 S&P 500 ETF Return Visualizer. Sourced live and adjustable via parameters.</p>
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-[#3E7355]/80">Interactive Brokers Support v2</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-[#325E45]/80">Tailwind Engine v4</span>
              </div>
            </div>
          </footer>

        </section>

      </main>
    </div>
  );
}
