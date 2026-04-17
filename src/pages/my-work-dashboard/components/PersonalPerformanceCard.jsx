import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import Icon from '../../../components/AppIcon';

const PersonalPerformanceCard = ({ tickets = [] }) => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [timeRange, setTimeRange] = useState('week');
  
  const data = useMemo(() => {
    const resolved = tickets.filter((t) => String(t.status).toLowerCase() === 'resolved');
    const weekly = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const dayTickets = resolved.filter((ticket) => new Date(ticket.updatedAt || ticket.createdAt).toDateString() === day.toDateString());
      return {
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        resolved: dayTickets.length,
        avgTime: dayTickets.length ? Math.round(dayTickets.reduce((sum, ticket) => sum + Math.max(5, Math.floor(((new Date(ticket.updatedAt || Date.now())) - new Date(ticket.createdAt || Date.now())) / 60000)), 0) / dayTickets.length) : 0,
        satisfaction: dayTickets.length ? Number((dayTickets.reduce((sum, ticket) => sum + (ticket.satisfactionScore || 4.5), 0) / dayTickets.length).toFixed(1)) : 0
      };
    });
    const monthly = Array.from({ length: 4 }, (_, index) => {
      const slice = resolved.slice(index * 10, index * 10 + 10);
      return {
        day: `Week ${index + 1}`,
        resolved: slice.length,
        avgTime: slice.length ? Math.round(slice.reduce((sum, ticket) => sum + Math.max(5, Math.floor(((new Date(ticket.updatedAt || Date.now())) - new Date(ticket.createdAt || Date.now())) / 60000)), 0) / slice.length) : 0,
        satisfaction: slice.length ? Number((slice.reduce((sum, ticket) => sum + (ticket.satisfactionScore || 4.5), 0) / slice.length).toFixed(1)) : 0
      };
    });
    return timeRange === 'week' ? weekly : monthly;
  }, [tickets, timeRange]);

  const currentStats = useMemo(() => {
    const resolved = tickets.filter((t) => String(t.status).toLowerCase() === 'resolved');
    const avgResolutionTime = resolved.length
      ? Math.round(resolved.reduce((sum, ticket) => sum + Math.max(5, Math.floor(((new Date(ticket.updatedAt || Date.now())) - new Date(ticket.createdAt || Date.now())) / 60000)), 0) / resolved.length)
      : 0;
    const avgSatisfaction = resolved.length
      ? Number((resolved.reduce((sum, ticket) => sum + (ticket.satisfactionScore || 4.5), 0) / resolved.length).toFixed(1))
      : 0;
    return {
      totalResolved: resolved.length,
      avgResolutionTime,
      customerSatisfaction: avgSatisfaction,
      firstCallResolution: tickets.length ? Math.round((resolved.length / tickets.length) * 100) : 0,
      productivity: Math.min(100, 50 + resolved.length * 2),
      knowledgeScore: Math.min(100, 60 + resolved.filter((ticket) => String(ticket.resolutionNotes || '').length > 20).length * 5)
    };
  }, [tickets]);

  const achievements = useMemo(() => [
    { title: t('quickResolver', 'Quick Resolver'), description: `${Math.max(1, currentStats.totalResolved)} ${t('ticketsResolvedFromBackend', 'tickets resolved from backend data')}`, icon: 'Zap', color: 'text-warning' },
    { title: t('employeeChampion', 'Employee Champion'), description: `${currentStats.customerSatisfaction || 0}/5 ${t('averageSatisfaction', 'average satisfaction')}`, icon: 'Heart', color: 'text-error' },
    { title: t('knowledgeExpert', 'Knowledge Expert'), description: `${Math.max(0, tickets.filter(t => (t.resolutionNotes || '').length > 25).length)} ${t('documentedResolutions', 'documented resolutions')}`, icon: 'BookOpen', color: 'text-blue-500' }
  ], [currentStats, tickets, language]);

  const getStatColor = (value, type) => {
    switch (type) {
      case 'satisfaction':
        if (value >= 4.5) return 'text-success';
        if (value >= 4.0) return 'text-warning';
        return 'text-error';
      case 'resolution':
        if (value <= 30) return 'text-success';
        if (value <= 45) return 'text-warning';
        return 'text-error';
      case 'percentage':
        if (value >= 90) return 'text-success';
        if (value >= 75) return 'text-warning';
        return 'text-error';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className={`text-xl font-bold text-foreground flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md">
              <Icon name="TrendingUp" size={24} className="text-primary-foreground" />
            </div>
            <span>{t('personalPerformanceDashboard', 'Personal Performance Dashboard')}</span>
          </h3>
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e?.target?.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <option value="week">{t('thisWeek', 'This Week')}</option>
              <option value="month">{t('thisMonth', 'This Month')}</option>
            </select>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="Download" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="CheckCircle2" size={20} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-xs text-muted-foreground mb-1">{t('totalResolved', 'Total Resolved')}</p>
                <p className="text-lg font-bold text-foreground">{currentStats?.totalResolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-success/10 rounded-lg p-4 border border-success/20">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-success text-success-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Clock" size={20} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-xs text-muted-foreground mb-1">{t('avgResolution', 'Avg Resolution')}</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.avgResolutionTime, 'resolution')}`}>
                  {currentStats?.avgResolutionTime}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-warning text-warning-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Star" size={20} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-xs text-muted-foreground mb-1">{t('satisfaction', 'Satisfaction')}</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.customerSatisfaction, 'satisfaction')}`}>
                  {currentStats?.customerSatisfaction}/5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Target" size={20} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-xs text-muted-foreground mb-1">{t('firstCallResolution', 'First Call Resolution')}</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.firstCallResolution, 'percentage')}`}>
                  {currentStats?.firstCallResolution}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Activity" size={20} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-xs text-muted-foreground mb-1">{t('productivityScore', 'Productivity Score')}</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.productivity, 'percentage')}`}>
                  {currentStats?.productivity}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Brain" size={20} />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-xs text-muted-foreground mb-1">{t('knowledgeScore', 'Knowledge Score')}</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.knowledgeScore, 'percentage')}`}>
                  {currentStats?.knowledgeScore}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resolution Trend Chart */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-4">{t('resolutionTrend', 'Resolution Trend')}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelClassName="text-foreground"
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Average Resolution Time */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-4">{t('avgResolutionTime', 'Avg Resolution Time')}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelClassName="text-foreground"
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="avgTime" 
                  fill="hsl(var(--warning))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-6">
          <h4 className="font-semibold text-foreground mb-4">{t('recentAchievements', 'Recent Achievements')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements?.map((achievement, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 ${achievement?.color}`}>
                    <Icon name={achievement?.icon} size={24} />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <h5 className="font-medium text-foreground text-sm mb-1">{achievement?.title}</h5>
                    <p className="text-xs text-muted-foreground">{achievement?.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
          <h4 className="font-semibold text-foreground mb-4">{t('monthlyGoalsProgress', 'Monthly Goals Progress')}</h4>
          <div className="space-y-4">
            <div>
              <div className={`flex justify-between text-sm mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="text-foreground">{t('ticketsResolvedTarget', 'Tickets Resolved (Target: 200)')}</span>
                <span className="text-primary font-medium">165/200 (83%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary rounded-full h-2.5 transition-all" style={{ width: '83%' }} />
              </div>
            </div>
            
            <div>
              <div className={`flex justify-between text-sm mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="text-foreground">{t('employeeSatisfactionTarget', 'Employee Satisfaction (Target: 4.5)')}</span>
                <span className="text-success font-medium">4.4/5.0 (98%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-success rounded-full h-2.5 transition-all" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalPerformanceCard;
