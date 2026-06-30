import { TrendingUp, GraduationCap, Building, BarChart, Globe, Settings } from 'lucide-react';
import { LEARN_MODULES } from '../features/learn/learnConfig';

export const navConfig = [
  {
    label: "Visualizer",
    icon: TrendingUp,
    path: "/visualizer",
    children: [
      { label: "ETF Drag", path: "/visualizer/etf-drag" },
      { label: "Wealth Simulator", path: "/visualizer/wealth-simulator" }
    ]
  },
  {
    label: "Learn",
    icon: GraduationCap,
    path: "/learn",
    children: LEARN_MODULES.map((m) => ({ label: `${m.code} · ${m.title}`, path: `/learn/${m.slug}` }))
  },
  { label: "Portfolio", icon: Building, path: "/portfolio", comingSoon: true },
  { label: "Analysis", icon: BarChart, path: "/analysis", comingSoon: true },
  { label: "Market", icon: Globe, path: "/market", comingSoon: true },
  { label: "Settings", icon: Settings, path: "/settings", comingSoon: true }
];
