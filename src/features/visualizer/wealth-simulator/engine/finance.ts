/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetAllocation, MarketAssumptions, SimulationYear, UserInputs, FinancialHealth } from "./types";
import { getDebtBalanceAt, getActiveMonthlyDebtPayments } from "./debtUtils";

/**
 * Calculates the portfolio expected return and volatility based on allocation.
 */
export function getPortfolioStats(
  allocation: AssetAllocation,
  assumptions: MarketAssumptions
) {
  const expectedReturn =
    allocation.equity * assumptions.equityReturn +
    allocation.fixedIncome * assumptions.fixedIncomeReturn +
    allocation.cash * assumptions.cashReturn +
    allocation.realEstate * assumptions.realEstateReturn +
    allocation.gold * assumptions.goldReturn;

  // Asset correlation matrix (estimated historical averages)
  const correlations: Record<string, Record<string, number>> = {
    equity: { equity: 1.0, fixedIncome: 0.15, cash: 0.05, realEstate: 0.65, gold: -0.10 },
    fixedIncome: { equity: 0.15, fixedIncome: 1.0, cash: 0.30, realEstate: 0.20, gold: 0.10 },
    cash: { equity: 0.05, fixedIncome: 0.30, cash: 1.0, realEstate: 0.05, gold: 0.0 },
    realEstate: { equity: 0.65, fixedIncome: 0.20, cash: 0.05, realEstate: 1.0, gold: 0.15 },
    gold: { equity: -0.10, fixedIncome: 0.10, cash: 0.0, realEstate: 0.15, gold: 1.0 },
  };

  const assets = ['equity', 'fixedIncome', 'cash', 'realEstate', 'gold'] as const;
  const volatilities: Record<string, number> = {
    equity: assumptions.equityVolatility,
    fixedIncome: assumptions.fixedIncomeVolatility,
    cash: assumptions.cashVolatility,
    realEstate: assumptions.realEstateVolatility,
    gold: assumptions.goldVolatility,
  };

  // Portfolio Variance = sum_i sum_j (w_i * w_j * sigma_i * sigma_j * rho_ij)
  let variance = 0;
  assets.forEach((i) => {
    assets.forEach((j) => {
      const weightI = allocation[i as keyof AssetAllocation];
      const weightJ = allocation[j as keyof AssetAllocation];
      const volI = volatilities[i];
      const volJ = volatilities[j];
      const corrIJ = correlations[i][j];
      variance += weightI * weightJ * volI * volJ * corrIJ;
    });
  });

  const volatility = Math.sqrt(variance);

  // Use cash return as the risk-free rate for Sharpe calculation
  const riskFreeRate = assumptions.cashReturn;
  const sharpeRatio = volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;

  let riskLevel = "Conservative";
  if (volatility >= 0.15) riskLevel = "Aggressive";
  else if (volatility > 0.10) riskLevel = "Moderate";
  else if (volatility > 0.05) riskLevel = "Balanced";

  return { expectedReturn, volatility, sharpeRatio, riskLevel };
}

/**
 * Calculates the monthly payment for a loan.
 */
export function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (termYears <= 0) return principal;
  if (annualRate === 0) return principal / (termYears * 12);
  const monthlyRate = annualRate / 12;
  const numberOfPayments = termYears * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

/**
 * Runs a single deterministic simulation based on average returns.
 */
export function runDeterministicSimulation(
  inputs: UserInputs,
  assumptions: MarketAssumptions
): SimulationYear[] {
  const timeline: SimulationYear[] = [];
  const yearsToSimulate = inputs.retirementAge - inputs.currentAge;
  
  let currentInvestmentBalance = inputs.initialSavings;
  let currentCashBalance = inputs.initialCash;
  let currentMonthlySalary = inputs.monthlySalary;
  let currentMonthlyContribution = inputs.monthlyContribution;
  
  const { expectedReturn } = getPortfolioStats(inputs.allocation, assumptions);

  // Push Initial State (Year 0)
  const initialDebt = getDebtBalanceAt(inputs.debts, 0);
  const initialActiveDebtPayments = getActiveMonthlyDebtPayments(inputs.debts, 0);
  const initialLifestyleBudget = currentMonthlySalary * (1 - inputs.savingsRate);
  const initialExpenses = (initialLifestyleBudget + initialActiveDebtPayments) * 12;
  
  timeline.push({
    year: 0,
    age: inputs.currentAge,
    salary: currentMonthlySalary * 12,
    totalSaved: 0,
    investmentContribution: 0,
    cashContribution: 0,
    investmentBalance: currentInvestmentBalance,
    cashBalance: currentCashBalance,
    debtBalance: initialDebt,
    netWorth: currentInvestmentBalance + currentCashBalance - initialDebt,
    expenses: initialExpenses,
    isRetired: false,
    inflationAdjustedNetWorth: currentInvestmentBalance + currentCashBalance - initialDebt,
  });

  for (let year = 1; year <= yearsToSimulate; year++) {
    const age = inputs.currentAge + year;

    // --- Cashflow Routing with Debt Overflow ---
    const lifestyleBudget = currentMonthlySalary * (1 - inputs.savingsRate);
    // Debt payments active at the START of this year
    const activeDebtPayments = getActiveMonthlyDebtPayments(inputs.debts, (year - 1) * 12);
    // If debt payments exceed lifestyle budget, overflow eats into savings
    const debtOverflow = Math.max(0, activeDebtPayments - lifestyleBudget);
    const annualDebtOverflow = debtOverflow * 12;

    const totalAnnualSaved = (currentMonthlySalary * inputs.savingsRate) * 12;
    // Reduce effective savings by any debt overflow
    const effectiveTotalSaved = Math.max(0, totalAnnualSaved - annualDebtOverflow);
    // Investment contribution is capped at effective savings
    const investmentContribution = Math.min(currentMonthlyContribution * 12, effectiveTotalSaved);
    const cashContribution = effectiveTotalSaved - investmentContribution;

    // Expenses now include lifestyle + debt payments (full picture)
    const currentExpenses = (lifestyleBudget + activeDebtPayments) * 12;
    
    const borrowingRate = 0.06;
    const growth = currentInvestmentBalance > 0 
      ? currentInvestmentBalance * expectedReturn 
      : currentInvestmentBalance * borrowingRate;

    currentInvestmentBalance = currentInvestmentBalance + growth + investmentContribution;
    currentCashBalance = currentCashBalance * (1 + assumptions.cashReturn) + cashContribution;
    
    const endOfYearDebt = getDebtBalanceAt(inputs.debts, year * 12);

    const netWorth = currentInvestmentBalance + currentCashBalance - endOfYearDebt;
    const inflationFactor = Math.pow(1 + assumptions.inflation, year);

    timeline.push({
      year,
      age,
      salary: currentMonthlySalary * 12,
      totalSaved: effectiveTotalSaved,
      investmentContribution,
      cashContribution,
      investmentBalance: currentInvestmentBalance,
      cashBalance: currentCashBalance,
      debtBalance: endOfYearDebt,
      netWorth,
      expenses: currentExpenses,
      isRetired: false,
      inflationAdjustedNetWorth: netWorth / inflationFactor,
    });

    currentMonthlySalary *= (1 + inputs.salaryGrowth);
    currentMonthlyContribution *= (1 + inputs.salaryGrowth);
  }

  return timeline;
}

export function auditFinancialHealth(inputs: UserInputs): FinancialHealth {
  const monthlyLifestyle = inputs.monthlySalary * (1 - inputs.savingsRate);
  const totalMonthlyDebtPayments = inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const totalMonthlyOutflow = monthlyLifestyle + totalMonthlyDebtPayments;
  const emergencyFundMonths = inputs.initialCash / (totalMonthlyOutflow || 1);
  
  let emergencyFundStatus: 'danger' | 'warning' | 'good' = 'danger';
  if (emergencyFundMonths >= 6) emergencyFundStatus = 'good';
  else if (emergencyFundMonths >= 3) emergencyFundStatus = 'warning';

  const totalMonthlyDebt = totalMonthlyDebtPayments;
  const monthlyGrossIncome = inputs.monthlySalary || 1; // Avoid division by zero
  const debtToIncomeRatio = totalMonthlyDebt / monthlyGrossIncome;

  const savingsRate = inputs.savingsRate;
  let savingsRateStatus: 'low' | 'healthy' | 'aggressive' = 'low';
  if (savingsRate >= 0.25) savingsRateStatus = 'aggressive';
  else if (savingsRate >= 0.15) savingsRateStatus = 'healthy';

  return {
    emergencyFundStatus,
    emergencyFundMonths,
    debtToIncomeRatio,
    savingsRateStatus
  };
}
