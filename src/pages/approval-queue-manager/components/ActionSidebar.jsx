import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ActionSidebar = ({ selectedCount, onBulkApprove, onBulkDeny }) => {
  const [activeSection, setActiveSection] = useState('templates');
  const [delegateUser, setDelegateUser] = useState('');
  const [delegateStartDate, setDelegateStartDate] = useState('');
  const [delegateEndDate, setDelegateEndDate] = useState('');

  const approvalTemplates = [
    {
      id: 1,
      name: 'Standard Approval',
      description: 'Approved as per standard operating procedures',
      icon: 'CheckCircle'
    },
    {
      id: 2,
      name: 'Budget Approved',
      description: 'Approved within allocated budget constraints',
      icon: 'DollarSign'
    },
    {
      id: 3,
      name: 'Conditional Approval',
      description: 'Approved with specific conditions to be met',
      icon: 'AlertCircle'
    },
    {
      id: 4,
      name: 'Emergency Approval',
      description: 'Approved due to urgent business requirements',
      icon: 'Zap'
    }
  ];

  const denialTemplates = [
    {
      id: 1,
      name: 'Budget Constraints',
      description: 'Denied due to insufficient budget allocation',
      icon: 'XCircle'
    },
    {
      id: 2,
      name: 'Policy Violation',
      description: 'Denied as request violates company policy',
      icon: 'Shield'
    },
    {
      id: 3,
      name: 'Insufficient Justification',
      description: 'Denied due to inadequate business justification',
      icon: 'FileText'
    },
    {
      id: 4,
      name: 'Alternative Solution',
      description: 'Denied - alternative solution recommended',
      icon: 'RefreshCw'
    }
  ];

  const delegateOptions = [
    { value: 'john.doe', label: 'John Doe - Senior Manager' },
    { value: 'jane.smith', label: 'Jane Smith - Department Head' },
    { value: 'mike.johnson', label: 'Mike Johnson - Director' }
  ];

  const sections = [
    { id: 'templates', label: 'Templates', icon: 'FileText' },
    { id: 'delegation', label: 'Delegation', icon: 'Users' },
    { id: 'bulk', label: 'Bulk Actions', icon: 'Layers' }
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="flex gap-1 overflow-x-auto">
          {sections?.map((section) => (
            <button
              key={section?.id}
              onClick={() => setActiveSection(section?.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-smooth text-sm whitespace-nowrap ${
                activeSection === section?.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon name={section?.icon} size={16} />
              <span className="hidden sm:inline">{section?.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
        {activeSection === 'templates' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Approval Templates
              </h3>
              <div className="space-y-2">
                {approvalTemplates?.map((template) => (
                  <button
                    key={template?.id}
                    className="w-full p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted hover:shadow-elevation-1 transition-smooth text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center flex-shrink-0">
                        <Icon name={template?.icon} size={16} className="text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {template?.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template?.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Denial Templates
              </h3>
              <div className="space-y-2">
                {denialTemplates?.map((template) => (
                  <button
                    key={template?.id}
                    className="w-full p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted hover:shadow-elevation-1 transition-smooth text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-error/10 rounded flex items-center justify-center flex-shrink-0">
                        <Icon name={template?.icon} size={16} className="text-error" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {template?.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template?.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'delegation' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Temporary Delegation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Transfer approval authority temporarily while maintaining full audit trail
                  </p>
                </div>
              </div>
            </div>

            <Select
              label="Delegate To"
              options={delegateOptions}
              value={delegateUser}
              onChange={setDelegateUser}
              placeholder="Select user"
              required
            />

            <Input
              label="Start Date"
              type="date"
              value={delegateStartDate}
              onChange={(e) => setDelegateStartDate(e?.target?.value)}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={delegateEndDate}
              onChange={(e) => setDelegateEndDate(e?.target?.value)}
              required
            />

            <Button
              variant="primary"
              iconName="UserPlus"
              iconPosition="left"
              fullWidth
            >
              Activate Delegation
            </Button>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Active Delegations
              </h3>
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground text-center">
                  No active delegations
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'bulk' && (
          <div className="space-y-4">
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Bulk Operations
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCount > 0 
                      ? `${selectedCount} request${selectedCount !== 1 ? 's' : ''} selected`
                      : 'Select requests to enable bulk actions'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="success"
                iconName="CheckCircle"
                iconPosition="left"
                fullWidth
                disabled={selectedCount === 0}
                onClick={onBulkApprove}
              >
                Bulk Approve ({selectedCount})
              </Button>

              <Button
                variant="danger"
                iconName="XCircle"
                iconPosition="left"
                fullWidth
                disabled={selectedCount === 0}
                onClick={onBulkDeny}
              >
                Bulk Deny ({selectedCount})
              </Button>

              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                fullWidth
                disabled={selectedCount === 0}
              >
                Export Selected
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'j / k', action: 'Navigate up/down' },
                  { key: 'a', action: 'Approve selected' },
                  { key: 'd', action: 'Deny selected' },
                  { key: 'Tab', action: 'Next request' },
                  { key: 'Space', action: 'Select/deselect' }
                ]?.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{shortcut?.action}</span>
                    <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">
                      {shortcut?.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionSidebar;