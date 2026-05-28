export interface ETF {
  ticker: string;
  name: string;
  domicile: "US" | "IE";
  exchange: "NYSE" | "LSE";
  ter: number;
  structure: "Distributing" | "Accumulating";
  defaultPrice: number;
  defaultSpreadBps: number;
}

export interface SimulationDataPoint {
  year: number;
  valueA: number;
  contribA: number;
  feesA: number;
  terA: number;
  taxA: number;
  spreadA: number;
  totalDragA: number;
  
  valueB: number;
  contribB: number;
  feesB: number;
  terB: number;
  taxB: number;
  spreadB: number;
  totalDragB: number;

  valueBench: number;
  contribBench: number;
}

export type FeeOptimizationFrequency = "monthly" | "quarterly" | "biannually" | "annually";
