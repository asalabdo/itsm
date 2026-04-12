import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ConfigurationPanel = ({ selectedBlock, onBlockUpdate }) => {
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedBlock) {
      setConfig(selectedBlock?.config || {});
    }
  }, [selectedBlock]);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const handleSaveConfig = () => {
    if (selectedBlock) {
      onBlockUpdate(selectedBlock?.id, { config });
    }
  };

  const getConfigFields = () => {
    if (!selectedBlock) return [];

    const commonFields = [
      {
        key: 'name',
        label: 'Block Name',
        type: 'text',
        placeholder: 'Enter custom name',
        defaultValue: selectedBlock?.name,
      },
    ];

    switch (selectedBlock?.id) {
      case 'new-ticket':
        return [
          ...commonFields,
          {
            key: 'category',
            label: 'Ticket Category',
            type: 'select',
            options: [
              { value: 'all', label: 'All Categories' },
              { value: 'incident', label: 'Incident' },
              { value: 'problem', label: 'Problem' },
              { value: 'change', label: 'Change Request' },
            ],
          },
        ];

      case 'status-change':
        return [
          ...commonFields,
          {
            key: 'fromStatus',
            label: 'From Status',
            type: 'select',
            options: [
              { value: 'any', label: 'Any Status' },
              { value: 'open', label: 'Open' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'pending', label: 'Pending' },
            ],
          },
          {
            key: 'toStatus',
            label: 'To Status',
            type: 'select',
            options: [
              { value: 'in-progress', label: 'In Progress' },
              { value: 'pending', label: 'Pending' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        ];

      case 'time-based':
        return [
          ...commonFields,
          {
            key: 'interval',
            label: 'Time Interval',
            type: 'select',
            options: [
              { value: '15min', label: 'Every 15 minutes' },
              { value: '30min', label: 'Every 30 minutes' },
              { value: '1hour', label: 'Every hour' },
              { value: '24hours', label: 'Daily' },
            ],
          },
          {
            key: 'condition',
            label: 'Time Condition',
            type: 'select',
            options: [
              { value: 'created', label: 'Time since created' },
              { value: 'updated', label: 'Time since last update' },
              { value: 'sla', label: 'Time until SLA breach' },
            ],
          },
        ];

      case 'check-priority':
        return [
          ...commonFields,
          {
            key: 'priority',
            label: 'Priority Level',
            type: 'select',
            options: [
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
          },
          {
            key: 'operator',
            label: 'Operator',
            type: 'select',
            options: [
              { value: 'equals', label: 'Equals' },
              { value: 'not-equals', label: 'Not Equals' },
              { value: 'greater', label: 'Greater Than' },
            ],
          },
        ];

      case 'check-category':
        return [
          ...commonFields,
          {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
              { value: 'incident', label: 'Incident' },
              { value: 'problem', label: 'Problem' },
              { value: 'change', label: 'Change Request' },
            ],
          },
        ];

      case 'customer-type':
        return [
          ...commonFields,
          {
            key: 'customerTier',
            label: 'Customer Tier',
            type: 'select',
            options: [
              { value: 'enterprise', label: 'Enterprise' },
              { value: 'business', label: 'Business' },
              { value: 'standard', label: 'Standard' },
              { value: 'free', label: 'Free' },
            ],
          },
        ];

      case 'keyword-match':
        return [
          ...commonFields,
          {
            key: 'keywords',
            label: 'Keywords (comma-separated)',
            type: 'text',
            placeholder: 'urgent, critical, error',
          },
          {
            key: 'matchType',
            label: 'Match Type',
            type: 'select',
            options: [
              { value: 'any', label: 'Match Any' },
              { value: 'all', label: 'Match All' },
              { value: 'exact', label: 'Exact Match' },
            ],
          },
        ];

      case 'assign-agent':
        return [
          ...commonFields,
          {
            key: 'assignmentType',
            label: 'Assignment Type',
            type: 'select',
            options: [
              { value: 'specific', label: 'Specific Agent' },
              { value: 'round-robin', label: 'Round Robin' },
              { value: 'least-loaded', label: 'Least Loaded' },
              { value: 'skill-based', label: 'Skill Based' },
            ],
          },
          {
            key: 'agentId',
            label: 'Agent (if specific)',
            type: 'select',
            options: [
              { value: 'agent-1', label: 'Sarah Mitchell' },
              { value: 'agent-2', label: 'Michael Chen' },
              { value: 'agent-3', label: 'Emily Rodriguez' },
            ],
          },
        ];

      case 'assign-team':
        return [
          ...commonFields,
          {
            key: 'team',
            label: 'Team',
            type: 'select',
            options: [
              { value: 'support', label: 'General Support' },
              { value: 'technical', label: 'Technical Support' },
              { value: 'billing', label: 'Billing Team' },
              { value: 'escalation', label: 'Escalation Team' },
            ],
          },
        ];

      case 'send-notification':
        return [
          ...commonFields,
          {
            key: 'notificationType',
            label: 'Notification Type',
            type: 'select',
            options: [
              { value: 'email', label: 'Email' },
              { value: 'in-app', label: 'In-App' },
              { value: 'both', label: 'Both' },
            ],
          },
          {
            key: 'recipient',
            label: 'Recipient',
            type: 'select',
            options: [
              { value: 'customer', label: 'Customer' },
              { value: 'agent', label: 'Assigned Agent' },
              { value: 'manager', label: 'Manager' },
              { value: 'team', label: 'Team' },
            ],
          },
          {
            key: 'template',
            label: 'Message Template',
            type: 'select',
            options: [
              { value: 'ticket-created', label: 'Ticket Created' },
              { value: 'status-update', label: 'Status Update' },
              { value: 'assignment', label: 'Assignment Notification' },
              { value: 'sla-warning', label: 'SLA Warning' },
            ],
          },
        ];

      case 'update-status':
        return [
          ...commonFields,
          {
            key: 'newStatus',
            label: 'New Status',
            type: 'select',
            options: [
              { value: 'open', label: 'Open' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'pending', label: 'Pending' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        ];

      case 'update-priority':
        return [
          ...commonFields,
          {
            key: 'newPriority',
            label: 'New Priority',
            type: 'select',
            options: [
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
          },
        ];

      case 'add-tag':
        return [
          ...commonFields,
          {
            key: 'tags',
            label: 'Tags (comma-separated)',
            type: 'text',
            placeholder: 'escalated, vip, technical',
          },
        ];

      default:
        return commonFields;
    }
  };

  const configFields = getConfigFields();

  if (!selectedBlock) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 h-[calc(100vh-24rem)] flex items-center justify-center">
        <div className="text-center">
          <Icon name="Settings" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-sm">Select a block to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 h-[calc(100vh-24rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${selectedBlock?.color}15` }}
        >
          <Icon name={selectedBlock?.icon} size={18} color={selectedBlock?.color} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{selectedBlock?.name}</h2>
          <p className="text-xs text-muted-foreground capitalize">{selectedBlock?.category}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {configFields?.map((field) => (
          <div key={field?.key}>
            {field?.type === 'select' ? (
              <Select
                label={field?.label}
                options={field?.options}
                value={config?.[field?.key] || field?.defaultValue || ''}
                onChange={(value) => handleConfigChange(field?.key, value)}
                placeholder={field?.placeholder || 'Select option'}
              />
            ) : (
              <Input
                label={field?.label}
                type={field?.type}
                value={config?.[field?.key] || field?.defaultValue || ''}
                onChange={(e) => handleConfigChange(field?.key, e?.target?.value)}
                placeholder={field?.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="default"
          fullWidth
          iconName="Save"
          onClick={handleSaveConfig}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationPanel;