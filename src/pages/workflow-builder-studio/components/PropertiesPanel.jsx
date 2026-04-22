import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';

const PropertiesPanel = ({ selectedNode, onNodeUpdate, onNodeDelete, isCollapsed, onToggle }) => {
  const { language } = useLanguage();
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const text = (arText, enText) => (isArabic ? arText : enText);
  const [localNode, setLocalNode] = useState(selectedNode || {});

  const nodeTypeOptions = [
    { value: 'task', label: text('خطوة مهمة', 'Task Step') },
    { value: 'approval', label: text('موافقة', 'Approval') },
    { value: 'notification', label: text('إشعار', 'Notification') },
    { value: 'condition', label: text('شرط', 'Conditional') },
    { value: 'api', label: text('استدعاء API', 'API Call') }
  ];

  const priorityOptions = [
    { value: 'low', label: text('منخفضة', 'Low') },
    { value: 'medium', label: text('متوسطة', 'Medium') },
    { value: 'high', label: text('عالية', 'High') },
    { value: 'critical', label: text('حرجة', 'Critical') }
  ];

  const assigneeOptions = [
    { value: 'admin', label: text('المدير', 'Administrator') },
    { value: 'manager', label: text('مدير القسم', 'Department Manager') },
    { value: 'operator', label: text('فريق العمليات', 'Operations Staff') },
    { value: 'finance', label: text('فريق المالية', 'Finance Team') }
  ];

  const handleInputChange = (field, value) => {
    const updated = { ...localNode, [field]: value };
    setLocalNode(updated);
  };

  const handleSave = () => {
    onNodeUpdate(localNode);
  };

  const handleDelete = () => {
    if (window.confirm(text('هل تريد حذف هذه العقدة؟', 'Are you sure you want to delete this node?'))) {
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
          <h2 className="text-base lg:text-lg font-semibold">{text('الخصائص', 'Properties')}</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            aria-label={text('طي الخصائص', 'Collapse properties')}
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Icon name="MousePointerClick" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {text('حدد عقدة لعرض وتحرير خصائصها', 'Select a node to view and edit its properties')}
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
          <h2 className="text-base lg:text-lg font-semibold">{text('الخصائص', 'Properties')}</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            aria-label={text('طي الخصائص', 'Collapse properties')}
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
            <p className="text-xs text-muted-foreground">{text('تهيئة العقدة', 'Node Configuration')}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-4">
        <div>
          <Input
            label={text('اسم العقدة', 'Node Name')}
            type="text"
            value={localNode?.name || selectedNode?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            placeholder={text('أدخل اسم العقدة', 'Enter node name')}
            required
          />
        </div>

        <div>
          <Input
            label={text('الوصف', 'Description')}
            type="text"
            value={localNode?.description || selectedNode?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            placeholder={text('أدخل الوصف', 'Enter description')}
          />
        </div>

        <div>
          <Select
            label={text('نوع العقدة', 'Node Type')}
            options={nodeTypeOptions}
            value={localNode?.type || selectedNode?.id}
            onChange={(value) => handleInputChange('type', value)}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">{text('التكوين', 'Configuration')}</h3>
          
          <div className="space-y-4">
            <div>
              <Select
                label={text('الأولوية', 'Priority')}
                options={priorityOptions}
                value={localNode?.priority || 'medium'}
                onChange={(value) => handleInputChange('priority', value)}
              />
            </div>

            <div>
              <Select
                label={text('المسند إليه', 'Assignee')}
                options={assigneeOptions}
                value={localNode?.assignee || 'admin'}
                onChange={(value) => handleInputChange('assignee', value)}
                searchable
              />
            </div>

            <div>
              <Input
                label={text('المدة المقدرة (بالساعات)', 'Estimated Duration (hours)')}
                type="number"
                value={localNode?.duration || ''}
                onChange={(e) => handleInputChange('duration', e?.target?.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Checkbox
                label={text('يتطلب موافقة', 'Require approval')}
                checked={localNode?.requiresApproval || false}
                onChange={(e) => handleInputChange('requiresApproval', e?.target?.checked)}
              />
            </div>

            <div>
              <Checkbox
                label={text('إرسال إشعار', 'Send notification')}
                checked={localNode?.sendNotification || false}
                onChange={(e) => handleInputChange('sendNotification', e?.target?.checked)}
              />
            </div>

            <div>
              <Checkbox
                label={text('السماح بالتنفيذ المتوازي', 'Allow parallel execution')}
                checked={localNode?.allowParallel || false}
                onChange={(e) => handleInputChange('allowParallel', e?.target?.checked)}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">{text('المنطق الشرطي', 'Conditional Logic')}</h3>
          
          <div className="space-y-3">
            <div>
              <Input
                label={text('تعبير الشرط', 'Condition Expression')}
                type="text"
                value={localNode?.condition || ''}
                onChange={(e) => handleInputChange('condition', e?.target?.value)}
                placeholder={text("مثال: status === 'approved'", "e.g., status === 'approved'")}
              />
            </div>

            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1">{text('صياغة الشرط', 'Condition Syntax')}</p>
                  <p className="text-xs text-muted-foreground">
                    {text("استخدم تعبيرات JavaScript لتعريف الشروط.\nمثال: amount > 1000 && status === 'pending'", "Use JavaScript expressions to define conditions.\nExample: amount > 1000 && status === 'pending'")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">{text('إعدادات التكامل', 'Integration Settings')}</h3>
          
          <div className="space-y-3">
            <div>
              <Input
                label={text('نقطة نهاية API', 'API Endpoint')}
                type="url"
                value={localNode?.apiEndpoint || ''}
                onChange={(e) => handleInputChange('apiEndpoint', e?.target?.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>

            <div>
              <Select
                label={text('طريقة HTTP', 'HTTP Method')}
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
              {text('اختبار الاتصال', 'Test Connection')}
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
          {text('حفظ التغييرات', 'Save Changes')}
        </Button>
        <Button
          variant="destructive"
          size="default"
          iconName="Trash2"
          iconPosition="left"
          fullWidth
          onClick={handleDelete}
        >
          {text('حذف العقدة', 'Delete Node')}
        </Button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
