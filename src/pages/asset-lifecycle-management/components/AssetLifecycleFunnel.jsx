import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const AssetLifecycleFunnel = ({ data = [], onStageClick, onExport }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const lifecycleData = useMemo(() => data || [], [data]);

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
              <span className="text-sm">العدد:</span>
              <span className="text-sm font-medium">{data?.count?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">النسبة:</span>
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
          <h3 className="text-lg font-semibold text-foreground">توزيع دورة حياة الأصول</h3>
          <p className="text-sm text-muted-foreground">انقر على المراحل لعرض التفاصيل</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-muted-foreground" />
          <select className="text-sm border border-border rounded px-2 py-1 bg-background">
            <option>كل الفئات</option>
            <option>الأجهزة</option>
            <option>البرمجيات</option>
            <option>الشبكات</option>
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
            <h4 className="font-medium text-foreground">تفاصيل مرحلة {selectedStage?.stage}</h4>
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
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80" onClick={onExport}>
            <Icon name="Download" size={16} />
            <span>تصدير التقرير</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
            <Icon name="RefreshCw" size={16} />
            <span>تحديث البيانات</span>
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
