import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkOperationsToolbar = ({ selectedCount, onClearSelection, onBulkAction }) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const bulkActions = [
    { value: '', label: 'اختر إجراءً جماعيًا...' },
    { value: 'transfer', label: 'نقل الأصول' },
    { value: 'status-active', label: 'تعيين الحالة: نشط' },
    { value: 'status-inactive', label: 'تعيين الحالة: غير نشط' },
    { value: 'status-maintenance', label: 'تعيين الحالة: تحت الصيانة' },
    { value: 'schedule-maintenance', label: 'جدولة الصيانة' },
    { value: 'update-location', label: 'تحديث الموقع' },
    { value: 'export', label: 'تصدير المحدد' },
    { value: 'generate-qr', label: 'توليد رموز QR' }
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
              {selectedCount} أصل{selectedCount !== 1 ? 'ات' : ''} محدد
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-primary hover:underline focus-ring rounded px-2 py-1"
          >
            مسح التحديد
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial sm:w-64">
            <Select
              options={bulkActions}
              value={selectedAction}
              onChange={setSelectedAction}
            placeholder="اختر إجراءً..."
            />
          </div>
          <Button
            variant="default"
            onClick={handleApplyAction}
            disabled={!selectedAction}
            iconName="Check"
            iconPosition="left"
          >
            تطبيق
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
          نقل
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Wrench"
          iconPosition="left"
          onClick={() => onBulkAction('schedule-maintenance')}
        >
          جدولة الصيانة
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="MapPin"
          iconPosition="left"
          onClick={() => onBulkAction('update-location')}
        >
          تحديث الموقع
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={() => onBulkAction('export')}
        >
          تصدير
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="QrCode"
          iconPosition="left"
          onClick={() => onBulkAction('generate-qr')}
        >
          توليد QR
        </Button>
      </div>
    </div>
  );
};

export default BulkOperationsToolbar;
