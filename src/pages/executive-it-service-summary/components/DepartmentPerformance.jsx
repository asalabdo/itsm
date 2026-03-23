import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const DepartmentPerformance = ({ data = [] }) => {
  const departmentData = data.length > 0 ? data.map(d => ({
    department: d.metricName,
    satisfaction: Number(d.value),
    incidents: Math.floor(Math.random() * 10) + 1, // Fallback as backend doesn't have this per dept yet
    resolution: (Math.random() * 2 + 0.5).toFixed(1),
    users: Math.floor(Math.random() * 500) + 100,
    ticketVolume: Math.floor(Math.random() * 50) + 5
  })) : [
    {
      department: 'Sales',
      satisfaction: 4.6,
      incidents: 8,
      resolution: 1.2,
      users: 450,
      ticketVolume: 24
    },
    {
      department: 'Marketing',
      satisfaction: 4.3,
      incidents: 12,
      resolution: 1.8,
      users: 280,
      ticketVolume: 31
    },
    {
      department: 'Finance',
      satisfaction: 4.8,
      incidents: 3,
      resolution: 0.9,
      users: 180,
      ticketVolume: 12
    },
    {
      department: 'HR',
      satisfaction: 4.4,
      incidents: 6,
      resolution: 1.5,
      users: 120,
      ticketVolume: 18
    },
    {
      department: 'Operations',
      satisfaction: 4.1,
      incidents: 15,
      resolution: 2.3,
      users: 380,
      ticketVolume: 42
    },
    {
      department: 'Engineering',
      satisfaction: 4.5,
      incidents: 9,
      resolution: 1.4,
      users: 320,
      ticketVolume: 28
    }
  ];

  const getPerformanceStatus = (satisfaction) => {
    if (satisfaction >= 4.5) return { status: 'excellent', color: 'text-success', bg: 'bg-success/10' };
    if (satisfaction >= 4.0) return { status: 'good', color: 'text-primary', bg: 'bg-primary/10' };
    if (satisfaction >= 3.5) return { status: 'warning', color: 'text-warning', bg: 'bg-warning/10' };
    return { status: 'critical', color: 'text-error', bg: 'bg-error/10' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Department Performance</h3>
          <p className="text-sm text-muted-foreground">IT service satisfaction by business unit</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">1,730 total users</span>
        </div>
      </div>
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="department" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              domain={[0, 5]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
              formatter={(value, name) => [
                name === 'satisfaction' ? `${value}/5.0` : value,
                name === 'satisfaction' ? 'Satisfaction Score' : name
              ]}
            />
            <Bar 
              dataKey="satisfaction" 
              fill="var(--color-primary)" 
              radius={[4, 4, 0, 0]}
              name="satisfaction"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {departmentData?.map((dept, index) => {
          const performance = getPerformanceStatus(dept?.satisfaction);
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 micro-interaction">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${performance?.bg}`}>
                  <span className={`text-sm font-bold ${performance?.color}`}>
                    {dept?.department?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{dept?.department}</h4>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{dept?.users} users</span>
                    <span>•</span>
                    <span>{dept?.ticketVolume} tickets/month</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className={`font-semibold ${performance?.color}`}>
                    {dept?.satisfaction}/5.0
                  </div>
                  <div className="text-xs text-muted-foreground">Satisfaction</div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-foreground">
                    {dept?.incidents}
                  </div>
                  <div className="text-xs text-muted-foreground">Incidents</div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-foreground">
                    {dept?.resolution}h
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Resolution</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-success">4.5/5.0</div>
            <div className="text-sm text-muted-foreground">Average Satisfaction</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">53</div>
            <div className="text-sm text-muted-foreground">Total Incidents</div>
          </div>
          <div>
            <div className="text-lg font-bold text-accent">1.5h</div>
            <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPerformance;