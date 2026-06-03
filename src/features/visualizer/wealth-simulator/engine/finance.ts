/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetAllocation, MarketAssumptions, SimulationYear, UserInputs, FinancialHealth } from "./types";

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
  if (volatility > 0.15) riskLevel = "Aggressive";
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

  // Helper to calculate total debt balance at a specific point in time (months elapsed)
  const getDebtBalanceAt = (months: number) => {
    return inputs.debts.reduce((sum, debt) => {
      const totalMonths = debt.termYears * 12;
      if (totalMonths <= 0 || months >= totalMonths) return sum;
      
      const monthlyRate = debt.interestRate / 12;
      if (monthlyRate === 0) {
        return sum + (debt.principal * (totalMonths - months) / totalMonths);
      } else {
        const p1r_n = Math.pow(1 + monthlyRate, totalMonths);
        const p1r_p = Math.pow(1 + monthlyRate, months);
        return sum + (debt.principal * (p1r_n - p1r_p) / (p1r_n - 1));
      }
    }, 0);
  };

  // Push Initial State (Year 0)
  const initialDebt = getDebtBalanceAt(0);
  const initialExpenses = (currentMonthlySalary * (1 - inputs.savingsRate)) * 12;
  
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
    const currentExpenses = (currentMonthlySalary * (1 - inputs.savingsRate)) * 12;

    const totalAnnualSaved = (currentMonthlySalary * inputs.savingsRate) * 12;
    // Investment contribution is capped at total savings
    const investmentContribution = Math.min(currentMonthlyContribution * 12, totalAnnualSaved);
    const cashContribution = totalAnnualSaved - investmentContribution;
    
    const borrowingRate = 0.06;
    const growth = currentInvestmentBalance > 0 
      ? currentInvestmentBalance * expectedReturn 
      : currentInvestmentBalance * borrowingRate;

    currentInvestmentBalance = currentInvestmentBalance + growth + investmentContribution;
    currentCashBalance = currentCashBalance * (1 + assumptions.cashReturn) + cashContribution;
    
    const endOfYearDebt = getDebtBalanceAt(year * 12);

    const netWorth = currentInvestmentBalance + currentCashBalance - endOfYearDebt;
    const inflationFactor = Math.pow(1 + assumptions.inflation, year);

    timeline.push({
      year,
      age,
      salary: currentMonthlySalary * 12,
      totalSaved: totalAnnualSaved,
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
  const monthlyExpenses = inputs.monthlySalary * (1 - inputs.savingsRate);
  const emergencyFundMonths = inputs.initialCash / (monthlyExpenses || 1);
  
  let emergencyFundStatus: 'danger' | 'warning' | 'good' = 'danger';
  if (emergencyFundMonths >= 6) emergencyFundStatus = 'good';
  else if (emergencyFundMonths >= 3) emergencyFundStatus = 'warning';

  const totalMonthlyDebt = inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
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
