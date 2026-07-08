import React, { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import SideNav from '../navigation/SideNav';
import PageLoader from '../shared/components/PageLoader';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#212121] font-sans antialiased overflow-x-clip flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-[#212121] focus:text-xs focus:font-semibold focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-[#E6E6E6] focus:shadow-lg"
      >
        Skip to main content
      </a>
      <SideNav />
      {/* pt-14 clears the fixed mobile header; none needed once the rail is visible */}
      <main id="main" className="flex-1 lg:ml-72 flex flex-col min-h-screen pt-14 lg:pt-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollRestoration />
    </div>
  );
}
