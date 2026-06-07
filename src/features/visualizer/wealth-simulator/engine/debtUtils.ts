/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DebtProfile } from "./types";

/**
 * Calculates the remaining balance of all debts at a specific point in time.
 * Uses the standard amortizing loan remaining balance formula:
 *   Bal_m = P × ((1+r)^N − (1+r)^m) / ((1+r)^N − 1)
 *
 * @param debts Array of debt profiles
 * @param months Number of months elapsed since loan origination
 */
export function getDebtBalanceAt(debts: DebtProfile[], months: number): number {
  return debts.reduce((sum, debt) => {
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
}

/**
 * Calculates the total monthly debt payments for debts still active at a given month.
 * A debt is "active" if its term has not yet elapsed.
 *
 * @param debts Array of debt profiles
 * @param months Number of months elapsed since loan origination
 */
export function getActiveMonthlyDebtPayments(debts: DebtProfile[], months: number): number {
  return debts.reduce((sum, debt) => {
    const totalMonths = debt.termYears * 12;
    if (totalMonths <= 0 || months >= totalMonths) return sum; // paid off
    return sum + debt.monthlyPayment;
  }, 0);
}
