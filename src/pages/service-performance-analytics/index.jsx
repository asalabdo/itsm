import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MetricCard from './components/MetricCard';
import FilterPanel from './components/FilterPanel';
import PerformanceChart from './components/PerformanceChart';
import TopIssuesTable from './components/TopIssuesTable';
import TrendAnalysisSection from './components/TrendAnalysisSection';
import ManageEnginePerformanceInsights from './components/ManageEnginePerformanceInsights';
import { dashboardAPI, reportsAPI, ticketsAPI } from '../../services/api';
import { downloadCsv } from '../../services/exportUtils';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const ServicePerformanceAnalytics = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const langText = (ar, en) => (language === 'ar' ? ar : en);
  const [filters, setFilters] = useState({
    timeRange: '30d',
    department: 'all',
    service: 'all',
    comparison: false,
  });
  const [kpiData, setKpiData] = useState([]);
  const [reportData, setReportData] = useState({
    overview: null,
    trends: [],
    categories: [],
    tickets: [],
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true);
        const timeRangeDays = (() => {
          switch (filters.timeRange) {
            case '7d': return 7;
            case '90d': return 90;
            case 'q1':
            case 'q2':
            case 'q3':
            case 'yearly':
              return 90;
            case '30d':
            default:
              return 30;
          }
        })();

        const [metricsRes, overviewRes, trendsRes, categoriesRes, ticketsRes] = await Promise.all([
          dashboardAPI.getAllMetrics().catch(() => ({ data: [] })),
          reportsAPI.getOverview(timeRangeDays).catch(() => ({ data: null })),
          reportsAPI.getTrends(timeRangeDays).catch(() => ({ data: [] })),
          reportsAPI.getCategories().catch(() => ({ data: [] })),
          ticketsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const data = Array.isArray(metricsRes.data) ? metricsRes.data : [];
        const mapped = data.slice(0, 4).map((m) => ({
          title: m.metricName || 'Metric',
          value: String(m.value ?? 0),
          unit: m.unit || '',
          change: Number(m.percentageChange || 0),
          trend: Number(m.percentageChange || 0) >= 0 ? 'up' : 'down',
          icon: 'BarChart3',
          color: 'primary',
          sparklineData: [],
        }));
        setKpiData(mapped);

        setReportData({
          overview: overviewRes.data || null,
          trends: Array.isArray(trendsRes.data) ? trendsRes.data : [],
          categories: Array.isArray(categoriesRes.data) ? categoriesRes.data : [],
          tickets: Array.isArray(ticketsRes.data) ? ticketsRes.data : [],
        });
      } catch (error) {
        console.error('Failed to fetch KPI data:', error);
        setKpiData([]);
        setReportData({ overview: null, trends: [], categories: [], tickets: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchKPIData();
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    window.dispatchEvent(new CustomEvent('itsm:refresh', { detail: { filters: newFilters } }));
  };

  const handleExport = (format) => {
    if (format === 'csv') {
      downloadCsv(
        reportData.tickets.map((ticket) => ([
          ticket?.ticketNumber || ticket?.id || '',
          ticket?.title || '',
          ticket?.status || '',
          ticket?.priority || '',
          ticket?.category || '',
          ticket?.createdAt || '',
        ])),
        `service-performance-analytics-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Ticket ID', 'Title', 'Status', 'Priority', 'Category', 'Created At']
      );
      return;
    }

    const blob = new Blob(
      [`Service Performance Analytics\nGenerated: ${new Date().toISOString()}\nFilters: ${JSON.stringify(filters)}`],
      { type: 'text/plain;charset=utf-8;' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'service-performance-analytics.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>{t('servicePerformance', 'Service Performance Analytics')} - ITSM Hub</title>
        <meta
          name="description"
          content={t('servicePerformanceSubtitle', 'Comprehensive analytical dashboard for tracking IT service KPI trends, performance patterns, and data-driven optimization decisions.')}
        />
      </Helmet>
      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <BreadcrumbTrail />

        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-3xl font-bold text-foreground mb-2`}>
                    {t('servicePerformance', 'Service Performance Analytics')}
                  </h1>
                  <p className={`text-muted-foreground`}>
                    {t('servicePerformanceSubtitle', 'Track KPI trends, identify performance patterns, and make data-driven optimization decisions')}
                  </p>
                </div>
                <div className={`hidden md:flex items-center space-x-2 text-sm text-muted-foreground ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <span>{t('dashboardRefreshed', 'Dashboard refreshed')}:</span>
                  <span className="font-medium">{new Date('2024-09-21T08:48:00').toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
              </div>
            </div>

            <FilterPanel
              onFiltersChange={handleFiltersChange}
              onExport={handleExport}
              lastUpdated={new Date()}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {kpiData?.map((kpi, index) => (
                <MetricCard
                  key={index}
                  title={kpi?.title}
                  value={kpi?.value}
                  unit={kpi?.unit}
                  change={kpi?.change}
                  trend={kpi?.trend}
                  sparklineData={kpi?.sparklineData}
                  icon={kpi?.icon}
                  color={kpi?.color}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
              <div className="xl:col-span-8">
                <PerformanceChart reportData={reportData} />
              </div>

              <div className="xl:col-span-4">
                <TopIssuesTable tickets={reportData.tickets} />
              </div>
            </div>

            <TrendAnalysisSection reportData={reportData} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <ManageEnginePerformanceInsights />
              </div>

              <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
                <h4 className={`text-lg font-semibold text-foreground mb-4`}>
                  {t('keyInsightsShort', 'Key Insights')}
                </h4>
                <div className="space-y-3">
                  <div className={`flex items-start gap-3`}>
                    <div className="w-2 h-2 bg-success rounded-full mt-2" />
                    <div>
                      <p className={`text-sm text-foreground font-medium`}>
                        {t('slaPerformanceImprovingShort', 'SLA Performance Improving')}
                      </p>
                      <p className={`text-xs text-muted-foreground`}>
                        {langText('زيادة بنسبة 2.3% في معدل الالتزام خلال هذه الفترة', 'Increase of 2.3% in compliance during this period')}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-3`}>
                    <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                    <div>
                      <p className={`text-sm text-foreground font-medium`}>
                        {t('emailIssuesTrendingUpShort', 'Email Issues Trending Up')}
                      </p>
                      <p className={`text-xs text-muted-foreground`}>
                        {langText('تم تسجيل 45 حادثًا، ويحتاج الأمر إلى متابعة', '45 incidents were recorded and this needs follow-up')}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-3`}>
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className={`text-sm text-foreground font-medium`}>
                        {t('employeeSatisfactionHighShort', 'Employee Satisfaction High')}
                      </p>
                      <p className={`text-xs text-muted-foreground`}>
                        {langText('متوسط التقييم 4.4/5 عبر جميع الخدمات', 'Average rating of 4.4/5 across all services')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
                <h4 className={`text-lg font-semibold text-foreground mb-4`}>
                  {t('recommendations', 'Recommendations')}
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className={`text-sm text-foreground font-medium mb-1`}>
                      {t('focusOnEmailInfrastructure', 'Focus on Email Infrastructure')}
                    </p>
                    <p className={`text-xs text-muted-foreground`}>
                      {t('addressRecurringIssues', 'Address recurring connectivity issues to reduce ticket volume')}
                    </p>
                  </div>
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <p className={`text-sm text-foreground font-medium mb-1`}>
                      {t('expandUserTraining', 'Expand User Training')}
                    </p>
                    <p className={`text-xs text-muted-foreground`}>
                      {t('reducePasswordResets', 'Reduce password reset requests through better education')}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                    <p className={`text-sm text-foreground font-medium mb-1`}>
                      {t('optimizeWorkflows', 'Optimize Workflows')}
                    </p>
                    <p className={`text-xs text-muted-foreground`}>
                      {t('streamlineApprovals', 'Streamline approval processes for faster resolution')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
                <h4 className={`text-lg font-semibold text-foreground mb-4`}>
                  {t('quickActions', 'Quick Actions')}
                </h4>
                <div className="space-y-3">
                  <button className={`w-full p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors`}>
                    <p className={`text-sm text-foreground font-medium`}>
                      {t('generateMonthlyReport', 'Generate Monthly Report')}
                    </p>
                    <p className={`text-xs text-muted-foreground`}>
                      {t('createPerformanceSummary', 'Create comprehensive performance summary')}
                    </p>
                  </button>
                  <button className={`w-full p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors`}>
                    <p className={`text-sm text-foreground font-medium`}>
                      {t('scheduleReviewMeeting', 'Schedule Review Meeting')}
                    </p>
                    <p className={`text-xs text-muted-foreground`}>
                      {t('discussFindings', 'Discuss findings with stakeholders')}
                    </p>
                  </button>
                  <button className={`w-full p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors`}>
                    <p className={`text-sm text-foreground font-medium`}>
                      {t('configureAlerts', 'Configure Alerts')}
                    </p>
                    <p className={`text-xs text-muted-foreground`}>
                      {t('setMonitoringThresholds', 'Set up proactive monitoring thresholds')}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ServicePerformanceAnalytics;
