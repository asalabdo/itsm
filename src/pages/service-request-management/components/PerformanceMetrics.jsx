import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PerformanceMetrics = ({ expanded = false }) => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    // Mock performance metrics data
    const mockMetrics = {
      summary: {
        totalRequests: 1847,
        completionRate: 94.2,
        avgFulfillmentTime: 2.8,
        customerSatisfaction: 4.6
      },
      fulfillmentTrends: [
        { month: 'Oct', requests: 156, fulfilled: 148, avgTime: 3.1 },
        { month: 'Nov', requests: 173, fulfilled: 162, avgTime: 2.9 },
        { month: 'Dec', requests: 189, fulfilled: 181, avgTime: 2.7 },
        { month: 'Jan', requests: 201, fulfilled: 189, avgTime: 2.8 }
      ],
      servicePopularity: [
        { name: 'IT Support', value: 28, requests: 518, color: '#8884d8' },
        { name: 'Software License', value: 22, requests: 406, color: '#82ca9d' },
        { name: 'Hardware Request', value: 18, requests: 332, color: '#ffc658' },
        { name: 'Access Request', value: 16, requests: 295, color: '#ff7300' },
        { name: 'New Employee', value: 10, requests: 185, color: '#8dd1e1' },
        { name: 'Other', value: 6, requests: 111, color: '#d084d0' }
      ],
      satisfactionTrends: [
        { month: 'Oct', score: 4.4, responses: 89 },
        { month: 'Nov', score: 4.5, responses: 102 },
        { month: 'Dec', score: 4.6, responses: 118 },
        { month: 'Jan', score: 4.6, responses: 125 }
      ],
      departmentMetrics: [
        { department: 'Engineering', requests: 456, completion: 96, avgTime: 2.3 },
        { department: 'Marketing', requests: 287, completion: 94, avgTime: 2.8 },
        { department: 'Sales', requests: 345, completion: 92, avgTime: 3.1 },
        { department: 'HR', requests: 198, completion: 98, avgTime: 2.1 },
        { department: 'Finance', requests: 167, completion: 95, avgTime: 2.6 }
      ],
      technicianPerformance: [
        { name: 'Alex Rodriguez', resolved: 89, avgTime: 2.1, satisfaction: 4.8 },
        { name: 'Sarah Johnson', resolved: 76, avgTime: 2.3, satisfaction: 4.7 },
        { name: 'Mike Chen', resolved: 68, avgTime: 2.8, satisfaction: 4.5 },
        { name: 'Lisa Wang', resolved: 62, avgTime: 3.1, satisfaction: 4.4 },
        { name: 'David Wilson', resolved: 54, avgTime: 2.9, satisfaction: 4.6 }
      ]
    };

    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 900);
  }, [timeRange]);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '12m', label: 'Last 12 months' }
  ];

  const formatTooltip = (value, name) => {
    if (name === 'avgTime') return [`${value} days`, 'Avg. Time'];
    if (name === 'completion') return [`${value}%`, 'Completion Rate'];
    if (name === 'score') return [`${value}/5`, 'Satisfaction'];
    return [value, name];
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border operations-shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Performance Metrics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Service delivery analytics and KPI tracking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            {timeRangeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} />
            <span className="ml-2">Export</span>
          </Button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-semibold text-foreground">
                {metrics?.summary?.totalRequests?.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="ClipboardList" size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingUp" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">+12.5% from last month</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-semibold text-foreground">
                {metrics?.summary?.completionRate}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingUp" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">+2.1% from last month</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Fulfillment</p>
              <p className="text-2xl font-semibold text-foreground">
                {metrics?.summary?.avgFulfillmentTime} days
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingDown" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">-0.3 days improved</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Employee Satisfaction</p>
              <p className="text-2xl font-semibold text-foreground">
                {metrics?.summary?.customerSatisfaction}/5
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Star" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingUp" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">+0.1 from last month</span>
          </div>
        </div>
      </div>
      {/* Charts Grid */}
      <div className={`grid grid-cols-1 ${expanded ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
        {/* Fulfillment Trends */}
        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Fulfillment Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics?.fulfillmentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={formatTooltip} />
              <Area 
                type="monotone" 
                dataKey="requests" 
                stackId="1"
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6}
                name="Total Requests"
              />
              <Area 
                type="monotone" 
                dataKey="fulfilled" 
                stackId="1"
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.8}
                name="Fulfilled"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Popularity */}
        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Service Popularity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metrics?.servicePopularity}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {metrics?.servicePopularity?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {metrics?.servicePopularity?.slice(0, 4)?.map((service, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: service?.color }}
                ></div>
                <span className="text-xs text-muted-foreground">{service?.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics?.departmentMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="department" 
                stroke="#666" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={formatTooltip} />
              <Bar dataKey="requests" fill="#8884d8" name="Requests" />
              <Bar dataKey="completion" fill="#82ca9d" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Satisfaction Trends */}
        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Employee Satisfaction</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics?.satisfactionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis 
                domain={[4.0, 5.0]} 
                stroke="#666" 
                fontSize={12}
                tickFormatter={(value) => value?.toFixed(1)}
              />
              <Tooltip formatter={formatTooltip} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                name="Satisfaction Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Technician Performance Table */}
      {expanded && (
        <div className="mt-6 bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Top Performing Technicians</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">Technician</th>
                  <th className="text-right py-2 text-muted-foreground">Resolved</th>
                  <th className="text-right py-2 text-muted-foreground">Avg. Time</th>
                  <th className="text-right py-2 text-muted-foreground">Satisfaction</th>
                  <th className="text-right py-2 text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.technicianPerformance?.map((tech, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 font-medium text-foreground">{tech?.name}</td>
                    <td className="py-3 text-right text-foreground">{tech?.resolved}</td>
                    <td className="py-3 text-right text-foreground">{tech?.avgTime} days</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end">
                        <Icon name="Star" size={14} className="text-yellow-500 mr-1" />
                        <span className="text-foreground">{tech?.satisfaction}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end">
                        {tech?.satisfaction >= 4.7 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Excellent
                          </span>
                        )}
                        {tech?.satisfaction >= 4.5 && tech?.satisfaction < 4.7 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Good
                          </span>
                        )}
                        {tech?.satisfaction < 4.5 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            Average
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;