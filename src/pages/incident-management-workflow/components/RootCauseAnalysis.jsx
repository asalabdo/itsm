import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const RootCauseAnalysis = ({ incident }) => {
  const navigate = useNavigate();
  const [activeTemplate, setActiveTemplate] = useState('5-whys');
  const [analysisData, setAnalysisData] = useState({
    '5-whys': {
      problem: 'Email server is down and users cannot send/receive emails',
      whys: [
        { question: 'Why is the email server down?', answer: 'Database connection pool exhausted' },
        { question: 'Why is the connection pool exhausted?', answer: 'Too many concurrent connections from email service' },
        { question: 'Why are there too many concurrent connections?', answer: 'Connection pooling not configured properly' },
        { question: 'Why was connection pooling not configured properly?', answer: 'Configuration was reset during last maintenance' },
        { question: 'Why was the configuration reset?', answer: 'Maintenance procedure did not include configuration backup step' }
      ],
      rootCause: 'Maintenance procedure lacks configuration backup step',
      preventiveActions: [
        'Update maintenance procedure to include configuration backup',
        'Implement automated configuration backup before maintenance',
        'Create post-maintenance configuration verification checklist'
      ]
    },
    'fishbone': {
      problem: 'Email server outage',
      categories: {
        'People': ['Maintenance team unfamiliar with backup procedures', 'No dedicated DBA on maintenance team'],
        'Process': ['Incomplete maintenance checklist', 'No configuration backup step', 'Inadequate testing process'],
        'Technology': ['Database connection pooling misconfigured', 'No automated backup system', 'Monitoring alerts delayed'],
        'Environment': ['Maintenance performed during business hours', 'No redundant email server', 'Single point of failure']
      },
      rootCause: 'Process gap in maintenance procedure',
      solutions: [
        'Implement automated configuration management',
        'Add pre/post maintenance validation steps',
        'Deploy redundant email infrastructure'
      ]
    }
  });

  const [knowledgeBase, setKnowledgeBase] = useState({
    title: '',
    category: 'Infrastructure',
    tags: '',
    problemStatement: '',
    rootCause: '',
    solution: '',
    preventiveMeasures: ''
  });

  const [showKBForm, setShowKBForm] = useState(false);

  const analysisTemplates = [
    { id: '5-whys', name: '5 Whys Analysis', icon: 'HelpCircle' },
    { id: 'fishbone', name: 'Fishbone Diagram', icon: 'GitBranch' }
  ];

  const handleWhyUpdate = (index, field, value) => {
    setAnalysisData(prev => ({
      ...prev,
      '5-whys': {
        ...prev?.['5-whys'],
        whys: prev?.['5-whys']?.whys?.map((why, i) => 
          i === index ? { ...why, [field]: value } : why
        )
      }
    }));
  };

  const handleRootCauseUpdate = (template, rootCause) => {
    setAnalysisData(prev => ({
      ...prev,
      [template]: { ...prev?.[template], rootCause }
    }));
  };

  const handleCategoryUpdate = (category, items) => {
    setAnalysisData(prev => ({
      ...prev,
      fishbone: {
        ...prev?.fishbone,
        categories: { ...prev?.fishbone?.categories, [category]: items }
      }
    }));
  };

  const handleKBSubmit = () => {
    // Auto-populate from current analysis
    const currentAnalysis = analysisData?.[activeTemplate];
    setKnowledgeBase(prev => ({
      ...prev,
      title: `${incident?.title} - Root Cause Analysis`,
      problemStatement: activeTemplate === '5-whys' ? currentAnalysis?.problem : currentAnalysis?.problem,
      rootCause: currentAnalysis?.rootCause,
      solution: currentAnalysis?.preventiveActions?.join('; ') || currentAnalysis?.solutions?.join('; '),
      preventiveMeasures: currentAnalysis?.preventiveActions?.join('\n') || currentAnalysis?.solutions?.join('\n')
    }));
    
    setShowKBForm(false);
    localStorage.setItem('incidentKnowledgeBaseDraft', JSON.stringify(knowledgeBase));
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Search" size={20} />
            <span>Root Cause Analysis</span>
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e?.target?.value)}
              className="px-3 py-1.5 bg-background border border-border rounded text-sm text-foreground"
            >
              {analysisTemplates?.map(template => (
                <option key={template?.id} value={template?.id}>{template?.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowKBForm(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-success text-success-foreground text-sm rounded-lg hover:bg-success/90 transition-colors"
            >
              <Icon name="BookOpen" size={14} />
              <span>Save to KB</span>
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* 5 Whys Analysis */}
        {activeTemplate === '5-whys' && (
          <div className="space-y-6">
            {/* Problem Statement */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Problem Statement
              </label>
              <textarea
                value={analysisData?.['5-whys']?.problem}
                onChange={(e) => setAnalysisData(prev => ({
                  ...prev,
                  '5-whys': { ...prev?.['5-whys'], problem: e?.target?.value }
                }))}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                rows={2}
              />
            </div>

            {/* 5 Whys Questions */}
            <div>
              <h4 className="font-medium text-foreground mb-4">5 Whys Investigation</h4>
              <div className="space-y-4">
                {analysisData?.['5-whys']?.whys?.map((why, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Why #{index + 1}?
                          </label>
                          <input
                            type="text"
                            value={why?.question}
                            onChange={(e) => handleWhyUpdate(index, 'question', e?.target?.value)}
                            className="w-full p-2 bg-background border border-border rounded text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Answer
                          </label>
                          <input
                            type="text"
                            value={why?.answer}
                            onChange={(e) => handleWhyUpdate(index, 'answer', e?.target?.value)}
                            className="w-full p-2 bg-background border border-border rounded text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Cause */}
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                <Icon name="Target" size={16} className="text-error" />
                <span>Identified Root Cause</span>
              </h4>
              <textarea
                value={analysisData?.['5-whys']?.rootCause}
                onChange={(e) => handleRootCauseUpdate('5-whys', e?.target?.value)}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                rows={2}
              />
            </div>

            {/* Preventive Actions */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Preventive Actions</h4>
              <div className="space-y-2">
                {analysisData?.['5-whys']?.preventiveActions?.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                    <input
                      type="text"
                      value={action}
                      onChange={(e) => {
                        const newActions = [...analysisData?.['5-whys']?.preventiveActions];
                        newActions[index] = e?.target?.value;
                        setAnalysisData(prev => ({
                          ...prev,
                          '5-whys': { ...prev?.['5-whys'], preventiveActions: newActions }
                        }));
                      }}
                      className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newActions = [...analysisData?.['5-whys']?.preventiveActions, 'New preventive action'];
                    setAnalysisData(prev => ({
                      ...prev,
                      '5-whys': { ...prev?.['5-whys'], preventiveActions: newActions }
                    }));
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="Plus" size={14} />
                  <span>Add Preventive Action</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fishbone Diagram */}
        {activeTemplate === 'fishbone' && (
          <div className="space-y-6">
            {/* Problem Statement */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Problem Statement
              </label>
              <input
                type="text"
                value={analysisData?.fishbone?.problem}
                onChange={(e) => setAnalysisData(prev => ({
                  ...prev,
                  fishbone: { ...prev?.fishbone, problem: e?.target?.value }
                }))}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-medium text-foreground mb-4">Cause Categories</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysisData?.fishbone?.categories)?.map(([category, items]) => (
                  <div key={category} className="bg-muted/30 rounded-lg p-4">
                    <h5 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Icon name="Tag" size={16} />
                      <span>{category}</span>
                    </h5>
                    <div className="space-y-2">
                      {items?.map((item, index) => (
                        <input
                          key={index}
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index] = e?.target?.value;
                            handleCategoryUpdate(category, newItems);
                          }}
                          className="w-full p-2 bg-background border border-border rounded text-sm text-foreground"
                        />
                      ))}
                      <button
                        onClick={() => {
                          const newItems = [...items, 'New cause'];
                          handleCategoryUpdate(category, newItems);
                        }}
                        className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Plus" size={12} />
                        <span>Add cause</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Cause */}
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                <Icon name="Target" size={16} className="text-error" />
                <span>Identified Root Cause</span>
              </h4>
              <textarea
                value={analysisData?.fishbone?.rootCause}
                onChange={(e) => handleRootCauseUpdate('fishbone', e?.target?.value)}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                rows={2}
              />
            </div>

            {/* Solutions */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Proposed Solutions</h4>
              <div className="space-y-2">
                {analysisData?.fishbone?.solutions?.map((solution, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <Icon name="Lightbulb" size={16} className="text-success mt-0.5 flex-shrink-0" />
                    <input
                      type="text"
                      value={solution}
                      onChange={(e) => {
                        const newSolutions = [...analysisData?.fishbone?.solutions];
                        newSolutions[index] = e?.target?.value;
                        setAnalysisData(prev => ({
                          ...prev,
                          fishbone: { ...prev?.fishbone, solutions: newSolutions }
                        }));
                      }}
                      className="flex-1 bg-transparent border-none text-foreground focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex space-x-2">
            <button onClick={() => navigate('/reports-analytics')} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
              Generate Report
            </button>
            <button
              onClick={async () => {
                const text = `${incident?.title}: ${analysisData?.[activeTemplate]?.rootCause || 'Root cause not set'}`;
                if (navigator?.clipboard?.writeText) {
                  await navigator.clipboard.writeText(text);
                }
              }}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
            >
              Share Analysis
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button onClick={() => navigate('/change-management')} className="px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-colors">
              Create Change Request
            </button>
            <button onClick={() => navigate('/incident-management-workflow')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Implement Solutions
            </button>
          </div>
        </div>
      </div>
      {/* Knowledge Base Form Modal */}
      {showKBForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Create Knowledge Base Article</h3>
                <button
                  onClick={() => setShowKBForm(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => { e?.preventDefault(); handleKBSubmit(); }} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={knowledgeBase?.title}
                      onChange={(e) => setKnowledgeBase(prev => ({ ...prev, title: e?.target?.value }))}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      value={knowledgeBase?.category}
                      onChange={(e) => setKnowledgeBase(prev => ({ ...prev, category: e?.target?.value }))}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Database">Database</option>
                      <option value="Network">Network</option>
                      <option value="Application">Application</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={knowledgeBase?.tags}
                    onChange={(e) => setKnowledgeBase(prev => ({ ...prev, tags: e?.target?.value }))}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder="email, server, outage, database"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Problem Description *
                  </label>
                  <textarea
                    value={knowledgeBase?.problemStatement}
                    onChange={(e) => setKnowledgeBase(prev => ({ ...prev, problemStatement: e?.target?.value }))}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Root Cause *
                  </label>
                  <textarea
                    value={knowledgeBase?.rootCause}
                    onChange={(e) => setKnowledgeBase(prev => ({ ...prev, rootCause: e?.target?.value }))}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Solution Steps *
                  </label>
                  <textarea
                    value={knowledgeBase?.solution}
                    onChange={(e) => setKnowledgeBase(prev => ({ ...prev, solution: e?.target?.value }))}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preventive Measures
                  </label>
                  <textarea
                    value={knowledgeBase?.preventiveMeasures}
                    onChange={(e) => setKnowledgeBase(prev => ({ ...prev, preventiveMeasures: e?.target?.value }))}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowKBForm(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors"
                >
                  Create Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootCauseAnalysis;
