import React from 'react';
import { NavLink } from 'react-router-dom';

export default function VisualizerNav() {
  return (
    <div className="flex items-center gap-6 border-b border-[#E6E6E6] mb-6 px-4 pt-4">
      <NavLink 
        to="/visualizer/etf-drag" 
        className={({ isActive }) => 
          `py-3 text-sm font-bold border-b-2 transition-colors ${isActive ? 'border-[#D91222] text-[#212121]' : 'border-transparent text-[#727579] hover:text-[#212121]'}`
        }
      >
        ETF Drag Visualizer
      </NavLink>
      <NavLink 
        to="/visualizer/wealth-simulator" 
        className={({ isActive }) => 
          `py-3 text-sm font-bold border-b-2 transition-colors ${isActive ? 'border-[#D91222] text-[#212121]' : 'border-transparent text-[#727579] hover:text-[#212121]'}`
        }
      >
        Wealth Simulator
      </NavLink>
    </div>
  );
}
