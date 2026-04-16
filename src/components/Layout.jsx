import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';
import { useLanguage } from '../context/LanguageContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const { pathname } = useLocation();
  const { isRtl } = useLanguage();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const handleToast = (event) => {
      const detail = event?.detail || {};
      if (!detail?.message) return;
      setToast({
        type: detail.type || 'success',
        message: detail.message,
      });
    };

    window.addEventListener('itsm:toast', handleToast);
    return () => window.removeEventListener('itsm:toast', handleToast);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (isLoginPage) {
    return <main className="min-h-screen bg-background text-foreground">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="pt-16 flex min-h-screen items-start" dir={isRtl ? 'rtl' : 'ltr'}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 min-w-0 p-6 max-w-full overflow-x-hidden">{children}</main>
      </div>
      {toast && (
        <div className={`fixed top-20 z-[2000] max-w-sm rounded-xl border border-border bg-popover px-4 py-3 shadow-xl ${isRtl ? 'left-4' : 'right-4'}`}>
          <p className={`text-sm font-medium ${toast.type === 'error' ? 'text-destructive' : toast.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Layout;
