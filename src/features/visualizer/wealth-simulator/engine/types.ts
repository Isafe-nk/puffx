/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketAssumptions {
  equityReturn: number;
  equityVolatility: number;
  fixedIncomeReturn: number;
  fixedIncomeVolatility: number;
  cashReturn: number;
  cashVolatility: number;
  realEstateReturn: number;
  realEstateVolatility: number;
  goldReturn: number;
  goldVolatility: number;
  inflation: number;
}

/**
 * Composition of the invested (Growth) portfolio only. Cash is deliberately excluded:
 * it lives as the separate emergency buffer (Safety pool), not as a portfolio sleeve.
 * Weights are expected to sum to 1; getPortfolioStats normalizes defensively.
 */
export interface AssetAllocation {
  equity: number;
  fixedIncome: number;
  realEstate: number;
  gold: number;
}

export interface DebtProfile {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
}

export interface UserInputs {
  currentAge: number;
  retirementAge: number;
  monthlySalary: number;
  salaryGrowth: number;
  savingsRate: number; // Represents total unspent lifestyle %
  monthlyContribution: number; // Actual dollar amount invested
  initialSavings: number; // Starting portfolio balance
  initialCash: number; // Starting cash buffer
  emergencyFundTargetMonths: number; // Cash buffer target, in months of essential expenses
  allocation: AssetAllocation;
  debts: DebtProfile[];
}

export interface SimulationYear {
  year: number;
  age: number;
  salary: number;
  totalSaved: number;
  investmentContribution: number;
  cashContribution: number; // routed into the emergency buffer (capped by the moving target)
  discretionarySpend: number; // surplus that leaks out as lifestyle/travel spend
  investmentBalance: number;
  cashBalance: number;
  debtBalance: number;
  netWorth: number;
  expenses: number;
  isRetired: boolean;
  inflationAdjustedNetWorth: number;
}

export interface FinancialHealth {
  emergencyFundStatus: 'danger' | 'warning' | 'good';
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  debtToIncomeStatus: 'healthy' | 'caution' | 'high';
  savingsRateStatus: 'low' | 'healthy' | 'aggressive';
}

export interface MonteCarloResult {
  paths: number[][]; // Array of net worth paths
  percentiles: {
    p10: number[];
    p50: number[];
    p90: number[];
  };
  successProbability: number;
}
