import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';
import ToastContainer from './ToastContainer';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed, w-64 */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — pushed right by margin on desktop */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky navbar — stays in document flow, no offset hack needed */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content — takes full remaining width naturally */}
        <main className="flex-1">
          <Breadcrumb />
          <div className="px-4 sm:px-6 py-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
}

