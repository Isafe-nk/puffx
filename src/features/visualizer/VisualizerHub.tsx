import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, PieChart } from 'lucide-react';

export default function VisualizerHub() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display tracking-tight text-[#212121] mb-2">Visualizer Hub</h1>
        <p className="text-[#727579]">Select a visualizer tool to begin modeling and forecasting your wealth trajectory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/visualizer/etf-drag" className="group bg-white border border-[#E6E6E6] hover:border-[#D91222] hover:shadow-md rounded-2xl p-6 transition-all duration-200 block">
          <div className="w-12 h-12 bg-[#F7F8FA] group-hover:bg-[#D91222]/10 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <TrendingUp className="w-6 h-6 text-[#212121] group-hover:text-[#D91222] transition-colors" />
          </div>
          <h2 className="text-xl font-bold mb-2">ETF Drag Visualizer</h2>
          <p className="text-sm text-[#727579] leading-relaxed">
            Compare US vs Ireland-domiciled S&P 500 ETFs. Model transaction friction, WHT drag, and total cost of ownership over time.
          </p>
        </Link>

        <Link to="/visualizer/wealth-simulator" className="group bg-white border border-[#E6E6E6] hover:border-[#D91222] hover:shadow-md rounded-2xl p-6 transition-all duration-200 block">
          <div className="w-12 h-12 bg-[#F7F8FA] group-hover:bg-[#D91222]/10 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <PieChart className="w-6 h-6 text-[#212121] group-hover:text-[#D91222] transition-colors" />
          </div>
          <h2 className="text-xl font-bold mb-2">Wealth Simulator</h2>
          <p className="text-sm text-[#727579] leading-relaxed">
            Simulate your personal wealth trajectory. Model salary growth, asset allocation, Monte Carlo risk scenarios, and debt strategies.
          </p>
        </Link>
      </div>
    </div>
  );
}
