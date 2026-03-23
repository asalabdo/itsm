import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PipelineVisualization = () => {
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [pipelineData, setPipelineData] = useState([]);
  const [viewMode, setViewMode] = useState('current'); // current, historical

  useEffect(() => {
    const mockPipelineData = [
      {
        id: 'PIPE-001',
        name: 'Employee Portal Release v2.3.1',
        status: 'In Progress',
        currentStage: 'Production Deployment',
        startTime: new Date(2024, 8, 21, 14, 0),
        estimatedCompletion: new Date(2024, 8, 21, 18, 0),
        priority: 'High',
        environment: 'Production',
        stages: [
          {
            name: 'Code Review',
            status: 'Completed',
            duration: 45,
            successRate: 100,
            startTime: new Date(2024, 8, 21, 9, 0),
            endTime: new Date(2024, 8, 21, 9, 45),
            issues: []
          },
          {
            name: 'Build & Test',
            status: 'Completed',
            duration: 120,
            successRate: 98,
            startTime: new Date(2024, 8, 21, 10, 0),
            endTime: new Date(2024, 8, 21, 12, 0),
            issues: ['Minor test flakiness in integration tests']
          },
          {
            name: 'Security Scan',
            status: 'Completed',
            duration: 30,
            successRate: 100,
            startTime: new Date(2024, 8, 21, 12, 0),
            endTime: new Date(2024, 8, 21, 12, 30),
            issues: []
          },
          {
            name: 'Staging Deployment',
            status: 'Completed',
            duration: 60,
            successRate: 100,
            startTime: new Date(2024, 8, 21, 13, 0),
            endTime: new Date(2024, 8, 21, 14, 0),
            issues: []
          },
          {
            name: 'Production Deployment',
            status: 'In Progress',
            duration: null,
            successRate: null,
            startTime: new Date(2024, 8, 21, 14, 0),
            endTime: null,
            issues: []
          },
          {
            name: 'Post-Deploy Verification',
            status: 'Pending',
            duration: null,
            successRate: null,
            startTime: null,
            endTime: null,
            issues: []
          }
        ],
        overallProgress: 75,
        riskLevel: 'Medium',
        rollbackPlan: 'Automated rollback available',
        businessImpact: 'Customer-facing features'
      },
      {
        id: 'PIPE-002',
        name: 'Database Schema Update v1.2.0',
        status: 'Failed',
        currentStage: 'Production Deployment',
        startTime: new Date(2024, 8, 20, 20, 0),
        estimatedCompletion: new Date(2024, 8, 21, 2, 0),
        priority: 'Critical',
        environment: 'Production',
        stages: [
          {
            name: 'Code Review',
            status: 'Completed',
            duration: 60,
            successRate: 100,
            startTime: new Date(2024, 8, 20, 16, 0),
            endTime: new Date(2024, 8, 20, 17, 0),
            issues: []
          },
          {
            name: 'Build & Test',
            status: 'Completed',
            duration: 90,
            successRate: 95,
            startTime: new Date(2024, 8, 20, 17, 30),
            endTime: new Date(2024, 8, 20, 19, 0),
            issues: ['Performance degradation in migration scripts']
          },
          {
            name: 'Security Scan',
            status: 'Completed',
            duration: 25,
            successRate: 100,
            startTime: new Date(2024, 8, 20, 19, 0),
            endTime: new Date(2024, 8, 20, 19, 25),
            issues: []
          },
          {
            name: 'Staging Deployment',
            status: 'Completed',
            duration: 45,
            successRate: 100,
            startTime: new Date(2024, 8, 20, 19, 30),
            endTime: new Date(2024, 8, 20, 20, 15),
            issues: []
          },
          {
            name: 'Production Deployment',
            status: 'Failed',
            duration: 180,
            successRate: 0,
            startTime: new Date(2024, 8, 20, 20, 30),
            endTime: new Date(2024, 8, 20, 23, 30),
            issues: ['Migration timeout', 'Lock contention detected', 'Rollback initiated']
          },
          {
            name: 'Post-Deploy Verification',
            status: 'Skipped',
            duration: null,
            successRate: null,
            startTime: null,
            endTime: null,
            issues: []
          }
        ],
        overallProgress: 85,
        riskLevel: 'High',
        rollbackPlan: 'Manual rollback completed',
        businessImpact: 'Core system functionality'
      },
      {
        id: 'PIPE-003',
        name: 'API Gateway Configuration Update',
        status: 'Completed',
        currentStage: 'Post-Deploy Verification',
        startTime: new Date(2024, 8, 19, 10, 0),
        estimatedCompletion: new Date(2024, 8, 19, 14, 0),
        priority: 'Medium',
        environment: 'Production',
        stages: [
          {
            name: 'Code Review',
            status: 'Completed',
            duration: 30,
            successRate: 100,
            startTime: new Date(2024, 8, 19, 9, 0),
            endTime: new Date(2024, 8, 19, 9, 30),
            issues: []
          },
          {
            name: 'Build & Test',
            status: 'Completed',
            duration: 60,
            successRate: 100,
            startTime: new Date(2024, 8, 19, 10, 0),
            endTime: new Date(2024, 8, 19, 11, 0),
            issues: []
          },
          {
            name: 'Security Scan',
            status: 'Completed',
            duration: 20,
            successRate: 100,
            startTime: new Date(2024, 8, 19, 11, 0),
            endTime: new Date(2024, 8, 19, 11, 20),
            issues: []
          },
          {
            name: 'Staging Deployment',
            status: 'Completed',
            duration: 40,
            successRate: 100,
            startTime: new Date(2024, 8, 19, 11, 30),
            endTime: new Date(2024, 8, 19, 12, 10),
            issues: []
          },
          {
            name: 'Production Deployment',
            status: 'Completed',
            duration: 35,
            successRate: 100,
            startTime: new Date(2024, 8, 19, 12, 30),
            endTime: new Date(2024, 8, 19, 13, 5),
            issues: []
          },
          {
            name: 'Post-Deploy Verification',
            status: 'Completed',
            duration: 30,
            successRate: 100,
            startTime: new Date(2024, 8, 19, 13, 5),
            endTime: new Date(2024, 8, 19, 13, 35),
            issues: []
          }
        ],
        overallProgress: 100,
        riskLevel: 'Low',
        rollbackPlan: 'Not required',
        businessImpact: 'API performance improvement'
      }
    ];
    setPipelineData(mockPipelineData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-success';
      case 'In Progress': return 'text-warning';
      case 'Failed': return 'text-error';
      case 'Pending': return 'text-muted-foreground';
      case 'Skipped': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return 'CheckCircle';
      case 'In Progress': return 'Clock';
      case 'Failed': return 'XCircle';
      case 'Pending': return 'Circle';
      case 'Skipped': return 'Minus';
      default: return 'Circle';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success/10 border-success/20';
      case 'In Progress': return 'bg-warning/10 border-warning/20';
      case 'Failed': return 'bg-error/10 border-error/20';
      case 'Pending': return 'bg-muted/10 border-muted/20';
      case 'Skipped': return 'bg-muted/10 border-muted/20';
      default: return 'bg-muted/10 border-muted/20';
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

  const calculateOverallSuccessRate = () => {
    const completedPipelines = pipelineData?.filter(p => p?.status === 'Completed');
    return pipelineData?.length > 0 ? Math.round((completedPipelines?.length / pipelineData?.length) * 100) : 0;
  };

  const getFailurePoints = () => {
    const failurePoints = {};
    pipelineData?.forEach(pipeline => {
      pipeline?.stages?.forEach(stage => {
        if (stage?.status === 'Failed') {
          failurePoints[stage.name] = (failurePoints?.[stage?.name] || 0) + 1;
        }
      });
    });
    return Object.entries(failurePoints)?.sort((a, b) => b?.[1] - a?.[1]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Release Pipeline Visualization</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Activity" size={16} />
            <span>Success Rate: {calculateOverallSuccessRate()}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'current' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('current')}
          >
            Current
          </Button>
          <Button
            variant={viewMode === 'historical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('historical')}
          >
            Historical
          </Button>
          <Button variant="ghost" size="sm" title="Refresh Pipelines">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>
      {/* Pipeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Active Pipelines</div>
              <div className="text-2xl font-semibold text-foreground">
                {pipelineData?.filter(p => p?.status === 'In Progress')?.length}
              </div>
            </div>
            <Icon name="GitBranch" size={24} className="text-accent" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="text-2xl font-semibold text-success">
                {calculateOverallSuccessRate()}%
              </div>
            </div>
            <Icon name="CheckCircle" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Failed Deployments</div>
              <div className="text-2xl font-semibold text-error">
                {pipelineData?.filter(p => p?.status === 'Failed')?.length}
              </div>
            </div>
            <Icon name="XCircle" size={24} className="text-error" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Avg Deploy Time</div>
              <div className="text-2xl font-semibold text-accent">
                3.2h
              </div>
            </div>
            <Icon name="Timer" size={24} className="text-accent" />
          </div>
        </div>
      </div>
      {/* Pipeline List */}
      <div className="space-y-4">
        {pipelineData?.map(pipeline => (
          <div 
            key={pipeline?.id} 
            className={`bg-card rounded-lg border border-border p-6 cursor-pointer transition-all hover:border-accent/50 ${
              selectedPipeline?.id === pipeline?.id ? 'border-accent bg-accent/5' : ''
            }`}
            onClick={() => setSelectedPipeline(selectedPipeline?.id === pipeline?.id ? null : pipeline)}
          >
            {/* Pipeline Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Icon 
                  name={getStatusIcon(pipeline?.status)} 
                  size={24} 
                  className={getStatusColor(pipeline?.status)} 
                />
                <div>
                  <h4 className="font-medium text-foreground">{pipeline?.name}</h4>
                  <div className="text-sm text-muted-foreground">{pipeline?.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getPriorityColor(pipeline?.priority)}`}>
                  {pipeline?.priority} Priority
                </div>
                <div className="text-xs text-muted-foreground">
                  {pipeline?.environment}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Overall Progress</span>
                <span>{pipeline?.overallProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    pipeline?.status === 'Failed' ? 'bg-error' : 
                    pipeline?.status === 'Completed' ? 'bg-success' : 'bg-accent'
                  }`}
                  style={{ width: `${pipeline?.overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
              {pipeline?.stages?.map((stage, index) => (
                <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                  <div className={`px-3 py-2 rounded-lg border text-xs font-medium ${getStatusBgColor(stage?.status)}`}>
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getStatusIcon(stage?.status)} 
                        size={14} 
                        className={getStatusColor(stage?.status)} 
                      />
                      <span>{stage?.name}</span>
                    </div>
                    {stage?.duration && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {stage?.duration}min
                      </div>
                    )}
                  </div>
                  {index < pipeline?.stages?.length - 1 && (
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            {/* Pipeline Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  Started: {pipeline?.startTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-muted-foreground">
                  Current: {pipeline?.currentStage}
                </span>
              </div>
              <div className="text-muted-foreground">
                Risk: {pipeline?.riskLevel}
              </div>
            </div>

            {/* Expanded Details */}
            {selectedPipeline?.id === pipeline?.id && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stage Details */}
                  <div>
                    <h5 className="font-medium text-foreground mb-3">Stage Details</h5>
                    <div className="space-y-3">
                      {pipeline?.stages?.map((stage, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Icon 
                            name={getStatusIcon(stage?.status)} 
                            size={16} 
                            className={`${getStatusColor(stage?.status)} mt-0.5`} 
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{stage?.name}</span>
                              {stage?.successRate !== null && (
                                <span className="text-xs text-muted-foreground">
                                  {stage?.successRate}% success
                                </span>
                              )}
                            </div>
                            {stage?.duration && (
                              <div className="text-xs text-muted-foreground">
                                Duration: {stage?.duration} minutes
                              </div>
                            )}
                            {stage?.issues?.length > 0 && (
                              <div className="mt-1">
                                {stage?.issues?.map((issue, issueIndex) => (
                                  <div key={issueIndex} className="text-xs text-error bg-error/10 px-2 py-1 rounded mt-1">
                                    {issue}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pipeline Metadata */}
                  <div>
                    <h5 className="font-medium text-foreground mb-3">Pipeline Information</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business Impact:</span>
                        <span className="text-foreground">{pipeline?.businessImpact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <span className="text-foreground">{pipeline?.riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rollback Plan:</span>
                        <span className="text-foreground">{pipeline?.rollbackPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span className="text-foreground">
                          {pipeline?.startTime?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Completion:</span>
                        <span className="text-foreground">
                          {pipeline?.estimatedCompletion?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Failure Analysis */}
      {getFailurePoints()?.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium text-foreground mb-4 flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span>Common Failure Points</span>
          </h4>
          <div className="space-y-2">
            {getFailurePoints()?.map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{stage}</span>
                <span className="text-error font-medium">{count} failure{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineVisualization;