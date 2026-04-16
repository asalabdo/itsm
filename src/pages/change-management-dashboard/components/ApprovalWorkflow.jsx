import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApprovalWorkflow = ({ changes = [] }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const workflowData = useMemo(() => (changes || []).map((change, index) => {
    const totalSteps = change?.status === 'Completed' ? 4 : change?.status === 'Approved' ? 3 : 5;
    const completedSteps = change?.status === 'Completed' ? totalSteps : change?.status === 'Approved' ? totalSteps - 1 : Math.max(1, Math.min(2, index + 1));
    const status = change?.status === 'Completed' ? 'Approved' : change?.status === 'Implementing' ? 'In Progress' : 'Pending';
    const createdAt = new Date(change?.createdAt || Date.now());
    const scheduled = new Date(change?.scheduledEndDate || new Date(createdAt.getTime() + 72 * 60 * 60 * 1000));
    return {
      id: `WF-${change?.id || index + 1}`,
      changeId: change?.changeNumber || `CHG-${change?.id || index + 1}`,
      title: change?.title || 'Untitled Change',
      currentStep: status === 'Approved' ? 'الموافقة النهائية' : status === 'In Progress' ? 'مراجعة التنفيذ' : 'المراجعة الأولية',
      totalSteps,
      completedSteps,
      status,
      priority: change?.priority || 'Medium',
      submittedDate: createdAt,
      estimatedCompletion: scheduled,
      steps: [
        { name: 'المراجعة الأولية', status: 'Completed', approver: 'مدير التغيير', completedAt: createdAt, duration: 2 },
        { name: 'مراجعة مجلس التغيير', status: completedSteps > 1 ? 'Completed' : 'Pending', approver: 'CAB', completedAt: completedSteps > 1 ? createdAt : null, duration: completedSteps > 1 ? 6 : null },
        { name: 'اعتماد التنفيذ', status: status === 'Approved' ? 'Completed' : 'Pending', approver: 'مدير العمليات', completedAt: status === 'Approved' ? scheduled : null, duration: status === 'Approved' ? 4 : null }
      ],
      bottleneck: status === 'Pending' ? 'CAB Review' : null,
      averageStepTime: Math.max(1, Number((scheduled - createdAt) / 36e5 / Math.max(1, totalSteps)).toFixed(1)),
      riskLevel: change?.riskLevel || 'Low'
    };
  }), [changes]);

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
          <h3 className="text-lg font-semibold text-foreground">حالة سير الموافقات</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>المتوسط: {calculateAverageApprovalTime()} ساعة</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="text-sm border border-border rounded px-2 py-1 bg-background"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يومًا</option>
            <option value="90d">آخر 90 يومًا</option>
          </select>
          <Button variant="ghost" size="sm" title="تحديث البيانات">
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
                <div className="text-sm text-muted-foreground">سير العمل النشط</div>
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
                <div className="text-sm text-muted-foreground">متوسط وقت الموافقة</div>
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
                <div className="text-sm text-muted-foreground">نقاط الاختناق</div>
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
                    الخطوة {workflow?.completedSteps}/{workflow?.totalSteps}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>التقدم</span>
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
                  <span className="text-muted-foreground">الحالية:</span>
                  <span className="font-medium text-foreground">{workflow?.currentStep}</span>
                    {workflow?.bottleneck === workflow?.currentStep && (
                    <Icon name="AlertCircle" size={16} className="text-warning" title="تم اكتشاف نقطة اختناق" />
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
                              المدة: {step?.duration} ساعة
                              {step?.completedAt && (
                                <span className="ml-2">
                                  اكتملت: {step?.completedAt?.toLocaleDateString()}
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
            <span>نقاط الاختناق المحددة</span>
          </h4>
          <div className="space-y-2">
            {getBottleneckSteps()?.slice(0, 3)?.map(([step, count]) => (
              <div key={step} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{step}</span>
                <span className="text-warning font-medium">{count} مرة{count > 1 ? 'ات' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
