import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TicketDetailPanel = ({ ticket, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [comment, setComment] = useState('');

  if (!ticket) return null;

  // Check if ticket has linked asset
  const linkedAsset = ticket?.assetLinked ? {
    assetId: ticket?.assetId || 'AST-2024-001',
    description: 'Dell Latitude 5520 Laptop',
    serialNumber: 'SN-DL5520-2024-001',
    status: 'active',
    currentOwner: ticket?.requester
  } : null;

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const assigneeOptions = [
    { value: ticket?.assignedToId ? String(ticket.assignedToId) : 'unassigned', label: ticket?.assignee || 'Unassigned' },
    { value: 'unassigned', label: 'Unassigned' }
  ];

  const activityHistory = [
    {
      id: 1,
      type: 'created',
      user: ticket?.requester || 'Unknown requester',
      userInitials: String(ticket?.requester || 'U').split(' ').map((part) => part?.[0]).filter(Boolean).join('').slice(0, 2).toUpperCase(),
      action: 'created this ticket',
      timestamp: ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'
    },
    {
      id: 2,
      type: 'status',
      user: ticket?.assignee || 'Unassigned',
      userInitials: String(ticket?.assignee || 'U').split(' ').map((part) => part?.[0]).filter(Boolean).join('').slice(0, 2).toUpperCase(),
      action: `current status is ${ticket?.statusLabel || ticket?.status || 'Open'}`,
      timestamp: ticket?.slaDeadline || 'N/A'
    }
  ];

  const attachments = [];

  const getActivityIcon = (type) => {
    const icons = {
      status: 'RefreshCw',
      comment: 'MessageSquare',
      assignment: 'UserPlus',
      created: 'Plus',
      attachment: 'Paperclip'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      status: 'text-primary bg-primary/10',
      comment: 'text-success bg-success/10',
      assignment: 'text-warning bg-warning/10',
      created: 'text-muted-foreground bg-muted',
      attachment: 'text-primary bg-primary/10'
    };
    return colors?.[type] || 'text-muted-foreground bg-muted';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-1000 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static top-16 right-0 bottom-0 w-full lg:w-96 bg-card border-l border-border z-1100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-base">Ticket Details</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-muted transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-smooth ${
                activeTab === 'details' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-smooth ${
                activeTab === 'activity' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-primary">#{ticket?.id}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    ticket?.priority === 'critical' ? 'text-error bg-error/10' :
                    ticket?.priority === 'high' ? 'text-warning bg-warning/10' :
                    ticket?.priority === 'medium'? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted'
                  }`}>
                    {ticket?.priorityLabel}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3">{ticket?.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ticket?.description || 'No description provided for this ticket.'}
                </p>
              </div>

              <div className="space-y-4">
                <Select
                  label="Status"
                  options={statusOptions}
                  value={ticket?.status}
                  onChange={() => {}}
                />

                <Select
                  label="Priority"
                  options={priorityOptions}
                  value={ticket?.priority}
                  onChange={() => {}}
                />

                <Select
                  label="Assignee"
                  options={assigneeOptions}
                  value={ticket?.assignedToId ? String(ticket.assignedToId) : 'unassigned'}
                  onChange={() => {}}
                  placeholder="Select assignee"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <Icon name="Building" size={16} />
            <span className="text-sm">{ticket?.department || 'Unassigned'}</span>
          </div>
        </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SLA Status</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <Icon name="Clock" size={16} className={
                      ticket?.slaHours < 0 ? 'text-error' :
                      ticket?.slaHours < 4 ? 'text-warning': 'text-success'
                    } />
                    <span className={`text-sm font-medium ${
                      ticket?.slaHours < 0 ? 'text-error' :
                      ticket?.slaHours < 4 ? 'text-warning': 'text-success'
                    }`}>
                      {ticket?.slaHours < 0 ? `${Math.abs(ticket?.slaHours)}h overdue` :
                       ticket?.slaHours < 24 ? `${ticket?.slaHours}h remaining` :
                       `${Math.floor(ticket?.slaHours / 24)}d remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Asset Section - Controlled Visibility */}
              {linkedAsset && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="Package" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground">Linked Asset</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          {linkedAsset?.status}
                        </span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{linkedAsset?.assetId}</p>
                      <p className="text-xs text-muted-foreground mt-1">{linkedAsset?.description}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Serial Number</span>
                          <span className="text-foreground font-medium">{linkedAsset?.serialNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Owner</span>
                          <span className="text-foreground font-medium">{linkedAsset?.currentOwner}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 italic">
                        Asset details visible only within this ticket context
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {attachments?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Attachments</label>
                  <div className="space-y-2">
                    {attachments?.map(attachment => (
                      <div
                        key={attachment?.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-smooth cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon name={attachment?.type === 'image' ? 'Image' : 'FileText'} size={20} />
                          <div>
                            <p className="text-sm font-medium">{attachment?.name}</p>
                            <p className="text-xs text-muted-foreground">{attachment?.size}</p>
                          </div>
                        </div>
                        <Icon name="Download" size={16} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activityHistory?.map((activity, index) => (
                <div key={activity?.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                      <Icon name={getActivityIcon(activity?.type)} size={16} />
                    </div>
                    {index < activityHistory?.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{activity?.user}</span>
                      <span className="text-xs text-muted-foreground">{activity?.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{activity?.action}</p>
                    {activity?.content && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{activity?.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          <Input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e?.target?.value)}
            multiline
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              variant="default"
              fullWidth
              iconName="Send"
              iconPosition="right"
            >
              Comment
            </Button>
            <Button
              variant="outline"
              iconName="Paperclip"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default TicketDetailPanel;
