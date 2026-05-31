export const formatCurrency = (
  value: number,
  showInUsd: boolean,
  usdMyrRate: number,
  fractionDigits: number = 0
): string => {
  const converted = showInUsd ? value / usdMyrRate : value;
  const prefix = showInUsd ? '$' : 'RM ';
  return prefix + converted.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
};
