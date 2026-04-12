import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SLAPerformanceChart = () => {
  const data = [
    { month: 'Jul', met: 92, breached: 8, target: 95 },
    { month: 'Aug', met: 88, breached: 12, target: 95 },
    { month: 'Sep', met: 94, breached: 6, target: 95 },
    { month: 'Oct', met: 91, breached: 9, target: 95 },
    { month: 'Nov', met: 96, breached: 4, target: 95 },
    { month: 'Dec', met: 93, breached: 7, target: 95 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-3">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-muted-foreground caption">{entry?.name}:</span>
              </span>
              <span className="font-medium text-foreground data-text">{entry?.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="SLA Performance Trend">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
            label={{ value: 'Percentage', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="circle"
          />
          <Bar
            dataKey="met"
            name="SLA Met"
            fill="var(--color-success)"
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
          <Bar
            dataKey="breached"
            name="SLA Breached"
            fill="var(--color-error)"
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
          <Bar
            dataKey="target"
            name="Target"
            fill="var(--color-muted)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SLAPerformanceChart;