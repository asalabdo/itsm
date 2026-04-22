import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';

const WorkflowToolbar = ({ 
  workflowName, 
  onSave, 
  onPreview, 
  onExport, 
  onTemplateOpen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaving
}) => {
  const { language } = useLanguage();
  const isArabic = String(language || '').toLowerCase().startsWith('ar');

  return (
    <div className="h-16 bg-card border-b border-border px-4 md:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
            <Icon name="Workflow" size={24} color="var(--color-primary)" />
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base md:text-lg font-semibold truncate">{workflowName}</h1>
            <p className="text-xs text-muted-foreground">{isArabic ? 'آخر حفظ' : 'Last saved'}: {new Date()?.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 mr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            title={isArabic ? 'تراجع (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
          >
            <Icon name="Undo" size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            title={isArabic ? 'إعادة (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
          >
            <Icon name="Redo" size={18} />
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          iconName="FileText"
          iconPosition="left"
          onClick={onTemplateOpen}
          className="hidden lg:flex"
        >
          {isArabic ? 'القوالب' : 'Templates'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          iconName="Play"
          iconPosition="left"
          onClick={onPreview}
          className="hidden md:flex"
        >
          {isArabic ? 'معاينة' : 'Preview'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={onExport}
          className="hidden sm:flex"
        >
          {isArabic ? 'تصدير' : 'Export'}
        </Button>

        <Button
          variant="default"
          size="sm"
          iconName="Save"
          iconPosition="left"
          onClick={onSave}
          loading={isSaving}
        >
          {isArabic ? 'حفظ' : 'Save'}
        </Button>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label={isArabic ? 'خيارات إضافية' : 'More options'}
        >
          <Icon name="MoreVertical" size={20} />
        </button>
      </div>
    </div>
  );
};

export default WorkflowToolbar;
