import React, { useState } from 'react';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className={`pt-16 flex ${sidebarOpen ? '' : ''}`}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 max-w-full">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
