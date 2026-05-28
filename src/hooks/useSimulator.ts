import { useMemo } from "react";
import { ETF, SimulationDataPoint, FeeOptimizationFrequency } from "../types";
import { ETF_REGISTRY } from "../constants";
import { calculateTradeFees, getWhtRate, getBrokerMin } from "../utils/frictionModel";

export interface SimulatorInputs {
  initialInvestmentRM: number;
  monthlyContributionRM: number;
  horizonYears: number;
  tickerA: string;
  tickerB: string;
  grossMarketGrowth: number;
  marketDividendYield: number;
  usdMyrRate: number;
  overridePriceA: string;
  overridePriceB: string;
  overrideTerA: string;
  overrideTerB: string;
  overrideSpreadA: string;
  overrideSpreadB: string;
  feeOptimizationFreq: FeeOptimizationFrequency;
  depositDirectUSD: boolean;
}

export const useSimulator = (inputs: SimulatorInputs) => {
  const {
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
    depositDirectUSD,
  } = inputs;

  // Setup actual selected ETF properties
  const selectedA = useMemo(() => ETF_REGISTRY.find(e => e.ticker === tickerA) || ETF_REGISTRY[2], [tickerA]);
  const selectedB = useMemo(() => ETF_REGISTRY.find(e => e.ticker === tickerB) || ETF_REGISTRY[5], [tickerB]);

  // Derived overrides
  const finalPriceA = overridePriceA !== "" ? parseFloat(overridePriceA) || selectedA.defaultPrice : selectedA.defaultPrice;
  const finalPriceB = overridePriceB !== "" ? parseFloat(overridePriceB) || selectedB.defaultPrice : selectedB.defaultPrice;
  
  const finalTerA = overrideTerA !== "" ? (parseFloat(overrideTerA) / 100) || selectedA.ter : selectedA.ter;
  const finalTerB = overrideTerB !== "" ? (parseFloat(overrideTerB) / 100) || selectedB.ter : selectedB.ter;

  // Derived spread overrides (in basis points)
  const finalSpreadBpsA = overrideSpreadA !== "" ? parseFloat(overrideSpreadA) || selectedA.defaultSpreadBps : selectedA.defaultSpreadBps;
  const finalSpreadBpsB = overrideSpreadB !== "" ? parseFloat(overrideSpreadB) || selectedB.defaultSpreadBps : selectedB.defaultSpreadBps;

  // Comprehensive data-driven simulation logic
  const simData: SimulationDataPoint[] = useMemo(() => {
    const yearsArray: SimulationDataPoint[] = [];

    // All computations occur in USD natively
    const initialUSD = initialInvestmentRM / usdMyrRate;
    const monthlyUSD = monthlyContributionRM / usdMyrRate;

    // Growth rates conversion to monthly rates
    const g_annual = grossMarketGrowth / 100;
    const d_annual = marketDividendYield / 100;
    const g_monthly = Math.pow(1 + g_annual, 1 / 12) - 1;
    const d_monthly = d_annual / 12;

    // Dividend Withholding Taxes
    const whtA = getWhtRate(selectedA.domicile);
    const whtB = getWhtRate(selectedB.domicile);

    // Calculate initial investment friction
    const initA = calculateTradeFees(initialUSD, selectedA.domicile, finalPriceA, depositDirectUSD, finalSpreadBpsA);
    const initB = calculateTradeFees(initialUSD, selectedB.domicile, finalPriceB, depositDirectUSD, finalSpreadBpsB);

    // Dynamic Portfolio balances tracking (USD)
    let balA = initA.netInv;
    let balB = initB.netInv;
    let balBench = initialUSD; // Absolute friction-free Benchmark

    // Cumulative parameters tracking (USD)
    let cumContributedA = initialUSD;
    let cumContributedB = initialUSD;
    let cumContributedBench = initialUSD;

    let cumFeesA = initA.fxFee + initA.brokerFee;
    let cumFeesB = initB.fxFee + initB.brokerFee;

    let cumSpreadA = initA.spreadCost;
    let cumSpreadB = initB.spreadCost;

    let cumTerA = 0;
    let cumTerB = 0;

    let cumTaxA = 0;
    let cumTaxB = 0;

    // Push Year 0 (immediate state after Initial Purchase Fees)
    yearsArray.push({
      year: 0,
      valueA: balA * usdMyrRate,
      contribA: initialInvestmentRM,
      feesA: cumFeesA * usdMyrRate,
      terA: 0,
      taxA: 0,
      spreadA: cumSpreadA * usdMyrRate,
      totalDragA: (balBench - balA) * usdMyrRate,

      valueB: balB * usdMyrRate,
      contribB: initialInvestmentRM,
      feesB: cumFeesB * usdMyrRate,
      terB: 0,
      taxB: 0,
      spreadB: cumSpreadB * usdMyrRate,
      totalDragB: (balBench - balB) * usdMyrRate,

      valueBench: balBench * usdMyrRate,
      contribBench: initialInvestmentRM
    });

    const totalMonths = horizonYears * 12;

    for (let m = 1; m <= totalMonths; m++) {
      // Frequency execution modifier for monthly contribution
      let shouldInvestThisMonth = false;
      let investmentVolumeUSD = 0;

      if (feeOptimizationFreq === "monthly") {
        shouldInvestThisMonth = monthlyUSD > 0;
        investmentVolumeUSD = monthlyUSD;
      } else if (feeOptimizationFreq === "quarterly" && m % 3 === 1) {
        shouldInvestThisMonth = true;
        investmentVolumeUSD = monthlyUSD * 3;
      } else if (feeOptimizationFreq === "biannually" && m % 6 === 1) {
        shouldInvestThisMonth = true;
        investmentVolumeUSD = monthlyUSD * 6;
      } else if (feeOptimizationFreq === "annually" && m % 12 === 1) {
        shouldInvestThisMonth = true;
        investmentVolumeUSD = monthlyUSD * 12;
      }

      // Add to benchmark contribution monthly
      balBench += monthlyUSD;
      cumContributedBench += monthlyUSD;

      // Compound S&P 500 Benchmark (Perfect market indexing target with zero friction)
      const returnMarketBench = balBench * (g_monthly + d_monthly);
      balBench = balBench + returnMarketBench;

      // Handle Asset A purchases
      cumContributedA += monthlyUSD;
      if (shouldInvestThisMonth) {
        const fees = calculateTradeFees(investmentVolumeUSD, selectedA.domicile, finalPriceA, depositDirectUSD, finalSpreadBpsA);
        balA += fees.netInv;
        cumFeesA += (fees.fxFee + fees.brokerFee);
        cumSpreadA += fees.spreadCost;
      }

      // Handle Asset B purchases
      cumContributedB += monthlyUSD;
      if (shouldInvestThisMonth) {
        const fees = calculateTradeFees(investmentVolumeUSD, selectedB.domicile, finalPriceB, depositDirectUSD, finalSpreadBpsB);
        balB += fees.netInv;
        cumFeesB += (fees.fxFee + fees.brokerFee);
        cumSpreadB += fees.spreadCost;
      }

      // Compute returns, TER, and WHT
      const returnMarketA = balA * (g_monthly + d_monthly);
      const taxWithheldA = balA * d_monthly * whtA;
      const terExpenseA = balA * (finalTerA / 12);
      balA = balA + returnMarketA - taxWithheldA - terExpenseA;

      cumTaxA += taxWithheldA;
      cumTerA += terExpenseA;

      const returnMarketB = balB * (g_monthly + d_monthly);
      const taxWithheldB = balB * d_monthly * whtB;
      const terExpenseB = balB * (finalTerB / 12);
      balB = balB + returnMarketB - taxWithheldB - terExpenseB;

      cumTaxB += taxWithheldB;
      cumTerB += terExpenseB;

      // Log snapshots at end of each year
      if (m % 12 === 0) {
        const year = m / 12;
        yearsArray.push({
          year,
          valueA: balA * usdMyrRate,
          contribA: cumContributedA * usdMyrRate,
          feesA: cumFeesA * usdMyrRate,
          terA: cumTerA * usdMyrRate,
          taxA: cumTaxA * usdMyrRate,
          spreadA: cumSpreadA * usdMyrRate,
          totalDragA: Math.max(0, (balBench - balA) * usdMyrRate),

          valueB: balB * usdMyrRate,
          contribB: cumContributedB * usdMyrRate,
          feesB: cumFeesB * usdMyrRate,
          terB: cumTerB * usdMyrRate,
          taxB: cumTaxB * usdMyrRate,
          spreadB: cumSpreadB * usdMyrRate,
          totalDragB: Math.max(0, (balBench - balB) * usdMyrRate),

          valueBench: balBench * usdMyrRate,
          contribBench: cumContributedBench * usdMyrRate
        });
      }
    }

    return yearsArray;
  }, [
    initialInvestmentRM, 
    monthlyContributionRM, 
    horizonYears, 
    selectedA, 
    selectedB, 
    finalPriceA, 
    finalPriceB, 
    finalTerA, 
    finalTerB, 
    finalSpreadBpsA,
    finalSpreadBpsB,
    grossMarketGrowth, 
    marketDividendYield, 
    usdMyrRate,
    feeOptimizationFreq,
    depositDirectUSD
  ]);

  // Last snapshot values
  const latestData = useMemo(() => simData[simData.length - 1] || {
    valueA: 0, valueB: 0, valueBench: 0,
    contribA: 0, contribB: 0, feesA: 0, feesB: 0,
    terA: 0, terB: 0, taxA: 0, taxB: 0,
    spreadA: 0, spreadB: 0,
    totalDragA: 0, totalDragB: 0,
    contribBench: 0
  }, [simData]);

  // Delta calculation metrics
  const portfolioDelta = useMemo(() => latestData.valueB - latestData.valueA, [latestData]);
  const winner = useMemo(() => portfolioDelta > 0 ? "B" : "A", [portfolioDelta]);
  const absDelta = useMemo(() => Math.abs(portfolioDelta), [portfolioDelta]);

  const dragRatioA = useMemo(() => latestData.valueBench > 0 ? (latestData.totalDragA / latestData.valueBench) * 100 : 0, [latestData]);
  const dragRatioB = useMemo(() => latestData.valueBench > 0 ? (latestData.totalDragB / latestData.valueBench) * 100 : 0, [latestData]);

  // Transaction-level friction based on selected optimization frequency
  const fxMinUSD = depositDirectUSD ? 0 : 2.00;
  const contUSD = monthlyContributionRM / usdMyrRate;

  const freqMultiplier = useMemo(() => 
    feeOptimizationFreq === "monthly" ? 1 :
    feeOptimizationFreq === "quarterly" ? 3 :
    feeOptimizationFreq === "biannually" ? 6 :
    12, [feeOptimizationFreq]);

  const transactionSumUSD = useMemo(() => contUSD * freqMultiplier, [contUSD, freqMultiplier]);
  const actualFrictionA = useMemo(() => transactionSumUSD > 0 ? ((fxMinUSD + getBrokerMin(selectedA.domicile)) / transactionSumUSD) * 100 : 0, [transactionSumUSD, selectedA, fxMinUSD]);
  const actualFrictionB = useMemo(() => transactionSumUSD > 0 ? ((fxMinUSD + getBrokerMin(selectedB.domicile)) / transactionSumUSD) * 100 : 0, [transactionSumUSD, selectedB, fxMinUSD]);

  const showOptimizationWarning = useMemo(() => actualFrictionA > 2.0 || actualFrictionB > 2.0, [actualFrictionA, actualFrictionB]);

  const advisoryData = useMemo(() => {
    const annualConversionSaving = (latestData.feesA + latestData.feesB) > 0;
    if (!annualConversionSaving) return null;
    
    const monthlyCostA = (fxMinUSD + getBrokerMin(selectedA.domicile)) * usdMyrRate;
    const monthlyCostB = (fxMinUSD + getBrokerMin(selectedB.domicile)) * usdMyrRate;

    const totalTransactionsHorizon = horizonYears * 12;
    const estimateMonthlyFeesHorizonA = totalTransactionsHorizon * (fxMinUSD + getBrokerMin(selectedA.domicile)) * usdMyrRate;
    const estimateQuarterlyFeesHorizonA = (horizonYears * 4) * (fxMinUSD + getBrokerMin(selectedA.domicile)) * usdMyrRate;
    const A_saved = estimateMonthlyFeesHorizonA - estimateQuarterlyFeesHorizonA;

    return {
      monthlyCostA,
      monthlyCostB,
      quarterlySavingsA: A_saved,
      suggestedQuarterlyRM: monthlyContributionRM * 3
    };
  }, [latestData, selectedA, selectedB, horizonYears, monthlyContributionRM, usdMyrRate]);

  return {
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
  };
};
