import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import apiClient from '../../../services/apiClient';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ServiceHealthScorecard = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiClient.get('/reports/categories').then(r => setCategories(r.data || [])).catch(console.error);
  }, []);

  const getStatusByCount = (count) => {
    if (count === 0) return 'excellent';
    if (count <= 2) return 'good';
    if (count <= 5) return 'warning';
    return 'critical';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return 'CheckCircle';
      case 'good': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'critical': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'excellent': return 'bg-success/10';
      case 'good': return 'bg-primary/10';
      case 'warning': return 'bg-warning/10';
      case 'critical': return 'bg-error/10';
      default: return 'bg-muted';
    }
  };

  const total = categories.reduce((s, c) => s + (c.count || 0), 0);
  const healthy = categories.filter(c => getStatusByCount(c.count) !== 'critical').length;
  const healthPct = categories.length > 0 ? Math.round((healthy / categories.length) * 100) : 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('serviceHealthScorecard', 'Service Health Scorecard')}</h3>
          <p className="text-sm text-muted-foreground">{t('ticketDistributionByCategory', 'Ticket distribution by category')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('live', 'Live')}</span>
        </div>
      </div>
      <div className="space-y-4">
        {categories.map((cat, i) => {
          const status = getStatusByCount(cat.count);
          return (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusBg(status)}`}>
                  <Icon name={getStatusIcon(status)} size={20} className={getStatusColor(status)} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{cat.category}</h4>
                  <p className="text-sm text-muted-foreground">{cat.count} {t('openTickets', 'open tickets')}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium capitalize ${getStatusColor(status)}`}>{status}</span>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">{t('noDataAvailable', 'No data available')}</p>
        )}
      </div>
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('overallServiceHealth', 'Overall Service Health')}</span>
        <div className="flex items-center space-x-2">
          <Icon name="CheckCircle" size={16} className="text-success" />
          <span className="font-medium text-success">{healthPct}% {t('healthy', 'Healthy')}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceHealthScorecard;
