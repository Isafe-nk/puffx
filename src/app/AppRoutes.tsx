import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '../shared/components/PageLoader';

// App route tree rendered INSIDE each window's own MemoryRouter (spec §5/§8).
// A window shows exactly one app; its MemoryRouter is seeded with the window's
// path, so in-window navigation (lesson→lesson, phase→module) stays local to
// that window and never touches the address bar. Lazy so recharts/motion/
// react-markdown load only when their window opens.
const EtfDragVisualizer = lazy(() => import('../features/visualizer/etf-drag/index'));
const WealthSimulator = lazy(() => import('../features/visualizer/wealth-simulator/index'));
const Learn = lazy(() => import('../features/learn/index'));
const LearnPhase = lazy(() => import('../features/learn/LearnPhase'));
const LessonView = lazy(() => import('../features/learn/LessonView'));
const Glossary = lazy(() => import('../features/glossary/index'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/visualizer/etf-drag" element={<EtfDragVisualizer />} />
        <Route path="/visualizer/wealth-simulator" element={<WealthSimulator />} />
        <Route path="/visualizer" element={<Navigate to="/visualizer/etf-drag" replace />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/phase/:phaseSlug" element={<LearnPhase />} />
        <Route path="/learn/:moduleSlug/:lessonSlug" element={<LessonView />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </Suspense>
  );
}
