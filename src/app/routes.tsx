import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './Layout';
import VisualizerLayout from '../features/visualizer/VisualizerLayout';
import EtfDragVisualizer from '../features/visualizer/etf-drag/index';
import WealthSimulator from '../features/visualizer/wealth-simulator/index';
import Learn from '../features/learn/index';
import LearnModule from '../features/learn/LearnModule';
import Glossary from '../features/glossary/index';

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
            element: <Navigate to="/visualizer/etf-drag" replace />
          },
          {
            path: 'etf-drag',
            element: <EtfDragVisualizer />
          },
          {
            path: 'wealth-simulator',
            element: <WealthSimulator />
          }
        ]
      },
      {
        path: 'learn',
        element: <Learn />
      },
      {
        path: 'learn/:moduleSlug',
        element: <LearnModule />
      },
      {
        path: 'glossary',
        element: <Glossary />
      }
    ]
  }
]);
