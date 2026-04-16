import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PipelineVisualization = ({ changes = [] }) => {
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [viewMode, setViewMode] = useState('current'); // current, historical
  const pipelineData = useMemo(() => (changes || []).map((change, index) => {
    const started = new Date(change?.scheduledStartDate || change?.createdAt || Date.now());
    const completed = new Date(change?.scheduledEndDate || new Date(started.getTime() + 6 * 60 * 60 * 1000));
    const status = String(change?.status || 'Proposed');
    const stages = [
      { name: 'Review', status: status === 'Proposed' ? 'In Progress' : 'Completed', duration: 30, successRate: status === 'Proposed' ? 70 : 100, issues: status === 'Proposed' ? ['Awaiting review'] : [] },
      { name: 'Approval', status: ['Approved', 'Implementing', 'Completed'].includes(status) ? 'Completed' : 'Pending', duration: 45, successRate: ['Approved', 'Implementing', 'Completed'].includes(status) ? 100 : 80, issues: [] },
      { name: 'Implementation', status: status === 'Implementing' ? 'In Progress' : status === 'Completed' ? 'Completed' : 'Pending', duration: 90, successRate: status === 'Completed' ? 100 : 85, issues: status === 'Implementing' ? ['Monitoring deployment'] : [] }
    ];
    return {
      id: `PIPE-${change?.id || index + 1}`,
      name: change?.title || 'Untitled Change',
      priority: change?.priority || 'Medium',
      environment: 'Production',
      status: status === 'Completed' ? 'Completed' : status === 'Implementing' ? 'In Progress' : status === 'Rolled Back' ? 'Failed' : 'Pending',
      overallProgress: Math.min(100, Math.max(10, (change?.status === 'Completed' ? 100 : change?.status === 'Approved' ? 70 : 35))),
      stages,
      currentStage: stages.find(stage => stage.status !== 'Completed')?.name || 'Complete',
      riskLevel: change?.riskLevel || 'Low',
      businessImpact: change?.category || 'Normal',
      rollbackPlan: change?.backoutPlan || 'Use standard rollback procedure',
      startTime: started,
      estimatedCompletion: completed
    };
  }), [changes, viewMode]);

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
          <h3 className="text-lg font-semibold text-foreground">تصور خط الإصدار</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Activity" size={16} />
            <span>معدل النجاح: {calculateOverallSuccessRate()}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'current' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('current')}
          >
            الحالي
          </Button>
          <Button
            variant={viewMode === 'historical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('historical')}
          >
            تاريخي
          </Button>
          <Button variant="ghost" size="sm" title="تحديث الخطوط">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>
      {/* Pipeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">الخطوط النشطة</div>
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
              <div className="text-sm text-muted-foreground">معدل النجاح</div>
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
              <div className="text-sm text-muted-foreground">عمليات النشر الفاشلة</div>
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
              <div className="text-sm text-muted-foreground">متوسط وقت النشر</div>
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
                  أولوية {pipeline?.priority}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pipeline?.environment}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>التقدم الكلي</span>
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
                  بدأ: {pipeline?.startTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-muted-foreground">
                  الحالي: {pipeline?.currentStage}
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
                    <h5 className="font-medium text-foreground mb-3">تفاصيل المراحل</h5>
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
                                  {stage?.successRate}% نجاح
                                </span>
                              )}
                            </div>
                            {stage?.duration && (
                              <div className="text-xs text-muted-foreground">
                                المدة: {stage?.duration} دقيقة
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
                    <h5 className="font-medium text-foreground mb-3">معلومات الخط</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الأثر التجاري:</span>
                        <span className="text-foreground">{pipeline?.businessImpact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مستوى المخاطر:</span>
                        <span className="text-foreground">{pipeline?.riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">خطة التراجع:</span>
                        <span className="text-foreground">{pipeline?.rollbackPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">بدأ:</span>
                        <span className="text-foreground">
                          {pipeline?.startTime?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الاكتمال المتوقع:</span>
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
            <span>نقاط الفشل الشائعة</span>
          </h4>
          <div className="space-y-2">
            {getFailurePoints()?.map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{stage}</span>
                <span className="text-error font-medium">{count} فشل{count > 1 ? 'ات' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineVisualization;
