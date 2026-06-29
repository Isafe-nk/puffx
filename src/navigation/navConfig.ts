import { TrendingUp, Building, BarChart, Globe, Settings } from 'lucide-react';

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
  { label: "Portfolio", icon: Building, path: "/portfolio", comingSoon: true },
  { label: "Analysis", icon: BarChart, path: "/analysis", comingSoon: true },
  { label: "Market", icon: Globe, path: "/market", comingSoon: true },
  { label: "Settings", icon: Settings, path: "/settings", comingSoon: true }
];
