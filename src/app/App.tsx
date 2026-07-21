import React from 'react';
import Layout from './Layout';

// No top-level router: the shell navigates through the window store (openApp),
// and each open window hosts its app in its own MemoryRouter (see AppWindow).
// A root <RouterProvider> here would collide with those ("cannot render a
// <Router> inside another <Router>").
export default function App() {
  return <Layout />;
}
