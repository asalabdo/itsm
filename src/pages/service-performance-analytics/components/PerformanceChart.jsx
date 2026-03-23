import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Button from '../../../components/ui/Button';

const PerformanceChart = () => {
  const [chartView, setChartView] = useState('combined');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const chartData = [
    {
      date: 'Sep 14',
      ticketVolume: 145,
      avgResolutionTime: 4.2,
      slaCompliance: 94.5,
      customerSat: 4.3
    },
    {
      date: 'Sep 15',
      ticketVolume: 132,
      avgResolutionTime: 3.8,
      slaCompliance: 96.2,
      customerSat: 4.5
    },
    {
      date: 'Sep 16',
      ticketVolume: 168,
      avgResolutionTime: 5.1,
      slaCompliance: 91.8,
      customerSat: 4.1
    },
    {
      date: 'Sep 17',
      ticketVolume: 156,
      avgResolutionTime: 4.6,
      slaCompliance: 93.4,
      customerSat: 4.2
    },
    {
      date: 'Sep 18',
      ticketVolume: 142,
      avgResolutionTime: 4.0,
      slaCompliance: 95.1,
      customerSat: 4.4
    },
    {
      date: 'Sep 19',
      ticketVolume: 139,
      avgResolutionTime: 3.9,
      slaCompliance: 95.8,
      customerSat: 4.6
    },
    {
      date: 'Sep 20',
      ticketVolume: 151,
      avgResolutionTime: 4.3,
      slaCompliance: 94.2,
      customerSat: 4.3
    },
    {
      date: 'Sep 21',
      ticketVolume: 147,
      avgResolutionTime: 4.1,
      slaCompliance: 94.8,
      customerSat: 4.4
    }
  ];

  const drillDownOptions = [
    { value: 'all', label: 'All Services', icon: 'BarChart3' },
    { value: 'service-type', label: 'By Service Type', icon: 'Layers' },
    { value: 'priority', label: 'By Priority', icon: 'AlertTriangle' },
    { value: 'technician', label: 'By Technician', icon: 'Users' },
    { value: 'department', label: 'By Department', icon: 'Building' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-4 operations-shadow">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-popover-foreground">{entry?.name}:</span>
              </div>
              <span className="text-sm font-medium text-popover-foreground">
                {entry?.name === 'Ticket Volume' ? entry?.value : 
                 entry?.name === 'Avg Resolution Time' ? `${entry?.value}h` :
                 entry?.name === 'SLA Compliance' ? `${entry?.value}%` :
                 `${entry?.value}/5`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Performance Trends</h3>
          <p className="text-sm text-muted-foreground">Ticket volume and resolution time correlation</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {drillDownOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartView(chartView === 'combined' ? 'separate' : 'combined')}
            iconName="Layers"
            iconPosition="left"
          >
            {chartView === 'combined' ? 'Separate' : 'Combined'}
          </Button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Bar 
              yAxisId="left"
              dataKey="ticketVolume" 
              name="Ticket Volume"
              fill="var(--color-primary)" 
              opacity={0.8}
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="avgResolutionTime" 
              name="Avg Resolution Time"
              stroke="var(--color-secondary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="slaCompliance" 
              name="SLA Compliance"
              stroke="var(--color-success)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">147</div>
            <div className="text-xs text-muted-foreground">Avg Daily Volume</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">4.1h</div>
            <div className="text-xs text-muted-foreground">Avg Resolution</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">94.8%</div>
            <div className="text-xs text-muted-foreground">SLA Compliance</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">4.4/5</div>
            <div className="text-xs text-muted-foreground">Employee Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;