import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const KeyInsightsSummary = ({ insights = [], recommendations = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'critical': return 'XCircle';
      default: return 'Info';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-primary';
    }
  };

  const getInsightBg = (type) => {
    switch (type) {
      case 'positive': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'critical': return 'bg-error/10';
      default: return 'bg-primary/10';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const localizedImpact = (impact) => {
    if (!isArabic) return `${impact} ${t('impact', 'Impact')}`;
    const map = { High: 'مرتفع التأثير', Medium: 'متوسط التأثير', Low: 'منخفض التأثير' };
    return map[impact] || impact;
  };

  const localizedPriority = (priority) => {
    if (!isArabic) return `${priority} ${t('priority', 'Priority')}`;
    const map = { high: 'عالية الأولوية', medium: 'متوسطة الأولوية', low: 'منخفضة الأولوية' };
    return map[priority] || priority;
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('keyInsights', 'Key Insights')}</h3>
            <p className="text-sm text-muted-foreground">{t('backendDrivenAnalysis', 'Backend-driven analysis and trends')}</p>
          </div>
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left" iconSize={16}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight?.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 micro-interaction">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getInsightBg(insight?.type)} flex-shrink-0 mt-1`}>
                  <Icon name={getInsightIcon(insight?.type)} size={16} className={getInsightColor(insight?.type)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{insight?.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${insight?.impact === 'High' ? 'bg-error/10 text-error' : insight?.impact === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {localizedImpact(insight?.impact)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{insight?.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="Target" size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{insight?.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{insight?.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('strategicRecommendations', 'Strategic Recommendations')}</h3>
            <p className="text-sm text-muted-foreground">{t('actionItemsForContinuousImprovement', 'Action items for continuous improvement')}</p>
          </div>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" iconSize={16}>
            {t('addCustom', 'Add Custom')}
          </Button>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec?.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 micro-interaction">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${rec?.priority === 'high' ? 'bg-error' : rec?.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                  <h4 className="font-medium text-foreground">{rec?.title}</h4>
                </div>
                <span className={`text-xs font-medium uppercase tracking-wide ${getPriorityColor(rec?.priority)}`}>
                  {localizedPriority(rec?.priority)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 ml-5">{rec?.description}</p>
              <div className="flex items-center justify-between ml-5">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{rec?.timeline}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Target" size={12} />
                    <span>{rec?.impact}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">{t('viewDetails', 'View Details')}</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isArabic
                ? `${recommendations.length} توصيات • ملخص التشغيل المباشر`
                : `${recommendations.length} ${t('recommendations', 'recommendations')} • ${t('liveOperationalSummary', 'Live operational summary')}`}
            </div>
            <Button variant="outline" size="sm">{t('exportActionPlan', 'Export Action Plan')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyInsightsSummary;
