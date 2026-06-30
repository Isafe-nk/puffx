import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// A group is "active" when the current path is its own landing or any of its
// (recursive) descendants — so Learn lights up on a module page, but not when
// you're on a sibling like Glossary.
function isActivePath(item: any, pathname: string): boolean {
  if (Array.isArray(item.children) && item.children.length > 0) {
    return pathname === item.path || item.children.some((c: any) => isActivePath(c, pathname));
  }
  return pathname === item.path;
}

export const SideNavItem: React.FC<{ item: any; depth?: number }> = ({ item, depth = 0 }) => {
  const location = useLocation();
  const comingSoon = item.comingSoon;
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const active = !comingSoon && isActivePath(item, location.pathname);
  const [expanded, setExpanded] = useState(active);

  const nested = depth > 0;
  const labelCls = nested
    ? 'text-[11px] font-semibold tracking-wide'
    : 'text-xs uppercase font-bold tracking-wider';
  const rowPad = nested ? 'px-3 py-2' : 'px-3 py-2.5';

  // Leaf
  if (!hasChildren) {
    return (
      <NavLink
        to={comingSoon ? '#' : item.path}
        end
        onClick={(e) => comingSoon && e.preventDefault()}
        className={({ isActive }) =>
          `flex items-center gap-3 ${rowPad} rounded-lg font-bold transition-colors duration-200 ${
            isActive && !comingSoon
              ? nested
                ? 'text-white bg-white/10'
                : 'text-white bg-white/15 border-l-2 border-[#D91222]'
              : comingSoon
                ? 'text-white/30 cursor-not-allowed pointer-events-none'
                : 'text-white/55 hover:text-white hover:bg-white/5'
          }`
        }
      >
        {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
        <span className={labelCls}>{item.label}</span>
      </NavLink>
    );
  }

  // Expandable group — whole row toggles; chevron is the indicator.
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`w-full flex items-center gap-3 ${rowPad} rounded-lg font-bold transition-colors duration-200 ${
          active
            ? nested
              ? 'text-white bg-white/10'
              : 'text-white bg-white/15 border-l-2 border-[#D91222]'
            : 'text-white/55 hover:text-white hover:bg-white/5'
        }`}
      >
        {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
        <span className={labelCls}>{item.label}</span>
        <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <div className={`grid transition-all duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="ml-4 pl-3 border-l border-white/10 flex flex-col gap-0.5">
            {item.children.map((child: any) => (
              <SideNavItem key={`${child.path}:${child.label}`} item={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
