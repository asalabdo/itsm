import { useCallback, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ChangeCalendar = ({ changes = [] }) => {
  const { language } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);
  const isArabic = language === 'ar';
  const locale = isArabic ? 'ar-SA' : 'en-US';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week
  const mappedChanges = useMemo(() => (changes || []).map(change => ({
    id: change?.changeNumber || `CHG-${change?.id}`,
    title: change?.title || (isArabic ? 'ØªØºÙŠÙŠØ± Ø¨Ø¯ÙˆÙ† Ø¹Ù†ÙˆØ§Ù†' : t('untitledChange', 'Untitled Change')),
    type: change?.category || (isArabic ? 'Ø§Ø¹ØªÙŠØ§Ø¯ÙŠ' : t('standard', 'Standard')),
    status: change?.status || (isArabic ? 'Ù…Ù‚ØªØ±Ø­' : t('proposed', 'Proposed')),
    priority: change?.priority || (isArabic ? 'Ù…ØªÙˆØ³Ø·' : t('medium', 'Medium')),
    environment: isArabic ? 'Ø§Ù„Ø¥Ù†ØªØ§Ø¬' : t('production', 'Production'),
    startDate: change?.scheduledStartDate ? new Date(change.scheduledStartDate) : new Date(change?.createdAt || Date.now()),
    endDate: change?.scheduledEndDate ? new Date(change.scheduledEndDate) : new Date((new Date(change?.createdAt || Date.now())).getTime() + 4 * 60 * 60 * 1000),
    assignee: change?.requestedBy?.username || change?.requestedBy?.firstName || (isArabic ? 'ØºÙŠØ± Ù…Ø³Ù†Ø¯' : t('unassigned', 'Unassigned')),
    riskLevel: change?.riskLevel || (isArabic ? 'Ù…Ù†Ø®ÙØ¶' : t('low', 'Low')),
    isEmergency: change?.category === 'Emergency',
    successRate: change?.status === 'Completed' ? (isArabic ? 'Ù†Ø§Ø¬Ø­' : t('success', 'Success')) : null
  })), [changes, isArabic, t]);

  const getStatusColor = (status, successRate) => {
    if (successRate === (isArabic ? 'Ù†Ø§Ø¬Ø­' : t('success', 'Success'))) return 'bg-success text-success-foreground';
    if (successRate === (isArabic ? 'ÙØ´Ù„' : t('failed', 'Failed'))) return 'bg-error text-error-foreground';
    
    switch (status) {
      case (isArabic ? 'Ù…Ø¬Ø¯ÙˆÙ„' : t('scheduled', 'Scheduled')): return 'bg-secondary text-secondary-foreground';
      case (isArabic ? 'Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°' : t('inProgress', 'In Progress')): return 'bg-warning text-warning-foreground';
      case (isArabic ? 'Ù…Ø¹ØªÙ…Ø¯' : t('approved', 'Approved')): return 'bg-accent text-accent-foreground';
      case (isArabic ? 'Ù…ÙƒØªÙ…Ù„' : t('completed', 'Completed')): return 'bg-muted text-muted-foreground';
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
    return mappedChanges?.filter(change => {
      const changeDate = new Date(change.startDate);
      return changeDate?.toDateString() === date?.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate?.setMonth(currentDate?.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStartOfWeek = (date) => {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const getWeekDates = () => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates();
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 border-l border-border">
        {weekDates.map((date) => {
          const dayChanges = getChangesForDate(date);
          const isToday = date?.toDateString() === new Date()?.toDateString();
          const isSelected = selectedDate && date?.toDateString() === selectedDate?.toDateString();

          return (
            <button
              key={date.toISOString()}
              type="button"
              className={`p-3 text-left border-b border-r border-border min-h-[180px] hover:bg-muted/50 transition-colors ${
                isToday ? 'bg-primary/10' : ''
              } ${isSelected ? 'bg-accent/20' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                {date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div className="space-y-2">
                {dayChanges.slice(0, 3).map((change) => (
                  <div
                    key={change?.id}
                    className={`text-xs px-2 py-1 rounded truncate ${getStatusColor(change?.status, change?.successRate)} ${
                      change?.isEmergency ? 'ring-1 ring-error animate-pulse' : ''
                    }`}
                    title={`${change?.title} - ${change?.status}`}
                  >
                    {change?.title}
                  </div>
                ))}
                {dayChanges.length > 3 && <div className="text-xs text-muted-foreground">+{dayChanges.length - 3} {isArabic ? 'Ø£Ø®Ø±Ù‰' : t('more', 'more')}</div>}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = [
      t('sunday', 'Sunday'), 
      t('monday', 'Monday'), 
      t('tuesday', 'Tuesday'), 
      t('wednesday', 'Wednesday'), 
      t('thursday', 'Thursday'), 
      t('friday', 'Friday'), 
      t('saturday', 'Saturday')
    ];

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
                +{dayChanges?.length - 2} {isArabic ? 'Ø£Ø®Ø±Ù‰' : t('more', 'more')}
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
          <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'ØªÙ‚ÙˆÙŠÙ… Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª' : t('changeCalendar', 'Change Calendar')}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentDate?.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
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
            {isArabic ? 'Ø´Ù‡Ø±' : t('month', 'Month')}
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            {isArabic ? 'Ø£Ø³Ø¨ÙˆØ¹' : t('week', 'Week')}
          </Button>
          <Button variant="ghost" size="sm" title={t('refreshCalendar', 'Refresh Calendar')}>
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-secondary rounded"></div>
          <span className="text-xs text-muted-foreground">{isArabic ? 'Ù…Ø¬Ø¯ÙˆÙ„' : t('scheduled', 'Scheduled')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning rounded"></div>
          <span className="text-xs text-muted-foreground">{isArabic ? 'Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°' : t('inProgress', 'In Progress')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded"></div>
          <span className="text-xs text-muted-foreground">{t('successful', 'Successful')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-error rounded"></div>
          <span className="text-xs text-muted-foreground">{isArabic ? 'ÙØ´Ù„' : t('failed', 'Failed')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-error rounded animate-pulse ring-1 ring-error"></div>
          <span className="text-xs text-muted-foreground">{t('emergency', 'Emergency')}</span>
        </div>
      </div>
      {/* Calendar Grid */}
      {viewMode === 'week' ? (
        renderWeekView()
      ) : (
        <div className="grid grid-cols-7 border-l border-border">
          {renderCalendarGrid()}
        </div>
      )}
      {/* Selected Date Details */}
      {selectedDate && (
        <div className="p-4 border-t border-border bg-muted/30">
          <h4 className="font-medium text-foreground mb-2">
            {t('changesForDate', 'Changes for')} {selectedDate?.toLocaleDateString(locale, { 
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
                      {change?.startDate?.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - 
                      {change?.endDate?.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${getRiskColor(change?.riskLevel)}`}>
                    {change?.riskLevel} {t('risk', 'Risk')}
                  </div>
                  <div className="text-xs text-muted-foreground">{change?.assignee}</div>
                </div>
              </div>
            ))}
            {getChangesForDate(selectedDate)?.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                {t('noChangesScheduled', 'No changes scheduled for this date')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeCalendar;
