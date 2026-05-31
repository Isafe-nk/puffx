/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetAllocation, MarketAssumptions, MonteCarloResult, UserInputs } from "./types";
import { getPortfolioStats } from "./finance";

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

  const finalSalary = (inputs.monthlySalary * 12) * Math.pow(1 + inputs.salaryGrowth, yearsToSimulate);
  const annualExpenses = (finalSalary * (1 - inputs.savingsRate));
  const retirementGoal = annualExpenses * 25;

  for (let i = 0; i < iterations; i++) {
    const path: number[] = [];
    let currentBalance = inputs.initialSavings;
    let currentMonthlySalary = inputs.monthlySalary;

    // Year 0
    const initialDebt = getDebtBalanceAt(0);
    path.push(currentBalance - initialDebt);

    for (let year = 1; year <= yearsToSimulate; year++) {
      const totalAnnualSurplus = (currentMonthlySalary * inputs.savingsRate) * 12;
      
      // Calculate total debt payments for this year (handling partial years)
      let totalAnnualDebtPayments = 0;
      for (const debt of inputs.debts) {
        const totalMonths = debt.termYears * 12;
        const startMonths = (year - 1) * 12;
        
        if (startMonths < totalMonths) {
          const monthsPaidThisYear = Math.min(12, totalMonths - startMonths);
          totalAnnualDebtPayments += debt.monthlyPayment * monthsPaidThisYear;
        }
      }

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
      
      const investmentContribution = totalAnnualSurplus - totalAnnualDebtPayments;
      currentBalance = currentBalance + growth + investmentContribution;
      const endOfYearDebt = getDebtBalanceAt(year * 12);

      path.push(currentBalance - endOfYearDebt);
      
      currentMonthlySalary *= (1 + inputs.salaryGrowth);
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
