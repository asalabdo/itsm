import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApprovalWorkflow = () => {
  const [workflowData, setWorkflowData] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const mockWorkflowData = [
      {
        id: 'WF-001',
        changeId: 'CHG-2024-001',
        title: 'Database Migration - Production',
        currentStep: 'CAB Review',
        totalSteps: 5,
        completedSteps: 2,
        status: 'In Progress',
        priority: 'High',
        submittedDate: new Date(2024, 8, 18, 10, 0),
        estimatedCompletion: new Date(2024, 8, 22, 16, 0),
        steps: [
          { name: 'Initial Review', status: 'Completed', approver: 'IT Manager', completedAt: new Date(2024, 8, 18, 14, 0), duration: 4 },
          { name: 'Technical Assessment', status: 'Completed', approver: 'Lead Architect', completedAt: new Date(2024, 8, 19, 11, 0), duration: 21 },
          { name: 'CAB Review', status: 'In Progress', approver: 'Change Advisory Board', startedAt: new Date(2024, 8, 20, 9, 0), duration: null },
          { name: 'Final Approval', status: 'Pending', approver: 'IT Director', startedAt: null, duration: null },
          { name: 'Implementation Authorization', status: 'Pending', approver: 'Operations Manager', startedAt: null, duration: null }
        ],
        bottleneck: 'CAB Review',
        averageStepTime: 12.5,
        riskLevel: 'Medium'
      },
      {
        id: 'WF-002',
        changeId: 'CHG-2024-002',
        title: 'Security Patch Deployment',
        currentStep: 'Emergency Approval',
        totalSteps: 3,
        completedSteps: 1,
        status: 'Fast Track',
        priority: 'Critical',
        submittedDate: new Date(2024, 8, 21, 8, 0),
        estimatedCompletion: new Date(2024, 8, 21, 12, 0),
        steps: [
          { name: 'Emergency Assessment', status: 'Completed', approver: 'Security Manager', completedAt: new Date(2024, 8, 21, 8, 30), duration: 0.5 },
          { name: 'Emergency Approval', status: 'In Progress', approver: 'IT Director', startedAt: new Date(2024, 8, 21, 8, 30), duration: null },
          { name: 'Implementation Authorization', status: 'Pending', approver: 'Operations Manager', startedAt: null, duration: null }
        ],
        bottleneck: null,
        averageStepTime: 2,
        riskLevel: 'High'
      },
      {
        id: 'WF-003',
        changeId: 'CHG-2024-003',
        title: 'Application Update - Test Environment',
        currentStep: 'Completed',
        totalSteps: 4,
        completedSteps: 4,
        status: 'Approved',
        priority: 'Medium',
        submittedDate: new Date(2024, 8, 17, 14, 0),
        estimatedCompletion: new Date(2024, 8, 20, 9, 0),
        steps: [
          { name: 'Initial Review', status: 'Completed', approver: 'Team Lead', completedAt: new Date(2024, 8, 17, 16, 0), duration: 2 },
          { name: 'Technical Review', status: 'Completed', approver: 'Senior Developer', completedAt: new Date(2024, 8, 18, 10, 0), duration: 18 },
          { name: 'Test Environment Approval', status: 'Completed', approver: 'QA Manager', completedAt: new Date(2024, 8, 19, 14, 0), duration: 28 },
          { name: 'Implementation Authorization', status: 'Completed', approver: 'Operations Manager', completedAt: new Date(2024, 8, 20, 8, 0), duration: 18 }
        ],
        bottleneck: 'Test Environment Approval',
        averageStepTime: 16.5,
        riskLevel: 'Low'
      }
    ];
    setWorkflowData(mockWorkflowData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-success';
      case 'In Progress': return 'text-warning';
      case 'Pending': return 'text-muted-foreground';
      case 'Fast Track': return 'text-accent';
      case 'Approved': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return 'CheckCircle';
      case 'In Progress': return 'Clock';
      case 'Pending': return 'Circle';
      case 'Fast Track': return 'Zap';
      case 'Approved': return 'CheckCircle2';
      default: return 'Circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-error';
      case 'High': return 'text-warning';
      case 'Medium': return 'text-accent';
      case 'Low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const calculateAverageApprovalTime = () => {
    const completedWorkflows = workflowData?.filter(wf => wf?.status === 'Approved');
    if (completedWorkflows?.length === 0) return 0;
    
    const totalTime = completedWorkflows?.reduce((sum, wf) => sum + wf?.averageStepTime, 0);
    return (totalTime / completedWorkflows?.length)?.toFixed(1);
  };

  const getBottleneckSteps = () => {
    const bottlenecks = {};
    workflowData?.forEach(wf => {
      if (wf?.bottleneck) {
        bottlenecks[wf.bottleneck] = (bottlenecks?.[wf?.bottleneck] || 0) + 1;
      }
    });
    return Object.entries(bottlenecks)?.sort((a, b) => b?.[1] - a?.[1]);
  };

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-foreground">Approval Workflow Status</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>Avg: {calculateAverageApprovalTime()}h</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="text-sm border border-border rounded px-2 py-1 bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="ghost" size="sm" title="Refresh Data">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>
      {/* Workflow Summary Cards */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Active Workflows</div>
                <div className="text-2xl font-semibold text-foreground">
                  {workflowData?.filter(wf => wf?.status === 'In Progress' || wf?.status === 'Fast Track')?.length}
                </div>
              </div>
              <Icon name="GitBranch" size={24} className="text-accent" />
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Avg Approval Time</div>
                <div className="text-2xl font-semibold text-foreground">
                  {calculateAverageApprovalTime()}h
                </div>
              </div>
              <Icon name="Timer" size={24} className="text-warning" />
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Bottlenecks</div>
                <div className="text-2xl font-semibold text-foreground">
                  {getBottleneckSteps()?.length}
                </div>
              </div>
              <Icon name="AlertTriangle" size={24} className="text-error" />
            </div>
          </div>
        </div>
      </div>
      {/* Workflow List */}
      <div className="p-4">
        <div className="space-y-4">
          {workflowData?.map(workflow => (
            <div 
              key={workflow?.id} 
              className={`border border-border rounded-lg p-4 cursor-pointer transition-all hover:border-accent/50 ${
                selectedWorkflow?.id === workflow?.id ? 'border-accent bg-accent/5' : ''
              }`}
              onClick={() => setSelectedWorkflow(selectedWorkflow?.id === workflow?.id ? null : workflow)}
            >
              {/* Workflow Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={getStatusIcon(workflow?.status)} 
                    size={20} 
                    className={getStatusColor(workflow?.status)} 
                  />
                  <div>
                    <div className="font-medium text-foreground">{workflow?.title}</div>
                    <div className="text-sm text-muted-foreground">{workflow?.changeId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getPriorityColor(workflow?.priority)}`}>
                    {workflow?.priority}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Step {workflow?.completedSteps}/{workflow?.totalSteps}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round((workflow?.completedSteps / workflow?.totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${(workflow?.completedSteps / workflow?.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Step */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium text-foreground">{workflow?.currentStep}</span>
                  {workflow?.bottleneck === workflow?.currentStep && (
                    <Icon name="AlertCircle" size={16} className="text-warning" title="Bottleneck detected" />
                  )}
                </div>
                <div className="text-muted-foreground">
                  Est: {workflow?.estimatedCompletion?.toLocaleDateString()}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedWorkflow?.id === workflow?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="space-y-3">
                    {workflow?.steps?.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Icon 
                            name={getStatusIcon(step?.status)} 
                            size={16} 
                            className={getStatusColor(step?.status)} 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{step?.name}</span>
                            <span className="text-xs text-muted-foreground">{step?.approver}</span>
                          </div>
                          {step?.duration && (
                            <div className="text-xs text-muted-foreground">
                              Duration: {step?.duration}h
                              {step?.completedAt && (
                                <span className="ml-2">
                                  Completed: {step?.completedAt?.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Bottleneck Analysis */}
      {getBottleneckSteps()?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span>Identified Bottlenecks</span>
          </h4>
          <div className="space-y-2">
            {getBottleneckSteps()?.slice(0, 3)?.map(([step, count]) => (
              <div key={step} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{step}</span>
                <span className="text-warning font-medium">{count} occurrence{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;