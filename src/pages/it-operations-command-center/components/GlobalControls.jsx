import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const GlobalControls = ({ onServiceFilterChange, onRefreshToggle, isAutoRefresh }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [selectedService, setSelectedService] = useState('all');
  const [slaCountdown, setSlaCountdown] = useState(847); // seconds until next SLA breach
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const serviceOptions = [
    { value: 'all', label: t('allServices', 'All Services') },
    { value: 'email', label: t('emailServices', 'Email Services') },
    { value: 'network', label: t('networkInfrastructure', 'Network Infrastructure') },
    { value: 'database', label: t('databaseSystems', 'Database Systems') },
    { value: 'application', label: t('applicationServices', 'Application Services') },
    { value: 'security', label: t('securityServices', 'Security Services') }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlaCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleServiceChange = (value) => {
    setSelectedService(value);
    onServiceFilterChange(value);
  };

  const getCountdownColor = () => {
    if (slaCountdown < 300) return 'text-error'; // < 5 minutes
    if (slaCountdown < 900) return 'text-warning'; // < 15 minutes
    return 'text-success';
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
        {/* Left Section - Service Filter */}
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <Select
              label="Service Filter"
              options={serviceOptions}
              value={selectedService}
              onChange={handleServiceChange}
              className="text-sm"
            />
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-success' : 'bg-error'} animate-pulse`}></div>
            <span className="text-sm text-muted-foreground capitalize">{connectionStatus}</span>
          </div>
        </div>

        {/* Center Section - SLA Countdown */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Next SLA Breach</div>
            <div className={`text-2xl font-bold font-data ${getCountdownColor()}`}>
              {formatCountdown(slaCountdown)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Active Incidents</div>
            <div className="text-2xl font-bold text-foreground">
              47
            </div>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center space-x-3">
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
            onClick={onRefreshToggle}
            iconName={isAutoRefresh ? "Pause" : "Play"}
            iconPosition="left"
          >
            {isAutoRefresh ? "Auto (30s)" : "Manual"}
          </Button>
          
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" iconName="Settings">
            Configure
          </Button>
          
          <Button variant="outline" size="sm" iconName="Maximize2">
            Fullscreen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalControls;