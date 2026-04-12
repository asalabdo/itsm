import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const PropertiesPanel = ({ selectedNode, onNodeUpdate, onNodeDelete, isCollapsed, onToggle }) => {
  const [localNode, setLocalNode] = useState(selectedNode || {});

  const nodeTypeOptions = [
    { value: 'task', label: 'Task Step' },
    { value: 'approval', label: 'Approval' },
    { value: 'notification', label: 'Notification' },
    { value: 'condition', label: 'Conditional' },
    { value: 'api', label: 'API Call' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const assigneeOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Department Manager' },
    { value: 'operator', label: 'Operations Staff' },
    { value: 'finance', label: 'Finance Team' }
  ];

  const handleInputChange = (field, value) => {
    const updated = { ...localNode, [field]: value };
    setLocalNode(updated);
  };

  const handleSave = () => {
    onNodeUpdate(localNode);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      onNodeDelete(selectedNode?.id);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-l border-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label="Expand properties"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
        <Icon name="Settings" size={20} className="text-muted-foreground" />
      </div>
    );
  }

  if (!selectedNode) {
    return (
      <div className="w-64 lg:w-80 bg-card border-l border-border flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base lg:text-lg font-semibold">Properties</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            aria-label="Collapse properties"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Icon name="MousePointerClick" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a node to view and edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 lg:w-80 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold">Properties</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            aria-label="Collapse properties"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
          <div className={selectedNode?.color}>
            <Icon name={selectedNode?.icon} size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedNode?.name}</p>
            <p className="text-xs text-muted-foreground">Node Configuration</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-4">
        <div>
          <Input
            label="Node Name"
            type="text"
            value={localNode?.name || selectedNode?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            placeholder="Enter node name"
            required
          />
        </div>

        <div>
          <Input
            label="Description"
            type="text"
            value={localNode?.description || selectedNode?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            placeholder="Enter description"
          />
        </div>

        <div>
          <Select
            label="Node Type"
            options={nodeTypeOptions}
            value={localNode?.type || selectedNode?.id}
            onChange={(value) => handleInputChange('type', value)}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <Select
                label="Priority"
                options={priorityOptions}
                value={localNode?.priority || 'medium'}
                onChange={(value) => handleInputChange('priority', value)}
              />
            </div>

            <div>
              <Select
                label="Assignee"
                options={assigneeOptions}
                value={localNode?.assignee || 'admin'}
                onChange={(value) => handleInputChange('assignee', value)}
                searchable
              />
            </div>

            <div>
              <Input
                label="Estimated Duration (hours)"
                type="number"
                value={localNode?.duration || ''}
                onChange={(e) => handleInputChange('duration', e?.target?.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Checkbox
                label="Require approval"
                checked={localNode?.requiresApproval || false}
                onChange={(e) => handleInputChange('requiresApproval', e?.target?.checked)}
              />
            </div>

            <div>
              <Checkbox
                label="Send notification"
                checked={localNode?.sendNotification || false}
                onChange={(e) => handleInputChange('sendNotification', e?.target?.checked)}
              />
            </div>

            <div>
              <Checkbox
                label="Allow parallel execution"
                checked={localNode?.allowParallel || false}
                onChange={(e) => handleInputChange('allowParallel', e?.target?.checked)}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">Conditional Logic</h3>
          
          <div className="space-y-3">
            <div>
              <Input
                label="Condition Expression"
                type="text"
                value={localNode?.condition || ''}
                onChange={(e) => handleInputChange('condition', e?.target?.value)}
                placeholder="e.g., status === 'approved'"
              />
            </div>

            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1">Condition Syntax</p>
                  <p className="text-xs text-muted-foreground">
                    Use JavaScript expressions to define conditions.\nExample: amount &gt; 1000 && status === 'pending'
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">Integration Settings</h3>
          
          <div className="space-y-3">
            <div>
              <Input
                label="API Endpoint"
                type="url"
                value={localNode?.apiEndpoint || ''}
                onChange={(e) => handleInputChange('apiEndpoint', e?.target?.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>

            <div>
              <Select
                label="HTTP Method"
                options={[
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'DELETE', label: 'DELETE' }
                ]}
                value={localNode?.httpMethod || 'POST'}
                onChange={(value) => handleInputChange('httpMethod', value)}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              iconName="Play"
              iconPosition="left"
              fullWidth
            >
              Test Connection
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="default"
          size="default"
          iconName="Save"
          iconPosition="left"
          fullWidth
          onClick={handleSave}
        >
          Save Changes
        </Button>
        <Button
          variant="destructive"
          size="default"
          iconName="Trash2"
          iconPosition="left"
          fullWidth
          onClick={handleDelete}
        >
          Delete Node
        </Button>
      </div>
    </div>
  );
};

export default PropertiesPanel;