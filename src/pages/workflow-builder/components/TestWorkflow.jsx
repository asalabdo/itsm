import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const TestWorkflow = ({ workflow, onClose }) => {
  const [testData, setTestData] = useState({
    category: 'incident',
    priority: 'high',
    customerTier: 'enterprise',
    subject: 'Test ticket for workflow validation',
  });
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTest = () => {
    setIsRunning(true);
    
    // Simulate workflow execution
    setTimeout(() => {
      const results = {
        success: true,
        executedBlocks: workflow?.blocks?.length,
        steps: workflow?.blocks?.map((block, index) => ({
          blockName: block?.name,
          status: 'success',
          message: `${block?.name} executed successfully`,
          timestamp: new Date()?.toISOString(),
        })),
        finalState: {
          assignedTo: 'Sarah Alrashedea',
          team: 'Technical Support',
          status: 'In Progress',
          priority: testData?.priority,
          tags: ['automated', 'workflow-test'],
        },
      };
      setTestResults(results);
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Test Workflow</h2>
            <p className="text-sm text-muted-foreground">
              Simulate workflow execution with sample data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Workflow Info */}
          <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Workflow" size={20} color="var(--color-primary)" />
              <h3 className="font-semibold text-foreground">{workflow?.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {workflow?.blocks?.length} blocks configured
            </p>
          </div>

          {/* Test Data Input */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Test Data</h3>
            
            <Select
              label="Ticket Category"
              options={[
                { value: 'incident', label: 'Incident' },
                { value: 'problem', label: 'Problem' },
                { value: 'change', label: 'Change Request' },
              ]}
              value={testData?.category}
              onChange={(value) => setTestData({ ...testData, category: value })}
            />

            <Select
              label="Priority"
              options={[
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              value={testData?.priority}
              onChange={(value) => setTestData({ ...testData, priority: value })}
            />

            <Select
              label="Customer Tier"
              options={[
                { value: 'enterprise', label: 'Enterprise' },
                { value: 'business', label: 'Business' },
                { value: 'standard', label: 'Standard' },
                { value: 'free', label: 'Free' },
              ]}
              value={testData?.customerTier}
              onChange={(value) => setTestData({ ...testData, customerTier: value })}
            />

            <Input
              label="Subject"
              type="text"
              value={testData?.subject}
              onChange={(e) => setTestData({ ...testData, subject: e?.target?.value })}
              placeholder="Enter test ticket subject"
            />
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">Test Results</h3>
              
              {/* Success Banner */}
              <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                  <div>
                    <p className="font-medium text-success">Workflow executed successfully</p>
                    <p className="text-sm text-muted-foreground">
                      {testResults?.executedBlocks} blocks processed
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution Steps */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Execution Steps:</p>
                {testResults?.steps?.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="Check" size={14} color="var(--color-success)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{step?.blockName}</p>
                      <p className="text-xs text-muted-foreground">{step?.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final State */}
              <div className="bg-background border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">Final Ticket State:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                    <p className="text-sm font-medium text-foreground">{testResults?.finalState?.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Team</p>
                    <p className="text-sm font-medium text-foreground">{testResults?.finalState?.team}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-medium text-foreground">{testResults?.finalState?.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <p className="text-sm font-medium text-foreground capitalize">{testResults?.finalState?.priority}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {testResults?.finalState?.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            iconName="Play"
            onClick={handleRunTest}
            loading={isRunning}
            disabled={isRunning || workflow?.blocks?.length === 0}
          >
            {isRunning ? 'Running Test...' : 'Run Test'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestWorkflow;