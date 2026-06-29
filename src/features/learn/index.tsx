import React from 'react';
import { GraduationCap, Landmark, Percent, Coins, Repeat, ShieldAlert } from 'lucide-react';
import Card from '../../shared/components/Card';

interface Concept {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}

const CONCEPTS: Concept[] = [
  {
    icon: Percent,
    title: 'Dividend Withholding Tax (WHT)',
    body: (
      <>
        When an S&P 500 fund receives dividends, a slice is taxed before it ever reaches the fund.
        A <strong>US-domiciled</strong> ETF (VOO/IVV/SPY) suffers the full <strong>30%</strong> rate.
        An <strong>Ireland-domiciled UCITS</strong> (CSPX/VUAA/SPYL) pays only <strong>15%</strong> under
        the US–Ireland tax treaty. That 15-point gap compounds for decades — it is the single largest
        structural difference between the two.
      </>
    ),
  },
  {
    icon: Coins,
    title: 'Total Expense Ratio (TER)',
    body: (
      <>
        The fund's annual management fee, skimmed continuously off your balance. US funds are cheaper
        (often ~0.03%), Irish UCITS slightly higher (~0.07%). It is small per year but, like WHT,
        it is a drag that compounds — so the visualizer weighs it against the tax saving rather than
        judging either in isolation.
      </>
    ),
  },
  {
    icon: Coins,
    title: 'Transaction Friction',
    body: (
      <>
        Every purchase leaks a little to fixed costs: IBKR's <strong>FX spot fee</strong> (min ~$2),
        the <strong>brokerage commission</strong> (US NYSE min ~$0.35; London UCITS ~$1.91 all-in), and
        the <strong>bid-ask spread</strong> you cross on each trade. On small contributions these fixed
        minimums dominate — which is why batching (quarterly, annually) can matter more than the fund choice.
      </>
    ),
  },
  {
    icon: Repeat,
    title: 'Accumulating vs Distributing',
    body: (
      <>
        <strong>Accumulating</strong> funds reinvest dividends internally — no cash hits your account, no
        manual re-buying, no extra commissions. <strong>Distributing</strong> funds pay dividends out as cash.
        For a long-horizon Malaysian saver, accumulating UCITS keep compounding frictionless.
      </>
    ),
  },
  {
    icon: ShieldAlert,
    title: 'US Estate Tax',
    body: (
      <>
        A risk most retail investors miss: for non-resident aliens, US-situs assets above <strong>$60,000</strong>
        can be hit by US estate tax of up to <strong>40%</strong> on death. Ireland-domiciled funds are
        <strong> not</strong> US-situs, so they sidestep this entirely — a major reason long-term holders
        favour the UCITS route.
      </>
    ),
  },
];

export default function Learn() {
  return (
    <div className="w-full">
      {/* Page header — mirrors the visualizer tool headers */}
      <header className="border-b border-[#E6E6E6] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D91222]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-[#D91222]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-[#212121]">Learn</h1>
            <p className="text-xs text-[#727579] font-sans mt-0.5">
              The concepts behind the numbers — for Malaysian investors buying the S&P 500 via IBKR
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
        {/* The core decision */}
        <Card className="!p-6 lg:!p-7">
          <div className="flex items-center gap-2 text-[10px] text-[#727579] font-semibold uppercase tracking-[0.15em] mb-3">
            <span className="w-0.5 h-4 bg-[#D91222] rounded-full"></span>
            The Core Decision
          </div>
          <h2 className="text-lg lg:text-xl font-black font-display text-[#212121] tracking-tight mb-2">
            US-domiciled vs Ireland-domiciled S&P 500 ETFs
          </h2>
          <p className="text-sm text-[#44474D] leading-relaxed">
            Both track the same index, so the contest is decided by leakage, not returns.
            <strong> US funds</strong> win on fees (lower TER) but lose 30% of dividends to withholding tax and
            carry US estate-tax exposure. <strong>Irish UCITS</strong> charge a little more in TER but cut
            withholding tax to 15% and remove the estate-tax risk. The visualizer's job is to compound those
            opposing forces over your horizon and show which one actually leaves you with more.
          </p>
        </Card>

        {/* Concept grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONCEPTS.map((c) => (
            <React.Fragment key={c.title}>
              <Card className="!p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F7F8FA] border border-[#E6E6E6] flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-[#D91222]" />
                  </div>
                  <h3 className="text-sm font-bold font-display text-[#212121]">{c.title}</h3>
                </div>
                <p className="text-[13px] text-[#727579] leading-relaxed">{c.body}</p>
              </Card>
            </React.Fragment>
          ))}
        </div>

        {/* Footnote */}
        <div className="flex items-start gap-2.5 text-[11px] text-[#727579] leading-normal bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E6E6E6]">
          <Landmark className="w-3.5 h-3.5 text-[#D91222] shrink-0 mt-0.5" />
          <span>
            Educational only — not tax or investment advice. Rates and treaty treatment can change;
            confirm current figures with Interactive Brokers and a qualified adviser before acting.
          </span>
        </div>
      </main>
    </div>
  );
}
