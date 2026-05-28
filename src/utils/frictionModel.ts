export const getWhtRate = (domicile: "US" | "IE") => domicile === "US" ? 0.30 : 0.15;

// All-in minimum: IBKR comm ($1.70) + exchange (~$0.13) + clearing (~$0.08) = $1.91
export const getBrokerMin = (domicile: "US" | "IE") => domicile === "US" ? 0.35 : 1.91;

export const calculateTradeFees = (amountUSD: number, domicile: "US" | "IE", price: number, bypassFX?: boolean, spreadBps?: number) => {
  if (amountUSD <= 0) return { fxFee: 0, brokerFee: 0, spreadCost: 0, netInv: 0 };
  
  const fxFee = bypassFX ? 0 : Math.max(2.00, 0.00002 * amountUSD);
  const spendableUSD = Math.max(0, amountUSD - fxFee);
  
  let brokerFee = 0;
  if (spendableUSD > 0) {
    if (domicile === "US") {
      const estimatedShares = spendableUSD / price;
      const nominalComm = estimatedShares * 0.0035;
      // Standard IBKR NYSE Tiered Commission: min $0.35, max 1% of value.
      brokerFee = Math.min(0.01 * spendableUSD, Math.max(0.35, nominalComm));
    } else {
      // UK London Stock Exchange (LSE UCITS) — IBKR Tiered Pricing breakdown:
      // 1. IBKR Commission: 0.05% of trade value, min $1.70 USD
      const ibkrComm = Math.max(1.70, 0.0005 * spendableUSD);
      // 2. Exchange Fee (pass-through): 0.0045% of trade value, min GBP 0.10 ≈ $0.13
      const exchangeFee = Math.max(0.13, 0.000045 * spendableUSD);
      // 3. Clearing Fee (pass-through): flat GBP 0.06 ≈ $0.08
      const clearingFee = 0.08;
      brokerFee = ibkrComm + exchangeFee + clearingFee;
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
