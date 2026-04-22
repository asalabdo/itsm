import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ApprovalWorkflow = ({ changes = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  const workflowData = useMemo(() => (changes || []).map((change, index) => {
    const totalSteps = change?.status === 'Completed' ? 4 : change?.status === 'Approved' ? 3 : 5;
    const completedSteps = change?.status === 'Completed' ? totalSteps : change?.status === 'Approved' ? totalSteps - 1 : Math.max(1, Math.min(2, index + 1));
    const status = change?.status === 'Completed' ? (isArabic ? 'معتمد' : 'Approved') : change?.status === 'Implementing' ? (isArabic ? 'قيد التنفيذ' : 'In Progress') : (isArabic ? 'معلق' : 'Pending');
    const createdAt = new Date(change?.createdAt || Date.now());
    const scheduled = new Date(change?.scheduledEndDate || new Date(createdAt.getTime() + 72 * 60 * 60 * 1000));
    return {
      id: `WF-${change?.id || index + 1}`,
      changeId: change?.changeNumber || `CHG-${change?.id || index + 1}`,
      title: change?.title || (isArabic ? 'تغيير بدون عنوان' : 'Untitled Change'),
      currentStep: status === (isArabic ? 'معتمد' : 'Approved') ? (isArabic ? 'الموافقة النهائية' : 'Final approval') : status === (isArabic ? 'قيد التنفيذ' : 'In Progress') ? (isArabic ? 'مراجعة التنفيذ' : 'Implementation review') : (isArabic ? 'المراجعة الأولية' : 'Initial review'),
      totalSteps,
      completedSteps,
      status,
      priority: change?.priority || 'Medium',
      submittedDate: createdAt,
      estimatedCompletion: scheduled,
      steps: [
        { name: isArabic ? 'المراجعة الأولية' : 'Initial review', status: 'Completed', approver: isArabic ? 'مدير التغيير' : 'Change manager', completedAt: createdAt, duration: 2 },
        { name: isArabic ? 'مراجعة مجلس التغيير' : 'Change advisory board review', status: completedSteps > 1 ? 'Completed' : 'Pending', approver: 'CAB', completedAt: completedSteps > 1 ? createdAt : null, duration: completedSteps > 1 ? 6 : null },
        { name: isArabic ? 'اعتماد التنفيذ' : 'Implementation approval', status: status === (isArabic ? 'معتمد' : 'Approved') ? 'Completed' : 'Pending', approver: isArabic ? 'مدير العمليات' : 'Operations manager', completedAt: status === (isArabic ? 'معتمد' : 'Approved') ? scheduled : null, duration: status === (isArabic ? 'معتمد' : 'Approved') ? 4 : null }
      ],
      bottleneck: status === (isArabic ? 'معلق' : 'Pending') ? (isArabic ? 'مراجعة CAB' : 'CAB review') : null,
      averageStepTime: Math.max(1, Number((scheduled - createdAt) / 36e5 / Math.max(1, totalSteps)).toFixed(1)),
      riskLevel: change?.riskLevel || 'Low'
    };
  }), [changes, isArabic]);

  const calculateAverageApprovalTime = () => {
    const completedWorkflows = workflowData?.filter((wf) => wf?.status === (isArabic ? 'معتمد' : 'Approved'));
    if (!completedWorkflows?.length) return 0;
    const totalTime = completedWorkflows.reduce((sum, wf) => sum + wf.averageStepTime, 0);
    return (totalTime / completedWorkflows.length).toFixed(1);
  };

  const getBottleneckSteps = () => {
    const bottlenecks = {};
    workflowData?.forEach((wf) => {
      if (wf?.bottleneck) bottlenecks[wf.bottleneck] = (bottlenecks[wf.bottleneck] || 0) + 1;
    });
    return Object.entries(bottlenecks).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'حالة سير الموافقات' : 'Approval workflow status'}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>{isArabic ? 'المتوسط' : 'Average'}: {calculateAverageApprovalTime()} {isArabic ? 'ساعة' : 'h'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="text-sm border border-border rounded px-2 py-1 bg-background">
            <option value="7d">{isArabic ? 'آخر 7 أيام' : 'Last 7 days'}</option>
            <option value="30d">{isArabic ? 'آخر 30 يومًا' : 'Last 30 days'}</option>
            <option value="90d">{isArabic ? 'آخر 90 يومًا' : 'Last 90 days'}</option>
          </select>
          <Button variant="ghost" size="sm" title={isArabic ? 'تحديث البيانات' : 'Refresh data'}>
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{isArabic ? 'سير العمل النشط' : 'Active workflows'}</div>
                <div className="text-2xl font-semibold text-foreground">{workflowData?.filter((wf) => wf?.status === (isArabic ? 'قيد التنفيذ' : 'In Progress') || wf?.status === (isArabic ? 'معتمد' : 'Approved'))?.length}</div>
              </div>
              <Icon name="GitBranch" size={24} className="text-accent" />
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{isArabic ? 'متوسط وقت الموافقة' : 'Average approval time'}</div>
                <div className="text-2xl font-semibold text-foreground">{calculateAverageApprovalTime()}h</div>
              </div>
              <Icon name="Timer" size={24} className="text-warning" />
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{isArabic ? 'نقاط الاختناق' : 'Bottlenecks'}</div>
                <div className="text-2xl font-semibold text-foreground">{getBottleneckSteps().length}</div>
              </div>
              <Icon name="AlertTriangle" size={24} className="text-error" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {workflowData?.map((workflow) => (
            <div
              key={workflow?.id}
              className={`border border-border rounded-lg p-4 cursor-pointer transition-all hover:border-accent/50 ${
                selectedWorkflow?.id === workflow?.id ? 'border-accent bg-accent/5' : ''
              }`}
              onClick={() => setSelectedWorkflow(selectedWorkflow?.id === workflow?.id ? null : workflow)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <div>
                    <div className="font-medium text-foreground">{workflow?.title}</div>
                    <div className="text-sm text-muted-foreground">{workflow?.changeId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${workflow?.priority === 'Critical' ? 'text-error' : workflow?.priority === 'High' ? 'text-warning' : 'text-accent'}`}>
                    {isArabic ? 'الأولوية' : 'Priority'} {workflow?.priority}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isArabic ? 'الخطوة' : 'Step'} {workflow?.completedSteps}/{workflow?.totalSteps}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{isArabic ? 'التقدم' : 'Progress'}</span>
                  <span>{Math.round((workflow?.completedSteps / workflow?.totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${(workflow?.completedSteps / workflow?.totalSteps) * 100}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">{isArabic ? 'الحالة:' : 'Status:'}</span>
                  <span className="font-medium text-foreground">{workflow?.currentStep}</span>
                </div>
                <div className="text-muted-foreground">
                  {isArabic ? 'متوقع' : 'Est.'}: {workflow?.estimatedCompletion?.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                </div>
              </div>

              {selectedWorkflow?.id === workflow?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="space-y-3">
                    {workflow?.steps?.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Icon name="Circle" size={16} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{step?.name}</span>
                            <span className="text-xs text-muted-foreground">{step?.approver}</span>
                          </div>
                          {step?.duration && (
                            <div className="text-xs text-muted-foreground">
                              {isArabic ? 'المدة:' : 'Duration:'} {step?.duration} {isArabic ? 'ساعة' : 'h'}
                              {step?.completedAt && (
                                <span className="ml-2">
                                  {isArabic ? 'اكتملت:' : 'Completed:'} {step?.completedAt?.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
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

      {getBottleneckSteps().length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span>{isArabic ? 'نقاط الاختناق المحددة' : 'Identified bottlenecks'}</span>
          </h4>
          <div className="space-y-2">
            {getBottleneckSteps().slice(0, 3).map(([step, count]) => (
              <div key={step} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{step}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
