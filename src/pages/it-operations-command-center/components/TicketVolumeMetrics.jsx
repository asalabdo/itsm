import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const TicketVolumeMetrics = () => {
  const [volumeData, setVolumeData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    // Mock ticket volume data
    const mockData = [
      { time: '00:00', open: 12, inProgress: 8, resolved: 15, priority: { P1: 2, P2: 8, P3: 15, P4: 10 } },
      { time: '02:00', open: 8, inProgress: 12, resolved: 18, priority: { P1: 1, P2: 6, P3: 18, P4: 13 } },
      { time: '04:00', open: 15, inProgress: 6, resolved: 12, priority: { P1: 3, P2: 9, P3: 12, P4: 9 } },
      { time: '06:00', open: 22, inProgress: 18, resolved: 25, priority: { P1: 4, P2: 15, P3: 25, P4: 21 } },
      { time: '08:00', open: 35, inProgress: 28, resolved: 32, priority: { P1: 6, P2: 22, P3: 32, P4: 35 } },
      { time: '10:00', open: 28, inProgress: 32, resolved: 38, priority: { P1: 5, P2: 18, P3: 38, P4: 37 } },
      { time: '12:00', open: 42, inProgress: 35, resolved: 45, priority: { P1: 8, P2: 28, P3: 45, P4: 41 } },
      { time: '14:00', open: 38, inProgress: 42, resolved: 48, priority: { P1: 7, P2: 25, P3: 48, P4: 48 } },
      { time: '16:00', open: 32, inProgress: 38, resolved: 42, priority: { P1: 5, P2: 22, P3: 42, P4: 43 } },
      { time: '18:00', open: 25, inProgress: 28, resolved: 35, priority: { P1: 3, P2: 18, P3: 35, P4: 32 } },
      { time: '20:00', open: 18, inProgress: 22, resolved: 28, priority: { P1: 2, P2: 12, P3: 28, P4: 26 } },
      { time: '22:00', open: 12, inProgress: 15, resolved: 22, priority: { P1: 1, P2: 8, P3: 22, P4: 18 } }
    ];

    setVolumeData(mockData);
    
    // Calculate total tickets
    const total = mockData?.reduce((sum, item) => sum + item?.open + item?.inProgress + item?.resolved, 0);
    setTotalTickets(total);
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