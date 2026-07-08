// Currency conversion lives in exactly one place. Engine values are native USD
// (see spec.md: "All core engine simulations natively operate in USD"); these
// helpers are the only boundary that turns USD into the chosen display currency.

/** Convert a native-USD value into the chosen display currency. */
export const convertCurrency = (
  valueUsd: number,
  showInUsd: boolean,
  usdMyrRate: number
): number => (showInUsd ? valueUsd : valueUsd * usdMyrRate);

/** Format a value that is ALREADY in the display currency (no conversion). */
export const formatDisplay = (
  displayValue: number,
  showInUsd: boolean,
  fractionDigits: number = 0
): string => {
  const prefix = showInUsd ? '$' : 'RM ';
  return prefix + displayValue.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
};

/** Convert a native-USD value to the display currency and format it. */
export const formatCurrency = (
  valueUsd: number,
  showInUsd: boolean,
  usdMyrRate: number,
  fractionDigits: number = 0
): string =>
  formatDisplay(convertCurrency(valueUsd, showInUsd, usdMyrRate), showInUsd, fractionDigits);

/**
 * Format a native-MYR value (no conversion). The Wealth Simulator engine works
 * in RM throughout — this is its single formatter so axis labels, tooltips and
 * KPIs all abbreviate the same way.
 */
export const formatRM = (value: number, compact: boolean = false): string =>
  new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0,
    notation: compact || Math.abs(value) >= 1_000_000 ? 'compact' : 'standard',
  }).format(value);
