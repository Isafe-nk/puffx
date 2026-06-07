/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketAssumptions, MonteCarloResult, UserInputs } from "./types";
import { getPortfolioStats } from "./finance";
import { getDebtBalanceAt, getActiveMonthlyDebtPayments } from "./debtUtils";

/**
 * Box-Muller transform for generating normally distributed random numbers.
 */
function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function runMonteCarlo(
  inputs: UserInputs,
  assumptions: MarketAssumptions,
  iterations: number = 1000
): MonteCarloResult {
  const yearsToSimulate = inputs.retirementAge - inputs.currentAge;
  const { expectedReturn, volatility } = getPortfolioStats(inputs.allocation, assumptions);
  
  const paths: number[][] = [];

  const finalSalary = (inputs.monthlySalary * 12) * Math.pow(1 + inputs.salaryGrowth, yearsToSimulate);
  const annualExpenses = (finalSalary * (1 - inputs.savingsRate));
  const retirementGoal = annualExpenses * 25;

  for (let i = 0; i < iterations; i++) {
    const path: number[] = [];
    let currentBalance = inputs.initialSavings;
    let currentCashBalance = inputs.initialCash;
    let currentMonthlySalary = inputs.monthlySalary;
    let currentMonthlyContribution = inputs.monthlyContribution;

    // Year 0
    const initialDebt = getDebtBalanceAt(inputs.debts, 0);
    path.push(currentBalance + currentCashBalance - initialDebt);

    for (let year = 1; year <= yearsToSimulate; year++) {
      // --- Cashflow Routing with Debt Overflow ---
      const lifestyleBudget = currentMonthlySalary * (1 - inputs.savingsRate);
      const activeDebtPayments = getActiveMonthlyDebtPayments(inputs.debts, (year - 1) * 12);
      const debtOverflow = Math.max(0, activeDebtPayments - lifestyleBudget);
      const annualDebtOverflow = debtOverflow * 12;

      const totalAnnualSaved = (currentMonthlySalary * inputs.savingsRate) * 12;
      const effectiveTotalSaved = Math.max(0, totalAnnualSaved - annualDebtOverflow);
      const investmentContribution = Math.min(currentMonthlyContribution * 12, effectiveTotalSaved);
      const cashContribution = effectiveTotalSaved - investmentContribution;

      // Growth logic: 
      const borrowingRate = 0.06;
      let growth = 0;
      
      if (currentBalance > 0) {
        const shock = randomNormal();
        const actualReturn = Math.exp((expectedReturn - 0.5 * Math.pow(volatility, 2)) + volatility * shock) - 1;
        growth = currentBalance * actualReturn;
      } else {
        growth = currentBalance * borrowingRate;
      }
      
      currentBalance = currentBalance + growth + investmentContribution;
      currentCashBalance = currentCashBalance * (1 + assumptions.cashReturn) + cashContribution;
      
      const endOfYearDebt = getDebtBalanceAt(inputs.debts, year * 12);

      path.push(currentBalance + currentCashBalance - endOfYearDebt);
      
      currentMonthlySalary *= (1 + inputs.salaryGrowth);
      currentMonthlyContribution *= (1 + inputs.salaryGrowth);
    }
    paths.push(path);
  }

  // Calculate percentiles
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];
  
  const totalYears = yearsToSimulate + 1; // Including Year 0
  for (let year = 0; year < totalYears; year++) {
    const valuesAtYear = paths.map(p => p[year]).sort((a, b) => a - b);
    p10.push(valuesAtYear[Math.floor(iterations * 0.1)]);
    p50.push(valuesAtYear[Math.floor(iterations * 0.5)]);
    p90.push(valuesAtYear[Math.floor(iterations * 0.9)]);
  }

  const successCount = paths.filter(p => p[p.length - 1] > retirementGoal).length;

  return {
    paths: paths.slice(0, 50), // Only return 50 paths for visualization to keep it light
    percentiles: { p10, p50, p90 },
    successProbability: successCount / iterations
  };
}
