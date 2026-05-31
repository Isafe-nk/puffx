import { ShieldAlert } from "lucide-react";
import { ETF } from "../types";
import AlertBanner from "../../../../shared/components/AlertBanner";

interface FrictionAlertProps {
  showOptimizationWarning: boolean;
  feeOptimizationFreq: string;
  monthlyContributionRM: number;
  freqMultiplier: number;
  transactionSumUSD: number;
  selectedA: ETF;
  selectedB: ETF;
  actualFrictionA: number;
  actualFrictionB: number;
  usdMyrRate: number;
  formatVal: (v: number) => string;
  depositDirectUSD: boolean;
}

export default function FrictionAlert({
  showOptimizationWarning,
  feeOptimizationFreq,
  monthlyContributionRM,
  freqMultiplier,
  transactionSumUSD,
  selectedA,
  selectedB,
  actualFrictionA,
  actualFrictionB,
  usdMyrRate,
  formatVal,
  depositDirectUSD
}: FrictionAlertProps) {
  if (!showOptimizationWarning) return null;

  const fxCost = depositDirectUSD ? 0 : 2.00;
  const brokerMinA = selectedA.domicile === "US" ? 0.35 : 1.91;
  const brokerMinB = selectedB.domicile === "US" ? 0.35 : 1.91;
  const overheadA = brokerMinA + fxCost;
  const overheadB = brokerMinB + fxCost;

  return (
    <AlertBanner
      type="warning"
      title="IBKR Transaction Drag Alert: Excessive Overhead Detected"
      icon={<ShieldAlert className="w-5 h-5" />}
    >
      <div className="text-[11px] text-[#44474D] leading-relaxed space-y-2">
        <p>
          Your current execution frequency (<strong>{feeOptimizationFreq}</strong>) pools your contribution into purchases of <strong>RM {monthlyContributionRM * freqMultiplier}</strong> (approx. <strong>${transactionSumUSD.toFixed(1)} USD</strong>). This transaction size suffers from high recurring fixed costs relative to IBKR's commission minimums:
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-[#727579] font-mono text-[10.5px]">
          <li>
            <strong>{selectedA.ticker} ({selectedA.domicile} fund):</strong> Minimum buying commission of <strong>${brokerMinA.toFixed(2)} USD</strong>{depositDirectUSD ? "" : " + $2.00 USD FX min conversion fee"} = <strong>${overheadA.toFixed(2)} USD</strong> total overhead (around <strong>RM {(overheadA * usdMyrRate).toFixed(2)}</strong>), which eats up <strong>{actualFrictionA.toFixed(1)}%</strong> of your purchase.
          </li>
          <li>
            <strong>{selectedB.ticker} ({selectedB.domicile} fund):</strong> Minimum buying commission of <strong>${brokerMinB.toFixed(2)} USD</strong>{depositDirectUSD ? "" : " + $2.00 USD FX min conversion fee"} = <strong>${overheadB.toFixed(2)} USD</strong> total overhead (around <strong>RM {(overheadB * usdMyrRate).toFixed(2)}</strong>), which eats up <strong>{actualFrictionB.toFixed(1)}%</strong> of your purchase.
          </li>
        </ul>
        {feeOptimizationFreq === "monthly" ? (
          <p className="text-[11px] text-[#44474D] pt-1">
            💡 <span className="text-[#212121] font-semibold">Change your purchase frequency to &quot;Quarterly&quot; (or wider) in the sidebar parameter panel</span> to pool your funds into <strong>{formatVal(monthlyContributionRM * 3)}</strong> per transaction. This drastically reduces the recurring overhead drag from {actualFrictionA > actualFrictionB ? actualFrictionA.toFixed(1) : actualFrictionB.toFixed(1)}% down to <strong>{( (actualFrictionA > actualFrictionB ? actualFrictionA : actualFrictionB) / 3 ).toFixed(2)}%</strong>!
          </p>
        ) : (
          <p className="text-[11px] text-[#44474D] pt-1">
            💡 <span className="text-[#212121] font-semibold">Consider pooling your purchases even further (e.g., &quot;Semi-Annually&quot; or &quot;Annually&quot;)</span> in the sidebar settings to let your funds accumulate into even larger single purchase volumes and suppress this transaction drag.
          </p>
        )}
      </div>
    </AlertBanner>
  );
}
