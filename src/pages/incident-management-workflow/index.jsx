import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import IncidentCreationWizard from './components/IncidentCreationWizard';
import IncidentDetailsCard from './components/IncidentDetailsCard';
import RelatedInformationCard from './components/RelatedInformationCard';
import TimelineVisualization from './components/TimelineVisualization';
import RootCauseAnalysis from './components/RootCauseAnalysis';
import VolumeTrackingDashboard from './components/VolumeTrackingDashboard';
import ManageEngineIntegration from './components/ManageEngineIntegration';
import ExternalSystemBadge from '../../components/ui/ExternalSystemBadge';

import { ticketsAPI } from '../../services/api';

const IncidentManagementWorkflow = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchIncidents();
  }, [filters, refreshTrigger]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const response = await ticketsAPI.search(params);
      setActiveIncidents(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError('Failed to load incidents. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      setSelectedIncident(null);
    }
  };

  const handleIncidentSelect = async (incident) => {
    try {
      const response = await ticketsAPI.getById(incident.id);
      setSelectedIncident(response.data);
      setCurrentView('details');
    } catch (err) {
      console.error('Failed to fetch incident details:', err);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleSyncComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const normalizeValue = (value) => {
    if (!value) return '';
    return String(value).trim();
  };

  const toOptionValue = (value) => normalizeValue(value).toLowerCase().replace(/\s+/g, '-');

  const incidentMetadata = useMemo(() => {
    const getAssignmentGroupLabel = (incident) => normalizeValue(
      incident?.assignmentGroup
      || incident?.assignedTo?.department
      || incident?.assignedToDepartment
      || incident?.department
      || `${incident?.assignedTo?.firstName || ''} ${incident?.assignedTo?.lastName || ''}`.trim()
    );

    const categories = Array.from(new Set(
      activeIncidents
        .map((incident) => normalizeValue(incident?.category))
        .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    const assignmentGroups = Array.from(new Set(
      activeIncidents
        .map((incident) => getAssignmentGroupLabel(incident))
        .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    const priorities = Array.from(new Set(
      activeIncidents
        .map((incident) => normalizeValue(incident?.priority))
        .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    const statuses = Array.from(new Set(
      activeIncidents
        .map((incident) => normalizeValue(incident?.status))
        .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    return {
      categoryOptions: categories.map((value) => ({ value: toOptionValue(value), label: value })),
      assignmentGroupOptions: assignmentGroups.map((value) => ({ value: toOptionValue(value), label: value })),
      priorityOptions: priorities.map((value) => ({ value: toOptionValue(value), label: value })),
      statusOptions: statuses.map((value) => ({ value: toOptionValue(value), label: value })),
    };
  }, [activeIncidents]);

  const filteredIncidents = useMemo(() => {
    return activeIncidents.filter((incident) => {
      const matchesStatus = filters.status === 'all' || toOptionValue(incident?.status) === toOptionValue(filters.status);
      const matchesPriority = filters.priority === 'all' || toOptionValue(incident?.priority) === toOptionValue(filters.priority);
      const matchesCategory = filters.category === 'all' || toOptionValue(incident?.category) === toOptionValue(filters.category);
      const searchTerm = filters.search?.trim().toLowerCase();
      const matchesSearch = !searchTerm || [
        incident?.ticketNumber,
        incident?.title,
        incident?.description,
        incident?.category,
        incident?.status,
        incident?.priority,
        incident?.assignedTo?.firstName,
        incident?.assignedTo?.lastName
      ].some((value) => String(value || '').toLowerCase().includes(searchTerm));
      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [activeIncidents, filters]);

  const getSeverityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-error bg-error/10 border-error';
      case 'medium': return 'text-warning bg-warning/10 border-warning';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      default: return 'text-muted-foreground bg-muted/10 border-muted';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'new': return 'text-blue-500 bg-blue-500/10';
      case 'assigned': return 'text-warning bg-warning/10';
      case 'in progress': return 'text-primary bg-primary/10';
      case 'resolved': return 'text-success bg-success/10';
      case 'closed': return 'text-muted-foreground bg-muted/10';
      default: return 'text-foreground bg-muted/10';
    }
  };

  const formatSLATime = (deadline) => {
    if (!deadline) return '--';
    const diff = new Date(deadline).getTime() - Date.now();
    
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

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
              <button
                onClick={() => handleViewChange('integration')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'integration' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                ManageEngine
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
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search by ID, title or description..."
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-foreground">Status:</label>
                      <select
                        value={filters?.status}
                        onChange={(e) => handleFilterChange('status', e?.target?.value)}
                        className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
                      >
                        <option value="all">All</option>
                        {incidentMetadata?.statusOptions?.map((status) => (
                          <option key={status?.value} value={status?.label}>
                            {status?.label}
                          </option>
                        ))}
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
                        {incidentMetadata?.priorityOptions?.map((priority) => (
                          <option key={priority?.value} value={priority?.label}>
                            {priority?.label}
                          </option>
                        ))}
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
                        {incidentMetadata?.categoryOptions?.map((category) => (
                          <option key={category?.value} value={category?.label}>
                            {category?.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => setRefreshTrigger(t => t + 1)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Refresh"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Active Incidents */}
                <div className="bg-card border border-border rounded-lg min-h-[400px]">
                  <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-foreground">
                      Active Incidents ({filteredIncidents?.length})
                    </h2>
                    {loading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    )}
                  </div>
                  
                  <div className="divide-y divide-border">
                    {error ? (
                      <div className="p-12 text-center">
                        <p className="text-error mb-4">{error}</p>
                        <button 
                          onClick={() => setRefreshTrigger(t => t + 1)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                        >
                          Retry
                        </button>
                      </div>
                    ) : filteredIncidents?.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        {loading ? 'Loading incidents...' : 'No incidents found matching your filters.'}
                      </div>
                    ) : (
                      filteredIncidents?.map((incident) => (
                        <div
                          key={incident?.id}
                          className="p-6 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleIncidentSelect(incident)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(incident?.priority)}`}>
                                  {incident?.priority} Priority
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(incident?.status)}`}>
                                  {incident?.status}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                                  {incident?.category}
                                </span>
                                <ExternalSystemBadge
                                  externalSystem={incident?.externalSystem}
                                  externalId={incident?.externalId}
                                />
                              </div>
                              
                              <h3 className="text-lg font-semibold text-foreground mb-2">
                                {incident?.ticketNumber}: {incident?.title}
                              </h3>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Assigned to:</span>
                                  <p className="font-medium text-foreground">{incident?.assignedTo?.firstName ? `${incident.assignedTo.firstName} ${incident.assignedTo.lastName}` : 'Unassigned'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Requested by:</span>
                                  <p className="font-medium text-foreground">{incident?.requestedBy?.firstName} {incident?.requestedBy?.lastName}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Category:</span>
                                  <p className="font-medium text-foreground">{incident?.category}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Updated:</span>
                                  <p className="font-medium text-foreground">{new Date(incident?.updatedAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right ml-6">
                              <div className="text-sm">
                                <span className="text-muted-foreground">SLA Remaining:</span>
                                <p className={`font-semibold ${
                                  formatSLATime(incident?.slaDueDate) === 'Overdue' ? 'text-error' : 'text-foreground'
                                }`}>
                                  {formatSLATime(incident?.slaDueDate)}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Created {new Date(incident?.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
                <IncidentDetailsCard 
                  incident={selectedIncident} 
                  onUpdate={(updated) => {
                    setSelectedIncident(updated);
                    setActiveIncidents(prev => prev.map(inc => inc.id === updated.id ? updated : inc));
                  }}
                />
                <TimelineVisualization incident={selectedIncident} />
                <RootCauseAnalysis incident={selectedIncident} />
              </div>
                <div className="space-y-6">
                  <RelatedInformationCard incident={selectedIncident} />
                </div>
              </div>
            )}

            {currentView === 'analytics' && (
              <VolumeTrackingDashboard incidents={filteredIncidents} />
            )}

            {currentView === 'integration' && (
              <ManageEngineIntegration onSyncComplete={handleSyncComplete} />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default IncidentManagementWorkflow;
