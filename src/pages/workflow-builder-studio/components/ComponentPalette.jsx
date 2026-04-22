import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ComponentPalette = ({ isCollapsed, onToggle, onDragStart }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const text = (arText, enText) => (isArabic ? arText : enText);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const componentCategories = [
    {
      id: 'all',
      label: text('كل المكونات', 'All Components'),
      icon: 'Grid3x3'
    },
    {
      id: 'steps',
      label: text('خطوات سير العمل', 'Workflow Steps'),
      icon: 'GitBranch',
      components: [
        { id: 'start', name: text('عقدة البداية', 'Start Node'), icon: 'Play', color: 'text-success', description: text('نقطة دخول سير العمل', 'Workflow entry point') },
        { id: 'task', name: text('خطوة مهمة', 'Task Step'), icon: 'CheckSquare', color: 'text-primary', description: text('مهمة يدوية أو آلية', 'Manual or automated task') },
        { id: 'approval', name: text('الموافقة', 'Approval'), icon: 'UserCheck', color: 'text-warning', description: text('يتطلب موافقة المستخدم', 'Requires user approval') },
        { id: 'notification', name: text('الإشعار', 'Notification'), icon: 'Bell', color: 'text-accent', description: text('إرسال الإشعارات', 'Send notifications') },
        { id: 'end', name: text('عقدة النهاية', 'End Node'), icon: 'Square', color: 'text-error', description: text('اكتمال سير العمل', 'Workflow completion') }
      ]
    },
    {
      id: 'decisions',
      label: text('عقد القرار', 'Decision Nodes'),
      icon: 'GitMerge',
      components: [
        { id: 'condition', name: text('شرط', 'Conditional'), icon: 'GitBranch', color: 'text-warning', description: text('منطق إذا-فإن-وإلا', 'If-then-else logic') },
        { id: 'switch', name: text('تبديل', 'Switch'), icon: 'GitMerge', color: 'text-primary', description: text('عدة شروط', 'Multiple conditions') },
        { id: 'loop', name: text('تكرار', 'Loop'), icon: 'Repeat', color: 'text-accent', description: text('تكرار الإجراءات', 'Repeat actions') }
      ]
    },
    {
      id: 'integrations',
      label: text('نقاط التكامل', 'Integration Points'),
      icon: 'Plug',
      components: [
        { id: 'api', name: text('استدعاء API', 'API Call'), icon: 'Cloud', color: 'text-primary', description: text('تكامل مع API خارجي', 'External API integration') },
        { id: 'database', name: text('قاعدة البيانات', 'Database'), icon: 'Database', color: 'text-success', description: text('عمليات قاعدة البيانات', 'Database operations') },
        { id: 'email', name: text('البريد الإلكتروني', 'Email'), icon: 'Mail', color: 'text-accent', description: text('إرسال رسائل البريد الإلكتروني', 'Send emails') },
        { id: 'webhook', name: text('ويب هوك', 'Webhook'), icon: 'Webhook', color: 'text-warning', description: text('تشغيل webhooks', 'Trigger webhooks') }
      ]
    },
    {
      id: 'data',
      label: text('عمليات البيانات', 'Data Operations'),
      icon: 'Database',
      components: [
        { id: 'transform', name: text('تحويل', 'Transform'), icon: 'RefreshCw', color: 'text-primary', description: text('تحويل البيانات', 'Data transformation') },
        { id: 'validate', name: text('تحقق', 'Validate'), icon: 'ShieldCheck', color: 'text-success', description: text('التحقق من البيانات', 'Data validation') },
        { id: 'aggregate', name: text('تجميع', 'Aggregate'), icon: 'Layers', color: 'text-accent', description: text('دمج البيانات', 'Combine data') }
      ]
    }
  ];

  const getAllComponents = () => {
    return componentCategories?.filter(cat => cat?.components)?.flatMap(cat => cat?.components);
  };

  const getFilteredComponents = () => {
    const components = activeCategory === 'all' 
      ? getAllComponents()
      : componentCategories?.find(cat => cat?.id === activeCategory)?.components || [];

    if (!searchQuery) return components;

    return components?.filter(comp => 
      comp?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      comp?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  };

  const handleDragStart = (e, component) => {
    e.dataTransfer.effectAllowed = 'copy';
    e?.dataTransfer?.setData('application/json', JSON.stringify(component));
    onDragStart(component);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label={text('توسيع اللوحة', 'Expand palette')}
        >
          <Icon name="ChevronRight" size={20} />
        </button>
        {componentCategories?.slice(1)?.map(category => (
          <button
            key={category?.id}
            onClick={() => {
              setActiveCategory(category?.id);
              onToggle();
            }}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            title={category?.label}
          >
            <Icon name={category?.icon} size={20} />
          </button>
        ))}
      </div>
    );
  }

  return (
      <div className="w-64 lg:w-80 bg-card border-r border-border flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold">{text('المكونات', 'Components')}</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
            aria-label={text('طي اللوحة', 'Collapse palette')}
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
        </div>
        
        <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
            placeholder={text('البحث في المكونات...', 'Search components...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-custom">
        {componentCategories?.map(category => (
          <button
            key={category?.id}
            onClick={() => setActiveCategory(category?.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-smooth press-scale ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <Icon name={category?.icon} size={16} />
            <span className="hidden lg:inline">{category?.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
        {getFilteredComponents()?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{text('لم يتم العثور على مكونات', 'No components found')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {getFilteredComponents()?.map(component => (
              <div
                key={component?.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                className="p-3 bg-background border border-border rounded-md cursor-move hover:border-primary hover:shadow-elevation-1 transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className={`${component?.color} mt-0.5`}>
                    <Icon name={component?.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{component?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {component?.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>{text('اسحب المكونات إلى اللوحة', 'Drag components to canvas')}</span>
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;
