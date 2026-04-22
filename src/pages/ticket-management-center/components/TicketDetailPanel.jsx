import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import WorkflowStatusStrip from '../../../components/ui/WorkflowStatusStrip';
import { ticketsAPI, usersAPI } from '../../../services/api';
import { resolveWorkflowPresentationForTicket } from '../../../services/workflowStages';
import { formatLocalizedValue, getLocalizedDisplayName } from '../../../services/displayValue';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const TicketDetailPanel = ({ ticket, isOpen, onClose }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [activeTab, setActiveTab] = useState('details');
  const [comment, setComment] = useState('');
  const [workflowPresentation, setWorkflowPresentation] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [assigning, setAssigning] = useState(false);

  if (!ticket) return null;

  // Check if ticket has linked asset
  const linkedAsset = ticket?.assetLinked ? {
    assetId: ticket?.assetId || 'AST-2024-001',
    description: 'Dell Latitude 5520 Laptop',
    serialNumber: 'SN-DL5520-2024-001',
    status: 'active',
    currentOwner: ticket?.requester
  } : null;

  const statusOptions = [
    { value: 'open', label: formatLocalizedValue('Open') },
    { value: 'in-progress', label: formatLocalizedValue('In Progress') },
    { value: 'pending', label: formatLocalizedValue('Pending') },
    { value: 'resolved', label: formatLocalizedValue('Resolved') },
    { value: 'closed', label: formatLocalizedValue('Closed') }
  ];

  const priorityOptions = [
    { value: 'critical', label: formatLocalizedValue('Critical') },
    { value: 'high', label: formatLocalizedValue('High') },
    { value: 'medium', label: formatLocalizedValue('Medium') },
    { value: 'low', label: formatLocalizedValue('Low') }
  ];

  const assigneeOptions = [
    { value: ticket?.assignedToId ? String(ticket.assignedToId) : 'unassigned', label: getLocalizedDisplayName(ticket?.assignedTo) || t(ticket?.assignee, ticket?.assignee) || formatLocalizedValue('Unassigned') },
    { value: 'unassigned', label: formatLocalizedValue('Unassigned') }
  ];

  const activityHistory = [
    {
      id: 1,
      type: 'created',
      user: getLocalizedDisplayName(ticket?.requestedBy) || ticket?.requester || formatLocalizedValue('Requester'),
      userInitials: String(getLocalizedDisplayName(ticket?.requestedBy) || ticket?.requester || 'U').split(' ').map((part) => part?.[0]).filter(Boolean).join('').slice(0, 2).toUpperCase(),
      action: t('createdAction', 'Created'),
      timestamp: ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : t('notAvailable', 'N/A')
    },
    {
      id: 2,
      type: 'status',
      user: getLocalizedDisplayName(ticket?.assignedTo) || ticket?.assignee || formatLocalizedValue('Unassigned'),
      userInitials: String(getLocalizedDisplayName(ticket?.assignedTo) || ticket?.assignee || 'U').split(' ').map((part) => part?.[0]).filter(Boolean).join('').slice(0, 2).toUpperCase(),
      action: `${t('currentStatusIs', 'Current status is')} ${formatLocalizedValue(ticket?.statusLabel || ticket?.status || 'Open')}`,
      timestamp: ticket?.slaDeadline || t('notAvailable', 'N/A')
    }
  ];

  const attachments = [];

  const getActivityIcon = (type) => {
    const icons = {
      status: 'RefreshCw',
      comment: 'MessageSquare',
      assignment: 'UserPlus',
      created: 'Plus',
      attachment: 'Paperclip'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      status: 'text-primary bg-primary/10',
      comment: 'text-success bg-success/10',
      assignment: 'text-warning bg-warning/10',
      created: 'text-muted-foreground bg-muted',
      attachment: 'text-primary bg-primary/10'
    };
    return colors?.[type] || 'text-muted-foreground bg-muted';
  };

  useEffect(() => {
    let cancelled = false;

    const loadWorkflow = async () => {
      try {
        const presentation = await resolveWorkflowPresentationForTicket(ticket);
        if (!cancelled) {
          setWorkflowPresentation(presentation);
        }
      } catch {
        if (!cancelled) {
          setWorkflowPresentation(null);
        }
      }
    };

    loadWorkflow();

    return () => {
      cancelled = true;
    };
  }, [ticket]);

  useEffect(() => {
    let cancelled = false;
    const loadTechnicians = async () => {
      try {
        const res = await usersAPI.getByRole('Technician');
        if (!cancelled) {
          setTechnicians(Array.isArray(res?.data) ? res.data : []);
        }
      } catch {
        if (!cancelled) {
          setTechnicians([]);
        }
      }
    };

    void loadTechnicians();
    return () => {
      cancelled = true;
    };
  }, []);

  const workflowSteps = workflowPresentation?.steps || ticket?.workflowSteps || [];
  const workflowActiveStep = workflowPresentation?.activeStep ?? 0;
  const workflowService = workflowPresentation?.name || t(ticket?.category, ticket?.category) || t('ticketWorkflowFallback', 'Ticket workflow');
  const workflowOrganization = workflowPresentation?.organizationKey || t(ticket?.assigneeDepartment, ticket?.assigneeDepartment) || t(ticket?.department, ticket?.department) || t('organizationRoutingFallback', 'Organization routing');
  const workflowLastAction = workflowPresentation?.lastAction || ticket?.statusLabel || ticket?.status || t('waitingForNextAction', 'Waiting for next action');

  const handleClaimNext = async () => {
    if (!ticket?.backendId) return;
    const currentUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();

    if (!currentUser?.id) {
      window.dispatchEvent(new CustomEvent('itsm:toast', {
      detail: { type: 'warning', message: t('pleaseLogInToClaimTickets', 'Please log in to claim tickets.') }
      }));
      return;
    }

    try {
      setAssigning(true);
      await ticketsAPI.assign(ticket.backendId, { assignedToId: currentUser.id });
      window.dispatchEvent(new CustomEvent('itsm:toast', {
      detail: { type: 'success', message: t('ticketClaimedSuccessfully', 'Ticket claimed successfully.') }
      }));
      window.dispatchEvent(new CustomEvent('itsm:refresh'));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('itsm:toast', {
      detail: { type: 'error', message: t('failedToClaimTicket', 'Failed to claim ticket.') }
      }));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-1000 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static top-16 right-0 bottom-0 w-full lg:w-96 bg-card border-l border-border z-1100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
                <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-base">{t('ticketDetailsTitle', 'Ticket Details')}</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-muted transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-smooth ${
                activeTab === 'details' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('detailsTab', 'Details')}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-smooth ${
                activeTab === 'activity' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('activityTab', 'Activity')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <WorkflowStatusStrip
                title={t('ticketWorkflowTitle', 'Ticket Workflow')}
                subtitle={t('followRoutingPath', 'Follow the current routing path for this ticket from intake to close.')}
                service={workflowService}
                organization={workflowOrganization}
                mode={t('drawerView', 'Drawer view')}
                lastAction={workflowLastAction}
                activeStep={workflowActiveStep}
                steps={workflowSteps.length > 0 ? workflowSteps : undefined}
              />

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t('departmentRouting', 'Department routing')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('claimOrReassignTicket', 'Claim or reassign this ticket to the responsible technician.')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClaimNext} disabled={assigning}>
                    {assigning ? t('claiming', 'Claiming...') : t('claimNext', 'Claim next')}
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>{t('technicians', 'Technicians')}: {technicians.length}</div>
                  <div>{t('currentAssignee', 'Current assignee')}: {ticket?.assignee || formatLocalizedValue('Unassigned')}</div>
                </div>
              </div>

              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-primary">#{ticket?.id}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    ticket?.priority === 'critical' ? 'text-error bg-error/10' :
                    ticket?.priority === 'high' ? 'text-warning bg-warning/10' :
                    ticket?.priority === 'medium'? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted'
                  }`}>
                    {t(ticket?.priorityLabel || ticket?.priority, ticket?.priorityLabel || ticket?.priority)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3">{ticket?.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                  {ticket?.description || t('noDescriptionProvidedForThisTicket', 'No description provided for this ticket.')}
                </p>
              </div>

              <div className="space-y-4">
                  <Select
                  label={t('status', 'Status')}
                  options={statusOptions}
                  value={ticket?.status}
                  onChange={() => {}}
                />

                  <Select
                  label={t('priority', 'Priority')}
                  options={priorityOptions}
                  value={ticket?.priority}
                  onChange={() => {}}
                />

                  <Select
                  label={t('assignee', 'Assignee')}
                  options={assigneeOptions}
                  value={ticket?.assignedToId ? String(ticket.assignedToId) : 'unassigned'}
                  onChange={() => {}}
                  placeholder={t('selectAssignee', 'Select assignee')}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">{t('department', 'Department')}</label>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <Icon name="Building" size={16} />
            <span className="text-sm">{t(ticket?.department, ticket?.department) || formatLocalizedValue('Unassigned')}</span>
          </div>
        </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('slaStatus', 'SLA Status')}</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <Icon name="Clock" size={16} className={
                      ticket?.slaHours < 0 ? 'text-error' :
                      ticket?.slaHours < 4 ? 'text-warning': 'text-success'
                    } />
                    <span className={`text-sm font-medium ${
                      ticket?.slaHours < 0 ? 'text-error' :
                      ticket?.slaHours < 4 ? 'text-warning': 'text-success'
                    }`}>
                      {ticket?.slaHours < 0 ? `${Math.abs(ticket?.slaHours)}h ${t('overdue', 'overdue')}` :
                       ticket?.slaHours < 24 ? `${ticket?.slaHours}h ${t('remaining', 'remaining')}` :
                       `${Math.floor(ticket?.slaHours / 24)}d ${t('remaining', 'remaining')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Asset Section - Controlled Visibility */}
              {linkedAsset && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="Package" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">{t('linkedAsset', 'Linked Asset')}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          {t(linkedAsset?.status, linkedAsset?.status)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{linkedAsset?.assetId}</p>
                      <p className="text-xs text-muted-foreground mt-1">{linkedAsset?.description}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{formatLocalizedValue('Serial Number')}</span>
                          <span className="text-foreground font-medium">{linkedAsset?.serialNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{t('owner', 'Owner')}</span>
                        <span className="text-foreground font-medium">{linkedAsset?.currentOwner}</span>
                      </div>
                    </div>
                      <p className="text-xs text-muted-foreground mt-3 italic">
                        {t('assetDetailsVisibleOnlyWithinThisTicketContext', 'Asset details visible only within this ticket context')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {attachments?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">{t('attachments', 'Attachments')}</label>
                  <div className="space-y-2">
                    {attachments?.map(attachment => (
                      <div
                        key={attachment?.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-smooth cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon name={attachment?.type === 'image' ? 'Image' : 'FileText'} size={20} />
                          <div>
                            <p className="text-sm font-medium">{attachment?.name}</p>
                            <p className="text-xs text-muted-foreground">{attachment?.size}</p>
                          </div>
                        </div>
                        <Icon name="Download" size={16} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activityHistory?.map((activity, index) => (
                <div key={activity?.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                      <Icon name={getActivityIcon(activity?.type)} size={16} />
                    </div>
                    {index < activityHistory?.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{activity?.user}</span>
                      <span className="text-xs text-muted-foreground">{activity?.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{activity?.action}</p>
                    {activity?.content && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{activity?.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          <Input
            placeholder={t('addCommentPlaceholder', 'Add a comment...')}
            value={comment}
            onChange={(e) => setComment(e?.target?.value)}
            multiline
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              variant="default"
              fullWidth
              iconName="Send"
              iconPosition="right"
            >
              {t('comment', 'Comment')}
            </Button>
            <Button
              variant="outline"
              iconName="Paperclip"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default TicketDetailPanel;
