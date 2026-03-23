import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TechnicianWorkload = () => {
  const [technicians, setTechnicians] = useState([]);
  const [assignmentQueue, setAssignmentQueue] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  useEffect(() => {
    // Mock technician workload data
    const mockTechnicians = [
      {
        id: 1,
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        status: 'available',
        currentLoad: 8,
        maxCapacity: 12,
        specialties: ['Email', 'Network'],
        activeTickets: ['INC-001847', 'INC-001851', 'REQ-002341'],
        avgResolutionTime: '2.3h',
        satisfactionScore: 4.8
      },
      {
        id: 2,
        name: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        status: 'busy',
        currentLoad: 11,
        maxCapacity: 12,
        specialties: ['Database', 'Application'],
        activeTickets: ['INC-001853', 'INC-001855', 'REQ-002342', 'REQ-002343'],
        avgResolutionTime: '1.8h',
        satisfactionScore: 4.9
      },
      {
        id: 3,
        name: 'Alex Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        status: 'away',
        currentLoad: 5,
        maxCapacity: 12,
        specialties: ['Security', 'Infrastructure'],
        activeTickets: ['INC-001857'],
        avgResolutionTime: '3.1h',
        satisfactionScore: 4.6
      },
      {
        id: 4,
        name: 'Lisa Wang',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        status: 'available',
        currentLoad: 6,
        maxCapacity: 12,
        specialties: ['Application', 'Mobile'],
        activeTickets: ['REQ-002344', 'REQ-002345'],
        avgResolutionTime: '2.1h',
        satisfactionScore: 4.7
      },
      {
        id: 5,
        name: 'David Park',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        status: 'available',
        currentLoad: 9,
        maxCapacity: 12,
        specialties: ['Network', 'VPN'],
        activeTickets: ['INC-001859', 'REQ-002346'],
        avgResolutionTime: '2.7h',
        satisfactionScore: 4.5
      }
    ];

    const mockQueue = [
      {
        id: 'INC-2024-001861',
        title: 'Printer Connectivity Issues',
        priority: 'P3',
        category: 'Hardware',
        estimatedEffort: '1h',
        requiredSkills: ['Hardware', 'Network'],
        age: '15m'
      },
      {
        id: 'REQ-2024-002347',
        title: 'New User Account Setup',
        priority: 'P4',
        category: 'Access Management',
        estimatedEffort: '30m',
        requiredSkills: ['Active Directory'],
        age: '8m'
      },
      {
        id: 'INC-2024-001863',
        title: 'Application Crash Reports',
        priority: 'P2',
        category: 'Application',
        estimatedEffort: '2h',
        requiredSkills: ['Application', 'Debugging'],
        age: '22m'
      }
    ];

    setTechnicians(mockTechnicians);
    setAssignmentQueue(mockQueue);
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
    // Mock assignment logic
    console.log(`Assigning ${ticketId} to technician ${technicianId}`);
    // Remove from queue and update technician load
    setAssignmentQueue(prev => prev?.filter(ticket => ticket?.id !== ticketId));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Users" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Technician Workload</h3>
        </div>
        
        <Button variant="outline" size="sm" iconName="UserPlus">
          Add Technician
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
                    {loadPercentage}% capacity
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
                  <span className="text-muted-foreground">Avg Resolution:</span>
                  <span className="font-medium text-foreground">{tech?.avgResolutionTime}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Satisfaction:</span>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={12} className="text-warning fill-current" />
                    <span className="font-medium text-foreground">{tech?.satisfactionScore}</span>
                  </div>
                </div>
              </div>
              {/* Expanded Details */}
              {selectedTechnician === tech?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h5 className="text-sm font-medium text-foreground mb-2">Active Tickets:</h5>
                  <div className="space-y-2">
                    {tech?.activeTickets?.map((ticketId) => (
                      <div key={ticketId} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span className="font-medium text-foreground">{ticketId}</span>
                        <Button variant="ghost" size="sm">
                          View
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
          <h4 className="font-medium text-foreground">Assignment Queue ({assignmentQueue?.length})</h4>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Refresh
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
                  <span className="text-muted-foreground">Category: </span>
                  <span className="text-foreground">{ticket?.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Effort: </span>
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
                    <option value="">Assign to...</option>
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