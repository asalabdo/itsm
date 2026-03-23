import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const AssetLifecycleFunnel = ({ onStageClick }) => {
  const [selectedStage, setSelectedStage] = useState(null);

  const lifecycleData = [
    {
      stage: 'Procurement',
      count: 1247,
      percentage: 15.2,
      color: '#005051',
      description: 'Assets in procurement process',
      details: {
        pending: 89,
        approved: 158,
        ordered: 1000
      }
    },
    {
      stage: 'Deployment',
      count: 2834,
      percentage: 34.6,
      color: '#2563EB',
      description: 'Assets being deployed',
      details: {
        staging: 234,
        testing: 456,
        production: 2144
      }
    },
    {
      stage: 'Active',
      count: 3456,
      percentage: 42.1,
      color: '#059669',
      description: 'Assets in active use',
      details: {
        optimal: 2890,
        maintenance: 456,
        issues: 110
      }
    },
    {
      stage: 'Maintenance',
      count: 456,
      percentage: 5.6,
      color: '#D97706',
      description: 'Assets under maintenance',
      details: {
        scheduled: 234,
        emergency: 122,
        warranty: 100
      }
    },
    {
      stage: 'Retirement',
      count: 203,
      percentage: 2.5,
      color: '#DC2626',
      description: 'Assets scheduled for retirement',
      details: {
        planned: 156,
        immediate: 47,
        disposed: 0
      }
    }
  ];

  const handleStageClick = (data) => {
    setSelectedStage(data);
    if (onStageClick) {
      onStageClick(data);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 operations-shadow">
          <h4 className="font-semibold text-popover-foreground mb-2">{label}</h4>
          <p className="text-sm text-muted-foreground mb-2">{data?.description}</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">Count:</span>
              <span className="text-sm font-medium">{data?.count?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Percentage:</span>
              <span className="text-sm font-medium">{data?.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Asset Lifecycle Distribution</h3>
          <p className="text-sm text-muted-foreground">Click on stages to view detailed breakdown</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-muted-foreground" />
          <select className="text-sm border border-border rounded px-2 py-1 bg-background">
            <option>All Categories</option>
            <option>Hardware</option>
            <option>Software</option>
            <option>Network</option>
          </select>
        </div>
      </div>
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={lifecycleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="stage" 
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={handleStageClick}
            >
              {lifecycleData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Stage Details */}
      {selectedStage && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">{selectedStage?.stage} Stage Details</h4>
            <button 
              onClick={() => setSelectedStage(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(selectedStage?.details)?.map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
            <Icon name="Download" size={16} />
            <span>Export Report</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
            <Icon name="RefreshCw" size={16} />
            <span>Refresh Data</span>
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date()?.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AssetLifecycleFunnel;