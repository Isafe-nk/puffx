/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketAssumptions, UserInputs } from "./engine/types";

export const DEFAULT_MARKET_ASSUMPTIONS: MarketAssumptions = {
  equityReturn: 0.085,
  equityVolatility: 0.15,
  fixedIncomeReturn: 0.05,
  fixedIncomeVolatility: 0.05,
  cashReturn: 0.02,
  cashVolatility: 0.01,
  realEstateReturn: 0.06,
  realEstateVolatility: 0.09,
  goldReturn: 0.045,
  goldVolatility: 0.12,
  inflation: 0.025,
};

export const INITIAL_USER_INPUTS: UserInputs = {
  currentAge: 23,
  retirementAge: 60,
  monthlySalary: 3000,
  salaryGrowth: 0.04,
  savingsRate: 0.15, // 15% of monthly salary
  initialSavings: 5000,
  allocation: {
    equity: 0.6,
    fixedIncome: 0.2,
    cash: 0.1,
    realEstate: 0.05,
    gold: 0.05,
  },
  debts: [],
};
