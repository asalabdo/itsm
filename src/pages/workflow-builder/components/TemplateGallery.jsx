import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { workflowsAPI } from '../../../services/api';

const TemplateGallery = ({ onClose, onLoadTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const res = await workflowsAPI.getAll();
        setTemplates(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const categories = [
    { id: 'all', label: 'All Templates', icon: 'Grid3x3' },
    { id: 'draft', label: 'Draft', icon: 'PencilLine' },
    { id: 'published', label: 'Published', icon: 'CheckCircle2' },
    { id: 'active', label: 'Active', icon: 'Play' },
  ];

  const templateCards = useMemo(() => {
    return templates.map((template) => {
      let blocks = Array.isArray(template?.steps) ? template.steps : [];
      if (!blocks.length && template?.workflowDefinition) {
        try {
          const parsed = JSON.parse(template.workflowDefinition);
          if (Array.isArray(parsed)) {
            blocks = parsed;
          } else if (Array.isArray(parsed?.blocks)) {
            blocks = parsed.blocks;
          } else if (Array.isArray(parsed?.steps)) {
            blocks = parsed.steps;
          }
        } catch {
          blocks = [];
        }
      }

      const normalizedBlocks = blocks.map((block, index) => ({
        id: block?.id || `template-block-${template.id}-${index}`,
        name: block?.name || block?.stepName || `Step ${index + 1}`,
        category: block?.category || block?.stepType || 'actions',
        icon: block?.icon || 'Workflow',
        color: block?.color || 'var(--color-primary)',
        description: block?.description || block?.stepConfiguration || 'Workflow step from backend template',
        position: block?.position || { x: 80, y: 60 + index * 120 },
        config: block?.config || {},
      }));

      return {
        id: template.id,
        name: template.name || 'Untitled workflow',
        category: String(template.status || 'draft').toLowerCase(),
        description: template.description || 'Workflow template from the backend',
        icon: template.status === 'Published' ? 'CheckCircle2' : 'Workflow',
        color: template.status === 'Published' ? 'text-success' : template.status === 'Active' ? 'text-primary' : 'text-warning',
        blocks: normalizedBlocks.length > 0 ? normalizedBlocks : [{
          id: `template-block-${template.id}-1`,
          name: template.name || 'Untitled workflow',
          category: 'actions',
          icon: 'Workflow',
          color: 'var(--color-primary)',
          description: template.description || 'Imported workflow template',
          position: { x: 80, y: 60 },
          config: {},
        }],
        nodes: normalizedBlocks.length,
        estimatedTime: template.status === 'Published' ? 'Ready to use' : 'Editable',
      };
    });
  }, [templates]);

  const filteredTemplates = templateCards.filter((template) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [template.name, template.description].some((value) => String(value || '').toLowerCase().includes(query));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!onClose) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-4 md:inset-8 lg:inset-16 rounded-2xl border border-border bg-card shadow-elevation-5 flex flex-col">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Template Gallery</h3>
            <p className="text-sm text-muted-foreground">Load workflow templates from the backend</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted transition-smooth" aria-label="Close template gallery">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="flex-1"
            />
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                    selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Icon name={category.icon} size={16} />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Icon name="Loader2" size={40} className="mx-auto mb-3 animate-spin" />
                Loading templates...
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Icon name="Search" size={40} className="mx-auto mb-3" />
                <p>No templates found</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onLoadTemplate(template)}
                  className="text-left rounded-xl border border-border bg-background p-4 hover:border-primary hover:shadow-elevation-2 transition-smooth"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`rounded-lg bg-muted p-3 ${template.color}`}>
                      <Icon name={template.icon} size={20} />
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{template.category}</span>
                  </div>
                  <h4 className="font-semibold text-foreground">{template.name}</h4>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.blocks.length} blocks</span>
                    <span>{template.estimatedTime}</span>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" fullWidth>
                      Use Template
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
