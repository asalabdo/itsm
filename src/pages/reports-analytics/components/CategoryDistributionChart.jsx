import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CategoryDistributionChart = () => {
  const data = [
    { name: 'Technical Support', value: 342, percentage: 38 },
    { name: 'Billing Inquiry', value: 256, percentage: 28 },
    { name: 'Sales Request', value: 178, percentage: 20 },
    { name: 'General Inquiry', value: 89, percentage: 10 },
    { name: 'Account Management', value: 45, percentage: 4 },
  ];

  const COLORS = [
    'var(--color-primary)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-accent)',
    'var(--color-secondary)',
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-3">
          <p className="text-sm font-medium text-foreground mb-1">{data?.name}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground caption">Tickets:</span>
            <span className="font-medium text-foreground data-text">{data?.value}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground caption">Percentage:</span>
            <span className="font-medium text-foreground data-text">{data?.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Ticket Category Distribution">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={window.innerWidth < 768 ? 80 : 120}
            fill="#8884d8"
            dataKey="value"
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistributionChart;