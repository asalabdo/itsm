import { useCallback, useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import Icon from '../../components/AppIcon';
import PriorityBanner from './components/PriorityBanner';
import ActiveTicketsCard from './components/ActiveTicketsCard';
import InProgressWorkCard from './components/InProgressWorkCard';
import CompletedTodayCard from './components/CompletedTodayCard';
import PersonalPerformanceCard from './components/PersonalPerformanceCard';
import QuickActionsPanel from './components/QuickActionsPanel';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';

import { ticketsAPI, usersAPI } from '../../services/api';

const MyWorkDashboard = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : { firstName: 'User', lastName: '', role: 'Agent', id: null };
  });

  const visibleTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (selectedFilter === 'urgent') {
        return ['critical', 'high'].includes(String(ticket?.priority || '').toLowerCase());
      }
      if (selectedFilter === 'overdue') {
        return ticket?.dueDate ? new Date(ticket.dueDate) < new Date() : false;
      }
      if (selectedFilter === 'assigned') {
        return Boolean(ticket?.assignedToId);
      }
      return true;
    });
  }, [tickets, selectedFilter]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser?.id) return;
      try {
        const res = await usersAPI.getById(currentUser.id);
        if (res?.data) {
          setCurrentUser((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to load current user profile:', err);
      }
    };

    loadUserProfile();
  }, [currentUser?.id]);

  const fetchWorkData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = currentUser?.id;
      if (!userId) return;
      const res = await ticketsAPI.getByAssignee(userId);
      setTickets(res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch user work data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchWorkData();
    const interval = setInterval(() => {
      fetchWorkData();
    }, 60000); // refresh every minute

    const handleRefresh = () => {
      fetchWorkData();
    };
    window.addEventListener('itsm:refresh', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('itsm:refresh', handleRefresh);
    };
  }, [currentUser?.id, fetchWorkData]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const formatLastUpdated = (date) => {
    return date?.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('myWorkDashboard', 'My Work Dashboard')} - {t('personalTaskManagement', 'Personal Task Management')}</title>
        <meta name="description" content="Personalized task management interface for individual technicians and service desk agents to efficiently manage their assigned workload and track performance metrics." />
        <meta name="keywords" content="personal dashboard, task management, ticket assignment, SLA tracking, technician workspace" />
      </Helmet>
      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        
        <main className="pt-16">
          {/* Priority Banner */}
          <PriorityBanner tickets={tickets} />

          {/* User Info & Status Bar */}
          <div className="bg-gradient-to-r from-card via-card to-muted/20 border-b border-border px-6 py-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-primary/10">
                  {(() => {
                    const name = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() || currentUser?.name || currentUser?.fullName || currentUser?.username || 'U';
                    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() || currentUser?.name || currentUser?.fullName || currentUser?.username || 'Current User'}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{currentUser?.role} • ID: {currentUser?.id}</p>
                  <div className={`flex items-center mt-2 ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full border border-success/20">
                      {currentUser?.shift || 'Day Shift'}
                    </span>
                    {Array.isArray(currentUser?.skillset) && currentUser.skillset.filter(Boolean).length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {t('skills', 'Skills')}: {currentUser.skillset.filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`flex flex-col items-end ${isRtl ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <div className={`flex items-center text-sm ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'} bg-muted/50 px-4 py-2 rounded-lg`}>
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="font-medium text-success">{t('online', 'Online')}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-2">
                  {t('lastUpdated', 'Last Updated')}: <span className="font-medium text-foreground">{formatLastUpdated(lastUpdated)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-muted/30 border-b border-border px-6 py-4">
            <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="Filter" size={16} />
                {t('filterBy', 'Filter by')}:
              </span>
              <div className={`flex ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                {['all', 'urgent', 'overdue', 'assigned']?.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                      selectedFilter === filter
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                    }`}
                  >
                    {t(`${filter}Filter`, filter)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Workspace Grid */}
          <div className="p-6 bg-gradient-to-b from-background to-muted/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Active Tickets */}
              <div className="lg:col-span-4 transform transition-all hover:scale-[1.02]">
                <ActiveTicketsCard tickets={visibleTickets.filter(t => String(t.status).toLowerCase() === 'open')} filter={selectedFilter} loading={loading} />
              </div>

              {/* In Progress Work */}
              <div className="lg:col-span-4 transform transition-all hover:scale-[1.02]">
                <InProgressWorkCard tickets={visibleTickets.filter(t => String(t.status).toLowerCase() === 'in progress')} filter={selectedFilter} loading={loading} />
              </div>

              {/* Completed Today */}
              <div className="lg:col-span-4 transform transition-all hover:scale-[1.02]">
                <CompletedTodayCard tickets={visibleTickets.filter(t => String(t.status).toLowerCase() === 'resolved')} loading={loading} />
              </div>
            </div>

            {/* Performance Dashboard */}
            <div className="mt-8">
              <PersonalPerformanceCard tickets={visibleTickets} />
            </div>

            <div className="mt-8">
              <ManageEngineOnPremSnapshot
                compact
                title={t('manageEngineMyWorkContext', 'ManageEngine My Work Context')}
                description={t('manageEngineMyWorkContextDesc', 'ServiceDesk requests plus OpManager 12.8.270 services and alerts that can influence your assigned work today.')}
              />
            </div>
          </div>

          {/* Quick Actions Panel */}
          <QuickActionsPanel />
        </main>
      </div>
    </>
  );
};

export default MyWorkDashboard;
