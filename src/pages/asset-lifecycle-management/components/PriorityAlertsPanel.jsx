import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PriorityAlertsPanel = ({ alerts = [] }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const priorityAlerts = useMemo(() => alerts || [], [alerts]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-accent bg-accent/10 border-accent/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warranty': return 'Shield';
      case 'license': return 'FileText';
      case 'compliance': return 'CheckCircle';
      case 'maintenance': return 'Wrench';
      case 'eol': return 'AlertTriangle';
      default: return 'Bell';
    }
  };

  const getDaysRemainingColor = (days) => {
    if (days < 0) return 'text-error';
    if (days <= 7) return 'text-error';
    if (days <= 30) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">تنبيهات الأولوية</h3>
          <p className="text-sm text-muted-foreground">الإجراءات الحرجة المطلوبة</p>
        </div>
        <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-error rounded-full flex items-center justify-center">
            <span className="text-xs text-error-foreground font-medium">{priorityAlerts?.length || 0}</span>
        </div>
        </div>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {priorityAlerts?.map((alert) => (
          <div
            key={alert?.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAlert?.id === alert?.id ? 'ring-2 ring-primary' : ''
            } ${getSeverityColor(alert?.severity)}`}
            onClick={() => setSelectedAlert(selectedAlert?.id === alert?.id ? null : alert)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Icon name={getTypeIcon(alert?.type)} size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">{alert?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{alert?.description}</p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-muted-foreground">الأصل: {alert?.assetId}</span>
                    <span className="text-muted-foreground">الموقع: {alert?.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getDaysRemainingColor(alert?.daysRemaining)}`}>
                  {alert?.daysRemaining < 0 
                    ? `متأخر ${Math.abs(alert?.daysRemaining)} يومًا`
                    : `${alert?.daysRemaining} يومًا`
                  }
                </div>
                <div className="text-xs text-muted-foreground">{alert?.cost}</div>
              </div>
            </div>

            {selectedAlert?.id === alert?.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">الحدة: </span>
                      <span className="capitalize font-medium">{alert?.severity}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">التكلفة التقديرية: </span>
                      <span className="font-medium">{alert?.cost}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      عرض التفاصيل
                    </Button>
                    <Button variant="default" size="sm">
                      {alert?.action}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" iconName="Filter">
              تصفية التنبيهات
            </Button>
            <Button variant="ghost" size="sm" iconName="Settings">
              إعدادات التنبيهات
            </Button>
          </div>
          {/* <Button variant="default" size="sm" iconName="Plus">
            Create Alert
          </Button> */}
        </div>
      </div>
      {/* Alert Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-error/10 rounded-lg">
          <div className="text-lg font-semibold text-error">{priorityAlerts?.filter(alert => alert.severity === 'critical').length}</div>
          <div className="text-xs text-muted-foreground">حرجة</div>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <div className="text-lg font-semibold text-warning">{priorityAlerts?.filter(alert => alert.severity === 'high').length}</div>
          <div className="text-xs text-muted-foreground">عالية</div>
        </div>
        <div className="text-center p-3 bg-accent/10 rounded-lg">
          <div className="text-lg font-semibold text-accent">{priorityAlerts?.filter(alert => alert.severity === 'medium').length}</div>
          <div className="text-xs text-muted-foreground">متوسطة</div>
        </div>
      </div>
    </div>
  );
};

export default PriorityAlertsPanel;
