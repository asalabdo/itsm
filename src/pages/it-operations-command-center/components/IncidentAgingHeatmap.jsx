import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IncidentAgingHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' or 'list'

  useEffect(() => {
    // Mock heatmap data - time buckets with incident counts
    const mockData = [
      { bucket: '0-15m', count: 23, severity: 'low', incidents: ['INC-001', 'INC-002', 'INC-003'] },
      { bucket: '15-30m', count: 18, severity: 'low', incidents: ['INC-004', 'INC-005'] },
      { bucket: '30-1h', count: 12, severity: 'medium', incidents: ['INC-006', 'INC-007'] },
      { bucket: '1-2h', count: 8, severity: 'medium', incidents: ['INC-008'] },
      { bucket: '2-4h', count: 15, severity: 'high', incidents: ['INC-009', 'INC-010'] },
      { bucket: '4-8h', count: 6, severity: 'high', incidents: ['INC-011'] },
      { bucket: '8-24h', count: 4, severity: 'critical', incidents: ['INC-012'] },
      { bucket: '1-3d', count: 2, severity: 'critical', incidents: ['INC-013'] },
      { bucket: '3-7d', count: 1, severity: 'critical', incidents: ['INC-014'] },
      { bucket: '>7d', count: 0, severity: 'critical', incidents: [] }
    ];
    setHeatmapData(mockData);
  }, []);

  const getSeverityColor = (severity, count) => {
    if (count === 0) return 'bg-muted';
    
    switch (severity) {
      case 'low': return 'bg-success/20 border-success/40';
      case 'medium': return 'bg-warning/30 border-warning/50';
      case 'high': return 'bg-error/40 border-error/60';
      case 'critical': return 'bg-error border-error';
      default: return 'bg-muted';
    }
  };

  const getTextColor = (severity, count) => {
    if (count === 0) return 'text-muted-foreground';
    if (severity === 'critical') return 'text-white';
    return 'text-foreground';
  };

  const detailedIncidents = [
    {
      id: 'INC-2024-001847',
      title: 'Email Server Performance Issues',
      priority: 'P2',
      age: '2h 15m',
      assignee: 'Sarah Chen',
      status: 'In Progress',
      category: 'Email Services'
    },
    {
      id: 'INC-2024-001851',
      title: 'Network Latency - Building A',
      priority: 'P3',
      age: '45m',
      assignee: 'Mike Rodriguez',
      status: 'Investigating',
      category: 'Network'
    },
    {
      id: 'INC-2024-001853',
      title: 'Database Connection Timeout',
      priority: 'P1',
      age: '4h 32m',
      assignee: 'Alex Kumar',
      status: 'Escalated',
      category: 'Database'
    },
    {
      id: 'INC-2024-001855',
      title: 'Application Login Failures',
      priority: 'P2',
      age: '1h 20m',
      assignee: 'Lisa Wang',
      status: 'Assigned',
      category: 'Application'
    },
    {
      id: 'INC-2024-001857',
      title: 'VPN Connection Issues',
      priority: 'P3',
      age: '25m',
      assignee: 'David Park',
      status: 'New',
      category: 'Network'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-error text-error-foreground';
      case 'P2': return 'bg-warning text-warning-foreground';
      case 'P3': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'text-accent';
      case 'Assigned': return 'text-warning';
      case 'In Progress': return 'text-warning';
      case 'Investigating': return 'text-accent';
      case 'Escalated': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const totalIncidents = heatmapData?.reduce((sum, bucket) => sum + bucket?.count, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Grid3X3" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Incident Aging Analysis</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'heatmap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('heatmap')}
            iconName="Grid3X3"
          >
            Heatmap
          </Button>
          
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            iconName="List"
          >
            List
          </Button>
        </div>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-foreground">{totalIncidents}</div>
          <div className="text-sm text-muted-foreground">Total Active</div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-error">
            {heatmapData?.filter(b => b?.severity === 'critical')?.reduce((sum, b) => sum + b?.count, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Critical Age</div>
        </div>
      </div>
      {viewMode === 'heatmap' ? (
        <>
          {/* Heatmap Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {heatmapData?.map((bucket, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${getSeverityColor(bucket?.severity, bucket?.count)} ${
                  selectedBucket === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedBucket(selectedBucket === index ? null : index)}
              >
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTextColor(bucket?.severity, bucket?.count)}`}>
                    {bucket?.count}
                  </div>
                  <div className={`text-sm font-medium ${getTextColor(bucket?.severity, bucket?.count)}`}>
                    {bucket?.bucket}
                  </div>
                  {bucket?.count > 0 && (
                    <div className={`text-xs mt-1 ${getTextColor(bucket?.severity, bucket?.count)}`}>
                      {bucket?.severity?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success/20 border border-success/40 rounded"></div>
              <span className="text-xs text-muted-foreground">Low Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-warning/30 border border-warning/50 rounded"></div>
              <span className="text-xs text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-error/40 border border-error/60 rounded"></div>
              <span className="text-xs text-muted-foreground">High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-error border border-error rounded"></div>
              <span className="text-xs text-muted-foreground">Critical</span>
            </div>
          </div>

          {/* Selected Bucket Details */}
          {selectedBucket !== null && heatmapData?.[selectedBucket]?.count > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-foreground mb-2">
                Incidents in {heatmapData?.[selectedBucket]?.bucket} bucket:
              </h4>
              <div className="space-y-2">
                {heatmapData?.[selectedBucket]?.incidents?.map((incidentId) => (
                  <div key={incidentId} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium text-foreground">{incidentId}</span>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* List View */
        (<div className="space-y-3">
          {detailedIncidents?.map((incident) => (
            <div key={incident?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(incident?.priority)}`}>
                    {incident?.priority}
                  </span>
                  <span className="text-sm font-medium text-foreground">{incident?.id}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{incident?.age}</span>
                </div>
              </div>

              <h4 className="font-medium text-foreground mb-2">{incident?.title}</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${getStatusColor(incident?.status)}`}>
                    {incident?.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assignee:</span>
                  <span className="font-medium text-foreground">{incident?.assignee}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {incident?.category}
                </span>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Assign
                  </Button>
                  <Button variant="default" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>)
      )}
    </div>
  );
};

export default IncidentAgingHeatmap;