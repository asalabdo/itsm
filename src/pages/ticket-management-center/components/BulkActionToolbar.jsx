import React, { useState } from 'react';

import Button from '../../../components/ui/Button';


const BulkActionToolbar = ({ selectedCount, onClearSelection, onBulkAction }) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

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
    { value: 'john-doe', label: 'John Doe' },
    { value: 'jane-smith', label: 'Jane Smith' },
    { value: 'mike-johnson', label: 'Mike Johnson' },
    { value: 'sarah-williams', label: 'Sarah Williams' }
  ];

  const handleBulkAction = (action, value = null) => {
    onBulkAction(action, value);
    setShowActionMenu(false);
    setShowAssignMenu(false);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-1000 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {selectedCount}
            </div>
            <span className="text-sm font-medium">
              {selectedCount} ticket{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                onClick={() => setShowActionMenu(!showActionMenu)}
              >
                Change Status
              </Button>
              {showActionMenu && (
                <>
                  <div
                    className="fixed inset-0 z-1100"
                    onClick={() => setShowActionMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-popover border border-border rounded-md shadow-elevation-3 z-1200 py-1">
                    {statusOptions?.map(option => (
                      <button
                        key={option?.value}
                        onClick={() => handleBulkAction('status', option?.value)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-smooth"
                      >
                        {option?.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="Flag"
                iconPosition="left"
                onClick={() => setShowAssignMenu(!showAssignMenu)}
              >
                Change Priority
              </Button>
              {showAssignMenu && (
                <>
                  <div
                    className="fixed inset-0 z-1100"
                    onClick={() => setShowAssignMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-popover border border-border rounded-md shadow-elevation-3 z-1200 py-1">
                    {priorityOptions?.map(option => (
                      <button
                        key={option?.value}
                        onClick={() => handleBulkAction('priority', option?.value)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-smooth"
                      >
                        {option?.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              iconName="UserPlus"
              iconPosition="left"
              onClick={() => handleBulkAction('assign')}
            >
              Assign
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={() => handleBulkAction('export')}
            >
              Export
            </Button>

            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClearSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;