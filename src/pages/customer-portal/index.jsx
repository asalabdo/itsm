import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import TicketCreationCard from './components/TicketCreationCard';
import MyTicketsTable from './components/MyTicketsTable';
import KnowledgeBaseSection from './components/KnowledgeBaseSection';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';

const CustomerPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Active Tickets', value: '--', change: '', trend: 'up', icon: 'Ticket', color: 'var(--color-primary)', bgColor: 'bg-primary/10' },
    { label: 'Resolved This Month', value: '--', change: '', trend: 'up', icon: 'CheckCircle', color: 'var(--color-success)', bgColor: 'bg-success/10' },
    { label: 'Avg. Response Time', value: '--', change: '', trend: 'down', icon: 'Clock', color: 'var(--color-warning)', bgColor: 'bg-warning/10' },
    { label: 'Total Tickets', value: '--', change: '', trend: 'up', icon: 'Star', color: 'var(--color-accent)', bgColor: 'bg-accent/10' },
  ]);

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeBanner');
    if (hasSeenWelcome) setShowWelcomeBanner(false);

    import('../../services/api').then(({ dashboardAPI }) => {
      dashboardAPI.getSummary().then(res => {
        const s = res.data;
        if (s) setStats([
          { label: 'Active Tickets', value: String(s.openTickets ?? '--'), change: '', trend: 'up', icon: 'Ticket', color: 'var(--color-primary)', bgColor: 'bg-primary/10' },
          { label: 'Resolved This Month', value: String(s.resolvedTickets ?? '--'), change: '', trend: 'up', icon: 'CheckCircle', color: 'var(--color-success)', bgColor: 'bg-success/10' },
          { label: 'Avg. Response Time', value: s.averageResolutionTime != null ? `${Number(s.averageResolutionTime).toFixed(1)}h` : '--', change: '', trend: 'down', icon: 'Clock', color: 'var(--color-warning)', bgColor: 'bg-warning/10' },
          { label: 'Total Tickets', value: String(s.totalTickets ?? '--'), change: '', trend: 'up', icon: 'Star', color: 'var(--color-accent)', bgColor: 'bg-accent/10' },
        ]);
      }).catch(console.error);
    });
  }, []);

  const handleDismissWelcome = () => {
    setShowWelcomeBanner(false);
    sessionStorage.setItem('hasSeenWelcomeBanner', 'true');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'tickets', label: 'My Tickets', icon: 'Ticket' },
    { id: 'knowledge', label: 'Knowledge Base', icon: 'Book' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  return (
    <>
      <Helmet>
        <title>Employee Portal - SupportFlow Pro</title>
        <meta name="description" content="Manage your support tickets, access knowledge base, and track issue resolution in the SupportFlow Pro customer portal" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <BreadcrumbTrail />

        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          {showWelcomeBanner && (
            <div className="mb-6 md:mb-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 md:p-8 text-white shadow-elevation-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-2">
                    Welcome to Your Support Portal
                  </h1>
                  <p className="text-base md:text-lg opacity-90 mb-4">
                    Create tickets, track progress, and find solutions to common issues all in one place
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-white text-primary rounded-md font-medium hover:bg-white/90 transition-smooth">
                      Take a Tour
                    </button>
                    <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-md font-medium hover:bg-white/30 transition-smooth">
                      Watch Video Guide
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDismissWelcome}
                  className="flex-shrink-0 p-2 hover:bg-white/20 rounded-md transition-smooth"
                  aria-label="Dismiss welcome banner"
                >
                  <Icon name="X" size={24} color="#FFFFFF" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats?.map((stat) => (
              <div
                key={stat?.label}
                className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 hover:shadow-elevation-3 transition-smooth"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon name={stat?.icon} size={24} color={stat?.color} />
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      stat?.trend === 'up' ?'bg-success/10 text-success' :'bg-error/10 text-error'
                    }`}
                  >
                    {stat?.change}
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-foreground mb-1 data-text">
                  {stat?.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat?.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-lg shadow-elevation-2 mb-6 md:mb-8 overflow-hidden">
            <div className="border-b border-border overflow-x-auto">
              <div className="flex min-w-max">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-smooth ${
                      activeTab === tab?.id
                        ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <TicketCreationCard />
                <MyTicketsTable />
              </div>
              <div className="lg:col-span-1">
                <QuickActionsPanel />
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <MyTicketsTable />
              </div>
              <div className="lg:col-span-1">
                <QuickActionsPanel />
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeBaseSection />
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg shadow-elevation-2 p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
                    Account Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">Profile Information</h3>
                          <p className="text-sm text-muted-foreground">Update your personal details</p>
                        </div>
                        <Icon name="ChevronRight" size={20} color="var(--color-muted-foreground)" />
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">Security Settings</h3>
                          <p className="text-sm text-muted-foreground">Manage password and 2FA</p>
                        </div>
                        <Icon name="ChevronRight" size={20} color="var(--color-muted-foreground)" />
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">Communication Preferences</h3>
                          <p className="text-sm text-muted-foreground">Control how we contact you</p>
                        </div>
                        <Icon name="ChevronRight" size={20} color="var(--color-muted-foreground)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <QuickActionsPanel />
              </div>
            </div>
          )}
        </main>

        <footer className="bg-card border-t border-border mt-12 md:mt-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date()?.getFullYear()} SupportFlow Pro. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CustomerPortal;