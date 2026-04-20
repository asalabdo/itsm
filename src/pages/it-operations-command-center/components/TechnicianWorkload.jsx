import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { ticketsAPI } from '../../../services/ticketsApi';

const TechnicianWorkload = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [technicians, setTechnicians] = useState([]);
  const [assignmentQueue, setAssignmentQueue] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const fetchWorkloadData = async () => {
    try {
      const [techniciansRes, queueRes] = await Promise.all([
        ticketsAPI.getTechnicians?.() || Promise.resolve({ data: [] }),
        ticketsAPI.getAssignmentQueue?.() || Promise.resolve({ data: [] })
      ]);
      setTechnicians(techniciansRes?.data || []);
      setAssignmentQueue(queueRes?.data || []);
    } catch (error) {
      console.error('Failed to fetch workload data:', error);
      setTechnicians([]);
      setAssignmentQueue([]);
    }
  };

  useEffect(() => {
    fetchWorkloadData();

    const handleRefresh = () => {
      fetchWorkloadData();
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'away': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return 'CheckCircle';
      case 'busy': return 'Clock';
      case 'away': return 'Pause';
      default: return 'Circle';
    }
  };

  const getLoadPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const getLoadColor = (percentage) => {
    if (percentage >= 90) return 'bg-error';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-error text-error-foreground';
      case 'P2': return 'bg-warning text-warning-foreground';
      case 'P3': return 'bg-accent text-accent-foreground';
      case 'P4': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleAssignTicket = (ticketId, technicianId) => {
    setAssignmentQueue(prev => prev?.filter(ticket => ticket?.id !== ticketId));
    setSelectedTechnician(technicianId);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Users" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('technicianWorkload', 'Technician Workload')}</h3>
        </div>
        
        <Button variant="outline" size="sm" iconName="UserPlus" onClick={() => navigate('/user-management')}>
          {t('addTechnician', 'Add Technician')}
        </Button>
      </div>
      {/* Technician List */}
      <div className="space-y-4 mb-6">
        {technicians?.map((tech) => {
          const loadPercentage = getLoadPercentage(tech?.currentLoad, tech?.maxCapacity);
          
          return (
            <div 
              key={tech?.id} 
              className={`border border-border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                selectedTechnician === tech?.id ? 'ring-2 ring-primary bg-muted/30' : ''
              }`}
              onClick={() => setSelectedTechnician(selectedTechnician === tech?.id ? null : tech?.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={tech?.avatar} 
                      alt={tech?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(tech?.status)}`}>
                      <Icon name={getStatusIcon(tech?.status)} size={10} className="w-full h-full" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground">{tech?.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span className="capitalize">{tech?.status}</span>
                      <span>•</span>
                      <span>{tech?.specialties?.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {tech?.currentLoad}/{tech?.maxCapacity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {loadPercentage}% {t('capacity', 'capacity')}
                  </div>
                </div>
              </div>
              {/* Load Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getLoadColor(loadPercentage)}`}
                  style={{ width: `${loadPercentage}%` }}
                ></div>
              </div>
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('avgResolution', 'Avg Resolution')}:</span>
                  <span className="font-medium text-foreground">{tech?.avgResolutionTime}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('satisfaction', 'Satisfaction')}:</span>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={12} className="text-warning fill-current" />
                    <span className="font-medium text-foreground">{tech?.satisfactionScore}</span>
                  </div>
                </div>
              </div>
              {/* Expanded Details */}
              {selectedTechnician === tech?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h5 className="text-sm font-medium text-foreground mb-2">{t('activeTickets', 'Active Tickets')}:</h5>
                  <div className="space-y-2">
                    {tech?.activeTickets?.map((ticketId) => (
                      <div key={ticketId} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span className="font-medium text-foreground">{ticketId}</span>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/ticket-details/${encodeURIComponent(ticketId)}`)}>
                          {t('view', 'View')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Assignment Queue */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">{t('assignmentQueue', 'Assignment Queue')} ({assignmentQueue?.length})</h4>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            {t('refresh', 'Refresh')}
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {assignmentQueue?.map((ticket) => (
            <div key={ticket?.id} className="border border-border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                    {ticket?.priority}
                  </span>
                  <span className="text-sm font-medium text-foreground">{ticket?.id}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="Clock" size={12} />
                  <span>{ticket?.age}</span>
                </div>
              </div>

              <h5 className="text-sm font-medium text-foreground mb-2">{ticket?.title}</h5>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-muted-foreground">{t('category', 'Category')}: </span>
                  <span className="text-foreground">{ticket?.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('effort', 'Effort')}: </span>
                  <span className="text-foreground">{ticket?.estimatedEffort}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {ticket?.requiredSkills?.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-muted text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-1">
                  <select 
                    className="text-xs border border-border rounded px-2 py-1 bg-background"
                    onChange={(e) => e?.target?.value && handleAssignTicket(ticket?.id, e?.target?.value)}
                    defaultValue=""
                  >
                    <option value="">{t('assignTo', 'Assign to...')}</option>
                    {technicians?.filter(tech => tech?.status === 'available' && tech?.currentLoad < tech?.maxCapacity)?.map(tech => (
                        <option key={tech?.id} value={tech?.id}>{tech?.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnicianWorkload;
