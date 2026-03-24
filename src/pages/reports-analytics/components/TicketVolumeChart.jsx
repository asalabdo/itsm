import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../../../services/apiClient';

const TicketVolumeChart = ({ chartType = 'line' }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiClient.get('/reports/trends?days=14').then(r => {
      setData((r.data || []).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
        created: d.created,
        resolved: d.resolved,
        pending: d.pending,
      })));
    }).catch(console.error);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-3">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry?.color }} />
                <span className="text-muted-foreground caption">{entry?.name}:</span>
              </span>
              <span className="font-medium text-foreground data-text">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Ticket Volume Trend Chart">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} iconType="circle" />
            <Line type="monotone" dataKey="created" name="Created" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="resolved" name="Resolved" stroke="var(--color-success)" strokeWidth={2} dot={{ fill: 'var(--color-success)', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="pending" name="Pending" stroke="var(--color-warning)" strokeWidth={2} dot={{ fill: 'var(--color-warning)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} iconType="circle" />
            <Bar dataKey="created" name="Created" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="resolved" name="Resolved" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" name="Pending" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default TicketVolumeChart;
