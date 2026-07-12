import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, PieChart, ArrowRight } from 'lucide-react';
import { usePageTitle } from '../../shared/hooks/usePageTitle';

const TOOLS = [
  {
    to: '/visualizer/etf-drag',
    icon: TrendingUp,
    eyebrow: 'Cost of investing',
    title: 'ETF Drag Visualizer',
    desc: 'Compare US vs Ireland-domiciled S&P 500 ETFs and see how fees, spreads and dividend tax drag on your final balance over decades.',
    footer: 'SPY vs CSPX · Withholding tax · TER · IBKR fees · Execution frequency',
  },
  {
    to: '/visualizer/wealth-simulator',
    icon: PieChart,
    eyebrow: 'Net-worth planning',
    title: 'Wealth Simulator',
    desc: 'Project your net worth to retirement — salary growth, savings, debts, asset mix, and 1,000 simulated market futures.',
    footer: 'Timeline · Asset allocation · Monte Carlo · Debt vs investing',
  },
];

export default function VisualizerHub() {
  usePageTitle('Visualizer');
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header — same language as the Learn landing */}
        <div className="pt-12 lg:pt-16">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#D91222]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#A2A3A5] font-semibold">Tools</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#212121] leading-tight">
            Visualizer
          </h1>
          <p className="mt-4 text-[15px] text-[#727579] leading-relaxed max-w-2xl">
            Interactive models for Malaysian investors — the true cost of your ETF choice, and the long-term shape of your net worth.
          </p>
        </div>

        {/* Tools */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map(({ to, icon: Icon, eyebrow, title, desc, footer }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-[#E6E6E6] bg-white p-6 hover:border-[#D91222] active:scale-[0.99] transition duration-200 flex flex-col"
            >
              <Icon className="w-5 h-5 text-[#727579] mb-6" strokeWidth={1.5} />
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A2A3A5] font-semibold mb-1">{eyebrow}</p>
              <h2 className="text-lg font-bold font-display text-[#212121] flex items-center gap-1.5">
                {title}
                <ArrowRight className="w-4 h-4 text-[#D91222] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" strokeWidth={1.5} />
              </h2>
              <p className="mt-2 text-[13px] text-[#727579] leading-relaxed">{desc}</p>
              <p className="mt-5 pt-4 border-t border-[#EEEEEE] text-[11px] text-[#A2A3A5] leading-relaxed mt-auto">
                {footer}
              </p>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-12 text-[11px] text-[#A2A3A5]">Educational only — not financial advice.</p>
      </div>
    </div>
  );
}
