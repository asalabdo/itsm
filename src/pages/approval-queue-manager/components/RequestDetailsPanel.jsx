import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';

const RequestDetailsPanel = ({ request, onApprove, onDeny, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!request) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a request to view details</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: 'FileText' },
    { id: 'documents', label: 'Documents', icon: 'Paperclip' },
    { id: 'history', label: 'History', icon: 'History' }
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold text-foreground truncate mb-1">
            {request?.id}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">{request?.type || 'Approval Request'}</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring ml-2"
          aria-label="Close details"
        >
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-smooth text-sm ${
                activeTab === tab?.id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Requester
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{request?.requester || 'Unknown requester'}</p>
                    <p className="text-xs text-muted-foreground">{request?.department || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submission Date
                </label>
                <p className="text-sm text-foreground mt-2">{request?.submissionDate || 'Unknown'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Urgency Level
                </label>
                <p className="text-sm text-foreground mt-2 capitalize">{request?.urgency || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  SLA Status
                </label>
                <p className="text-sm text-foreground mt-2">
                  {request?.slaHoursRemaining === 'N/A'
                    ? 'SLA not set'
                    : Number.isFinite(Number(request?.slaHoursRemaining))
                      ? (Number(request?.slaHoursRemaining) < 0
                        ? `${Math.abs(Number(request?.slaHoursRemaining))}h overdue`
                        : `${request?.slaHoursRemaining}h remaining`)
                      : 'SLA not set'}
                </p>
              </div>

              {request?.value && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Request Value
                  </label>
                  <p className="text-sm font-semibold text-foreground mt-2">{request?.value}</p>
                </div>
              )}
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </label>
                <p className="text-sm text-foreground mt-2 leading-relaxed">
                {request?.description || request?.title || 'No description provided.'}
                </p>
              </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Justification
                </label>
                <p className="text-sm text-foreground mt-2 leading-relaxed">
                {request?.justification || request?.description || 'No justification provided.'}
                </p>
              </div>
            </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-3">
            {request?.documents?.map((doc) => (
              <div
                key={doc?.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-smooth cursor-pointer"
              >
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc?.name}</p>
                  <p className="text-xs text-muted-foreground">{doc?.size} • {doc?.uploadDate}</p>
                </div>
                <Button variant="ghost" size="sm" iconName="Download" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {request?.history?.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name={event?.icon} size={16} className="text-primary" />
                  </div>
                  {index < request?.history?.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-foreground">{event?.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event?.user}</p>
                  <p className="text-xs text-muted-foreground">{event?.timestamp}</p>
                  {event?.comment && (
                    <p className="text-sm text-foreground mt-2 p-2 bg-muted rounded">
                      {event?.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 border-t border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="success"
            iconName="Check"
            iconPosition="left"
            onClick={() => onApprove(request)}
            className="flex-1"
          >
            Approve Request
          </Button>
          <Button
            variant="danger"
            iconName="X"
            iconPosition="left"
            onClick={() => onDeny(request)}
            className="flex-1"
          >
            Deny Request
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPanel;
