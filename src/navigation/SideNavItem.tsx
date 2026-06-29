import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const SideNavItem: React.FC<{ item: any }> = ({ item }) => {
  const comingSoon = item.comingSoon;
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const location = useLocation();
  const sectionActive = hasChildren && location.pathname.startsWith(item.path);
  const [expanded, setExpanded] = useState(sectionActive);

  // Leaf item (no children) — original behavior.
  if (!hasChildren) {
    return (
      <NavLink
        to={comingSoon ? "#" : item.path}
        end
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-colors duration-200 ${
            isActive && !comingSoon
              ? 'text-white bg-white/15 border-l-2 border-[#D91222]'
              : comingSoon
                ? 'text-white/30 cursor-not-allowed pointer-events-none'
                : 'text-white/60 hover:text-white hover:bg-white/10'
          }`
        }
        onClick={(e) => comingSoon && e.preventDefault()}
      >
        <item.icon className="w-4 h-4" />
        <span className="text-xs uppercase font-bold tracking-wider">{item.label}</span>
      </NavLink>
    );
  }

  // Expandable group: the whole row toggles the children open/closed; the chevron
  // is just the state indicator. Auto-expanded when you're inside the section.
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-colors duration-200 ${
          sectionActive ? 'text-white bg-white/15 border-l-2 border-[#D91222]' : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="text-xs uppercase font-bold tracking-wider">{item.label}</span>
        <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <div className={`grid transition-all duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="ml-4 pl-3 border-l border-white/10 flex flex-col gap-0.5">
            {item.children.map((child: any) => (
              <NavLink
                key={child.path}
                to={child.path}
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
