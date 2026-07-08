import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './Layout';
import VisualizerLayout from '../features/visualizer/VisualizerLayout';

// Route groups are lazy so the first paint doesn't pull recharts + motion
// (visualizers) or react-markdown + course content (learn) into the main chunk.
const VisualizerHub = lazy(() => import('../features/visualizer/VisualizerHub'));
const EtfDragVisualizer = lazy(() => import('../features/visualizer/etf-drag/index'));
const WealthSimulator = lazy(() => import('../features/visualizer/wealth-simulator/index'));
const Learn = lazy(() => import('../features/learn/index'));
const LearnPhase = lazy(() => import('../features/learn/LearnPhase'));
const LearnModule = lazy(() => import('../features/learn/LearnModule'));
const LessonView = lazy(() => import('../features/learn/LessonView'));
const Glossary = lazy(() => import('../features/glossary/index'));

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
            element: <WealthSimulator />
          }
        ]
      },
      {
        path: 'learn',
        element: <Learn />
      },
      {
        path: 'glossary',
        element: <Glossary />
      },
      {
        path: 'learn/phase/:phaseSlug',
        element: <LearnPhase />
      },
      {
        path: 'learn/:moduleSlug',
        element: <LearnModule />
      },
      {
        path: 'learn/:moduleSlug/:lessonSlug',
        element: <LessonView />
      }
    ]
  }
]);
