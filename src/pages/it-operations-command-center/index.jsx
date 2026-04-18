import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import GlobalControls from './components/GlobalControls';
import CriticalAlerts from './components/CriticalAlerts';
import TicketVolumeMetrics from './components/TicketVolumeMetrics';
import IncidentAgingHeatmap from './components/IncidentAgingHeatmap';
import TechnicianWorkload from './components/TechnicianWorkload';
import SLAComplianceGauges from './components/SLAComplianceGauges';
import ManageEngineOperationsPanel from './components/ManageEngineOperationsPanel';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const ITOperationsCommandCenter = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
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

  useEffect(() => {
    const handleRefresh = () => {
      setLastUpdated(new Date());
      setConnectionStatus('connected');
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, []);

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
        <title>{t('itOperationsCommandCenter', 'IT Operations Command Center')} - ITSM Hub</title>
        <meta name="description" content={t('itOperationsDescription', 'Real-time IT services monitoring dashboard providing comprehensive visibility for incident response, SLA compliance, and workload management.')} />
        <meta name="keywords" content="IT operations, incident management, SLA monitoring, workload, real-time dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <BreadcrumbTrail />
        
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
                  {t('serviceFilter', 'Service Filter')}: <span className="font-medium text-foreground capitalize">{selectedService}</span>
                </span>
                <span className="text-muted-foreground">
                  {t('lastUpdated', 'Last Updated')}: <span className="font-medium text-foreground">{formatLastUpdated(lastUpdated)}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-success animate-pulse' : 
                  connectionStatus === 'warning' ? 'bg-warning animate-pulse' : 'bg-error'
                }`}></div>
              <span className="text-muted-foreground capitalize">{t(connectionStatus, connectionStatus)}</span>
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

            <div className="mt-6">
              <ManageEngineOperationsPanel />
            </div>

            {/* Bottom Row - SLA Compliance Gauges */}
            <div className="mt-6">
              <SLAComplianceGauges />
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="bg-card border-t border-border p-4 mt-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => navigate('/incident-management-workflow')} className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <span className="text-sm font-medium">{t('createIncident', 'Create Incident')}</span>
              </button>
              
              <button onClick={() => navigate('/manager-dashboard')} className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                <span className="text-sm font-medium">{t('escalateToManager', 'Escalate to Manager')}</span>
              </button>
              
              <button onClick={() => navigate('/reports-analytics')} className="flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                <span className="text-sm font-medium">{t('generateReport', 'Generate Report')}</span>
              </button>
              
              <button onClick={() => navigate('/reporting-and-analytics-hub')} className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                <span className="text-sm font-medium">{t('exportData', 'Export Data')}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ITOperationsCommandCenter;
