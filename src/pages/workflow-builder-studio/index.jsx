import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ComponentPalette from './components/ComponentPalette';
import WorkflowCanvas from './components/WorkflowCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import TemplateLibrary from './components/TemplateLibrary';
import ValidationPanel from './components/ValidationPanel';
import WorkflowToolbar from './components/WorkflowToolbar';

const WorkflowBuilderStudio = () => {
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [isValidationPanelOpen, setIsValidationPanelOpen] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const validationResults = [
    {
      type: 'error',
      message: 'Missing end node',
      details: 'Every workflow must have at least one end node to properly terminate execution',
      suggestion: 'Add an End Node from the Workflow Steps category'
    },
    {
      type: 'warning',
      message: 'Unconnected node detected',
      details: 'Node "Task Step" is not connected to any other nodes in the workflow',
      suggestion: 'Connect this node to establish proper workflow flow'
    },
    {
      type: 'suggestion',
      message: 'Consider adding error handling',
      details: 'Your workflow could benefit from error handling nodes for better resilience',
      suggestion: 'Add conditional nodes to handle potential failures'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e?.ctrlKey || e?.metaKey) && e?.key === 's') {
        e?.preventDefault();
        handleSave();
      }
      if ((e?.ctrlKey || e?.metaKey) && e?.key === 'z') {
        e?.preventDefault();
        handleUndo();
      }
      if ((e?.ctrlKey || e?.metaKey) && e?.key === 'y') {
        e?.preventDefault();
        handleRedo();
      }
      if ((e?.key === 'Delete' || e?.key === 'Backspace') && selectedNode) {
        e?.preventDefault();
        handleNodeDelete(selectedNode?.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, historyIndex]);

  const addToHistory = (newNodes, newConnections) => {
    const newHistory = history?.slice(0, historyIndex + 1);
    newHistory?.push({ nodes: newNodes, connections: newConnections });
    setHistory(newHistory);
    setHistoryIndex(newHistory?.length - 1);
  };

  const handleNodeAdd = (node) => {
    const newNodes = [...nodes, node];
    setNodes(newNodes);
    addToHistory(newNodes, connections);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const handleNodeUpdate = (updatedNode) => {
    const newNodes = nodes?.map(n => n?.id === updatedNode?.id ? updatedNode : n);
    setNodes(newNodes);
    setSelectedNode(updatedNode);
    addToHistory(newNodes, connections);
  };

  const handleNodeDelete = (nodeId) => {
    const newNodes = nodes?.filter(n => n?.id !== nodeId);
    const newConnections = connections?.filter(c => c?.source !== nodeId && c?.target !== nodeId);
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNode(null);
    addToHistory(newNodes, newConnections);
  };

  const handleConnectionAdd = (connection) => {
    const newConnections = [...connections, connection];
    setConnections(newConnections);
    addToHistory(nodes, newConnections);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      window.dispatchEvent(new CustomEvent('itsm:refresh', {
        detail: { source: 'workflow-builder-studio', action: 'save' }
      }));
    }, 1000);
  };

  const handlePreview = () => {
    setIsValidationPanelOpen(true);
  };

  const handleExport = () => {
    const workflowData = {
      name: workflowName,
      nodes,
      connections,
      exportedAt: new Date()?.toISOString()
    };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName?.replace(/\s+/g, '-')?.toLowerCase()}.json`;
    a?.click();
    URL.revokeObjectURL(url);
  };

  const handleTemplateSelect = (template) => {
    setWorkflowName(template?.name || workflowName);
    setIsTemplateLibraryOpen(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history?.[newIndex];
      setNodes(state?.nodes);
      setConnections(state?.connections);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history?.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history?.[newIndex];
      setNodes(state?.nodes);
      setConnections(state?.connections);
      setHistoryIndex(newIndex);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 h-screen flex flex-col">
        <WorkflowToolbar
          workflowName={workflowName}
          onSave={handleSave}
          onPreview={handlePreview}
          onExport={handleExport}
          onTemplateOpen={() => setIsTemplateLibraryOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history?.length - 1}
          isSaving={isSaving}
        />

        <div className="flex-1 flex overflow-hidden">
          <ComponentPalette
            isCollapsed={isPaletteCollapsed}
            onToggle={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
            onDragStart={() => {}}
          />

          <WorkflowCanvas
            nodes={nodes}
            connections={connections}
            onNodeAdd={handleNodeAdd}
            onNodeSelect={handleNodeSelect}
            onNodeUpdate={handleNodeUpdate}
            onConnectionAdd={handleConnectionAdd}
            selectedNode={selectedNode}
          />

          <PropertiesPanel
            selectedNode={selectedNode}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            isCollapsed={isPropertiesCollapsed}
            onToggle={() => setIsPropertiesCollapsed(!isPropertiesCollapsed)}
          />
        </div>
      </div>
      <TemplateLibrary
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        onTemplateSelect={handleTemplateSelect}
      />
      <ValidationPanel
        isOpen={isValidationPanelOpen}
        onClose={() => setIsValidationPanelOpen(false)}
        validationResults={validationResults}
      />
    </div>
  );
};

export default WorkflowBuilderStudio;
