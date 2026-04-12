import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkOperationsToolbar = ({ selectedCount, onClearSelection, onBulkAction }) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const bulkActions = [
    { value: '', label: 'Select bulk action...' },
    { value: 'transfer', label: 'Transfer Assets' },
    { value: 'status-active', label: 'Set Status: Active' },
    { value: 'status-inactive', label: 'Set Status: Inactive' },
    { value: 'status-maintenance', label: 'Set Status: Maintenance' },
    { value: 'schedule-maintenance', label: 'Schedule Maintenance' },
    { value: 'update-location', label: 'Update Location' },
    { value: 'export', label: 'Export Selected' },
    { value: 'generate-qr', label: 'Generate QR Codes' }
  ];

  const handleApplyAction = () => {
    if (selectedAction) {
      onBulkAction(selectedAction);
      setSelectedAction('');
      setShowActionMenu(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
              {selectedCount}
            </div>
            <span className="text-sm font-medium">
              {selectedCount} asset{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-primary hover:underline focus-ring rounded px-2 py-1"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial sm:w-64">
            <Select
              options={bulkActions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Select action..."
            />
          </div>
          <Button
            variant="default"
            onClick={handleApplyAction}
            disabled={!selectedAction}
            iconName="Check"
            iconPosition="left"
          >
            Apply
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          iconName="ArrowRightLeft"
          iconPosition="left"
          onClick={() => onBulkAction('transfer')}
        >
          Transfer
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Wrench"
          iconPosition="left"
          onClick={() => onBulkAction('schedule-maintenance')}
        >
          Schedule Maintenance
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="MapPin"
          iconPosition="left"
          onClick={() => onBulkAction('update-location')}
        >
          Update Location
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={() => onBulkAction('export')}
        >
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="QrCode"
          iconPosition="left"
          onClick={() => onBulkAction('generate-qr')}
        >
          Generate QR
        </Button>
      </div>
    </div>
  );
};

export default BulkOperationsToolbar;