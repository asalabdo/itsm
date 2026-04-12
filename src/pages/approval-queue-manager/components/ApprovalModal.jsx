import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const ApprovalModal = ({ isOpen, onClose, request, type, onConfirm }) => {
  const [comment, setComment] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  if (!isOpen || !request) return null;

  const templates = type === 'approve' 
    ? [
        { id: 1, text: 'Approved as per standard operating procedures' },
        { id: 2, text: 'Approved within allocated budget constraints' },
        { id: 3, text: 'Approved with specific conditions to be met' },
        { id: 4, text: 'Approved due to urgent business requirements' }
      ]
    : [
        { id: 1, text: 'Denied due to insufficient budget allocation' },
        { id: 2, text: 'Denied as request violates company policy' },
        { id: 3, text: 'Denied due to inadequate business justification' },
        { id: 4, text: 'Denied - alternative solution recommended' }
      ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template?.id);
    setComment(template?.text);
  };

  const handleConfirm = () => {
    if (type === 'deny' && !comment?.trim()) {
      alert('Comment is required for denial');
      return;
    }
    onConfirm(request, comment);
    setComment('');
    setSelectedTemplate(null);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-1300"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-1400 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-elevation-5 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                type === 'approve' ? 'bg-success/10' : 'bg-error/10'
              }`}>
                <Icon 
                  name={type === 'approve' ? 'CheckCircle' : 'XCircle'} 
                  size={24} 
                  className={type === 'approve' ? 'text-success' : 'text-error'}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {type === 'approve' ? 'Approve Request' : 'Deny Request'}
                </h2>
                <p className="text-sm text-muted-foreground">{request?.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
              aria-label="Close modal"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-custom p-6 space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Request Type
                  </label>
                  <p className="text-sm text-foreground mt-1">{request?.type}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Requester
                  </label>
                  <p className="text-sm text-foreground mt-1">{request?.requester}</p>
                </div>
                {request?.value && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Value
                    </label>
                    <p className="text-sm font-semibold text-foreground mt-1">{request?.value}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Urgency
                  </label>
                  <p className="text-sm text-foreground mt-1 capitalize">{request?.urgency}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Quick Templates
              </label>
              <div className="grid grid-cols-1 gap-2">
                {templates?.map((template) => (
                  <button
                    key={template?.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 rounded-lg border text-left transition-smooth ${
                      selectedTemplate === template?.id
                        ? 'border-primary bg-primary/5' :'border-border bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <p className="text-sm text-foreground">{template?.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Comment {type === 'deny' && <span className="text-error">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e?.target?.value)}
                placeholder={`Enter ${type === 'approve' ? 'approval' : 'denial'} comment...`}
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required={type === 'deny'}
              />
              {type === 'deny' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Comment is required for denial requests
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={type === 'approve' ? 'success' : 'danger'}
                iconName={type === 'approve' ? 'Check' : 'X'}
                iconPosition="left"
                onClick={handleConfirm}
                className="flex-1"
              >
                Confirm {type === 'approve' ? 'Approval' : 'Denial'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovalModal;