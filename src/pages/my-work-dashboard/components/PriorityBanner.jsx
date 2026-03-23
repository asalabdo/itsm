import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const PriorityBanner = ({ tickets = [] }) => {
  const urgentIncidents = tickets.length > 0 ? tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').map(t => ({
    id: t.ticketNumber,
    title: t.title,
    priority: t.priority === 'Critical' ? 'P1' : 'P2',
    slaRemaining: Math.floor(Math.random() * 120), // Placeholder for SLA
    assignedTo: 'Sarah Support',
    escalationWarning: Math.random() > 0.8,
    createdAt: new Date(t.createdAt)
  })) : [
    {
      id: 'INC-2026-001',
      title: 'Email Server Outage',
      priority: 'P1',
      slaRemaining: 45,
      assignedTo: 'Sarah Support',
      escalationWarning: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (urgentIncidents?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % urgentIncidents?.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [urgentIncidents?.length]);

  const formatSLATime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSLAColor = (minutes, escalation) => {
    if (escalation || minutes < 30) return 'text-error';
    if (minutes < 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  if (urgentIncidents?.length === 0) return null;

  const currentIncident = urgentIncidents?.[currentIndex];

  return (
    <div className={`relative px-6 py-4 border-b-2 ${
      currentIncident?.priority === 'P1' ? 'bg-error/10 border-error' : 'bg-warning/10 border-warning'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            currentIncident?.priority === 'P1' ?'bg-error text-error-foreground' :'bg-warning text-warning-foreground'
          }`}>
            <Icon name="AlertTriangle" size={16} />
            <span>{currentIncident?.priority} URGENT</span>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground">{currentIncident?.id}: {currentIncident?.title}</h3>
            <p className="text-sm text-muted-foreground">
              Assigned {new Date(currentIncident.createdAt)?.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className={`font-medium ${getSLAColor(currentIncident?.slaRemaining, currentIncident?.escalationWarning)}`}>
                {formatSLATime(currentIncident?.slaRemaining)} remaining
              </span>
              {currentIncident?.escalationWarning && (
                <Icon name="AlertCircle" size={16} className="text-error animate-pulse" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">SLA Breach Warning</p>
          </div>

          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors">
              Accept
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg hover:bg-secondary/90 transition-colors">
              Escalate
            </button>
          </div>
        </div>
      </div>
      {/* Pagination dots */}
      {urgentIncidents?.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {urgentIncidents?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-foreground' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityBanner;