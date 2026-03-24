import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ApprovalHistoryPanel = () => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');

  const timeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' }
  ];

  const [approvalHistory, setApprovalHistory] = React.useState([]);

  React.useEffect(() => {
    approvalsAPI.getHistory().then(res => {
      setApprovalHistory(res.data || []);
    }).catch(console.error);
  }, []);

  const getDecisionColor = (decision) => {
    return decision === 'approved' ?'bg-success/10 text-success' :'bg-error/10 text-error';
  };

  const getDecisionIcon = (decision) => {
    return decision === 'approved' ? 'CheckCircle' : 'XCircle';
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
          Approval History
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            options={timeOptions}
            value={timeFilter}
            onChange={setTimeFilter}
            placeholder="Select time period"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Select status"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
        <div className="space-y-3">
          {approvalHistory?.map((item) => (
            <div
              key={item?.id}
              className="p-4 bg-muted/50 rounded-lg border border-border hover:shadow-elevation-1 transition-smooth"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">{item?.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDecisionColor(item?.decision)}`}>
                      <Icon name={getDecisionIcon(item?.decision)} size={12} className="inline mr-1" />
                      {item?.decision?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                    {item?.type}
                  </p>
                </div>
                {item?.value && (
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {item?.value}
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Icon name="User" size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">{item?.requester}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Icon name="Calendar" size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{item?.decisionDate}</span>
                </div>
              </div>

              {item?.comment && (
                <div className="p-3 bg-card rounded border border-border">
                  <p className="text-xs md:text-sm text-foreground leading-relaxed">
                    {item?.comment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 md:p-6 border-t border-border">
        <Button variant="outline" iconName="Download" iconPosition="left" fullWidth>
          Export History Report
        </Button>
      </div>
    </div>
  );
};

export default ApprovalHistoryPanel;