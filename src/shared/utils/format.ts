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
