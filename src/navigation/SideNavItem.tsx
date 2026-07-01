import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// A group is "active" when the current path is under its own path prefix
// (so Learn/FFM light up on phase and module pages), or when any of its
// (recursive) children match — which catches a child whose URL lives outside
// the parent's prefix (e.g. Glossary at /glossary under the Learn group).
function isActivePath(item: any, pathname: string): boolean {
  if (Array.isArray(item.children) && item.children.length > 0) {
    if (pathname === item.path || pathname.startsWith(item.path + '/')) return true;
    return item.children.some((c: any) => isActivePath(c, pathname));
  }
  return pathname === item.path;
}

export const SideNavItem: React.FC<{ item: any; depth?: number }> = ({ item, depth = 0 }) => {
  const location = useLocation();
  const comingSoon = item.comingSoon;
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const active = !comingSoon && isActivePath(item, location.pathname);
  const [expanded, setExpanded] = useState(active);

  // Entering the section (via this row or any other link) opens the group.
  useEffect(() => {
    if (active) setExpanded(true);
  }, [active]);

  const nested = depth > 0;
  const labelCls = nested
    ? 'text-[11px] font-semibold tracking-wide'
    : 'text-xs uppercase font-bold tracking-wider';
  const rowPad = nested ? 'px-3 py-2' : 'px-3 py-2.5';
  const activeCls = nested ? 'text-white bg-white/10' : 'text-white bg-white/15 border-l-2 border-[#D91222]';
  const idleCls = 'text-white/55 hover:text-white hover:bg-white/5';

  // Leaf
  if (!hasChildren) {
    return (
      <NavLink
        to={comingSoon ? '#' : item.path}
        end
        onClick={(e) => comingSoon && e.preventDefault()}
        className={({ isActive }) =>
          `flex items-center gap-3 ${rowPad} rounded-lg font-bold transition-colors duration-200 ${
            isActive && !comingSoon ? activeCls : comingSoon ? 'text-white/30 cursor-not-allowed pointer-events-none' : idleCls
          }`
        }
      >
        {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
        <span className={labelCls}>{item.label}</span>
      </NavLink>
    );
  }

  // Expandable group — the label navigates to the section AND expands it; the
  // chevron is a separate control to collapse/expand without navigating.
  return (
    <div>
      <div className={`flex items-center rounded-lg font-bold transition-colors duration-200 ${active ? activeCls : idleCls}`}>
        <NavLink
          to={item.path}
          onClick={() => setExpanded(true)}
          className={`flex items-center gap-3 ${rowPad} flex-1 min-w-0`}
        >
          {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
          <span className={labelCls}>{item.label}</span>
        </NavLink>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
          aria-expanded={expanded}
          className="p-2 mr-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

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
