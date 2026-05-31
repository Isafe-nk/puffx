import { ETF } from "./types";

export const ETF_REGISTRY: ETF[] = [
  { ticker: "VOO", name: "Vanguard S&P 500", domicile: "US", exchange: "NYSE", ter: 0.0003, structure: "Distributing", defaultPrice: 525, defaultSpreadBps: 1 },
  { ticker: "IVV", name: "iShares Core S&P 500", domicile: "US", exchange: "NYSE", ter: 0.0003, structure: "Distributing", defaultPrice: 525, defaultSpreadBps: 1 },
  { ticker: "SPY", name: "SPDR S&P 500", domicile: "US", exchange: "NYSE", ter: 0.0009, structure: "Distributing", defaultPrice: 525, defaultSpreadBps: 1 },
  { ticker: "CSPX", name: "iShares Core S&P 500 UCITS", domicile: "IE", exchange: "LSE", ter: 0.0007, structure: "Accumulating", defaultPrice: 560, defaultSpreadBps: 3 },
  { ticker: "VUAA", name: "Vanguard S&P 500 UCITS", domicile: "IE", exchange: "LSE", ter: 0.0007, structure: "Accumulating", defaultPrice: 98, defaultSpreadBps: 5 },
  { ticker: "SPYL", name: "SPDR S&P 500 UCITS", domicile: "IE", exchange: "LSE", ter: 0.0003, structure: "Accumulating", defaultPrice: 11.5, defaultSpreadBps: 8 }
];
