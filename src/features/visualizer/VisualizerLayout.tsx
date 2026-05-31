import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import VisualizerNav from './VisualizerNav';

export default function VisualizerLayout() {
  const location = useLocation();
  const isHub = location.pathname === '/visualizer' || location.pathname === '/visualizer/';

  return (
    <div className="w-full flex-1 flex flex-col">
      {!isHub && <VisualizerNav />}
      <Outlet />
    </div>
  );
}
