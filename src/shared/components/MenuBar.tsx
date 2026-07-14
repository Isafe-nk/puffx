import React from 'react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/OSProvider';
import { useWindow } from '../../context/WindowContext';

interface DropItem {
  label: string;
  to?: string;
  soon?: boolean;
}
interface DropMenu {
  label: string;
  items: DropItem[];
  note?: string; // italic footer note under a divider (Help menu)
}

// Desktop-mode menus (desktop-APPROVED mock). Real routes where they exist;
// unbuilt destinations are marked "soon" or left inert.
const MENUS: DropMenu[] = [
  {
    label: 'Learn',
    items: [
      { label: 'Personal Finance', to: '/learn/phase/personal-finance' },
      { label: 'Investment', to: '/learn/phase/investment' },
    ],
  },
  {
    label: 'Docs',
    items: [
      { label: 'Glossary', to: '/glossary' },
      { label: 'Articles', soon: true },
      { label: 'Guides', soon: true },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'ETF Drag', to: '/visualizer/etf-drag' },
      { label: 'Wealth Simulator', to: '/visualizer/wealth-simulator' },
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
  'flex items-center justify-between gap-4 px-2.5 py-[7px] rounded-[4px] text-[12.5px] whitespace-nowrap text-body hover:bg-accent hover:text-white transition-colors';

// A hover-and-keyboard-open dropdown. The mock is hover-only; group-focus-within
// keeps it operable by keyboard (design.md §9), and items are real links.
function Dropdown({ menu }: { menu: DropMenu }) {
  return (
    <div className="relative group/menu">
      <button
        type="button"
        aria-haspopup="true"
        className="px-3 py-[7px] rounded-[5px] text-[13px] text-body group-hover/menu:bg-sage-tint group-hover/menu:text-ink group-focus-within/menu:bg-sage-tint group-focus-within/menu:text-ink transition-colors"
      >
        {menu.label}
      </button>
      <div className="os-dropdown absolute top-[calc(100%+3px)] left-0 min-w-[216px] p-[5px] rounded-[5px] z-[60] hidden group-hover/menu:block group-focus-within/menu:block">
        {menu.items.map((item) =>
          item.to ? (
            <Link key={item.label} to={item.to} className={rowCls}>
              {item.label}
            </Link>
          ) : (
            <span key={item.label} className={`${rowCls} cursor-default group/row`}>
              {item.label}
              {item.soon && <span className="text-[10px] text-faint group-hover/row:text-white/70">soon</span>}
            </span>
          )
        )}
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
 * The OS menu bar (desktop-APPROVED mock): beveled surface, logo + Puffx wordmark,
 * hover/keyboard dropdown menus on the desktop, and Search + Help icon buttons on
 * the right (no clock, no account — we're no-login). In an open app it swaps the
 * dropdowns for a "Desktop" way home plus the app's own menus (from useWindow).
 */
export default function MenuBar() {
  const { activeApp, closeToDesktop } = useApp();
  const { menu } = useWindow();

  return (
    <header className="os-menubar h-[42px] shrink-0 flex items-center gap-px px-2 text-body relative z-30">
      <Link to="/" aria-label="Puffx — desktop" className="flex items-center gap-[5px] pl-1.5 pr-4 mr-1 shrink-0 active:scale-95 transition duration-200">
        <img src="/icon/logo.png" alt="" className="w-6 h-6 rounded-[6px] object-contain block" />
        <b className="text-ink font-bold text-[14.5px] tracking-[-0.01em]">Puffx</b>
      </Link>

      {activeApp ? (
        <>
          <button type="button" onClick={closeToDesktop} className="px-3 py-[7px] rounded-[5px] text-[13px] text-body hover:bg-sage-tint hover:text-ink transition-colors">
            Desktop
          </button>
          {menu?.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className="px-3 py-[7px] rounded-[5px] text-[13px] text-body hover:bg-sage-tint hover:text-ink transition-colors">
                {item.label}
              </Link>
            ) : (
              <button key={item.label} type="button" onClick={item.onClick} className="px-3 py-[7px] rounded-[5px] text-[13px] text-body hover:bg-sage-tint hover:text-ink transition-colors">
                {item.label}
              </button>
            )
          )}
        </>
      ) : (
        MENUS.map((m) => <Dropdown key={m.label} menu={m} />)
      )}

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
