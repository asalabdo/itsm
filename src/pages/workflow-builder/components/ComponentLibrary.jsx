import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const ComponentLibrary = ({ onAddBlock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const blockCategories = [
    { id: 'all', label: 'All', icon: 'Grid' },
    { id: 'triggers', label: 'Triggers', icon: 'Zap' },
    { id: 'conditions', label: 'Conditions', icon: 'GitBranch' },
    { id: 'actions', label: 'Actions', icon: 'Play' },
  ];

  const blocks = [
    // Triggers
    {
      id: 'new-ticket',
      name: 'New Ticket',
      category: 'triggers',
      icon: 'Plus',
      color: 'var(--color-primary)',
      description: 'Triggered when a new ticket is created',
    },
    {
      id: 'status-change',
      name: 'Status Change',
      category: 'triggers',
      icon: 'RefreshCw',
      color: 'var(--color-primary)',
      description: 'Triggered when ticket status changes',
    },
    {
      id: 'time-based',
      name: 'Time Based',
      category: 'triggers',
      icon: 'Clock',
      color: 'var(--color-primary)',
      description: 'Triggered at specific time intervals',
    },
    {
      id: 'priority-change',
      name: 'Priority Change',
      category: 'triggers',
      icon: 'AlertTriangle',
      color: 'var(--color-primary)',
      description: 'Triggered when priority is updated',
    },
    // Conditions
    {
      id: 'check-priority',
      name: 'Check Priority',
      category: 'conditions',
      icon: 'Filter',
      color: 'var(--color-warning)',
      description: 'Check ticket priority level',
    },
    {
      id: 'check-category',
      name: 'Check Category',
      category: 'conditions',
      icon: 'Tag',
      color: 'var(--color-warning)',
      description: 'Check ticket category type',
    },
    {
      id: 'customer-type',
      name: 'Customer Type',
      category: 'conditions',
      icon: 'Users',
      color: 'var(--color-warning)',
      description: 'Check customer tier or type',
    },
    {
      id: 'keyword-match',
      name: 'Keyword Match',
      category: 'conditions',
      icon: 'Search',
      color: 'var(--color-warning)',
      description: 'Match keywords in ticket content',
    },
    {
      id: 'sla-breach',
      name: 'SLA Breach',
      category: 'conditions',
      icon: 'AlertCircle',
      color: 'var(--color-warning)',
      description: 'Check if SLA is breached or near breach',
    },
    // Actions
    {
      id: 'assign-agent',
      name: 'Assign Agent',
      category: 'actions',
      icon: 'UserCheck',
      color: 'var(--color-success)',
      description: 'Assign ticket to specific agent',
    },
    {
      id: 'assign-team',
      name: 'Assign Team',
      category: 'actions',
      icon: 'Users',
      color: 'var(--color-success)',
      description: 'Route ticket to team',
    },
    {
      id: 'send-notification',
      name: 'Send Notification',
      category: 'actions',
      icon: 'Bell',
      color: 'var(--color-success)',
      description: 'Send email or in-app notification',
    },
    {
      id: 'update-status',
      name: 'Update Status',
      category: 'actions',
      icon: 'Edit',
      color: 'var(--color-success)',
      description: 'Change ticket status',
    },
    {
      id: 'update-priority',
      name: 'Update Priority',
      category: 'actions',
      icon: 'TrendingUp',
      color: 'var(--color-success)',
      description: 'Change ticket priority',
    },
    {
      id: 'add-tag',
      name: 'Add Tag',
      category: 'actions',
      icon: 'Tag',
      color: 'var(--color-success)',
      description: 'Add tags to ticket',
    },
  ];

  const filteredBlocks = blocks?.filter(block => {
    const matchesSearch = block?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         block?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = activeCategory === 'all' || block?.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 h-[calc(100vh-24rem)] flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4">Component Library</h2>
      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
        />
      </div>
      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {blockCategories?.map(category => (
          <button
            key={category?.id}
            onClick={() => setActiveCategory(category?.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name={category?.icon} size={14} />
            <span>{category?.label}</span>
          </button>
        ))}
      </div>
      {/* Block List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredBlocks?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No components found</p>
          </div>
        ) : (
          filteredBlocks?.map(block => (
            <button
              key={block?.id}
              onClick={() => onAddBlock(block)}
              className="w-full flex items-start gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary/50 hover:shadow-elevation-1 transition-smooth text-left"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${block?.color}15` }}
              >
                <Icon name={block?.icon} size={18} color={block?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground mb-1">{block?.name}</h3>
                <p className="text-xs text-muted-foreground caption line-clamp-2">
                  {block?.description}
                </p>
              </div>
              <Icon name="Plus" size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ComponentLibrary;