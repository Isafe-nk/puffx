export const getWhtRate = (domicile: "US" | "IE") => domicile === "US" ? 0.30 : 0.15;

export const getBrokerMin = (domicile: "US" | "IE") => domicile === "US" ? 0.35 : 1.70;

export const calculateTradeFees = (amountUSD: number, domicile: "US" | "IE", price: number, bypassFX?: boolean, spreadBps?: number) => {
  if (amountUSD <= 0) return { fxFee: 0, brokerFee: 0, spreadCost: 0, netInv: 0 };
  
  const fxFee = bypassFX ? 0 : Math.max(2.00, 0.00002 * amountUSD);
  const spendableUSD = Math.max(0, amountUSD - fxFee);
  
  let brokerFee = 0;
  if (spendableUSD > 0) {
    if (domicile === "US") {
      const estimatedShares = spendableUSD / price;
      const nominalComm = estimatedShares * 0.0035;
      // Standard IBKR NYSE Commission: min $0.35, max 1% of value. Capped at 1% of value on the outside.
      brokerFee = Math.min(0.01 * spendableUSD, Math.max(0.35, nominalComm));
    } else {
      // UK London Stock Exchange (LSE UCITS): min $1.70, 0.05% of value commission
      brokerFee = Math.max(1.70, 0.0005 * spendableUSD);
    }
  }

  // ETF bid-ask spread cost: half the spread (mid → ask crossing) applied on trade value after broker fees
  const afterBroker = Math.max(0, spendableUSD - brokerFee);
  const spreadCost = (spreadBps && spreadBps > 0) ? (spreadBps / 10000) / 2 * afterBroker : 0;

  return {
    fxFee,
    brokerFee,
    spreadCost,
    netInv: Math.max(0, afterBroker - spreadCost)
  };
};
