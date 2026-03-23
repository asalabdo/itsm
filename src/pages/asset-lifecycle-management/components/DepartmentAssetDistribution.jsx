import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const DepartmentAssetDistribution = () => {
  const [viewMode, setViewMode] = useState('count'); // 'count' or 'cost'
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const departmentData = [
    {
      department: 'IT Operations',
      assetCount: 1247,
      totalCost: 2450000,
      utilization: 87,
      categories: {
        servers: 156,
        networking: 89,
        storage: 45,
        workstations: 234,
        software: 723
      },
      costBreakdown: {
        servers: 1200000,
        networking: 450000,
        storage: 300000,
        workstations: 350000,
        software: 150000
      }
    },
    {
      department: 'Engineering',
      assetCount: 892,
      totalCost: 1890000,
      utilization: 92,
      categories: {
        servers: 45,
        networking: 23,
        storage: 12,
        workstations: 456,
        software: 356
      },
      costBreakdown: {
        servers: 450000,
        networking: 120000,
        storage: 80000,
        workstations: 912000,
        software: 328000
      }
    },
    {
      department: 'Sales',
      assetCount: 567,
      totalCost: 890000,
      utilization: 78,
      categories: {
        servers: 12,
        networking: 34,
        storage: 8,
        workstations: 234,
        software: 279
      },
      costBreakdown: {
        servers: 120000,
        networking: 180000,
        storage: 40000,
        workstations: 350000,
        software: 200000
      }
    },
    {
      department: 'Marketing',
      assetCount: 423,
      totalCost: 650000,
      utilization: 85,
      categories: {
        servers: 8,
        networking: 19,
        storage: 5,
        workstations: 156,
        software: 235
      },
      costBreakdown: {
        servers: 80000,
        networking: 95000,
        storage: 25000,
        workstations: 234000,
        software: 216000
      }
    },
    {
      department: 'Finance',
      assetCount: 234,
      totalCost: 450000,
      utilization: 91,
      categories: {
        servers: 5,
        networking: 12,
        storage: 3,
        workstations: 89,
        software: 125
      },
      costBreakdown: {
        servers: 50000,
        networking: 60000,
        storage: 15000,
        workstations: 178000,
        software: 147000
      }
    },
    {
      department: 'HR',
      assetCount: 156,
      totalCost: 280000,
      utilization: 82,
      categories: {
        servers: 2,
        networking: 8,
        storage: 2,
        workstations: 67,
        software: 77
      },
      costBreakdown: {
        servers: 20000,
        networking: 40000,
        storage: 10000,
        workstations: 134000,
        software: 76000
      }
    }
  ];

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-success';
    if (utilization >= 80) return 'text-warning';
    return 'text-error';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 operations-shadow">
          <h4 className="font-semibold text-popover-foreground mb-2">{label}</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">Assets:</span>
              <span className="text-sm font-medium">{data?.assetCount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Cost:</span>
              <span className="text-sm font-medium">${(data?.totalCost / 1000000)?.toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Utilization:</span>
              <span className={`text-sm font-medium ${getUtilizationColor(data?.utilization)}`}>
                {data?.utilization}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data) => {
    setSelectedDepartment(selectedDepartment?.department === data?.department ? null : data);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Department Asset Distribution</h3>
          <p className="text-sm text-muted-foreground">Asset allocation and utilization by department</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('count')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'count' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Count
            </button>
            <button
              onClick={() => setViewMode('cost')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'cost' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Cost
            </button>
          </div>
          <Icon name="MoreHorizontal" size={18} className="text-muted-foreground cursor-pointer" />
        </div>
      </div>
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={departmentData} 
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
              tickFormatter={(value) => 
                viewMode === 'cost' ? `$${(value / 1000000)?.toFixed(1)}M` : value?.toLocaleString()
              }
            />
            <YAxis 
              type="category"
              dataKey="department"
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={viewMode === 'cost' ? 'totalCost' : 'assetCount'}
              fill="#005051"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={handleBarClick}
            >
              {departmentData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={selectedDepartment?.department === entry?.department ? '#2563EB' : '#005051'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Department Details */}
      {selectedDepartment && (
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">{selectedDepartment?.department} - Asset Breakdown</h4>
            <button 
              onClick={() => setSelectedDepartment(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {Object.entries(selectedDepartment?.categories)?.map(([category, count]) => {
              const cost = selectedDepartment?.costBreakdown?.[category];
              return (
                <div key={category} className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold text-foreground">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize mb-1">{category}</div>
                  <div className="text-xs text-success">${(cost / 1000)?.toFixed(0)}K</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-sm text-muted-foreground">Total Assets: </span>
                <span className="font-medium">{selectedDepartment?.assetCount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Cost: </span>
                <span className="font-medium">${(selectedDepartment?.totalCost / 1000000)?.toFixed(1)}M</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Utilization: </span>
                <span className={`font-medium ${getUtilizationColor(selectedDepartment?.utilization)}`}>
                  {selectedDepartment?.utilization}%
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
                <Icon name="Eye" size={16} />
                <span>View Assets</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
                <Icon name="Download" size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {departmentData?.reduce((sum, dept) => sum + dept?.assetCount, 0)?.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Assets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              ${(departmentData?.reduce((sum, dept) => sum + dept?.totalCost, 0) / 1000000)?.toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {Math.round(departmentData?.reduce((sum, dept) => sum + dept?.utilization, 0) / departmentData?.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Utilization</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{departmentData?.length}</div>
            <div className="text-sm text-muted-foreground">Departments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAssetDistribution;