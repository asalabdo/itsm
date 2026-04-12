import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';


const ChartWidget = ({ title, type, data, config }) => {
  const [chartType, setChartType] = useState(type);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.375rem'
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.375rem'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.375rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${isFullscreen ? 'fixed inset-4 z-1300' : ''}`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded transition-smooth ${chartType === 'bar' ? 'bg-background' : 'hover:bg-background/50'}`}
              aria-label="Bar chart"
            >
              <Icon name="BarChart3" size={16} />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded transition-smooth ${chartType === 'line' ? 'bg-background' : 'hover:bg-background/50'}`}
              aria-label="Line chart"
            >
              <Icon name="LineChart" size={16} />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-1.5 rounded transition-smooth ${chartType === 'pie' ? 'bg-background' : 'hover:bg-background/50'}`}
              aria-label="Pie chart"
            >
              <Icon name="PieChart" size={16} />
            </button>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-md hover:bg-muted transition-smooth"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={16} />
          </button>
        </div>
      </div>
      <div className={`${isFullscreen ? 'h-[calc(100%-4rem)]' : 'h-64 sm:h-80'} p-4`} aria-label={`${title} visualization`}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartWidget;