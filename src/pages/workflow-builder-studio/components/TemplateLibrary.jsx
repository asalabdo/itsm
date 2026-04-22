import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { workflowsAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const TemplateLibrary = ({ isOpen, onClose, onTemplateSelect }) => {
  const { language } = useLanguage();
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const text = (arText, enText) => (isArabic ? arText : enText);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const loadWorkflows = async () => {
      setLoading(true);
      try {
        const res = await workflowsAPI.getAll();
        setWorkflows(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setWorkflows([]);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
    return undefined;
  }, [isOpen]);

  const categories = [
    { id: 'all', label: text('كل القوالب', 'All Templates'), icon: 'Grid3x3' },
    { id: 'draft', label: text('مسودة', 'Draft'), icon: 'PencilLine' },
    { id: 'published', label: text('منشور', 'Published'), icon: 'CheckCircle2' },
    { id: 'active', label: text('نشط', 'Active'), icon: 'Play' }
  ];

  const templateCards = useMemo(() => {
    return workflows.map((workflow) => {
      let stepCount = Array.isArray(workflow?.steps) ? workflow.steps.length : 0;
      if (!stepCount && workflow?.workflowDefinition) {
        try {
          const parsed = JSON.parse(workflow.workflowDefinition);
          if (Array.isArray(parsed)) stepCount = parsed.length;
          else if (Array.isArray(parsed?.steps)) stepCount = parsed.steps.length;
        } catch {
          stepCount = 0;
        }
      }

      return {
        id: workflow.id,
        name: workflow.name || text('سير عمل بدون عنوان', 'Untitled workflow'),
        category: String(workflow.status || 'draft').toLowerCase(),
        description: workflow.description || text('قالب سير عمل من مكتبة الخادم', 'Workflow template from the backend library'),
        icon: workflow.status === 'Published' ? 'CheckCircle2' : 'Workflow',
        color: workflow.status === 'Published' ? 'text-success' : workflow.status === 'Active' ? 'text-primary' : 'text-warning',
        nodes: stepCount,
        connections: Math.max(0, stepCount - 1),
        estimatedTime: workflow.status === 'Published' ? text('جاهز للاستخدام', 'Ready to use') : text('قابل للتحرير', 'Editable'),
        popularity: Math.min(100, 60 + stepCount * 5)
      };
    });
  }, [workflows]);

  const filteredTemplates = templateCards.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background z-1100" onClick={onClose} />
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border border-border rounded-lg shadow-elevation-5 z-1200 flex flex-col">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">{text('مكتبة القوالب', 'Template Library')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {text('اختر من قوالب سير العمل المخزنة في الخادم', 'Choose from workflow templates stored in the backend')}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring" aria-label={text('إغلاق مكتبة القوالب', 'Close template library')}>
              <Icon name="X" size={24} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder={text('البحث في القوالب...', 'Search templates...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-custom pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm whitespace-nowrap transition-smooth press-scale ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Icon name={category.icon} size={16} />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Icon name="Loader2" size={48} className="mx-auto mb-3 animate-spin" />
                {text('جارٍ تحميل القوالب...', 'Loading templates...')}
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Icon name="Search" size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{text('لم يتم العثور على قوالب', 'No templates found')}</h3>
                <p className="text-sm text-muted-foreground">{text('جرّب تعديل معايير البحث أو التصفية', 'Try adjusting your search or filter criteria')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-background border border-border rounded-lg p-4 md:p-6 hover:border-primary hover:shadow-elevation-2 transition-smooth cursor-pointer"
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${template.color} p-3 bg-muted rounded-lg`}>
                      <Icon name={template.icon} size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon name="TrendingUp" size={14} />
                      <span>{template.popularity}%</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-base mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{text('العقد', 'Nodes')}:</span>
                      <span className="font-medium">{template.nodes}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{text('الاتصالات', 'Connections')}:</span>
                      <span className="font-medium">{template.connections}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{text('الحالة', 'Status')}:</span>
                      <span className="font-medium capitalize">
                        {isArabic
                          ? (template.category === 'draft' ? 'مسودة' : template.category === 'published' ? 'منشور' : 'نشط')
                          : template.category}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" fullWidth>
                    {text('استخدام القالب', 'Use Template')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-border bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>{text('يتم تحميل القوالب من سير العمل في الخادم ويمكن تخصيصها بعد الاختيار.', 'Templates are loaded from backend workflows and can be customized after selection.')}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateLibrary;
