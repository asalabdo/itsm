import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { pathname } = useLocation();

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className={`pt-16 flex ${sidebarOpen ? '' : ''}`}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 max-w-full overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
