import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';

const PersonalPerformanceCard = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  const performanceData = {
    week: [
      { day: 'Mon', resolved: 8, avgTime: 45, satisfaction: 4.2 },
      { day: 'Tue', resolved: 12, avgTime: 38, satisfaction: 4.5 },
      { day: 'Wed', resolved: 6, avgTime: 52, satisfaction: 4.0 },
      { day: 'Thu', resolved: 15, avgTime: 32, satisfaction: 4.8 },
      { day: 'Fri', resolved: 10, avgTime: 41, satisfaction: 4.3 },
      { day: 'Sat', resolved: 4, avgTime: 48, satisfaction: 4.1 },
      { day: 'Sun', resolved: 3, avgTime: 35, satisfaction: 4.7 }
    ],
    month: [
      { day: 'Week 1', resolved: 45, avgTime: 42, satisfaction: 4.3 },
      { day: 'Week 2', resolved: 52, avgTime: 38, satisfaction: 4.5 },
      { day: 'Week 3', resolved: 48, avgTime: 45, satisfaction: 4.2 },
      { day: 'Week 4', resolved: 51, avgTime: 36, satisfaction: 4.6 }
    ]
  };

  const currentStats = {
    totalResolved: 51,
    avgResolutionTime: 39,
    customerSatisfaction: 4.4,
    firstCallResolution: 85,
    productivity: 92,
    knowledgeScore: 88
  };

  const achievements = [
    { title: 'Quick Resolver', description: 'Resolved 10+ tickets in under 30 minutes', icon: 'Zap', color: 'text-warning' },
    { title: 'Employee Champion', description: 'Maintained 4.5+ satisfaction rating', icon: 'Heart', color: 'text-error' },
    { title: 'Knowledge Expert', description: 'Contributed 5 solutions to knowledge base', icon: 'BookOpen', color: 'text-blue-500' }
  ];

  const data = performanceData?.[timeRange];

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