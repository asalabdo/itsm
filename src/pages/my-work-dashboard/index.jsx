import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import PriorityBanner from './components/PriorityBanner';
import ActiveTicketsCard from './components/ActiveTicketsCard';
import InProgressWorkCard from './components/InProgressWorkCard';
import CompletedTodayCard from './components/CompletedTodayCard';
import PersonalPerformanceCard from './components/PersonalPerformanceCard';
import QuickActionsPanel from './components/QuickActionsPanel';

import { ticketsAPI, usersAPI } from '../../services/api';

const MyWorkDashboard = () => {
  const { language } = useLanguage();
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
      const status = String(ticket?.status || '').toLowerCase();
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

  const fetchWorkData = async () => {
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
  };

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
  }, [currentUser?.id]);

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
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          {/* Priority Banner */}
          <PriorityBanner tickets={tickets} />

          {/* User Info & Status Bar */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  {[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() || currentUser?.name || currentUser?.fullName || currentUser?.username || 'Current User'}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() || currentUser?.name || currentUser?.fullName || currentUser?.username || 'Current User'}</h2>
                  <p className="text-sm text-muted-foreground">{currentUser?.role} • ID: {currentUser?.id}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-success/10 text-success rounded-full">
                      {currentUser?.shift}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Array.isArray(currentUser?.skillset) && currentUser.skillset.filter(Boolean).length > 0
                        ? `Skills: ${currentUser.skillset.filter(Boolean).join(', ')}`
                        : null}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-muted-foreground">
                  {t('lastUpdated', 'Last Updated')}: <span className="font-medium text-foreground">{formatLastUpdated(lastUpdated)}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-muted-foreground">{t('online', 'Online')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-muted/50 border-b border-border px-6 py-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-foreground">{t('filterBy', 'Filter by')}:</span>
              <div className="flex space-x-2">
                {['all', 'urgent', 'overdue', 'assigned']?.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                      selectedFilter === filter
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {t(`${filter}Filter`, filter)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Workspace Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Active Tickets */}
              <div className="lg:col-span-4">
                <ActiveTicketsCard tickets={visibleTickets.filter(t => String(t.status).toLowerCase() === 'open')} filter={selectedFilter} loading={loading} />
              </div>

              {/* In Progress Work */}
              <div className="lg:col-span-4">
                <InProgressWorkCard tickets={visibleTickets.filter(t => String(t.status).toLowerCase() === 'in progress')} filter={selectedFilter} loading={loading} />
              </div>

              {/* Completed Today */}
              <div className="lg:col-span-4">
                <CompletedTodayCard tickets={visibleTickets.filter(t => String(t.status).toLowerCase() === 'resolved')} loading={loading} />
              </div>
            </div>

            {/* Performance Dashboard */}
            <div className="mt-6">
              <PersonalPerformanceCard tickets={visibleTickets} />
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
