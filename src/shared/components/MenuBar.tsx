import React from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { useWindows } from '../../context/OSProvider';

interface DropItem {
  label: string;
  appId?: string;
  path?: string;
  soon?: boolean;
}
interface DropMenu {
  label: string;
  items: DropItem[];
  note?: string;
}

// Menu-bar dropdowns (spec §6, desktop-APPROVED mock). Items open/focus an app
// window via openApp; unbuilt destinations are marked "soon" and inert.
const MENUS: DropMenu[] = [
  {
    label: 'Learn',
    items: [
      { label: 'Personal Finance', appId: 'learn', path: '/learn/phase/personal-finance' },
      { label: 'Investment', appId: 'learn', path: '/learn/phase/investment' },
    ],
  },
  {
    label: 'Docs',
    items: [
      { label: 'Glossary', appId: 'glossary' },
      { label: 'Articles', soon: true },
      { label: 'Guides', soon: true },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'ETF Drag', appId: 'etf-drag' },
      { label: 'Wealth Simulator', appId: 'wealth-simulator' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Getting started', soon: true },
      { label: 'FAQ', soon: true },
      { label: 'Give feedback', soon: true },
    ],
    note: 'Educational only — not financial advice.',
  },
];

const rowCls =
  'flex items-center justify-between gap-4 w-full text-left px-2.5 py-[7px] rounded-[4px] text-[12.5px] whitespace-nowrap text-body enabled:hover:bg-accent enabled:hover:text-white transition-colors group/row';

function Dropdown({ menu, onOpen }: { menu: DropMenu; onOpen: (appId: string, path?: string) => void }) {
  return (
    <div className="relative group/menu">
      <button
        type="button"
        aria-haspopup="true"
        className="px-3 py-[7px] rounded-[5px] text-[13px] text-body group-hover/menu:bg-sage-tint group-hover/menu:text-ink group-focus-within/menu:bg-sage-tint group-focus-within/menu:text-ink transition-colors"
      >
        {menu.label}
      </button>
      {/* `os-menu-in` fades + drops 4px on open and closes instantly
          (spec/motion.md §3) — an animated dismissal makes an OS feel sluggish.
          The panel goes display:none → block, which is a render change, so
          `@starting-style` supplies the enter state with no JS. */}
      <div className="os-dropdown os-menu-in absolute top-[calc(100%+3px)] left-0 min-w-[216px] p-[5px] rounded-[5px] z-[60] hidden group-hover/menu:block group-focus-within/menu:block">
        {menu.items.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={!item.appId}
            onClick={() => item.appId && onOpen(item.appId, item.path)}
            className={`${rowCls} ${!item.appId ? 'cursor-default text-body' : ''}`}
          >
            {item.label}
            {item.soon && <span className="text-[10px] text-faint group-hover/row:text-white/70">soon</span>}
          </button>
        ))}
        {menu.note && (
          <>
            <div className="h-px bg-hairline mx-1.5 my-[5px]" />
            <p className="px-2.5 pt-[5px] pb-[3px] text-[11px] text-faint italic">{menu.note}</p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The OS menu bar (spec §6): beveled surface, logo + Puffx wordmark, hover/
 * keyboard dropdown menus that open app windows, and Search + Help icon buttons
 * on the right (no clock, no account — we're no-login).
 */
export default function MenuBar() {
  const { openApp } = useWindows();

  return (
    <header className="os-menubar h-[42px] shrink-0 flex items-center gap-px px-2 text-body relative z-30">
      <span className="flex items-center gap-[5px] pl-1.5 pr-4 mr-1 shrink-0">
        <img src="/icon/logo.png" alt="" className="w-6 h-6 rounded-[6px] object-contain block" />
        <b className="text-ink font-bold text-[14.5px] tracking-[-0.01em]">Puffx</b>
      </span>

      {MENUS.map((m) => (
        <Dropdown key={m.label} menu={m} onOpen={openApp} />
      ))}

      <span className="ml-auto flex items-center gap-0.5 pr-0.5">
        <button type="button" aria-label="Search" className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center text-mute hover:bg-sage-tint hover:text-ink transition-colors">
          <Search className="w-4 h-4" strokeWidth={1.6} />
        </button>
        <button type="button" aria-label="Help" className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center text-mute hover:bg-sage-tint hover:text-ink transition-colors">
          <HelpCircle className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </span>
    </header>
  );
}
