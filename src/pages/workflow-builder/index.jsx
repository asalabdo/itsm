import { useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ComponentLibrary from './components/ComponentLibrary';
import WorkflowCanvas from './components/WorkflowCanvas';
import ConfigurationPanel from './components/ConfigurationPanel';
import TemplateGallery from './components/TemplateGallery';
import TestWorkflow from './components/TestWorkflow';
import { workflowsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const WorkflowBuilder = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [workflowBlocks, setWorkflowBlocks] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [workflowName, setWorkflowName] = useState(t('newWorkflow', 'سير عمل جديد'));
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [triggerType, setTriggerType] = useState('Manual');

  const breadcrumbItems = [
    { label: t('dashboard', 'لوحة التحكم'), path: '/agent-dashboard' },
    { label: t('workflowBuilder', 'منشئ سير العمل'), path: '/workflow-builder' },
  ];

  const handleAddBlock = (block) => {
    const newBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random()?.toString(36)?.substr(2, 9)}`,
      position: { x: 100, y: workflowBlocks?.length * 120 + 50 },
      config: {},
    };
    setWorkflowBlocks([...workflowBlocks, newBlock]);
  };

  const handleBlockSelect = (block) => {
    setSelectedBlock(block);
  };

  const handleBlockUpdate = (blockId, updates) => {
    setWorkflowBlocks(workflowBlocks?.map(block => 
      block?.id === blockId ? { ...block, ...updates } : block
    ));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock({ ...selectedBlock, ...updates });
    }
  };

  const handleBlockDelete = (blockId) => {
    setWorkflowBlocks(workflowBlocks?.filter(block => block?.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleLoadTemplate = (template) => {
    setWorkflowBlocks(template?.blocks);
    setWorkflowName(template?.name);
    setWorkflowDescription(template?.description || '');
    setShowTemplates(false);
  };

  const handleSaveWorkflow = async () => {
    try {
      if (!workflowName.trim()) {
        alert('اسم سير العمل مطلوب.');
        return;
      }

      await workflowsAPI.create({
        name: workflowName.trim(),
        description: workflowDescription.trim(),
        workflowDefinition: JSON.stringify(workflowBlocks),
        triggerType,
      });
      alert('تم حفظ سير العمل بنجاح!');
    } catch (err) {
      console.error('Failed to save workflow:', err);
      alert('فشل حفظ سير العمل.');
    }
  };

  const handleClearWorkflow = () => {
    if (window.confirm('هل أنت متأكد أنك تريد مسح سير العمل؟')) {
      setWorkflowBlocks([]);
      setSelectedBlock(null);
      setWorkflowName('سير عمل جديد');
      setWorkflowDescription('');
      setTriggerType('Manual');
    }
  };

  const triggerOptions = [
    { value: 'Manual', label: 'يدوي' },
    { value: 'TicketCreated', label: 'إنشاء تذكرة' },
    { value: 'TicketUpdated', label: 'تحديث تذكرة' },
    { value: 'Schedule', label: 'جدولة' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <BreadcrumbTrail items={breadcrumbItems} />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              منشئ سير العمل
            </h1>
            <p className="text-muted-foreground">
              إنشاء وإدارة قواعد تلقائية لتوجيه التذاكر والإشعارات
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Layout"
              onClick={() => setShowTemplates(true)}
            >
              القوالب
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Play"
              onClick={() => setShowTestPanel(true)}
            >
              اختبار
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Trash2"
              onClick={handleClearWorkflow}
              disabled={workflowBlocks?.length === 0}
            >
              مسح
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Save"
              onClick={handleSaveWorkflow}
            >
              حفظ سير العمل
            </Button>
          </div>
        </div>

        {/* Workflow Info Bar */}
        <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-2">اسم سير العمل</label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e?.target?.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="اسم سير العمل"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-2">نوع المشغل</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e?.target?.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                {triggerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-2">الوصف</label>
              <input
                type="text"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e?.target?.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="صف ما الذي يفعله هذا سير العمل"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Layers" size={16} />
            <span>{workflowBlocks?.length} كتلة</span>
          </div>
        </div>

        {/* Main Workflow Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Component Library - Left Panel */}
          <div className="lg:col-span-3">
            <ComponentLibrary onAddBlock={handleAddBlock} />
          </div>

          {/* Workflow Canvas - Center */}
          <div className="lg:col-span-6">
            <WorkflowCanvas
              blocks={workflowBlocks}
              selectedBlock={selectedBlock}
              onBlockSelect={handleBlockSelect}
              onBlockUpdate={handleBlockUpdate}
              onBlockDelete={handleBlockDelete}
            />
          </div>

          {/* Configuration Panel - Right Panel */}
          <div className="lg:col-span-3">
            <ConfigurationPanel
              selectedBlock={selectedBlock}
              onBlockUpdate={handleBlockUpdate}
            />
          </div>
        </div>
      </div>
      {/* Template Gallery Modal */}
      {showTemplates && (
        <TemplateGallery
          onClose={() => setShowTemplates(false)}
          onLoadTemplate={handleLoadTemplate}
        />
      )}
      {/* Test Workflow Modal */}
      {showTestPanel && (
        <TestWorkflow
          workflow={{ name: workflowName, blocks: workflowBlocks }}
          onClose={() => setShowTestPanel(false)}
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;
