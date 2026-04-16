import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const BulkActionToolbar = ({ selectedCount, onClearSelection, onBulkAction }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const statusOptions = [
    { value: 'open', label: t('open', 'Open') },
    { value: 'in-progress', label: t('inProgress', 'In Progress') },
    { value: 'pending', label: t('pending', 'Pending') },
    { value: 'resolved', label: t('resolved', 'Resolved') },
    { value: 'closed', label: t('closed', 'Closed') }
  ];

  const priorityOptions = [
    { value: 'critical', label: t('critical', 'Critical') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') }
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
              {selectedCount} {t('ticketSelected', 'ticket')} {selectedCount !== 1 ? t('ticketsSelected', 'tickets selected') : t('ticketSelected', 'ticket selected')}
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
                {t('changeStatus', 'Change Status')}
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
                {t('changePriority', 'Change Priority')}
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
              {t('assign', 'Assign')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={() => handleBulkAction('export')}
            >
              {t('export', 'Export')}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={() => handleBulkAction('delete')}
            >
              {t('delete', 'Delete')}
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
