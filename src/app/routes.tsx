import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';

// Multi-window shell: the browser router only mounts the OS shell. What's "open"
// lives in the window store (OSProvider), and each window renders its app in its
// own MemoryRouter. Deep links are read once on boot by the store (spec §8), so a
// single catch-all route is all the top level needs.
export const router = createBrowserRouter([
  {
    path: '*',
    element: <Layout />,
  },
]);
