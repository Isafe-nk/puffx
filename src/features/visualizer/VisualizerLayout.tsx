import { Outlet } from 'react-router-dom';

// Tool switching now lives in the left SideNav (ETF Drag / Wealth Simulator as
// sub-items under Visualizer), so there is no top switcher bar — each tool owns
// its full header. The Hub (index) renders its own card selection.
export default function VisualizerLayout() {
  return (
    <div className="w-full flex-1 flex flex-col">
      <Outlet />
    </div>
  );
}
