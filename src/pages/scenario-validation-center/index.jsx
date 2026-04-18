import React, { useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const scenarioGroups = [
  {
    title: 'Security And Access',
    scenarios: [
      { id: 1, name: 'Disable User', expected: 'Inactive users cannot login or create tickets.', page: '/user-management' },
      { id: 38, name: 'Unauthorized Access', expected: 'Users cannot view tickets from other departments.', page: '/ticket-management-center' },
      { id: 39, name: 'SQL Injection Test', expected: 'Unsafe input is rejected and sanitized.', page: null },
      { id: 40, name: 'Session Timeout', expected: 'Users are logged out after inactivity.', page: '/settings' }
    ]
  },
  {
    title: 'Ticket Management',
    scenarios: [
      { id: 5, name: 'Create Ticket', expected: 'Ticket created with ticket number, status Open, created at, requester.', page: '/ticket-creation' },
      { id: 6, name: 'Auto Ticket Number Generation', expected: 'System generates TCK-000001 style numbers.', page: '/ticket-management-center' },
      { id: 7, name: 'Assign Ticket', expected: 'AssignedToId updates and activity is logged.', page: '/ticket-details' },
      { id: 8, name: 'Add Ticket Comment', expected: 'TicketComments row is inserted.', page: '/ticket-details' },
      { id: 9, name: 'Attach File', expected: 'TicketAttachments row is inserted.', page: '/ticket-details' },
      { id: 10, name: 'Resolve Ticket', expected: 'ResolvedAt and ResolutionNotes are populated.', page: '/ticket-details' },
      { id: 11, name: 'SLA Breach', expected: 'SlaStatus becomes Breached when overdue.', page: '/ticket-sla' },
      { id: 12, name: 'Reopen Ticket', expected: 'Resolved tickets can be reopened to Open.', page: '/ticket-details' },
      { id: 44, name: 'Ticket -> Approval -> Workflow', expected: 'Ticket creation can trigger approvals and workflows.', page: '/ticket-management-center' },
      { id: 45, name: 'Ticket -> Asset Link', expected: 'Ticket can reference an AssetId.', page: '/ticket-details' },
      { id: 47, name: 'Missing Required Fields', expected: 'Validation errors are shown before submit.', page: '/ticket-creation' },
      { id: 48, name: 'Invalid Email Format', expected: 'Invalid user emails are rejected.', page: '/user-management' },
      { id: 54, name: 'VIP Ticket', expected: 'Critical priority gets immediate assignment and short SLA.', page: '/it-operations-command-center' },
      { id: 56, name: 'Bulk Ticket Import', expected: 'Large ticket imports remain responsive.', page: '/ticket-management-center' },
      { id: 58, name: 'Ticket Reassignment', expected: 'Reassignment activity is logged.', page: '/ticket-details' }
    ]
  },
  {
    title: 'Service Requests',
    scenarios: [
      { id: 13, name: 'Create Service Request', expected: 'Record created in ServiceRequests.', page: '/service-request-management' },
      { id: 14, name: 'Assign Request', expected: 'AssignedToId updates.', page: '/fulfillment-center' },
      { id: 15, name: 'Complete Request', expected: 'CompletionDate is populated.', page: '/fulfillment-center' },
      { id: 16, name: 'Estimated vs Actual Hours', expected: 'ActualHours stays aligned with EstimatedHours.', page: '/service-request-management' }
    ]
  },
  {
    title: 'Asset Management',
    scenarios: [
      { id: 17, name: 'Create Asset', expected: 'Record created in Assets.', page: '/manage-assets' },
      { id: 18, name: 'Assign Asset to User', expected: 'OwnerId updates and AssetHistories log is created.', page: '/asset-registry-and-tracking' },
      { id: 19, name: 'Change Asset Status', expected: 'AssetHistories log is created.', page: '/asset-registry-and-tracking' },
      { id: 20, name: 'Decommission Asset', expected: 'DecommissionDate populated and status Retired.', page: '/asset-registry-and-tracking' },
      { id: 46, name: 'Change Request -> Workflow', expected: 'Workflow is triggered automatically.', page: '/change-management-dashboard' }
    ]
  },
  {
    title: 'Change Management',
    scenarios: [
      { id: 21, name: 'Create Change Request', expected: 'Record created in ChangeRequests.', page: '/change-management' },
      { id: 22, name: 'Approve Change', expected: 'ApprovedById populated and status Approved.', page: '/change-management-dashboard' },
      { id: 23, name: 'Schedule Change', expected: 'ScheduledStartDate is set.', page: '/change-management' },
      { id: 24, name: 'Reject Change', expected: 'Status becomes Rejected.', page: '/change-management-dashboard' },
      { id: 25, name: 'Emergency Change', expected: 'RiskLevel becomes High.', page: '/change-management-dashboard' },
      { id: 49, name: 'Past Due Date', expected: 'System warns the user.', page: '/change-management' }
    ]
  },
  {
    title: 'Approval Workflow',
    scenarios: [
      { id: 26, name: 'Submit Approval Request', expected: 'ApprovalItems row created.', page: '/approval-queue-manager' },
      { id: 27, name: 'Approve Item', expected: 'Status becomes Approved and ResolvedAt is populated.', page: '/approval-queue-manager' },
      { id: 28, name: 'Reject Item', expected: 'Status becomes Rejected.', page: '/approval-queue-manager' }
    ]
  },
  {
    title: 'Workflow Engine',
    scenarios: [
      { id: 29, name: 'Trigger Workflow', expected: 'WorkflowInstances row created.', page: '/workflow-builder' },
      { id: 30, name: 'Execute Workflow Step', expected: 'WorkflowInstanceSteps row created.', page: '/workflow-builder-studio' },
      { id: 31, name: 'Complete Workflow', expected: 'CompletedAt populated.', page: '/workflow-builder' }
    ]
  },
  {
    title: 'Automation Rules',
    scenarios: [
      { id: 32, name: 'Auto Assign Ticket', expected: 'Rule execution logs are created.', page: '/automation-rules' },
      { id: 33, name: 'Failed Automation', expected: 'Success is false and ErrorMessage is populated.', page: '/automation-rules' }
    ]
  },
  {
    title: 'Audit And Reporting',
    scenarios: [
      { id: 34, name: 'Update Ticket', expected: 'AuditLogs row created.', page: '/audit-trail-and-compliance-viewer' },
      { id: 35, name: 'Delete Asset', expected: 'Audit log created.', page: '/audit-trail-and-compliance-viewer' },
      { id: 36, name: 'Generate Dashboard Metrics', expected: 'DashboardMetrics row inserted.', page: '/reporting-and-analytics-hub' },
      { id: 37, name: 'Performance Trend Calculation', expected: 'Trend values calculate up or down.', page: '/service-performance-analytics' },
      { id: 55, name: 'Major Incident', expected: 'Multiple tickets linked and incident workflow triggered.', page: '/incident-management-workflow' }
    ]
  },
  {
    title: 'Security And Reliability',
    scenarios: [
      { id: 41, name: 'Create 10,000 Tickets', expected: 'System remains responsive.', page: null },
      { id: 42, name: 'Concurrent Users', expected: '100 users can create tickets simultaneously.', page: null },
      { id: 43, name: 'Large Attachment Upload', expected: '100MB file upload is accepted.', page: '/ticket-details' },
      { id: 50, name: 'System Crash Recovery', expected: 'No data loss on recovery.', page: null }
    ]
  },
  {
    title: 'Database Validation',
    scenarios: [
      { id: 51, name: 'Foreign Key Validation', expected: 'TicketComments require a valid TicketId.', page: null },
      { id: 52, name: 'Cascade Delete', expected: 'Deleting a ticket removes related comments, activities, and attachments.', page: null },
      { id: 53, name: 'Data Integrity', expected: 'No orphan records remain.', page: null }
    ]
  },
  {
    title: 'Real World Operations',
    scenarios: [
      { id: 57, name: 'SLA Escalation', expected: 'Manager notified before SLA breach.', page: '/it-operations-command-center' }
    ]
  }
];

const scenarioGroupLabels = {
  'Security And Access': 'securityAndAccess',
  'Ticket Management': 'ticketManagement',
  'Service Requests': 'serviceRequestsLabel',
  'Asset Management': 'assetManagement',
  'Change Management': 'changeManagementLabel',
  'Approval Workflow': 'approvalWorkflow',
  'Workflow Engine': 'workflowEngine',
  'Automation Rules': 'automationRules',
  'Audit And Reporting': 'auditAndReporting',
  'Security And Reliability': 'securityAndReliability',
  'Database Validation': 'databaseValidation',
  'Real World Operations': 'realWorldOperations',
};

const scenarioTranslations = {
  1: { ar: { name: 'تعطيل المستخدم', expected: 'لا يمكن للمستخدمين غير النشطين تسجيل الدخول أو إنشاء التذاكر.' } },
  5: { ar: { name: 'إنشاء تذكرة', expected: 'يتم إنشاء السجل برقم التذكرة والحالة مفتوحة وتاريخ الإنشاء والطالب.' } },
  6: { ar: { name: 'توليد رقم التذكرة تلقائيًا', expected: 'يقوم النظام بإنشاء أرقام بالشكل TCK-000001.' } },
  7: { ar: { name: 'تعيين تذكرة', expected: 'يتم تحديث AssignedToId وتسجيل النشاط.' } },
  8: { ar: { name: 'إضافة تعليق على التذكرة', expected: 'يتم إدراج صف في TicketComments.' } },
  9: { ar: { name: 'إرفاق ملف', expected: 'يتم إدراج صف في TicketAttachments.' } },
  10: { ar: { name: 'حل التذكرة', expected: 'يتم تعبئة ResolvedAt وResolutionNotes.' } },
  11: { ar: { name: 'تجاوز SLA', expected: 'تصبح حالة SLA متجاوزة عند التأخير.' } },
  12: { ar: { name: 'إعادة فتح التذكرة', expected: 'يمكن إعادة فتح التذاكر المحلولة إلى Open.' } },
  13: { ar: { name: 'إنشاء طلب خدمة', expected: 'يتم إنشاء السجل في ServiceRequests.' } },
  14: { ar: { name: 'تعيين الطلب', expected: 'يتم تحديث AssignedToId.' } },
  15: { ar: { name: 'إكمال الطلب', expected: 'يتم تعبئة CompletionDate.' } },
  16: { ar: { name: 'الساعات المقدرة مقابل الفعلية', expected: 'تظل ActualHours متوافقة مع EstimatedHours.' } },
  17: { ar: { name: 'إنشاء أصل', expected: 'يتم إنشاء سجل في Assets.' } },
  18: { ar: { name: 'تعيين الأصل لمستخدم', expected: 'يتم تحديث OwnerId وإنشاء سجل AssetHistories.' } },
  19: { ar: { name: 'تغيير حالة الأصل', expected: 'يتم إنشاء سجل AssetHistories.' } },
  20: { ar: { name: 'إخراج الأصل من الخدمة', expected: 'يتم تعبئة DecommissionDate وتصبح الحالة Retired.' } },
  21: { ar: { name: 'إنشاء طلب تغيير', expected: 'يتم إنشاء سجل في ChangeRequests.' } },
  22: { ar: { name: 'اعتماد التغيير', expected: 'يتم تعبئة ApprovedById وتصبح الحالة Approved.' } },
  23: { ar: { name: 'جدولة التغيير', expected: 'يتم ضبط ScheduledStartDate.' } },
  24: { ar: { name: 'رفض التغيير', expected: 'تصبح الحالة Rejected.' } },
  25: { ar: { name: 'تغيير طارئ', expected: 'تصبح RiskLevel عالية.' } },
  26: { ar: { name: 'إرسال طلب موافقة', expected: 'يتم إنشاء صف ApprovalItems.' } },
  27: { ar: { name: 'اعتماد عنصر', expected: 'تصبح الحالة Approved ويتم تعبئة ResolvedAt.' } },
  28: { ar: { name: 'رفض عنصر', expected: 'تصبح الحالة Rejected.' } },
  29: { ar: { name: 'تشغيل سير عمل', expected: 'يتم إنشاء صف WorkflowInstances.' } },
  30: { ar: { name: 'تنفيذ خطوة في سير العمل', expected: 'يتم إنشاء صف WorkflowInstanceSteps.' } },
  31: { ar: { name: 'إكمال سير العمل', expected: 'يتم تعبئة CompletedAt.' } },
  32: { ar: { name: 'التعيين التلقائي للتذكرة', expected: 'يتم إنشاء سجلات تنفيذ القاعدة.' } },
  33: { ar: { name: 'أتمتة فاشلة', expected: 'تكون Success false ويتم تعبئة ErrorMessage.' } },
  34: { ar: { name: 'تحديث تذكرة', expected: 'يتم إنشاء صف AuditLogs.' } },
  35: { ar: { name: 'حذف أصل', expected: 'يتم إنشاء سجل تدقيق.' } },
  36: { ar: { name: 'توليد مقاييس لوحة التحكم', expected: 'يتم إدراج صف DashboardMetrics.' } },
  37: { ar: { name: 'حساب اتجاه الأداء', expected: 'يتم حساب قيم الاتجاه صعودًا أو هبوطًا.' } },
  38: { ar: { name: 'وصول غير مصرّح به', expected: 'لا يمكن للمستخدمين عرض تذاكر الأقسام الأخرى.' } },
  39: { ar: { name: 'اختبار حقن SQL', expected: 'يتم رفض المدخلات غير الآمنة وتنقيتها.' } },
  40: { ar: { name: 'انتهاء مهلة الجلسة', expected: 'يتم تسجيل خروج المستخدمين بعد عدم النشاط.' } },
  41: { ar: { name: 'إنشاء 10,000 تذكرة', expected: 'يبقى النظام مستجيبًا.' } },
  42: { ar: { name: 'مستخدمون متزامنون', expected: 'يمكن لـ 100 مستخدم إنشاء التذاكر في الوقت نفسه.' } },
  43: { ar: { name: 'رفع مرفق كبير', expected: 'يتم قبول رفع ملف بحجم 100MB.' } },
  44: { ar: { name: 'تذكرة -> موافقة -> سير عمل', expected: 'يمكن لإنشاء التذكرة تشغيل الموافقات وسير العمل.' } },
  45: { ar: { name: 'ربط تذكرة بأصل', expected: 'يمكن للتذكرة الإشارة إلى AssetId.' } },
  46: { ar: { name: 'طلب تغيير -> سير عمل', expected: 'يتم تشغيل سير العمل تلقائيًا.' } },
  47: { ar: { name: 'حقول مطلوبة مفقودة', expected: 'تظهر أخطاء التحقق قبل الإرسال.' } },
  48: { ar: { name: 'صيغة بريد غير صحيحة', expected: 'يتم رفض عناوين البريد غير الصالحة.' } },
  49: { ar: { name: 'تاريخ استحقاق سابق', expected: 'يحذر النظام المستخدم.' } },
  50: { ar: { name: 'استعادة بعد تعطل النظام', expected: 'لا يحدث فقدان للبيانات عند الاستعادة.' } },
  51: { ar: { name: 'التحقق من المفتاح الخارجي', expected: 'يتطلب TicketComments TicketId صالحًا.' } },
  52: { ar: { name: 'حذف متسلسل', expected: 'حذف التذكرة يزيل التعليقات والأنشطة والمرفقات المرتبطة.' } },
  53: { ar: { name: 'سلامة البيانات', expected: 'لا تبقى سجلات يتيمة.' } },
  54: { ar: { name: 'تذكرة VIP', expected: 'تحصل الأولوية الحرجة على تعيين فوري وSLA قصير.' } },
  55: { ar: { name: 'حادث كبير', expected: 'ترتبط عدة تذاكر ويُفعّل سير عمل الحادث.' } },
  56: { ar: { name: 'استيراد دفعة كبيرة من التذاكر', expected: 'تظل عمليات الاستيراد الكبيرة سريعة الاستجابة.' } },
  57: { ar: { name: 'تصعيد SLA', expected: 'يتم إشعار المدير قبل تجاوز SLA.' } },
  58: { ar: { name: 'إعادة إسناد التذكرة', expected: 'يتم تسجيل نشاط إعادة الإسناد.' } },
};

const ScenarioValidationCenter = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [query, setQuery] = useState('');

  const flatScenarios = useMemo(() => scenarioGroups.flatMap((group) =>
    group.scenarios.map((scenario) => ({ ...scenario, group: group.title }))
  ), []);

  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return scenarioGroups;

    return scenarioGroups
      .map((group) => ({
        ...group,
        scenarios: group.scenarios.filter((scenario) =>
          [scenario.id, scenario.name, scenario.expected, group.title]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search))
        )
      }))
      .filter((group) => group.scenarios.length > 0);
  }, [query]);

  const summary = useMemo(() => {
    const total = flatScenarios.length;
    const withPages = flatScenarios.filter((scenario) => scenario.page).length;
    const backendOnly = total - withPages;
    return { total, withPages, backendOnly };
  }, [flatScenarios]);

  const localizeGroupTitle = (title) => {
    const key = scenarioGroupLabels[title];
    return key ? t(key, title) : title;
  };

  const localizeScenarioName = (scenario) => {
    return isArabic ? (scenarioTranslations[scenario.id]?.ar?.name || scenario.name) : scenario.name;
  };

  const localizeScenarioExpected = (scenario) => {
    return isArabic ? (scenarioTranslations[scenario.id]?.ar?.expected || scenario.expected) : scenario.expected;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              {isArabic ? 'مركز التحقق من السيناريو' : 'Scenario Validation Center'}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {isArabic
                ? 'قائمة تحقق مركزية لسيناريوهات ITSM، مع روابط مباشرة للصفحات الموجودة وعناصر التحقق الموجودة في الخلفية فقط.'
                : 'Central checklist for the ITSM scenarios, with direct links to existing pages and backend-only validation items.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/user-management')}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              {isArabic ? 'فتح الصفحات الأساسية' : 'Open Core Pages'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/ticket-management-center')}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors text-sm font-medium"
            >
              {isArabic ? 'مركز التذاكر' : 'Ticket Center'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <div className="text-sm text-muted-foreground">{isArabic ? 'إجمالي السيناريوهات' : 'Total Scenarios'}</div>
            <div className="text-3xl font-semibold text-foreground mt-2">{summary.total}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <div className="text-sm text-muted-foreground">{isArabic ? 'مربوط بالصفحات' : 'Mapped To Pages'}</div>
            <div className="text-3xl font-semibold text-success mt-2">{summary.withPages}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <div className="text-sm text-muted-foreground">{isArabic ? 'الخلفية فقط' : 'Backend Only'}</div>
            <div className="text-3xl font-semibold text-warning mt-2">{summary.backendOnly}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-elevation-1">
          <label className="block text-sm font-medium text-foreground mb-2">{isArabic ? 'ابحث في السيناريوهات' : 'Search scenarios'}</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث برقم السيناريو أو الاسم أو الوحدة أو النتيجة المتوقعة...' : 'Search by scenario number, name, module, or expected result...'}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <section key={group.title} className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{localizeGroupTitle(group.title)}</h2>
                  <p className="text-sm text-muted-foreground">{group.scenarios.length} {isArabic ? 'سيناريوهات' : 'scenarios'}</p>
                </div>
                <Icon name="ClipboardCheck" size={20} className="text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-5">
                {group.scenarios.map((scenario) => (
                  <div key={scenario.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {isArabic ? 'السيناريو' : 'Scenario'} {scenario.id}
                        </div>
                        <h3 className="text-base font-semibold text-foreground mt-1">{localizeScenarioName(scenario)}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${scenario.page ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {scenario.page ? (isArabic ? 'الصفحة موجودة' : 'Page exists') : (isArabic ? 'الخلفية فقط' : 'Backend only')}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{localizeScenarioExpected(scenario)}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{isArabic ? 'الوحدة:' : 'Module:'}</span> {localizeGroupTitle(scenario.group)}
                      </div>
                      {scenario.page ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(scenario.page)}
                        >
                          {isArabic ? 'فتح الصفحة' : 'Open Page'}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{isArabic ? 'لا توجد شاشة مخصصة مطلوبة' : 'No dedicated screen required'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ScenarioValidationCenter;
