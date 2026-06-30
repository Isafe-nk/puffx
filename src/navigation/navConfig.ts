import { TrendingUp, GraduationCap, Building, BarChart, Globe, Settings } from 'lucide-react';
import { PHASES } from '../features/learn/learnConfig';

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
    children: [
      {
        label: "FFM",
        path: "/learn",
        children: PHASES.map((p) => ({ label: `Phase ${p.num} · ${p.name}`, path: `/learn/phase/${p.slug}` }))
      },
      { label: "Glossary", path: "/glossary" }
    ]
  },
  { label: "Portfolio", icon: Building, path: "/portfolio", comingSoon: true },
  { label: "Analysis", icon: BarChart, path: "/analysis", comingSoon: true },
  { label: "Market", icon: Globe, path: "/market", comingSoon: true },
  { label: "Settings", icon: Settings, path: "/settings", comingSoon: true }
];
