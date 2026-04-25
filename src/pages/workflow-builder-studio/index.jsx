import { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ComponentPalette from './components/ComponentPalette';
import WorkflowCanvas from './components/WorkflowCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import TemplateLibrary from './components/TemplateLibrary';
import ValidationPanel from './components/ValidationPanel';
import WorkflowToolbar from './components/WorkflowToolbar';
import WorkflowStatusStrip from '../../components/ui/WorkflowStatusStrip';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const WorkflowBuilderStudio = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [isValidationPanelOpen, setIsValidationPanelOpen] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState(t('untitledWorkflowName', 'Untitled Workflow'));
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const validationResults = [
    {
      type: 'error',
      message: t('missingEndNode', 'Missing end node'),
      details: t('everyWorkflowMustHave', 'Every workflow must have at least one end node to properly terminate execution'),
      suggestion: t('addEndNode', 'Add an End Node from the Workflow Steps category')
    },
    {
      type: 'warning',
      message: t('unconnectedNode', 'Unconnected node detected'),
      details: t('nodeNotConnected', 'Node "Task Step" is not connected to any other nodes in the workflow'),
      suggestion: t('connectNode', 'Connect this node to establish proper workflow flow')
    },
    {
      type: 'suggestion',
      message: t('considerErrorHandling', 'Consider adding error handling'),
      details: t('workflowBenefit', 'Your workflow could benefit from error handling nodes for better resilience'),
      suggestion: t('addConditional', 'Add conditional nodes to handle potential failures')
    }
  ];

  const deploymentReadiness = (() => {
    const errorCount = validationResults.filter((result) => result.type === 'error').length;
    const warningCount = validationResults.filter((result) => result.type === 'warning').length;

    if (errorCount > 0) {
      return {
        state: 'blocked',
        label: t('deploymentBlocked', 'Blocked for deployment'),
        tone: 'destructive',
        description: t('resolveErrorsBeforeDeploy', 'Resolve validation errors before deploying this workflow')
      };
    }

    if (warningCount > 0) {
      return {
        state: 'review',
        label: t('deploymentReview', 'Ready for review'),
        tone: 'warning',
        description: t('reviewWarningsBeforeDeploy', 'Review validation warnings before deployment')
      };
    }

    return {
      state: 'ready',
      label: t('deploymentReady', 'Ready for deployment'),
      tone: 'success',
      description: t('workflowReadyToDeploy', 'No validation issues remain')
    };
  })();

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

  const workflowSteps = isArabic ? [
    'الاستقبال',
    'مطابقة الخدمة والمنظمة',
    'مراجعة المدير',
    'توزيع ERP',
    'إرسال الطرف الثالث',
    'الإغلاق'
  ] : [
    t('intake', 'Intake'),
    t('serviceOrgMatch', 'Service + org match'),
    t('managerReview', 'Manager review'),
    t('erpFanOut', 'ERP user fan-out'),
    t('thirdPartySubmit', 'Third-party submit'),
    t('closeStep', 'Close')
  ];

  const activeWorkflowStep = nodes.length === 0
    ? 0
    : Math.min(workflowSteps.length - 1, Math.max(1, Math.ceil(nodes.length / 2)));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <div className="pt-16 h-screen flex flex-col">
        <div className="px-4 py-3 md:px-6 lg:px-8">
          <ManageEngineOnPremSnapshot
            compact
            title={isArabic ? 'إشارات منشئ سير العمل في ManageEngine' : t('manageEngineWorkflowBuilderSignals', 'ManageEngine Workflow Builder Signals')}
            description={isArabic ? 'استخدم طلبات ServiceDesk مع خدمات وتنبيهات OpManager 12.8.270 أثناء تصميم مسارات الأتمتة.' : t('manageEngineWorkflowBuilderSignalsDesc', 'Use ServiceDesk requests plus OpManager 12.8.270 services and alerts while designing automation paths.')}
          />
        </div>

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
          deploymentReadiness={deploymentReadiness}
        />

        <div className="px-4 md:px-6 pt-4">
          <WorkflowStatusStrip
            title={isArabic ? 'منشئ سير العمل' : t('workflowBuilderStudio', 'Workflow Builder')}
            subtitle={isArabic ? 'صمم مساراً ينسجم مع الخدمة والمنظمة ومراجعة المدير وتوزيع ERP.' : t('workflowBuilderDescription', 'Design the route that matches service, organization, manager review, and ERP dispatch.')}
            service={workflowName}
            organization={isArabic ? 'منظمة غير معينة' : t('organizationAwareRouting', 'Organization-aware routing')}
            mode={isArabic ? 'وضع المنشئ' : t('builderMode', 'Builder mode')}
            lastAction={isSaving ? (isArabic ? 'جارٍ حفظ تغييرات سير العمل' : t('savingWorkflow', 'Saving workflow changes')) : (isArabic ? `تحتوي اللوحة على ${nodes.length} عقدة و${connections.length} اتصال` : t('canvasContains', `Canvas contains ${nodes.length} node(s) and ${connections.length} connection(s)`))}
            activeStep={activeWorkflowStep}
            steps={workflowSteps}
            deploymentReadiness={deploymentReadiness}
          />
        </div>

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
