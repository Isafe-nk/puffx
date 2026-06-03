import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from '../navigation/SideNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white text-[#212121] font-sans antialiased overflow-x-clip flex">
      <SideNav />
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
