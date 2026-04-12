import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import TicketCreationCard from './components/TicketCreationCard';
import MyTicketsTable from './components/MyTicketsTable';
import KnowledgeBaseSection from './components/KnowledgeBaseSection';
import QuickActionsPanel from './components/QuickActionsPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { ticketsAPI, settingsAPI } from '../../services/api';

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Active Tickets', value: '--', change: '', trend: 'up', icon: 'Ticket', color: 'var(--color-primary)', bgColor: 'bg-primary/10' },
    { label: 'Resolved This Month', value: '--', change: '', trend: 'up', icon: 'CheckCircle', color: 'var(--color-success)', bgColor: 'bg-success/10' },
    { label: 'Avg. Response Time', value: '--', change: '', trend: 'down', icon: 'Clock', color: 'var(--color-warning)', bgColor: 'bg-warning/10' },
    { label: 'Total Tickets', value: '--', change: '', trend: 'up', icon: 'Star', color: 'var(--color-accent)', bgColor: 'bg-accent/10' },
  ]);
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsProfile, setSettingsProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeBanner');
    if (hasSeenWelcome) setShowWelcomeBanner(false);

    const loadCustomerTickets = async () => {
      try {
        setLoading(true);
        const ticketsRes = await ticketsAPI.getAll();
        const rawTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        setAllTickets(rawTickets);

        try {
          const settingsRes = await settingsAPI.getProfile();
          setSettingsProfile(settingsRes?.data || null);
        } catch (settingsError) {
          console.error('Failed to load settings profile:', settingsError);
          setSettingsProfile({
            displayName: currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Portal User',
            role: currentUser?.role || 'Employee Portal',
            defaultLandingPage: '/it-operations-command-center',
            emailNotifications: true,
            pushNotifications: true
          });
        }

        const currentUserId = Number(currentUser?.id);
        const matchesCurrentUser = (ticket) => {
          if (!currentUserId) return true;
          const candidateIds = [
            ticket?.requestedById,
            ticket?.assignedToId,
            ticket?.requestedBy?.id,
            ticket?.assignedTo?.id,
            ticket?.requestedBy?.userId,
            ticket?.assignedTo?.userId,
            ticket?.ownerId,
            ticket?.createdById,
          ].map((value) => Number(value)).filter((value) => !Number.isNaN(value) && value > 0);
          return candidateIds.includes(currentUserId);
        };

        const matchedTickets = currentUserId ? rawTickets.filter(matchesCurrentUser) : rawTickets;
        const userTickets = matchedTickets.length > 0 ? matchedTickets : rawTickets.slice(0, 8);

        setTickets(userTickets);

        const activeTickets = userTickets.filter((ticket) => !['Resolved', 'Closed'].includes(ticket.status));
        const resolvedThisMonth = userTickets.filter((ticket) => {
          if (!ticket?.resolvedAt) return false;
          const resolvedAt = new Date(ticket.resolvedAt);
          const now = new Date();
          return resolvedAt.getMonth() === now.getMonth() && resolvedAt.getFullYear() === now.getFullYear();
        }).length;
        const averageResponseHours = userTickets.length
          ? (userTickets.reduce((sum, ticket) => {
              const createdAt = ticket?.createdAt ? new Date(ticket.createdAt) : null;
              const updatedAt = ticket?.updatedAt ? new Date(ticket.updatedAt) : null;
              if (!createdAt || !updatedAt) return sum;
              return sum + Math.max(0, (updatedAt - createdAt) / 36e5);
            }, 0) / userTickets.length).toFixed(1)
          : '--';

        setStats([
          { label: 'Active Tickets', value: String(activeTickets.length), change: '', trend: 'up', icon: 'Ticket', color: 'var(--color-primary)', bgColor: 'bg-primary/10' },
          { label: 'Resolved This Month', value: String(resolvedThisMonth), change: '', trend: 'up', icon: 'CheckCircle', color: 'var(--color-success)', bgColor: 'bg-success/10' },
          { label: 'Avg. Response Time', value: averageResponseHours === '--' ? '--' : `${averageResponseHours}h`, change: '', trend: 'down', icon: 'Clock', color: 'var(--color-warning)', bgColor: 'bg-warning/10' },
          { label: 'Total Tickets', value: String(userTickets.length), change: '', trend: 'up', icon: 'Star', color: 'var(--color-accent)', bgColor: 'bg-accent/10' },
        ]);
      } catch (error) {
        console.error('Failed to load customer portal data:', error);
        setAllTickets([]);
        setTickets([]);
        setSettingsProfile({
          displayName: currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Portal User',
          role: currentUser?.role || 'Employee Portal',
          defaultLandingPage: '/it-operations-command-center',
          emailNotifications: true,
          pushNotifications: true
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomerTickets();
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

  const settingsCards = [
    {
      title: 'Profile Information',
      description: 'Update your personal details',
      icon: 'User',
      meta: settingsProfile?.displayName || currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Portal User',
    },
    {
      title: 'Security Settings',
      description: 'Manage password and 2FA',
      icon: 'Shield',
      meta: settingsProfile?.defaultLandingPage || '/it-operations-command-center',
    },
    {
      title: 'Communication Preferences',
      description: 'Control how we contact you',
      icon: 'Bell',
      meta: `Email ${settingsProfile?.emailNotifications === false ? 'Off' : 'On'} · Push ${settingsProfile?.pushNotifications === false ? 'Off' : 'On'}`,
    },
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
                    <button onClick={() => navigate('/knowledge-base')} className="px-4 py-2 bg-white text-primary rounded-md font-medium hover:bg-white/90 transition-smooth">
                      Take a Tour
                    </button>
                    <button onClick={() => navigate('/ticket-chatbot')} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-md font-medium hover:bg-white/30 transition-smooth">
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
                <MyTicketsTable tickets={tickets} loading={loading} />
              </div>
              <div className="lg:col-span-1">
                <QuickActionsPanel tickets={tickets} />
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <MyTicketsTable tickets={tickets} loading={loading} />
              </div>
              <div className="lg:col-span-1">
                <QuickActionsPanel tickets={tickets} />
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
                  <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Signed in as</p>
                        <p className="font-semibold text-foreground">
                          {settingsProfile?.displayName || currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Portal User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {settingsProfile?.role || currentUser?.role || 'Employee Portal'}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => navigate('/settings')}>
                        Open Full Settings
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {settingsCards.map((card) => (
                      <button key={card.title} type="button" onClick={() => navigate('/settings')} className="w-full text-left p-4 bg-muted/50 rounded-lg border border-border hover:border-primary hover:bg-muted transition-smooth">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Icon name={card.icon} size={16} className="text-primary" />
                              <h3 className="font-medium text-foreground">{card.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">{card.meta}</p>
                          </div>
                          <Icon name="ChevronRight" size={20} color="var(--color-muted-foreground)" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <QuickActionsPanel tickets={tickets} />
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
                <button type="button" onClick={() => navigate('/settings')} className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy Policy
                </button>
                <button type="button" onClick={() => navigate('/knowledge-base')} className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Terms of Service
                </button>
                <button type="button" onClick={() => navigate('/ticket-chatbot')} className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CustomerPortal;
