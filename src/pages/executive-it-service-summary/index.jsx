import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricCard from './components/MetricCard';
import ServiceHealthScorecard from './components/ServiceHealthScorecard';
import TrendAnalysisChart from './components/TrendAnalysisChart';
import DepartmentPerformance from './components/DepartmentPerformance';
import KeyInsightsSummary from './components/KeyInsightsSummary';
import KPICorrelationMatrix from './components/KPICorrelationMatrix';
import ManageEngineExecutiveSummary from './components/ManageEngineExecutiveSummary';
import { dashboardAPI, reportsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const ExecutiveITServiceSummary = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [metrics, setMetrics] = useState([]);
  const [departmentMetrics, setDepartmentMetrics] = useState([]);
  const [trendMetrics, setTrendMetrics] = useState([]);
  const [categoryMetrics, setCategoryMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, summaryRes, deptRes, trendRes] = await Promise.all([
        dashboardAPI.getAllMetrics(),
        dashboardAPI.getSummary(),
        dashboardAPI.getPerformanceMetrics('Department'),
        dashboardAPI.getPerformanceMetrics('IncidentTrend')
      ]);
      const categoriesRes = await reportsAPI.getCategories().catch(() => ({ data: [] }));
      setMetrics(metricsRes.data || []);
      setSummary(summaryRes.data || null);
      setDepartmentMetrics(deptRes.data || []);
      setTrendMetrics((trendRes.data || []).reverse()); // Reverse to get chronological order
      setCategoryMetrics(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch executive summary data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const primaryMetrics = metrics.map(m => ({
    title: isArabic
      ? ({
          'Cost per Ticket': 'تكلفة كل تذكرة',
          'Employee Satisfaction': 'رضا الموظفين',
          'IT Service Availability': 'توافر خدمات تقنية المعلومات',
          'Business Impact Score': 'مؤشر تأثير الأعمال',
        }[m.metricName] || m.metricName)
      : m.metricName,
    value: String(m.value),
    unit: m.unit || "",
    trend: m.percentageChange >= 0 ? "up" : "down",
    trendValue: m.percentageChange ? `${m.percentageChange}%` : "0%",
    benchmark: String(m.targetValue || 0),
    status: (m.value >= (m.targetValue || 0)) ? "excellent" : "good",
    icon: m.metricName.includes("Availability") ? "Activity" : 
          m.metricName.includes("Satisfaction") ? "Heart" : 
          m.metricName.includes("Cost") ? "Banknote" : "TrendingUp",
    description: isArabic
      ? `أداء ${({
          'Cost per Ticket': 'تكلفة كل تذكرة',
          'Employee Satisfaction': 'رضا الموظفين',
          'IT Service Availability': 'توافر خدمات تقنية المعلومات',
          'Business Impact Score': 'مؤشر تأثير الأعمال',
        }[m.metricName] || m.metricName)} الحالي`
      : `Current ${m.metricName} performance`
  }));

  // Fallback if no metrics returned
  const displayMetrics = primaryMetrics.length > 0 ? primaryMetrics.slice(0, 4) : [
    {
      title: t('itServiceAvailability', 'IT Service Availability'),
      value: summary ? "99.8" : "--",
      unit: "%",
      trend: "up",
      trendValue: "+0.3%",
      benchmark: "99.5",
      status: "excellent",
      icon: "Activity",
      description: isArabic ? 'إجمالي زمن تشغيل الأنظمة عبر جميع الخدمات' : t('overallSystemUptime', 'Overall system uptime across all services')
    },
    {
      title: t('employeeSatisfaction', 'Employee Satisfaction'),
      value: "4.5",
      unit: "/5.0",
      trend: "up",
      trendValue: "+0.2",
      benchmark: "4.0",
      status: "excellent",
      icon: "Heart",
      description: isArabic ? 'متوسط تقييم رضا المستخدمين' : t('averageUserSatisfaction', 'Average user satisfaction rating')
    },
    {
      title: t('costPerTicket', 'Cost per Ticket'),
      value: "42",
      unit: "ريال",
      trend: "down",
      trendValue: "-8%",
      benchmark: "50",
      status: "good",
      icon: "Banknote",
      description: isArabic ? 'متوسط تكلفة معالجة كل تذكرة' : t('averageCostToResolve', 'Average cost to resolve each ticket')
    },
    {
      title: t('businessImpactScore', 'Business Impact Score'),
      value: "8.7",
      unit: "/10",
      trend: "up",
      trendValue: "+0.5",
      benchmark: "8.0",
      status: "excellent",
      icon: "TrendingUp",
      description: isArabic ? 'مساهمة تقنية المعلومات في أهداف الأعمال' : t('successRate', 'IT contribution to business objectives')
    }
  ];

  const insights = [
    {
      id: 1,
      type: 'positive',
      title: isArabic ? 'معدل مرور التذاكر جيد' : 'Ticket throughput is healthy',
      description: isArabic
        ? `المنصة تتتبع ${summary?.totalTickets ?? 0} تذكرة إجمالاً، تم حل ${summary?.resolvedTickets ?? 0} منها بالفعل.`
        : `The platform is tracking ${summary?.totalTickets ?? 0} total tickets with ${summary?.resolvedTickets ?? 0} already resolved.`,
      impact: 'High',
      action: isArabic ? 'استمر في سير العمل الحالي للحل' : 'Continue current resolution workflow',
      timestamp: isArabic ? 'الآن' : 'Just now',
      icon: 'CheckCircle'
    },
    {
      id: 2,
      type: 'warning',
      title: isArabic ? 'تحتاج الاختناقات الخدمية إلى انتباه' : 'Service bottlenecks need attention',
      description: isArabic
        ? `يوجد ${categoryMetrics.slice(0, 3).reduce((sum, item) => sum + Number(item.count || 0), 0)} تذكرة في أكثر الفئات ازدحامًا.`
        : `There are ${categoryMetrics.slice(0, 3).reduce((sum, item) => sum + Number(item.count || 0), 0)} tickets in the busiest categories.`,
      impact: 'Medium',
      action: isArabic ? 'أعطِ الأولوية لأهم ثلاث فئات' : 'Prioritize the top three categories',
      timestamp: isArabic ? 'الآن' : 'Just now',
      icon: 'AlertTriangle'
    },
    {
      id: 3,
      type: 'neutral',
      title: isArabic ? 'الأصول مستقرة' : 'Assets are stable',
      description: isArabic
        ? `يوجد ${summary?.activeAssets ?? 0} من أصل ${summary?.totalAssets ?? 0} أصلًا نشطًا ويتم تتبعها من الخلفية.`
        : `${summary?.activeAssets ?? 0} of ${summary?.totalAssets ?? 0} assets are active and being tracked from the backend.`,
      impact: 'Medium',
      action: isArabic ? 'راجع الأصول غير النشطة' : 'Review inactive assets',
      timestamp: isArabic ? 'الآن' : 'Just now',
      icon: 'Activity'
    }
  ];

  const recommendations = [
    {
      id: 1,
      priority: 'high',
      title: isArabic ? 'التركيز على أهم فئات التذاكر' : 'Focus on top ticket categories',
      description: categoryMetrics.length > 0
        ? (isArabic
          ? `أكثر فئة ازدحامًا هي ${categoryMetrics[0].category} وبها ${categoryMetrics[0].count} تذاكر.`
          : `The busiest category is ${categoryMetrics[0].category} with ${categoryMetrics[0].count} tickets.`)
        : (isArabic ? 'تتبّع حجم الفئات لتقليل الحوادث المتكررة.' : 'Track category volume to reduce repeat incidents.'),
      timeline: isArabic ? '14 يومًا' : '14 days',
      impact: isArabic ? 'تقليل ضغط التراكم' : 'Reduce backlog pressure'
    },
    {
      id: 2,
      priority: 'medium',
      title: isArabic ? 'تحسين مراقبة SLA' : 'Improve SLA monitoring',
      description: isArabic
        ? `امتثال SLA الحالي هو ${summary?.recentMetrics?.[0]?.value ?? 0}${summary?.recentMetrics?.[0]?.unit || ''}.`
        : `Current SLA compliance is ${summary?.recentMetrics?.[0]?.value ?? 0}${summary?.recentMetrics?.[0]?.unit || ''}.`,
      timeline: isArabic ? '30 يومًا' : '30 days',
      impact: isArabic ? 'منع أفضل للخرق' : 'Better breach prevention'
    },
    {
      id: 3,
      priority: 'medium',
      title: isArabic ? 'الحفاظ على نظافة سجل الأصول' : 'Keep asset records clean',
      description: isArabic
        ? `تغطية الأصول النشطة هي ${summary?.activeAssets ?? 0}/${summary?.totalAssets ?? 0}، لذا يجب مراجعة السجلات القديمة.`
        : `Active asset coverage is ${summary?.activeAssets ?? 0}/${summary?.totalAssets ?? 0}, so stale records should be reviewed.`,
      timeline: isArabic ? '30 يومًا' : '30 days',
      impact: isArabic ? 'مخزون أدق' : 'More accurate inventory'
    }
  ];

  const correlations = {
    availability: {
      name: t('itServiceAvailability', 'Service Availability'),
      correlations: [
        { metric: t('resolved', 'Resolved Tickets'), correlation: 0.82, trend: 'positive', impact: `Resolution volume is ${summary?.resolvedTickets ?? 0}, which supports availability tracking.` },
        { metric: t('openTickets', 'Open Tickets'), correlation: -0.74, trend: 'negative', impact: `There are ${summary?.openTickets ?? 0} open tickets left to reduce.` },
        { metric: 'Asset Utilization', correlation: 0.61, trend: 'positive', impact: `Active assets are at ${summary?.activeAssets ?? 0} and help maintain uptime.` }
      ]
    },
    satisfaction: {
      name: t('employeeSatisfaction', 'Employee Satisfaction'),
      correlations: [
        { metric: t('resolved', 'Resolved Tickets'), correlation: 0.79, trend: 'positive', impact: 'More completed work generally improves user confidence.' },
        { metric: t('pendingApprovals', 'Pending Approvals'), correlation: -0.68, trend: 'negative', impact: `Pending approvals are currently ${summary?.pendingApprovals ?? 0}.` },
        { metric: 'Response Time', correlation: -0.71, trend: 'negative', impact: 'Faster responses improve perception of the service desk.' }
      ]
    },
    cost: {
      name: t('costPerTicket', 'Cost per Ticket'),
      correlations: [
        { metric: 'Asset Count', correlation: -0.44, trend: 'negative', impact: `A total of ${summary?.totalAssets ?? 0} tracked assets influences support cost.` },
        { metric: t('openTickets', 'Open Tickets'), correlation: 0.71, trend: 'positive', impact: 'Backlog growth usually increases handling cost.' },
        { metric: 'Automation Coverage', correlation: -0.65, trend: 'negative', impact: 'Automation and self-service reduce per-ticket effort.' }
      ]
    },
    business: {
      name: t('businessImpactScore', 'Business Impact Score'),
      correlations: [
        { metric: t('resolved', 'Resolved Tickets'), correlation: 0.88, trend: 'positive', impact: 'Throughput directly improves service continuity.' },
        { metric: 'Total Assets', correlation: 0.57, trend: 'positive', impact: 'Asset visibility improves business resilience.' },
        { metric: t('pendingApprovals', 'Pending Approvals'), correlation: -0.63, trend: 'negative', impact: 'Approvals waiting in queue delay business change.' }
      ]
    }
  };

  const handleExport = (format) => {
    const blob = new Blob([
      isArabic
        ? `الملخص التنفيذي لخدمات تقنية المعلومات\nتم الإنشاء: ${new Date().toISOString()}\nالصيغة: ${format}`
        : `Executive IT Service Summary\nGenerated: ${new Date().toISOString()}\nFormat: ${format}`
    ], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-it-service-summary.${format === 'csv' ? 'csv' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const freshnessState = (() => {
    if (!autoRefresh) {
      return { label: 'Manual refresh', tone: 'muted' };
    }

    const ageMinutes = (now - new Date(lastUpdated).getTime()) / 60000;
    if (ageMinutes < 6) {
      return { label: 'Live', tone: 'success' };
    }

    return { label: 'Stale', tone: 'warning' };
  })();

  return (
    <>
      <Helmet>
        <title>{t('executiveITServiceSummary', 'Executive IT Service Summary')} - ITSM Hub</title>
        <meta name="description" content="High-level strategic dashboard for IT directors and business stakeholders with executive-level KPI monitoring and business impact visibility" />
      </Helmet>
      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <BreadcrumbTrail />
        
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="BarChart3" size={24} color="white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('executiveITServiceSummary', 'Executive IT Service Summary')}</h1>
                    <p className="text-muted-foreground">{t('executiveSummaryDescription', 'Strategic overview and business impact analysis')}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  <span>{t('lastUpdated', 'Last Updated')}: {lastUpdated?.toLocaleTimeString()}</span>
                </div>
                <div
                  className={`inline-flex items-center space-x-2 rounded-full border px-3 py-1 text-xs font-medium ${
                    freshnessState.tone === 'success'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                      : freshnessState.tone === 'warning'
                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-700'
                        : 'border-border bg-muted text-muted-foreground'
                  }`}
                  aria-label={`Dashboard status: ${freshnessState.label}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      freshnessState.tone === 'success'
                        ? 'bg-emerald-500'
                        : freshnessState.tone === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-muted-foreground'
                    }`}
                  />
                  <span>{freshnessState.label}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    iconName="RefreshCw"
                    iconPosition="left"
                    iconSize={16}
                  >
                    {t('refresh', 'Refresh')}
                  </Button>
                  
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                      iconSize={16}
                    >
                      {t('export', 'Export')}
                    </Button>
                    
                    {/* Export Dropdown */}
                    <div className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border rounded-md operations-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition z-50">
                      <div className="py-2">
                        <button 
                          onClick={() => handleExport('pdf')}
                          className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition flex items-center space-x-2"
                        >
                          <Icon name="FileText" size={16} />
                          <span>{t('exportPdf', 'PDF Report')}</span>
                        </button>
                        <button 
                          onClick={() => handleExport('pptx')}
                          className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition flex items-center space-x-2"
                        >
                          <Icon name="Presentation" size={16} />
                          <span>{t('exportPowerpoint', 'PowerPoint')}</span>
                        </button>
                        <button 
                          onClick={() => handleExport('excel')}
                          className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition flex items-center space-x-2"
                        >
                          <Icon name="FileSpreadsheet" size={16} />
                          <span>{t('exportExcel', 'Excel Data')}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoRefresh"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e?.target?.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="autoRefresh" className="text-sm text-muted-foreground">
                      {t('autoRefreshLabel', 'Auto Refresh')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Business Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {displayMetrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            <ManageEngineExecutiveSummary />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
              {/* Main Content Area (9 cols equivalent) */}
              <div className="xl:col-span-3 space-y-6">
                {/* Service Health Scorecard */}
                <ServiceHealthScorecard />

                {/* Trend Analysis */}
                <TrendAnalysisChart data={trendMetrics} />

                {/* Department Performance */}
                <DepartmentPerformance data={departmentMetrics} />
              </div>

              {/* Right Sidebar (3 cols equivalent) */}
              <div className="xl:col-span-1">
                <KeyInsightsSummary insights={insights} recommendations={recommendations} summary={summary} />
              </div>
            </div>

            {/* KPI Correlation Matrix */}
            <div className="mb-8">
              <KPICorrelationMatrix correlations={correlations} />
            </div>

            {/* Executive Summary Footer */}
            <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('executiveSummary', 'Executive Summary')}</h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    {t('executiveSummaryFooter', 'IT services are performing strongly with 99.8% availability and 4.5/5.0 customer satisfaction. Cost optimization initiatives have reduced cost per ticket by 8%. Focus priorities include improving database performance and continuing cloud migration to maintain service quality.')}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-muted-foreground">
                    {t('reportPeriod', 'Report Period: September 2024')}
                  </div>
                  <Button variant="outline" size="sm">
                    {t('scheduleEmailReport', 'Schedule Email Report')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ExecutiveITServiceSummary;
