import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ComponentLibrary from './components/ComponentLibrary';
import WorkflowCanvas from './components/WorkflowCanvas';
import ConfigurationPanel from './components/ConfigurationPanel';
import TemplateGallery from './components/TemplateGallery';
import TestWorkflow from './components/TestWorkflow';

const WorkflowBuilder = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [workflowBlocks, setWorkflowBlocks] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [isActive, setIsActive] = useState(false);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/agent-dashboard' },
    { label: 'Workflow Builder', path: '/workflow-builder' },
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
    setShowTemplates(false);
  };

  const handleSaveWorkflow = () => {
    console.log('Saving workflow:', { name: workflowName, blocks: workflowBlocks, isActive });
    alert('Workflow saved successfully!');
  };

  const handleClearWorkflow = () => {
    if (window.confirm('Are you sure you want to clear the workflow?')) {
      setWorkflowBlocks([]);
      setSelectedBlock(null);
      setWorkflowName('New Workflow');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <BreadcrumbTrail items={breadcrumbItems} />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Workflow Builder
            </h1>
            <p className="text-muted-foreground">
              Create and manage automated rules for ticket routing and notifications
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Layout"
              onClick={() => setShowTemplates(true)}
            >
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Play"
              onClick={() => setShowTestPanel(true)}
            >
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Trash2"
              onClick={handleClearWorkflow}
              disabled={workflowBlocks?.length === 0}
            >
              Clear
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Save"
              onClick={handleSaveWorkflow}
            >
              Save Workflow
            </Button>
          </div>
        </div>

        {/* Workflow Info Bar */}
        <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e?.target?.value)}
                className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 w-full md:w-auto"
                placeholder="Workflow Name"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth ${
                    isActive
                      ? 'bg-success/10 text-success border border-success/30' :'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Layers" size={16} />
                <span>{workflowBlocks?.length} blocks</span>
              </div>
            </div>
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