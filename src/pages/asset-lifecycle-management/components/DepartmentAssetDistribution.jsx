import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const DepartmentAssetDistribution = ({ data = [] }) => {
  const [viewMode, setViewMode] = useState('count'); // 'count' or 'cost'
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const departmentData = useMemo(() => data || [], [data]);

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
              <span className="text-sm">الأصول:</span>
              <span className="text-sm font-medium">{data?.assetCount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">إجمالي التكلفة:</span>
              <span className="text-sm font-medium">${(data?.totalCost / 1000000)?.toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">نسبة الاستخدام:</span>
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
          <h3 className="text-lg font-semibold text-foreground">توزيع الأصول حسب القسم</h3>
          <p className="text-sm text-muted-foreground">تخصيص الأصول ومعدلات الاستخدام حسب القسم</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('count')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'count' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              العدد
            </button>
            <button
              onClick={() => setViewMode('cost')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'cost' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              التكلفة
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
                <h4 className="font-medium text-foreground">تفصيل أصول {selectedDepartment?.department}</h4>
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
                <span className="text-sm text-muted-foreground">إجمالي الأصول: </span>
                <span className="font-medium">{selectedDepartment?.assetCount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">إجمالي التكلفة: </span>
                <span className="font-medium">${(selectedDepartment?.totalCost / 1000000)?.toFixed(1)}M</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">نسبة الاستخدام: </span>
                <span className={`font-medium ${getUtilizationColor(selectedDepartment?.utilization)}`}>
                  {selectedDepartment?.utilization}%
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
                <Icon name="Eye" size={16} />
                <span>عرض الأصول</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
                <Icon name="Download" size={16} />
                <span>تصدير</span>
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
            <div className="text-sm text-muted-foreground">إجمالي الأصول</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              ${(departmentData?.reduce((sum, dept) => sum + dept?.totalCost, 0) / 1000000)?.toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground">إجمالي القيمة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {Math.round(departmentData?.reduce((sum, dept) => sum + dept?.utilization, 0) / departmentData?.length)}%
            </div>
            <div className="text-sm text-muted-foreground">متوسط الاستخدام</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{departmentData?.length}</div>
            <div className="text-sm text-muted-foreground">الأقسام</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAssetDistribution;
