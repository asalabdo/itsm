import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { ticketsAPI, dashboardAPI } from '../../../services/api';

const TicketVolumeMetrics = () => {
  const [volumeData, setVolumeData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchVolumeData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getPerformanceMetrics('tickets');
      const data = res.data || [];

      const formattedData = Array.isArray(data) && data.length > 0
        ? data.map(d => ({
            time: d.time || d.timestamp || '00:00',
            open: d.open || d.openTickets || 0,
            inProgress: d.inProgress || d.workingTickets || 0,
            resolved: d.resolved || d.resolvedTickets || 0,
            priority: d.priority || { P1: 0, P2: 0, P3: 0, P4: 0 }
          }))
        : [];

      setVolumeData(formattedData);
      const total = formattedData.reduce((sum, item) => sum + (item?.open + item?.inProgress + item?.resolved), 0);
      setTotalTickets(total);
    } catch (error) {
      console.error('Failed to fetch volume metrics:', error);
      setVolumeData([]);
      setTotalTickets(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumeData();
  }, [selectedPeriod]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchVolumeData();
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, [selectedPeriod]);

  const priorityColors = {
    P1: '#DC2626', // error
    P2: '#D97706', // warning
    P3: '#0891B2', // accent
    P4: '#059669'  // success
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 operations-shadow">
          <p className="font-medium text-popover-foreground mb-2">{`Time: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-sm text-error">Open: {data?.open}</p>
            <p className="text-sm text-warning">In Progress: {data?.inProgress}</p>
            <p className="text-sm text-success">Resolved: {data?.resolved}</p>
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Priority Breakdown:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span>P1: {data?.priority?.P1}</span>
              <span>P2: {data?.priority?.P2}</span>
              <span>P3: {data?.priority?.P3}</span>
              <span>P4: {data?.priority?.P4}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentStats = {
    open: volumeData?.reduce((sum, item) => sum + item?.open, 0),
    inProgress: volumeData?.reduce((sum, item) => sum + item?.inProgress, 0),
    resolved: volumeData?.reduce((sum, item) => sum + item?.resolved, 0)
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="BarChart3" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Ticket Volume Metrics</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e?.target?.value)}
            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <Icon name="RefreshCw" size={16} className="text-muted-foreground cursor-pointer hover:text-foreground" />
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-error">{currentStats?.open}</div>
          <div className="text-sm text-muted-foreground">Open</div>
          <div className="flex items-center justify-center mt-1">
            <Icon name="TrendingUp" size={14} className="text-error mr-1" />
            <span className="text-xs text-error">+12%</span>
          </div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-warning">{currentStats?.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="flex items-center justify-center mt-1">
            <Icon name="TrendingDown" size={14} className="text-success mr-1" />
            <span className="text-xs text-success">-5%</span>
          </div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-success">{currentStats?.resolved}</div>
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="flex items-center justify-center mt-1">
            <Icon name="TrendingUp" size={14} className="text-success mr-1" />
            <span className="text-xs text-success">+8%</span>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={volumeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="time" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="resolved" stackId="a" fill="var(--color-success)" />
            <Bar dataKey="inProgress" stackId="a" fill="var(--color-warning)" />
            <Bar dataKey="open" stackId="a" fill="var(--color-error)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Priority Distribution */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Priority Distribution (Current)</h4>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(priorityColors)?.map(([priority, color]) => {
            const count = volumeData?.reduce((sum, item) => sum + (item?.priority?.[priority] || 0), 0);
            const percentage = totalTickets > 0 ? ((count / totalTickets) * 100)?.toFixed(1) : 0;
            
            return (
              <div key={priority} className="text-center">
                <div className="w-full h-2 bg-muted rounded-full mb-2">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: color 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">{priority}</div>
                <div className="text-sm font-medium text-foreground">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TicketVolumeMetrics;
