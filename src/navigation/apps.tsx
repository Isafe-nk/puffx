import { BookOpen, LineChart, Wallet, Book, PieChart, type LucideIcon } from 'lucide-react';

// The Puffx OS app registry (design.md §1): each feature is an app with one
// fixed lucide icon used everywhere it's referenced. Desktop icons, the menu
// bar and AppWindow routing all derive from this list — it replaces navConfig.
export interface PuffxApp {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Route prefix that opens this app's window. */
  path: string;
  /** Icon-tile tint (Dragon-earth family) — gives each app its own identity. */
  tint: string;
  /** Small status line under the desktop icon; mono when numeric. */
  sub?: string;
  subMono?: boolean;
  comingSoon?: boolean;
}

export const APPS: PuffxApp[] = [
  { id: 'learn', name: 'Learn', icon: BookOpen, path: '/learn', tint: '#3E7355' },
  { id: 'etf-drag', name: 'ETF Drag', icon: LineChart, path: '/visualizer/etf-drag', tint: '#4E7A96', sub: 'Visualizer' },
  { id: 'wealth-simulator', name: 'Wealth Simulator', icon: Wallet, path: '/visualizer/wealth-simulator', tint: '#C2673F', sub: 'Visualizer' },
  { id: 'glossary', name: 'Glossary', icon: Book, path: '/glossary', tint: '#7E5A73', sub: '40 terms', subMono: true },
  { id: 'portfolio', name: 'Portfolio Tracker', icon: PieChart, path: '/portfolio', tint: '#D99A2B', sub: 'Coming soon', comingSoon: true },
];

/** The app whose window a pathname belongs to (longest prefix wins). */
export function matchApp(pathname: string): PuffxApp | undefined {
  return APPS
    .filter((a) => !a.comingSoon)
    .filter((a) => pathname === a.path || pathname.startsWith(a.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
}
