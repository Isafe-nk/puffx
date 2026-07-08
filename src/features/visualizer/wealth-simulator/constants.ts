/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketAssumptions, UserInputs } from "./engine/types";

// Central chart/status color map — every visualization color in this feature
// comes from here, keyed to the Puffx tokens (no raw Tailwind palette colors).
export const CHART_COLORS = {
  success: "#0EB35B",
  warning: "#FFB300",
  danger: "#D91222",
  info: "#307EF2",
  neutral: "#727579",
  faint: "#A2A3A5",
} as const;

// Asset-class palette for the allocation pie + legends (Puffx tokens + the
// brand teal for the fourth distinguishable hue).
export const ASSET_COLORS: Record<string, string> = {
  equity: CHART_COLORS.success,
  fixedIncome: CHART_COLORS.info,
  realEstate: "#0B3944",
  gold: CHART_COLORS.warning,
};

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
  savingsRate: 0.20, // 20% of monthly salary
  monthlyContribution: 500, // $500/mo invested
  initialSavings: 5000,
  initialCash: 10000,
  emergencyFundTargetMonths: 6,
  allocation: {
    equity: 0.7,
    fixedIncome: 0.2,
    realEstate: 0.05,
    gold: 0.05,
  },
  debts: [],
};
