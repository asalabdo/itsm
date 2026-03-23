import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceHealthScorecard = () => {
  const services = [
    {
      id: 1,
      name: "Email Services",
      status: "excellent",
      availability: 99.98,
      incidents: 0,
      lastIncident: "7 days ago",
      users: 2450
    },
    {
      id: 2,
      name: "Network Infrastructure",
      status: "good",
      availability: 99.85,
      incidents: 1,
      lastIncident: "2 days ago",
      users: 2450
    },
    {
      id: 3,
      name: "Database Services",
      status: "warning",
      availability: 99.45,
      incidents: 3,
      lastIncident: "6 hours ago",
      users: 1850
    },
    {
      id: 4,
      name: "Application Hosting",
      status: "good",
      availability: 99.92,
      incidents: 1,
      lastIncident: "4 days ago",
      users: 2100
    },
    {
      id: 5,
      name: "Security Services",
      status: "excellent",
      availability: 99.99,
      incidents: 0,
      lastIncident: "14 days ago",
      users: 2450
    },
    {
      id: 6,
      name: "Backup & Recovery",
      status: "good",
      availability: 99.88,
      incidents: 2,
      lastIncident: "1 day ago",
      users: 2450
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return 'CheckCircle';
      case 'good': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'critical': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'excellent': return 'bg-success/10';
      case 'good': return 'bg-primary/10';
      case 'warning': return 'bg-warning/10';
      case 'critical': return 'bg-error/10';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Service Health Scorecard</h3>
          <p className="text-sm text-muted-foreground">Real-time service availability and incident status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="space-y-4">
        {services?.map((service) => (
          <div key={service?.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 micro-interaction">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusBg(service?.status)}`}>
                <Icon 
                  name={getStatusIcon(service?.status)} 
                  size={20} 
                  className={getStatusColor(service?.status)} 
                />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{service?.name}</h4>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{service?.availability}% uptime</span>
                  <span>•</span>
                  <span>{service?.users?.toLocaleString()} users</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-foreground">
                  {service?.incidents} incidents
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Last: {service?.lastIncident}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Service Health</span>
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="font-medium text-success">98.5% Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHealthScorecard;