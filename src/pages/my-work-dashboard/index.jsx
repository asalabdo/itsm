import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import PriorityBanner from './components/PriorityBanner';
import ActiveTicketsCard from './components/ActiveTicketsCard';
import InProgressWorkCard from './components/InProgressWorkCard';
import CompletedTodayCard from './components/CompletedTodayCard';
import PersonalPerformanceCard from './components/PersonalPerformanceCard';
import QuickActionsPanel from './components/QuickActionsPanel';

import { ticketsAPI, usersAPI } from '../../services/api';

const MyWorkDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    name: 'Sarah Support',
    role: 'IT Support Agent',
    id: 3, // Assuming agent2 from seed
    shift: 'Day Shift',
    skillset: ['Support', 'Customer Service', 'Troubleshooting']
  });

  const fetchWorkData = async () => {
    try {
      setLoading(true);
      // For demo, we use user ID 3 (agent2)
      const res = await ticketsAPI.getByAssignee(3);
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

    return () => clearInterval(interval);
  }, []);

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
        <title>My Work Dashboard - Personal Task Management</title>
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
                  {currentUser?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{currentUser?.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentUser?.role} • {currentUser?.id}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-success/10 text-success rounded-full">
                      {currentUser?.shift}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Skills: {currentUser?.skillset?.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-muted-foreground">
                  Last Updated: <span className="font-medium text-foreground">{formatLastUpdated(lastUpdated)}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-muted/50 border-b border-border px-6 py-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-foreground">Filter by:</span>
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
                    {filter}
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
                <ActiveTicketsCard tickets={tickets.filter(t => t.status === 'Open')} filter={selectedFilter} loading={loading} />
              </div>

              {/* In Progress Work */}
              <div className="lg:col-span-4">
                <InProgressWorkCard tickets={tickets.filter(t => t.status === 'In Progress')} filter={selectedFilter} loading={loading} />
              </div>

              {/* Completed Today */}
              <div className="lg:col-span-4">
                <CompletedTodayCard tickets={tickets.filter(t => t.status === 'Resolved')} loading={loading} />
              </div>
            </div>

            {/* Performance Dashboard */}
            <div className="mt-6">
              <PersonalPerformanceCard />
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