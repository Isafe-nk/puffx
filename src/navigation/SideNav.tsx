import React from 'react';
import { Download, BookOpen } from 'lucide-react';
import { navConfig } from './navConfig';
import { SideNavItem } from './SideNavItem';

export default function SideNav() {
  return (
    <nav className="hidden lg:flex h-screen w-72 fixed left-0 top-0 bg-[#0B3944] border-r border-[#E6E6E6] flex-col py-8 px-6 z-50">
      <div className="mb-8">
        <h2 className="font-display text-4xl text-white tracking-tighter font-bold">puffx</h2>
        <div className="w-12 h-0.5 bg-[#D91222] mt-2 rounded-full"></div>
        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-2">Own your numbers</p>
      </div>
      
      <div className="flex-1 flex flex-col gap-1.5">
        {navConfig.map((item) => (
          <SideNavItem key={item.path} item={item} />
        ))}
      </div>
      
      <div className="mt-auto flex flex-col gap-2 border-t border-white/15 pt-4">
        <button className="w-full bg-[#D91222]/50 text-white/50 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider cursor-not-allowed pointer-events-none shadow-none">
          <Download className="w-4 h-4" />
          Export Report
        </button>
        <a className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-white/30 font-medium cursor-not-allowed pointer-events-none">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs uppercase font-bold tracking-wider">Documentation</span>
        </a>
      </div>
    </nav>
  );
}
