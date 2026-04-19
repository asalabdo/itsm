import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ComponentPalette = ({ isCollapsed, onToggle, onDragStart }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const componentCategories = [
    {
      id: 'all',
      label: t('allComponents', 'All Components'),
      icon: 'Grid3x3'
    },
    {
      id: 'steps',
      label: t('workflowSteps', 'Workflow Steps'),
      icon: 'GitBranch',
      components: [
        { id: 'start', name: t('startNode', 'Start Node'), icon: 'Play', color: 'text-success', description: t('workflowEntry', 'Workflow entry point') },
        { id: 'task', name: t('taskStep', 'Task Step'), icon: 'CheckSquare', color: 'text-primary', description: t('manualOrAutomated', 'Manual or automated task') },
        { id: 'approval', name: t('approvalNode', 'Approval'), icon: 'UserCheck', color: 'text-warning', description: t('requiresApproval', 'Requires user approval') },
        { id: 'notification', name: t('notificationNode', 'Notification'), icon: 'Bell', color: 'text-accent', description: t('sendNotifications', 'Send notifications') },
        { id: 'end', name: t('endNode', 'End Node'), icon: 'Square', color: 'text-error', description: t('workflowCompletion', 'Workflow completion') }
      ]
    },
    {
      id: 'decisions',
      label: t('decisionNodes', 'Decision Nodes'),
      icon: 'GitMerge',
      components: [
        { id: 'condition', name: t('conditional', 'Conditional'), icon: 'GitBranch', color: 'text-warning', description: t('ifThenElse', 'If-then-else logic') },
        { id: 'switch', name: t('switchNode', 'Switch'), icon: 'GitMerge', color: 'text-primary', description: t('multipleConditions', 'Multiple conditions') },
        { id: 'loop', name: t('loopNode', 'Loop'), icon: 'Repeat', color: 'text-accent', description: t('repeatActions', 'Repeat actions') }
      ]
    },
    {
      id: 'integrations',
      label: t('integrationPoints', 'Integration Points'),
      icon: 'Plug',
      components: [
        { id: 'api', name: t('apiCall', 'API Call'), icon: 'Cloud', color: 'text-primary', description: t('externalApi', 'External API integration') },
        { id: 'database', name: t('databaseNode', 'Database'), icon: 'Database', color: 'text-success', description: t('dbOperations', 'Database operations') },
        { id: 'email', name: t('emailNode', 'Email'), icon: 'Mail', color: 'text-accent', description: t('sendEmails', 'Send emails') },
        { id: 'webhook', name: t('webhookNode', 'Webhook'), icon: 'Webhook', color: 'text-warning', description: t('triggerWebhooks', 'Trigger webhooks') }
      ]
    },
    {
      id: 'data',
      label: t('dataOperations', 'Data Operations'),
      icon: 'Database',
      components: [
        { id: 'transform', name: t('transformNode', 'Transform'), icon: 'RefreshCw', color: 'text-primary', description: t('dataTransform', 'Data transformation') },
        { id: 'validate', name: t('validateNode', 'Validate'), icon: 'ShieldCheck', color: 'text-success', description: t('dataValidation', 'Data validation') },
        { id: 'aggregate', name: t('aggregateNode', 'Aggregate'), icon: 'Layers', color: 'text-accent', description: t('combineData', 'Combine data') }
      ]
    }
  ];

  const getAllComponents = () => {
    return componentCategories?.filter(cat => cat?.components)?.flatMap(cat => cat?.components);
  };

  const getFilteredComponents = () => {
    const components = activeCategory === 'all' 
      ? getAllComponents()
      : componentCategories?.find(cat => cat?.id === activeCategory)?.components || [];

    if (!searchQuery) return components;

    return components?.filter(comp => 
      comp?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      comp?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  };

  const handleDragStart = (e, component) => {
    e.dataTransfer.effectAllowed = 'copy';
    e?.dataTransfer?.setData('application/json', JSON.stringify(component));
    onDragStart(component);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label="Expand palette"
        >
          <Icon name="ChevronRight" size={20} />
        </button>
        {componentCategories?.slice(1)?.map(category => (
          <button
            key={category?.id}
            onClick={() => {
              setActiveCategory(category?.id);
              onToggle();
            }}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            title={category?.label}
          >
            <Icon name={category?.icon} size={20} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 lg:w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold">{t('components', 'Components')}</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            aria-label="Collapse palette"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
        </div>
        
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchComponents', 'Search components...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-custom">
        {componentCategories?.map(category => (
          <button
            key={category?.id}
            onClick={() => setActiveCategory(category?.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-smooth press-scale ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <Icon name={category?.icon} size={16} />
            <span className="hidden lg:inline">{category?.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
        {getFilteredComponents()?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t('noComponents', 'No components found')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {getFilteredComponents()?.map(component => (
              <div
                key={component?.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                className="p-3 bg-background border border-border rounded-md cursor-move hover:border-primary hover:shadow-elevation-1 transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className={`${component?.color} mt-0.5`}>
                    <Icon name={component?.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{component?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {component?.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>Drag components to canvas</span>
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;