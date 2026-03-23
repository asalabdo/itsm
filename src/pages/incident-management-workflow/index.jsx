import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import IncidentCreationWizard from './components/IncidentCreationWizard';
import IncidentDetailsCard from './components/IncidentDetailsCard';
import RelatedInformationCard from './components/RelatedInformationCard';
import TimelineVisualization from './components/TimelineVisualization';
import RootCauseAnalysis from './components/RootCauseAnalysis';
import VolumeTrackingDashboard from './components/VolumeTrackingDashboard';

const IncidentManagementWorkflow = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeIncidents, setActiveIncidents] = useState([
    {
      id: 'INC-2025-008',
      title: 'Email Server Outage',
      severity: 'High',
      impact: 'High',
      priority: 'P1',
      status: 'In Progress',
      assignedTo: 'Alex Rodriguez',
      category: 'Infrastructure',
      subcategory: 'Email Services',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      slaDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
      affectedUsers: 250,
      estimatedResolution: '2 hours'
    },
    {
      id: 'INC-2025-009',
      title: 'Database Performance Issues',
      severity: 'Medium',
      impact: 'High',
      priority: 'P2',
      status: 'Assigned',
      assignedTo: 'Sarah Johnson',
      category: 'Database',
      subcategory: 'Performance',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
      affectedUsers: 45,
      estimatedResolution: '4 hours'
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all'
  });

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      setSelectedIncident(null);
    }
  };

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    setCurrentView('details');
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'text-error bg-error/10 border-error';
      case 'medium': return 'text-warning bg-warning/10 border-warning';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      default: return 'text-muted-foreground bg-muted/10 border-muted';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'text-blue-500 bg-blue-500/10';
      case 'assigned': return 'text-warning bg-warning/10';
      case 'in progress': return 'text-primary bg-primary/10';
      case 'resolved': return 'text-success bg-success/10';
      case 'closed': return 'text-muted-foreground bg-muted/10';
      default: return 'text-foreground bg-muted/10';
    }
  };

  const formatSLATime = (deadline) => {
    const diff = deadline?.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Overdue';
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const filteredIncidents = activeIncidents?.filter(incident => {
    if (filters?.status !== 'all' && incident?.status?.toLowerCase() !== filters?.status) return false;
    if (filters?.priority !== 'all' && incident?.priority !== filters?.priority) return false;
    if (filters?.category !== 'all' && incident?.category?.toLowerCase() !== filters?.category) return false;
    if (filters?.assignedTo !== 'all' && incident?.assignedTo !== filters?.assignedTo) return false;
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Incident Management Workflow - ITSM Hub</title>
        <meta name="description" content="Comprehensive incident lifecycle management interface enabling service desk teams to create, track, and resolve incidents through structured step-by-step workflows." />
        <meta name="keywords" content="incident management, workflow, ticket tracking, SLA monitoring, root cause analysis" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          {/* Navigation Tabs */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleViewChange('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'dashboard' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Incident Dashboard
              </button>
              <button
                onClick={() => handleViewChange('create')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'create' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Create Incident
              </button>
              <button
                onClick={() => handleViewChange('analytics')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'analytics' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Volume Analytics
              </button>
              {selectedIncident && (
                <button
                  onClick={() => handleViewChange('details')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'details' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {selectedIncident?.id}
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-foreground">Status:</label>
                      <select
                        value={filters?.status}
                        onChange={(e) => handleFilterChange('status', e?.target?.value)}
                        className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
                      >
                        <option value="all">All</option>
                        <option value="new">New</option>
                        <option value="assigned">Assigned</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-foreground">Priority:</label>
                      <select
                        value={filters?.priority}
                        onChange={(e) => handleFilterChange('priority', e?.target?.value)}
                        className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
                      >
                        <option value="all">All</option>
                        <option value="P1">P1</option>
                        <option value="P2">P2</option>
                        <option value="P3">P3</option>
                        <option value="P4">P4</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-foreground">Category:</label>
                      <select
                        value={filters?.category}
                        onChange={(e) => handleFilterChange('category', e?.target?.value)}
                        className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
                      >
                        <option value="all">All</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="database">Database</option>
                        <option value="application">Application</option>
                        <option value="network">Network</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Active Incidents */}
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                      Active Incidents ({filteredIncidents?.length})
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {filteredIncidents?.map((incident) => (
                      <div
                        key={incident?.id}
                        className="p-6 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleIncidentSelect(incident)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(incident?.severity)}`}>
                                {incident?.severity} Severity
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(incident?.status)}`}>
                                {incident?.status}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                                {incident?.priority}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {incident?.id}: {incident?.title}
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Assigned to:</span>
                                <p className="font-medium text-foreground">{incident?.assignedTo}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Affected Users:</span>
                                <p className="font-medium text-foreground">{incident?.affectedUsers}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <p className="font-medium text-foreground">{incident?.category}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Est. Resolution:</span>
                                <p className="font-medium text-foreground">{incident?.estimatedResolution}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right ml-6">
                            <div className="text-sm">
                              <span className="text-muted-foreground">SLA Remaining:</span>
                              <p className={`font-semibold ${
                                formatSLATime(incident?.slaDeadline) === 'Overdue' ?'text-error' :'text-foreground'
                              }`}>
                                {formatSLATime(incident?.slaDeadline)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created {incident?.createdAt?.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentView === 'create' && (
              <IncidentCreationWizard onIncidentCreated={(incident) => {
                setActiveIncidents(prev => [...prev, incident]);
                handleIncidentSelect(incident);
              }} />
            )}

            {currentView === 'details' && selectedIncident && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <IncidentDetailsCard incident={selectedIncident} />
                  <TimelineVisualization incident={selectedIncident} />
                  <RootCauseAnalysis incident={selectedIncident} />
                </div>
                <div className="space-y-6">
                  <RelatedInformationCard incident={selectedIncident} />
                </div>
              </div>
            )}

            {currentView === 'analytics' && (
              <VolumeTrackingDashboard incidents={activeIncidents} />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default IncidentManagementWorkflow;