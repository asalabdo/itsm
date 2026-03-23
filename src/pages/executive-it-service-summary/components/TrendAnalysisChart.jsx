import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrendAnalysisChart = ({ data = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const monthlyData = data.length > 0 ? data.map(d => ({
    month: d.metricName,
    incidents: Number(d.value),
    availability: (99.2 + Math.random() * 0.7).toFixed(1),
    satisfaction: (4.1 + Math.random() * 0.5).toFixed(1),
    resolution: (1.5 + Math.random() * 1.5).toFixed(1)
  })) : [
    { month: 'Jan', availability: 99.2, satisfaction: 4.2, incidents: 12, resolution: 2.4 },
    { month: 'Feb', availability: 99.5, satisfaction: 4.3, incidents: 8, resolution: 2.1 },
    { month: 'Mar', availability: 99.1, satisfaction: 4.1, incidents: 15, resolution: 2.8 },
    { month: 'Apr', availability: 99.7, satisfaction: 4.4, incidents: 6, resolution: 1.9 },
    { month: 'May', availability: 99.8, satisfaction: 4.5, incidents: 4, resolution: 1.7 },
    { month: 'Jun', availability: 99.6, satisfaction: 4.3, incidents: 7, resolution: 2.0 },
    { month: 'Jul', availability: 99.9, satisfaction: 4.6, incidents: 3, resolution: 1.5 },
    { month: 'Aug', availability: 99.4, satisfaction: 4.2, incidents: 9, resolution: 2.3 },
    { month: 'Sep', availability: 99.8, satisfaction: 4.5, incidents: 5, resolution: 1.8 }
  ];

  const quarterlyData = [
    { quarter: 'Q1 2024', availability: 99.3, satisfaction: 4.2, incidents: 35, resolution: 2.4 },
    { quarter: 'Q2 2024', availability: 99.7, satisfaction: 4.4, incidents: 17, resolution: 1.9 },
    { quarter: 'Q3 2024', availability: 99.7, satisfaction: 4.4, incidents: 17, resolution: 1.9 }
  ];

  const yearlyData = [
    { year: '2022', availability: 98.8, satisfaction: 3.9, incidents: 145, resolution: 3.2 },
    { year: '2023', availability: 99.2, satisfaction: 4.1, incidents: 98, resolution: 2.8 },
    { year: '2024', availability: 99.6, satisfaction: 4.3, incidents: 69, resolution: 2.1 }
  ];

  const getData = () => {
    switch (selectedPeriod) {
      case 'quarterly': return quarterlyData;
      case 'yearly': return yearlyData;
      default: return monthlyData;
    }
  };

  const getXAxisKey = () => {
    switch (selectedPeriod) {
      case 'quarterly': return 'quarter';
      case 'yearly': return 'year';
      default: return 'month';
    }
  };

  const periods = [
    { key: 'monthly', label: 'Monthly', icon: 'Calendar' },
    { key: 'quarterly', label: 'Quarterly', icon: 'BarChart3' },
    { key: 'yearly', label: 'Yearly', icon: 'TrendingUp' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Performance Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">Key metrics trending over time</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {periods?.map((period) => (
            <Button
              key={period?.key}
              variant={selectedPeriod === period?.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period?.key)}
              iconName={period?.icon}
              iconPosition="left"
              iconSize={16}
            >
              {period?.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey={getXAxisKey()} 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="availability" 
              stroke="var(--color-success)" 
              strokeWidth={3}
              name="Availability %"
              dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="satisfaction" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              name="Satisfaction Score"
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="resolution" 
              stroke="var(--color-accent)" 
              strokeWidth={3}
              name="Avg Resolution (hrs)"
              dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-sm font-medium text-success">Availability</span>
          </div>
          <p className="text-xs text-muted-foreground">Trending upward +0.8%</p>
        </div>
        
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Satisfaction</span>
          </div>
          <p className="text-xs text-muted-foreground">Steady improvement +0.4</p>
        </div>
        
        <div className="text-center p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingDown" size={16} className="text-accent" />
            <span className="text-sm font-medium text-accent">Resolution Time</span>
          </div>
          <p className="text-xs text-muted-foreground">Faster by 1.1 hours</p>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisChart;