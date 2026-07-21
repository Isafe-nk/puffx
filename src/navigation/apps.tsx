import { BookOpen, LineChart, Wallet, Book, type LucideIcon } from 'lucide-react';

// The Puffx OS app registry (design.md §1): each feature is an app with one
// fixed lucide icon used everywhere it's referenced. Desktop icons, the menu
// bar and AppWindow routing all derive from this list — it replaces navConfig.
export interface PuffxApp {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Route prefix that opens this app's window. */
  path: string;
  /** Icon-tile tint (Dragon-earth family) — the gradient-glyph fallback when no PNG. */
  tint: string;
  /** Real app-icon artwork (served from /public). When set, AppIcon renders the
   *  bare <img> — no tile bg/border/shadow/rounding. */
  iconImg?: string;
  /** Small status line under the desktop icon; mono when numeric. */
  sub?: string;
  subMono?: boolean;
  comingSoon?: boolean;
  /** Opening size as a fraction of the viewport (0–1): w of window width, h of
   *  desk height. Wide/landscape; clamped to [20%,90%] by the window store (§4). */
  defaultSize?: { w: number; h: number };
  /** Resize floor in px (default 340×240). */
  minSize?: { w: number; h: number };
}

const MIN = { w: 340, h: 240 };

export const APPS: PuffxApp[] = [
  { id: 'learn', name: 'Learning Hub', icon: BookOpen, path: '/learn', tint: '#3E7355', iconImg: '/icon/learn.png', defaultSize: { w: 0.86, h: 0.84 }, minSize: MIN },
  { id: 'etf-drag', name: 'ETF Drag', icon: LineChart, path: '/visualizer/etf-drag', tint: '#4E7A96', iconImg: '/icon/etf.png', sub: 'Visualizer', defaultSize: { w: 0.64, h: 0.80 }, minSize: MIN },
  { id: 'wealth-simulator', name: 'Wealth Simulator', icon: Wallet, path: '/visualizer/wealth-simulator', tint: '#C2673F', iconImg: '/icon/wealth_sim.png', sub: 'Visualizer', defaultSize: { w: 0.64, h: 0.80 }, minSize: MIN },
  { id: 'glossary', name: 'Glossary', icon: Book, path: '/glossary', tint: '#7E5A73', iconImg: '/icon/Glossary.png', sub: '40 terms', subMono: true, defaultSize: { w: 0.64, h: 0.80 }, minSize: MIN },
];

/** The app whose window a pathname belongs to (longest prefix wins). */
export function matchApp(pathname: string): PuffxApp | undefined {
  return APPS
    .filter((a) => !a.comingSoon)
    .filter((a) => pathname === a.path || pathname.startsWith(a.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
}
