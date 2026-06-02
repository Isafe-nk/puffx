import React from 'react';
import { NavLink } from 'react-router-dom';

export const SideNavItem: React.FC<{ item: any }> = ({ item }) => {
  const isComingSoon = item.path !== "/visualizer";
  return (
    <NavLink
      to={isComingSoon ? "#" : item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-colors duration-200 ${
          isActive && !isComingSoon
            ? 'text-white bg-white/15 border-l-2 border-[#D91222]'
            : isComingSoon 
              ? 'text-white/30 cursor-not-allowed pointer-events-none' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
        }`
      }
      onClick={(e) => isComingSoon && e.preventDefault()}
    >
      <item.icon className="w-4 h-4" />
      <span className="text-xs uppercase font-bold tracking-wider">{item.label}</span>
    </NavLink>
  );
};
