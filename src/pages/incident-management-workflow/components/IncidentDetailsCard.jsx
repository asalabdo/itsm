import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const IncidentDetailsCard = ({ incident }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...incident });
  const [showEscalation, setShowEscalation] = useState(false);

  const statusOptions = ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'];
  const priorityOptions = ['P1', 'P2', 'P3', 'P4'];

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

  const calculateSLAStatus = () => {
    const now = new Date();
    const deadline = new Date(incident.slaDeadline);
    const diff = deadline?.getTime() - now?.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return { status: 'breach', text: 'SLA Breached', color: 'text-error' };
    } else if (hours < 1) {
      return { status: 'critical', text: `${minutes}m remaining`, color: 'text-error' };
    } else if (hours < 4) {
      return { status: 'warning', text: `${hours}h ${minutes}m remaining`, color: 'text-warning' };
    } else {
      return { status: 'good', text: `${hours}h ${minutes}m remaining`, color: 'text-foreground' };
    }
  };

  const handleSave = () => {
    // Simulate save operation
    Object.assign(incident, editData);
    setIsEditing(false);
    console.log('Incident updated:', editData);
  };

  const handleEscalate = (escalationType) => {
    console.log(`Escalating incident ${incident?.id} to ${escalationType}`);
    setShowEscalation(false);
  };

  const slaStatus = calculateSLAStatus();

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {incident?.id}: {incident?.title}
            </h2>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(incident?.severity)}`}>
                {incident?.severity} Severity
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(incident?.status)}`}>
                {incident?.status}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded border border-primary">
                {incident?.priority}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`text-right text-sm ${slaStatus?.color}`}>
              <Icon name="Clock" size={16} className="inline mr-1" />
              <span className="font-medium">{slaStatus?.text}</span>
              <p className="text-xs text-muted-foreground mt-1">
                SLA Deadline: {new Date(incident.slaDeadline)?.toLocaleString()}
              </p>
            </div>
            
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Edit Incident"
              >
                <Icon name="Edit" size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowEscalation(true)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Escalate Incident"
              >
                <Icon name="ArrowUp" size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={editData?.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e?.target?.value }))}
                  className="w-full p-2 bg-background border border-border rounded text-foreground"
                >
                  {statusOptions?.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                <select
                  value={editData?.priority}
                  onChange={(e) => setEditData(prev => ({ ...prev, priority: e?.target?.value }))}
                  className="w-full p-2 bg-background border border-border rounded text-foreground"
                >
                  {priorityOptions?.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assigned To</label>
                <input
                  type="text"
                  value={editData?.assignedTo}
                  onChange={(e) => setEditData(prev => ({ ...prev, assignedTo: e?.target?.value }))}
                  className="w-full p-2 bg-background border border-border rounded text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estimated Resolution</label>
                <input
                  type="text"
                  value={editData?.estimatedResolution}
                  onChange={(e) => setEditData(prev => ({ ...prev, estimatedResolution: e?.target?.value }))}
                  className="w-full p-2 bg-background border border-border rounded text-foreground"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Assignment</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Assigned to:</p>
                  <p className="font-medium text-foreground">{incident?.assignedTo}</p>
                  <p className="text-muted-foreground">Category:</p>
                  <p className="font-medium text-foreground">{incident?.category}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Impact</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Affected Users:</p>
                  <p className="font-medium text-foreground">{incident?.affectedUsers}</p>
                  <p className="text-muted-foreground">Business Impact:</p>
                  <p className="font-medium text-foreground">{incident?.impact}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Timeline</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Created:</p>
                  <p className="font-medium text-foreground">
                    {incident?.createdAt?.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground">Est. Resolution:</p>
                  <p className="font-medium text-foreground">{incident?.estimatedResolution}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion:</span>
                    <span className="font-medium text-foreground">
                      {incident?.status === 'Resolved' ? '100%' : 
                       incident?.status === 'In Progress' ? '60%' : 
                       incident?.status === 'Assigned' ? '25%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ 
                        width: `${incident?.status === 'Resolved' ? '100' : 
                                  incident?.status === 'In Progress' ? '60' : 
                                  incident?.status === 'Assigned' ? '25' : '0'}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Icon name="MessageSquare" size={16} />
                <span>Add Comment</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                <Icon name="Phone" size={16} />
                <span>Contact User</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                <Icon name="Paperclip" size={16} />
                <span>Attach File</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                <Icon name="Share2" size={16} />
                <span>Share</span>
              </button>
            </div>

            {/* Status Update Section */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-3">Quick Status Update</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {statusOptions?.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setEditData(prev => ({ ...prev, status }));
                      handleSave();
                    }}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      incident?.status === status 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Escalation Modal */}
      {showEscalation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Escalate Incident</h3>
                <button
                  onClick={() => setShowEscalation(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Select escalation type for incident {incident?.id}:
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleEscalate('Level 2 Support')}
                  className="w-full p-3 text-left bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors"
                >
                  <div className="font-medium text-foreground">Level 2 Support</div>
                  <div className="text-sm text-muted-foreground">Technical escalation for complex issues</div>
                </button>
                
                <button
                  onClick={() => handleEscalate('Manager')}
                  className="w-full p-3 text-left bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors"
                >
                  <div className="font-medium text-foreground">Manager</div>
                  <div className="text-sm text-muted-foreground">Management escalation for authorization</div>
                </button>
                
                <button
                  onClick={() => handleEscalate('Vendor')}
                  className="w-full p-3 text-left bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors"
                >
                  <div className="font-medium text-foreground">Vendor Support</div>
                  <div className="text-sm text-muted-foreground">External vendor escalation</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetailsCard;