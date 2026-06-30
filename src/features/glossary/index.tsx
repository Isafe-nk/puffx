import React from 'react';
import { Percent, Coins, Repeat, ShieldAlert } from 'lucide-react';

interface Term {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: React.ReactNode;
}

const TERMS: Term[] = [
  {
    icon: Percent,
    title: 'Dividend Withholding Tax (WHT)',
    body: (
      <>
        When an S&P 500 fund receives dividends, a slice is taxed before it ever reaches the fund.
        A <strong>US-domiciled</strong> ETF (VOO/IVV/SPY) suffers the full <strong>30%</strong> rate.
        An <strong>Ireland-domiciled UCITS</strong> (CSPX/VUAA/SPYL) pays only <strong>15%</strong> under
        the US–Ireland tax treaty. That 15-point gap compounds for decades — the single largest structural
        difference between the two.
      </>
    ),
  },
  {
    icon: Coins,
    title: 'Total Expense Ratio (TER)',
    body: (
      <>
        The fund's annual management fee, skimmed continuously off your balance. US funds are cheaper
        (often ~0.03%), Irish UCITS slightly higher (~0.07%). Small per year, but — like WHT — it is a
        drag that compounds, so the visualizer weighs it against the tax saving rather than judging either alone.
      </>
    ),
  },
  {
    icon: Coins,
    title: 'Transaction Friction',
    body: (
      <>
        Every purchase leaks to fixed costs: IBKR's <strong>FX spot fee</strong> (min ~$2), the
        <strong> brokerage commission</strong> (US NYSE min ~$0.35; London UCITS ~$1.91 all-in), and the
        <strong> bid-ask spread</strong> you cross on each trade. On small contributions these fixed minimums
        dominate — which is why batching (quarterly, annually) can matter more than the fund choice.
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
        <strong> not</strong> US-situs, so they sidestep this entirely — a major reason long-term holders favour the UCITS route.
      </>
    ),
  },
];

export default function Glossary() {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header */}
        <div className="pt-12 lg:pt-16">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#D91222]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#A2A3A5] font-semibold">Reference</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#212121] leading-tight">Glossary</h1>
          <p className="mt-4 text-[15px] text-[#727579] leading-relaxed max-w-2xl">
            The concepts behind the visualizer — the costs and rules the simulation models.
          </p>
        </div>

        {/* Core decision */}
        <section className="mt-10 rounded-2xl border border-[#E6E6E6] bg-white p-6 lg:p-7">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A2A3A5] font-semibold mb-2">The core decision</p>
          <h2 className="text-lg lg:text-xl font-bold font-display text-[#212121] mb-2 tracking-tight">
            US-domiciled vs Ireland-domiciled S&P 500 ETFs
          </h2>
          <p className="text-sm text-[#44474D] leading-relaxed">
            Both track the same index, so the contest is decided by leakage, not returns.
            <strong> US funds</strong> win on fees (lower TER) but lose 30% of dividends to withholding tax and
            carry US estate-tax exposure. <strong>Irish UCITS</strong> charge a little more in TER but cut
            withholding tax to 15% and remove the estate-tax risk. The visualizer compounds those opposing
            forces over your horizon to show which one actually leaves you with more.
          </p>
        </section>

        {/* Terms */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {TERMS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-[#E6E6E6] bg-white p-6">
              <div className="flex items-center gap-2.5 mb-3">
                <t.icon className="w-4 h-4 text-[#727579]" strokeWidth={1.5} />
                <h3 className="text-sm font-bold font-display text-[#212121]">{t.title}</h3>
              </div>
              <p className="text-[13px] text-[#727579] leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-8 text-[11px] text-[#A2A3A5] leading-relaxed max-w-2xl">
          Educational only — not tax or investment advice. Rates and treaty treatment can change;
          confirm current figures with Interactive Brokers and a qualified adviser before acting.
        </p>
      </div>
    </div>
  );
}
