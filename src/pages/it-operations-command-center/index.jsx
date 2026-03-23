import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import GlobalControls from './components/GlobalControls';
import CriticalAlerts from './components/CriticalAlerts';
import TicketVolumeMetrics from './components/TicketVolumeMetrics';
import IncidentAgingHeatmap from './components/IncidentAgingHeatmap';
import TechnicianWorkload from './components/TechnicianWorkload';
import SLAComplianceGauges from './components/SLAComplianceGauges';

const ITOperationsCommandCenter = () => {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [selectedService, setSelectedService] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');

  useEffect(() => {
    let refreshInterval;
    
    if (isAutoRefresh) {
      refreshInterval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate occasional connection issues
        if (Math.random() < 0.05) {
          setConnectionStatus('warning');
          setTimeout(() => setConnectionStatus('connected'), 3000);
        }
      }, 30000); // 30 second refresh
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAutoRefresh]);

  const handleServiceFilterChange = (service) => {
    setSelectedService(service);
    setLastUpdated(new Date());
  };

  const handleRefreshToggle = () => {
    setIsAutoRefresh(!isAutoRefresh);
    if (!isAutoRefresh) {
      setLastUpdated(new Date());
    }
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
        <title>IT Operations Command Center - ITSM Hub</title>
        <meta name="description" content="Real-time IT service monitoring dashboard providing comprehensive visibility into incident response, SLA compliance, and technician workload management." />
        <meta name="keywords" content="IT operations, incident management, SLA monitoring, technician workload, real-time dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Main Content */}
        <main className="pt-16">
          {/* Global Controls */}
          <GlobalControls 
            onServiceFilterChange={handleServiceFilterChange}
            onRefreshToggle={handleRefreshToggle}
            isAutoRefresh={isAutoRefresh}
          />

          {/* Critical Alerts Strip */}
          <CriticalAlerts />

          {/* Status Bar */}
          <div className="bg-muted/50 border-b border-border px-6 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  Service Filter: <span className="font-medium text-foreground capitalize">{selectedService}</span>
                </span>
                <span className="text-muted-foreground">
                  Last Updated: <span className="font-medium text-foreground">{formatLastUpdated(lastUpdated)}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-success animate-pulse' : 
                  connectionStatus === 'warning' ? 'bg-warning animate-pulse' : 'bg-error'
                }`}></div>
                <span className="text-muted-foreground capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-24 gap-6 h-full">
              {/* Left Panel - Ticket Volume Metrics (8 cols) */}
              <div className="xl:col-span-8">
                <TicketVolumeMetrics />
              </div>

              {/* Center Panel - Incident Aging Heatmap (10 cols) */}
              <div className="xl:col-span-10">
                <IncidentAgingHeatmap />
              </div>

              {/* Right Panel - Technician Workload (6 cols) */}
              <div className="xl:col-span-6">
                <TechnicianWorkload />
              </div>
            </div>

            {/* Bottom Row - SLA Compliance Gauges */}
            <div className="mt-6">
              <SLAComplianceGauges />
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="bg-card border-t border-border p-4 mt-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <span className="text-sm font-medium">Create Incident</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                <span className="text-sm font-medium">Escalate to Manager</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                <span className="text-sm font-medium">Generate Report</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                <span className="text-sm font-medium">Export Data</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ITOperationsCommandCenter;