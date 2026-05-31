import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './Layout';
import VisualizerLayout from '../features/visualizer/VisualizerLayout';
import VisualizerHub from '../features/visualizer/VisualizerHub';
import EtfDragVisualizer from '../features/visualizer/etf-drag/index';

const WealthSimulatorPlaceholder = () => <div className="p-8">Wealth Simulator Component (Coming Soon in Phase 4)</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/visualizer" replace />
      },
      {
        path: 'visualizer',
        element: <VisualizerLayout />,
        children: [
          {
            index: true,
            element: <VisualizerHub />
          },
          {
            path: 'etf-drag',
            element: <EtfDragVisualizer />
          },
          {
            path: 'wealth-simulator',
            element: <WealthSimulatorPlaceholder />
          }
        ]
      }
    ]
  }
]);
