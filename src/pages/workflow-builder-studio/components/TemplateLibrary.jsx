import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TemplateLibrary = ({ isOpen, onClose, onTemplateSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 'approval-basic',
      name: 'Basic Approval Workflow',
      category: 'approval',
      description: 'Simple two-level approval process for standard requests',
      icon: 'UserCheck',
      color: 'text-primary',
      nodes: 5,
      connections: 4,
      estimatedTime: '2-3 days',
      popularity: 95
    },
    {
      id: 'approval-multi',
      name: 'Multi-Level Approval',
      category: 'approval',
      description: 'Complex approval chain with conditional routing based on amount',
      icon: 'Users',
      color: 'text-warning',
      nodes: 8,
      connections: 10,
      estimatedTime: '5-7 days',
      popularity: 87
    },
    {
      id: 'escalation-ticket',
      name: 'Ticket Escalation',
      category: 'escalation',
      description: 'Automated escalation workflow for unresolved support tickets',
      icon: 'AlertTriangle',
      color: 'text-error',
      nodes: 6,
      connections: 7,
      estimatedTime: '1-2 days',
      popularity: 92
    },
    {
      id: 'notification-alert',
      name: 'Alert Notification System',
      category: 'notification',
      description: 'Multi-channel notification workflow for critical system alerts',
      icon: 'Bell',
      color: 'text-accent',
      nodes: 4,
      connections: 3,
      estimatedTime: '1 day',
      popularity: 88
    },
    {
      id: 'asset-transfer',
      name: 'Asset Transfer Process',
      category: 'asset',
      description: 'Complete workflow for asset custody transfer with approvals',
      icon: 'Package',
      color: 'text-success',
      nodes: 7,
      connections: 8,
      estimatedTime: '3-4 days',
      popularity: 79
    },
    {
      id: 'onboarding-employee',
      name: 'Employee Onboarding',
      category: 'hr',
      description: 'Comprehensive onboarding workflow with task assignments',
      icon: 'UserPlus',
      color: 'text-primary',
      nodes: 10,
      connections: 12,
      estimatedTime: '7-10 days',
      popularity: 85
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates', icon: 'Grid3x3' },
    { id: 'approval', label: 'Approvals', icon: 'UserCheck' },
    { id: 'escalation', label: 'Escalations', icon: 'AlertTriangle' },
    { id: 'notification', label: 'Notifications', icon: 'Bell' },
    { id: 'asset', label: 'Asset Management', icon: 'Package' },
    { id: 'hr', label: 'HR Processes', icon: 'Users' }
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         template?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background z-1100" onClick={onClose} />
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border border-border rounded-lg shadow-elevation-5 z-1200 flex flex-col">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">Template Library</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose from pre-built workflow templates
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
              aria-label="Close template library"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-custom pb-2 md:pb-0">
              {categories?.map(category => (
                <button
                  key={category?.id}
                  onClick={() => setSelectedCategory(category?.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm whitespace-nowrap transition-smooth press-scale ${
                    selectedCategory === category?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Icon name={category?.icon} size={16} />
                  <span>{category?.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
          {filteredTemplates?.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Icon name="Search" size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTemplates?.map(template => (
                <div
                  key={template?.id}
                  className="bg-background border border-border rounded-lg p-4 md:p-6 hover:border-primary hover:shadow-elevation-2 transition-smooth cursor-pointer"
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${template?.color} p-3 bg-muted rounded-lg`}>
                      <Icon name={template?.icon} size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon name="TrendingUp" size={14} />
                      <span>{template?.popularity}%</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-base mb-2">{template?.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template?.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Nodes:</span>
                      <span className="font-medium">{template?.nodes}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Connections:</span>
                      <span className="font-medium">{template?.connections}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Est. Time:</span>
                      <span className="font-medium">{template?.estimatedTime}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    fullWidth
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-border bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>Templates can be customized after selection to match your specific requirements</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateLibrary;