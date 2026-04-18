import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const PipelineVisualization = ({ changes = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [viewMode, setViewMode] = useState('current');

  const pipelineData = useMemo(() => (changes || []).map((change, index) => {
    const started = new Date(change?.scheduledStartDate || change?.createdAt || Date.now());
    const completed = new Date(change?.scheduledEndDate || new Date(started.getTime() + 6 * 60 * 60 * 1000));
    const status = String(change?.status || 'Proposed');
    const stages = [
      { name: isArabic ? 'مراجعة' : 'Review', status: status === 'Proposed' ? (isArabic ? 'قيد التنفيذ' : 'In Progress') : (isArabic ? 'مكتمل' : 'Completed'), duration: 30, successRate: status === 'Proposed' ? 70 : 100, issues: status === 'Proposed' ? [isArabic ? 'بانتظار المراجعة' : 'Awaiting review'] : [] },
      { name: isArabic ? 'موافقة' : 'Approval', status: ['Approved', 'Implementing', 'Completed'].includes(status) ? (isArabic ? 'مكتمل' : 'Completed') : (isArabic ? 'معلق' : 'Pending'), duration: 45, successRate: ['Approved', 'Implementing', 'Completed'].includes(status) ? 100 : 80, issues: [] },
      { name: isArabic ? 'تنفيذ' : 'Implementation', status: status === 'Implementing' ? (isArabic ? 'قيد التنفيذ' : 'In Progress') : status === 'Completed' ? (isArabic ? 'مكتمل' : 'Completed') : (isArabic ? 'معلق' : 'Pending'), duration: 90, successRate: status === 'Completed' ? 100 : 85, issues: status === 'Implementing' ? [isArabic ? 'مراقبة النشر' : 'Monitoring deployment'] : [] }
    ];
    return {
      id: `PIPE-${change?.id || index + 1}`,
      name: change?.title || (isArabic ? 'تغيير بدون عنوان' : 'Untitled Change'),
      priority: change?.priority || 'Medium',
      environment: isArabic ? 'الإنتاج' : 'Production',
      status: status === 'Completed' ? (isArabic ? 'مكتمل' : 'Completed') : status === 'Implementing' ? (isArabic ? 'قيد التنفيذ' : 'In Progress') : status === 'Rolled Back' ? (isArabic ? 'فشل' : 'Failed') : (isArabic ? 'معلق' : 'Pending'),
      overallProgress: Math.min(100, Math.max(10, (change?.status === 'Completed' ? 100 : change?.status === 'Approved' ? 70 : 35))),
      stages,
      currentStage: stages.find((stage) => stage.status !== (isArabic ? 'مكتمل' : 'Completed'))?.name || (isArabic ? 'مكتمل' : 'Complete'),
      riskLevel: change?.riskLevel || 'Low',
      businessImpact: change?.category || 'Normal',
      rollbackPlan: change?.backoutPlan || (isArabic ? 'استخدم إجراء التراجع القياسي' : 'Use standard rollback procedure'),
      startTime: started,
      estimatedCompletion: completed
    };
  }), [changes, isArabic]);

  const getStatusColor = (status) => {
    switch (status) {
      case (isArabic ? 'مكتمل' : 'Completed'): return 'text-success';
      case (isArabic ? 'قيد التنفيذ' : 'In Progress'): return 'text-warning';
      case (isArabic ? 'فشل' : 'Failed'): return 'text-error';
      case (isArabic ? 'معلق' : 'Pending'): return 'text-muted-foreground';
      case (isArabic ? 'متجاوز' : 'Skipped'): return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case (isArabic ? 'مكتمل' : 'Completed'): return 'CheckCircle';
      case (isArabic ? 'قيد التنفيذ' : 'In Progress'): return 'Clock';
      case (isArabic ? 'فشل' : 'Failed'): return 'XCircle';
      case (isArabic ? 'معلق' : 'Pending'): return 'Circle';
      case (isArabic ? 'متجاوز' : 'Skipped'): return 'Minus';
      default: return 'Circle';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case (isArabic ? 'مكتمل' : 'Completed'): return 'bg-success/10 border-success/20';
      case (isArabic ? 'قيد التنفيذ' : 'In Progress'): return 'bg-warning/10 border-warning/20';
      case (isArabic ? 'فشل' : 'Failed'): return 'bg-error/10 border-error/20';
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
    const completedPipelines = pipelineData?.filter((p) => p?.status === (isArabic ? 'مكتمل' : 'Completed'));
    return pipelineData?.length > 0 ? Math.round((completedPipelines.length / pipelineData.length) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'تصور خط الإصدار' : 'Pipeline visualization'}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Activity" size={16} />
            <span>{isArabic ? 'معدل النجاح' : 'Success rate'}: {calculateOverallSuccessRate()}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === 'current' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('current')}>
            {isArabic ? 'الحالي' : 'Current'}
          </Button>
          <Button variant={viewMode === 'historical' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('historical')}>
            {isArabic ? 'تاريخي' : 'Historical'}
          </Button>
          <Button variant="ghost" size="sm" title={isArabic ? 'تحديث الخطوط' : 'Refresh pipelines'}>
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'الخطوط النشطة' : 'Active pipelines'}</div>
              <div className="text-2xl font-semibold text-foreground">{pipelineData?.filter((p) => p?.status === (isArabic ? 'قيد التنفيذ' : 'In Progress'))?.length}</div>
            </div>
            <Icon name="GitBranch" size={24} className="text-accent" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'معدل النجاح' : 'Success rate'}</div>
              <div className="text-2xl font-semibold text-success">{calculateOverallSuccessRate()}%</div>
            </div>
            <Icon name="CheckCircle" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'عمليات النشر الفاشلة' : 'Failed deployments'}</div>
              <div className="text-2xl font-semibold text-error">{pipelineData?.filter((p) => p?.status === (isArabic ? 'فشل' : 'Failed'))?.length}</div>
            </div>
            <Icon name="XCircle" size={24} className="text-error" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'متوسط وقت النشر' : 'Average deployment time'}</div>
              <div className="text-2xl font-semibold text-accent">3.2h</div>
            </div>
            <Icon name="Timer" size={24} className="text-accent" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {pipelineData?.map((pipeline) => (
          <div
            key={pipeline?.id}
            className={`bg-card rounded-lg border border-border p-6 cursor-pointer transition-all hover:border-accent/50 ${
              selectedPipeline?.id === pipeline?.id ? 'border-accent bg-accent/5' : ''
            }`}
            onClick={() => setSelectedPipeline(selectedPipeline?.id === pipeline?.id ? null : pipeline)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Icon name={getStatusIcon(pipeline?.status)} size={24} className={getStatusColor(pipeline?.status)} />
                <div>
                  <h4 className="font-medium text-foreground">{pipeline?.name}</h4>
                  <div className="text-sm text-muted-foreground">{pipeline?.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getPriorityColor(pipeline?.priority)}`}>
                  {isArabic ? 'الأولوية' : 'Priority'} {pipeline?.priority}
                </div>
                <div className="text-xs text-muted-foreground">{pipeline?.environment}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{isArabic ? 'التقدم الكلي' : 'Overall progress'}</span>
                <span>{pipeline?.overallProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${pipeline?.status === (isArabic ? 'فشل' : 'Failed') ? 'bg-error' : pipeline?.status === (isArabic ? 'مكتمل' : 'Completed') ? 'bg-success' : 'bg-accent'}`}
                  style={{ width: `${pipeline?.overallProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
              {pipeline?.stages?.map((stage, index) => (
                <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                  <div className={`px-3 py-2 rounded-lg border text-xs font-medium ${getStatusBgColor(stage?.status)}`}>
                    <div className="flex items-center space-x-2">
                      <Icon name={getStatusIcon(stage?.status)} size={14} className={getStatusColor(stage?.status)} />
                      <span>{stage?.name}</span>
                    </div>
                    {stage?.duration && <div className="text-xs text-muted-foreground mt-1">{stage.duration} {isArabic ? 'دقيقة' : 'min'}</div>}
                  </div>
                  {index < pipeline?.stages?.length - 1 && <Icon name="ChevronRight" size={16} className="text-muted-foreground" />}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  {isArabic ? 'بدأ' : 'Started'}: {pipeline?.startTime?.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-muted-foreground">
                  {isArabic ? 'الحالي' : 'Current'}: {pipeline?.currentStage}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineVisualization;
