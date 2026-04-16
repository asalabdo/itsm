import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import Icon from '../../../components/AppIcon';

const PersonalPerformanceCard = ({ tickets = [] }) => {
  const { language } = useLanguage();
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
    { title: 'Quick Resolver', description: `${Math.max(1, currentStats.totalResolved)} tickets resolved from backend data`, icon: 'Zap', color: 'text-warning' },
    { title: 'Employee Champion', description: `${currentStats.customerSatisfaction || 0}/5 average satisfaction`, icon: 'Heart', color: 'text-error' },
    { title: 'Knowledge Expert', description: `${Math.max(0, tickets.filter(t => (t.resolutionNotes || '').length > 25).length)} documented resolutions`, icon: 'BookOpen', color: 'text-blue-500' }
  ], [currentStats, tickets]);

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
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="TrendingUp" size={20} />
            <span>Personal Performance Dashboard</span>
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e?.target?.value)}
              className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
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
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle2" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Resolved</p>
                <p className="text-lg font-bold text-foreground">{currentStats?.totalResolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-success/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success text-success-foreground rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Resolution</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.avgResolutionTime, 'resolution')}`}>
                  {currentStats?.avgResolutionTime}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning text-warning-foreground rounded-lg flex items-center justify-center">
                <Icon name="Star" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.customerSatisfaction, 'satisfaction')}`}>
                  {currentStats?.customerSatisfaction}/5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                <Icon name="Target" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">First Call Resolution</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.firstCallResolution, 'percentage')}`}>
                  {currentStats?.firstCallResolution}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center">
                <Icon name="Activity" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Productivity Score</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.productivity, 'percentage')}`}>
                  {currentStats?.productivity}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-lg flex items-center justify-center">
                <Icon name="Brain" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Knowledge Score</p>
                <p className={`text-lg font-bold ${getStatColor(currentStats?.knowledgeScore, 'percentage')}`}>
                  {currentStats?.knowledgeScore}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resolution Trend Chart */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-4">Resolution Trend</h4>
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
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-4">Avg Resolution Time</h4>
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
          <h4 className="font-semibold text-foreground mb-4">Recent Achievements</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements?.map((achievement, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 flex items-start space-x-3">
                <div className={`flex-shrink-0 ${achievement?.color}`}>
                  <Icon name={achievement?.icon} size={24} />
                </div>
                <div>
                  <h5 className="font-medium text-foreground text-sm">{achievement?.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{achievement?.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">Monthly Goals Progress</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">Tickets Resolved (Target: 200)</span>
                <span className="text-primary font-medium">165/200 (83%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: '83%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">Employee Satisfaction (Target: 4.5)</span>
                <span className="text-success font-medium">4.4/5.0 (98%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success rounded-full h-2" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalPerformanceCard;
