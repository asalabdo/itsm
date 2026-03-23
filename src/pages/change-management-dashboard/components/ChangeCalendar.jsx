import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChangeCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week
  const [changes, setChanges] = useState([]);

  // Mock change data
  useEffect(() => {
    const mockChanges = [
      {
        id: 'CHG-2024-001',
        title: 'Database Migration - Production',
        type: 'Standard',
        status: 'Scheduled',
        priority: 'High',
        environment: 'Production',
        startDate: new Date(2024, 8, 23, 14, 0),
        endDate: new Date(2024, 8, 23, 18, 0),
        assignee: 'Database Team',
        riskLevel: 'Medium',
        isEmergency: false,
        successRate: null
      },
      {
        id: 'CHG-2024-002',
        title: 'Security Patch Deployment',
        type: 'Emergency',
        status: 'In Progress',
        priority: 'Critical',
        environment: 'Production',
        startDate: new Date(2024, 8, 21, 10, 0),
        endDate: new Date(2024, 8, 21, 12, 0),
        assignee: 'Security Team',
        riskLevel: 'High',
        isEmergency: true,
        successRate: null
      },
      {
        id: 'CHG-2024-003',
        title: 'Application Update - Test Environment',
        type: 'Standard',
        status: 'Completed',
        priority: 'Medium',
        environment: 'Test',
        startDate: new Date(2024, 8, 20, 9, 0),
        endDate: new Date(2024, 8, 20, 11, 0),
        assignee: 'Development Team',
        riskLevel: 'Low',
        isEmergency: false,
        successRate: 'Success'
      },
      {
        id: 'CHG-2024-004',
        title: 'Network Infrastructure Upgrade',
        type: 'Major',
        status: 'Completed',
        priority: 'High',
        environment: 'Production',
        startDate: new Date(2024, 8, 19, 20, 0),
        endDate: new Date(2024, 8, 20, 2, 0),
        assignee: 'Network Team',
        riskLevel: 'High',
        isEmergency: false,
        successRate: 'Failed'
      },
      {
        id: 'CHG-2024-005',
        title: 'API Gateway Configuration',
        type: 'Standard',
        status: 'Approved',
        priority: 'Medium',
        environment: 'Production',
        startDate: new Date(2024, 8, 25, 16, 0),
        endDate: new Date(2024, 8, 25, 18, 0),
        assignee: 'Platform Team',
        riskLevel: 'Medium',
        isEmergency: false,
        successRate: null
      }
    ];
    setChanges(mockChanges);
  }, []);

  const getStatusColor = (status, successRate) => {
    if (successRate === 'Success') return 'bg-success text-success-foreground';
    if (successRate === 'Failed') return 'bg-error text-error-foreground';
    
    switch (status) {
      case 'Scheduled': return 'bg-secondary text-secondary-foreground';
      case 'In Progress': return 'bg-warning text-warning-foreground';
      case 'Approved': return 'bg-accent text-accent-foreground';
      case 'Completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'text-error';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)?.getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)?.getDay();
  };

  const getChangesForDate = (date) => {
    return changes?.filter(change => {
      const changeDate = new Date(change.startDate);
      return changeDate?.toDateString() === date?.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate?.setMonth(currentDate?.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    dayNames?.forEach(day => {
      days?.push(
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border">
          {day}
        </div>
      );
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days?.push(<div key={`empty-${i}`} className="p-2 border-b border-r border-border"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayChanges = getChangesForDate(date);
      const isToday = date?.toDateString() === new Date()?.toDateString();
      const isSelected = selectedDate && date?.toDateString() === selectedDate?.toDateString();

      days?.push(
        <div
          key={day}
          className={`p-1 border-b border-r border-border cursor-pointer hover:bg-muted/50 transition-colors min-h-[80px] ${
            isToday ? 'bg-primary/10' : ''
          } ${isSelected ? 'bg-accent/20' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayChanges?.slice(0, 2)?.map(change => (
              <div
                key={change?.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(change?.status, change?.successRate)} ${
                  change?.isEmergency ? 'ring-1 ring-error animate-pulse' : ''
                }`}
                title={`${change?.title} - ${change?.status}`}
              >
                {change?.title}
              </div>
            ))}
            {dayChanges?.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayChanges?.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Change Calendar</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button variant="ghost" size="sm" title="Refresh Calendar">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-secondary rounded"></div>
          <span className="text-xs text-muted-foreground">Scheduled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning rounded"></div>
          <span className="text-xs text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded"></div>
          <span className="text-xs text-muted-foreground">Success</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-error rounded"></div>
          <span className="text-xs text-muted-foreground">Failed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-error rounded animate-pulse ring-1 ring-error"></div>
          <span className="text-xs text-muted-foreground">Emergency</span>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-l border-border">
        {renderCalendarGrid()}
      </div>
      {/* Selected Date Details */}
      {selectedDate && (
        <div className="p-4 border-t border-border bg-muted/30">
          <h4 className="font-medium text-foreground mb-2">
            Changes for {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          <div className="space-y-2">
            {getChangesForDate(selectedDate)?.map(change => (
              <div key={change?.id} className="flex items-center justify-between p-2 bg-card rounded border border-border">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(change?.status, change?.successRate)?.replace('text-', 'bg-')?.replace('-foreground', '')}`}></div>
                  <div>
                    <div className="font-medium text-sm">{change?.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {change?.startDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                      {change?.endDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${getRiskColor(change?.riskLevel)}`}>
                    {change?.riskLevel} Risk
                  </div>
                  <div className="text-xs text-muted-foreground">{change?.assignee}</div>
                </div>
              </div>
            ))}
            {getChangesForDate(selectedDate)?.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No changes scheduled for this date
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeCalendar;