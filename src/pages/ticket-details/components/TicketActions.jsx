import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { organizationUnitAPI } from '../../../services/api';
import { formatLocalizedValue, getNameParts, getPreferredLanguage } from '../../../services/displayValue';
import { ORG_UNIT_SOURCES, getOrganizationUnitLabel } from '../../../services/organizationUnits';

const normalizeText = (value) => String(value || '').trim().toLowerCase();
const isRenderable = (value) => {
  const text = String(value || '').trim();
  return Boolean(text) && text !== '[]' && text !== '{}' && text !== 'null' && text !== 'undefined';
};

const parseMaybeJson = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;

  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  return null;
};

const pickLocalizedText = (value, preferredLanguage = 'en') => {
  const parsed = parseMaybeJson(value);
  const source = parsed ?? value;

  if (Array.isArray(source)) {
    for (const item of source) {
      const picked = pickLocalizedText(item, preferredLanguage);
      if (isRenderable(picked)) return picked;
    }
    return null;
  }

  if (source && typeof source === 'object') {
    const preferredKeys = preferredLanguage === 'ar'
      ? ['ar', 'arabic', 'name', 'label', 'displayName', 'value', 'text', 'en', 'english']
      : ['en', 'english', 'name', 'label', 'displayName', 'value', 'text', 'ar', 'arabic'];

    for (const key of preferredKeys) {
      if (key in source) {
        const picked = pickLocalizedText(source[key], preferredLanguage);
        if (isRenderable(picked)) return picked;
      }
    }

    for (const key of Object.keys(source)) {
      const picked = pickLocalizedText(source[key], preferredLanguage);
      if (isRenderable(picked)) return picked;
    }

    return null;
  }

  const text = String(source || '').trim();
  return isRenderable(text) ? text : null;
};

const formatIdentityName = (identity) => {
  const preferredLanguage = getPreferredLanguage();
  const candidates = [
    formatLocalizedValue(identity?.fullName, preferredLanguage),
    formatLocalizedValue(identity?.displayName, preferredLanguage),
    formatLocalizedValue(identity?.name, preferredLanguage),
    formatLocalizedValue(identity?.firstName, preferredLanguage),
    formatLocalizedValue(identity?.username, preferredLanguage),
    formatLocalizedValue(identity?.userName, preferredLanguage),
  ].filter(isRenderable);

  return candidates[0] || null;
};

const formatIdentityEmail = (identity) => {
  const candidates = [
    pickLocalizedText(identity?.emailAddress, 'en'),
    pickLocalizedText(identity?.email, 'en'),
  ].filter(isRenderable);

  return candidates[0] || null;
};

const buildAssignedUserPayload = ({ identity, source, name, email }) => {
  const preferredLanguage = getPreferredLanguage();
  const resolvedName = name || formatLocalizedValue(identity?.fullName, preferredLanguage) || formatLocalizedValue(identity?.name, preferredLanguage) || '';
  const nameParts = getNameParts({ fullName: resolvedName }, preferredLanguage);
  const firstName = nameParts.firstName || formatLocalizedValue(identity?.firstName, preferredLanguage) || '';
  const lastName = nameParts.lastName || formatLocalizedValue(identity?.lastName, preferredLanguage) || formatLocalizedValue(identity?.surname, preferredLanguage) || '';
  const department = formatLocalizedValue(identity?.department, preferredLanguage) || formatLocalizedValue(source?.label, preferredLanguage) || '';
  const jobTitle = formatLocalizedValue(identity?.jobTitle, preferredLanguage) || formatLocalizedValue(identity?.title, preferredLanguage) || '';
  const username =
    formatLocalizedValue(identity?.userName, preferredLanguage) ||
    formatLocalizedValue(identity?.username, preferredLanguage) ||
    formatLocalizedValue(identity?.loginName, preferredLanguage) ||
    `user_${identity?.id || ''}`.trim();

  return {
    id: Number(identity?.id || identity?.userId || identity?.employeeId || identity?.employeeNo || identity?.employeeNumber || 0),
    username,
    email: email || '',
    firstName: firstName || resolvedName || `ERP User ${identity?.id || ''}`.trim(),
    lastName,
    fullName: [firstName || resolvedName, lastName].filter(Boolean).join(' ').trim() || resolvedName || `ERP User ${identity?.id || ''}`.trim(),
    role: pickLocalizedText(identity?.role, 'en') || 'Technician',
    department,
    jobTitle,
    phoneNumber: pickLocalizedText(identity?.phoneNumber, 'en') || pickLocalizedText(identity?.mobile, 'en') || null,
    isActive: true,
    avatarUrl: pickLocalizedText(identity?.avatarUrl, 'en') || null,
  };
};

const TicketActions = ({ ticket, onStatusChange, onPriorityChange, onAssign, onEscalate }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status);
  const [selectedPriority, setSelectedPriority] = useState(ticket?.priority);
  const [selectedAgent, setSelectedAgent] = useState(ticket?.assignedTo?.id ? String(ticket.assignedTo.id) : '');
  const [agentOptions, setAgentOptions] = useState([]);
  const ticketId = ticket?.backendId ?? ticket?.id;

  const statusOptions = [
    { value: 'Open', label: t('statusOpen', 'Open') },
    { value: 'In Progress', label: t('statusInProgress', 'In Progress') },
    { value: 'Pending', label: t('statusPendingCustomer', 'Pending Customer') },
    { value: 'Resolved', label: t('statusResolved', 'Resolved') },
    { value: 'Closed', label: t('statusClosed', 'Closed') },
  ];

  const priorityOptions = [
    { value: 'Low', label: t('priorityLow', 'Low Priority') },
    { value: 'Medium', label: t('priorityMedium', 'Medium Priority') },
    { value: 'High', label: t('priorityHigh', 'High Priority') },
    { value: 'Urgent', label: t('priorityUrgent', 'Urgent') },
  ];

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const responses = await Promise.all(
          ORG_UNIT_SOURCES.map((source) => organizationUnitAPI.getUsers(source.id, 100, 0))
        );

        const seen = new Set();
        const options = [];

        responses.forEach((response, index) => {
          const source = ORG_UNIT_SOURCES[index];
          const items =
            response?.data?.result?.items ||
            response?.data?.result ||
            response?.data?.items ||
            response?.data ||
            [];

          (Array.isArray(items) ? items : []).forEach((user) => {
            const identity = user?.user || user?.currentUser || user?.member || user?.person || user || {};
            const externalId = String(identity?.id || user?.id || identity?.userId || identity?.employeeId || identity?.employeeNo || identity?.employeeNumber || '').trim();
            if (!externalId || seen.has(externalId)) {
              return;
            }

            const name =
              formatIdentityName(identity) ||
              formatIdentityName(user) ||
              formatLocalizedValue(identity?.fullName, getPreferredLanguage()) ||
              formatLocalizedValue(user?.fullName, getPreferredLanguage()) ||
              formatLocalizedValue(identity?.name, getPreferredLanguage()) ||
              formatLocalizedValue(user?.name, getPreferredLanguage()) ||
              `User ${externalId}`.trim();

            const email = formatIdentityEmail(identity) || formatIdentityEmail(user) || '';
            const description = [
              email,
              [formatLocalizedValue(identity?.department || user?.department), formatLocalizedValue(identity?.jobTitle || user?.jobTitle)].filter(Boolean).join(' • '),
            ].filter(Boolean).join(' • ');
            const assignedTo = buildAssignedUserPayload({
              identity: { ...identity, id: externalId },
              source,
              name,
              email,
            });

            seen.add(externalId);
            options.push({
              value: externalId,
              label: name,
              group: getOrganizationUnitLabel(source.id),
              description,
              assignedTo,
            });
          });
        });

        options.sort((a, b) => a.label.localeCompare(b.label));
        setAgentOptions(options);
      } catch (error) {
        console.error('Failed to load ERP agents:', error);
        setAgentOptions([]);
      }
    };

    loadAgents();
  }, []);

  useEffect(() => {
    setSelectedStatus(ticket?.status);
    setSelectedPriority(ticket?.priority);
    setSelectedAgent(ticket?.assignedTo?.id ? String(ticket.assignedTo.id) : '');
  }, [ticket?.status, ticket?.priority, ticket?.assignedTo?.id]);

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    onStatusChange(value);
  };

  const handlePriorityChange = (value) => {
    setSelectedPriority(value);
    onPriorityChange(value);
  };

  const handleAgentChange = (value) => {
    setSelectedAgent(value);
    const selectedOption = agentOptions.find((option) => String(option.value) === String(value));
    onAssign(selectedOption?.assignedTo || value);
  };

  const handleLinkRelatedTicket = () => {
    if (!ticketId) return;
    navigate(`/search?q=${encodeURIComponent(ticket?.ticketNumber || ticketId)}`);
  };

  const handleDuplicateTicket = () => {
    if (!ticketId) return;
    navigate(`/ticket-creation?clone=${encodeURIComponent(ticketId)}`);
  };

  const handleArchiveTicket = () => {
    if (onStatusChange) {
      onStatusChange('Closed');
      return;
    }
    if (ticketId) {
      navigate(`/ticket-management-center?ticket=${encodeURIComponent(ticketId)}`);
    }
  };

  const handleShareWithTeam = async () => {
    if (!ticketId) return;
    const ticketUrl = `${window.location.origin}/ticket-details/${encodeURIComponent(ticketId)}`;

    try {
      await navigator.clipboard.writeText(ticketUrl);
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'success', message: 'Ticket link copied for sharing.' }
      }));
    } catch {
      window.open(ticketUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">{t('quickActions', 'Quick Actions')}</h3>
        <div className="space-y-4 md:space-y-6">
          <Select label={t('status', 'Status')} options={statusOptions} value={selectedStatus} onChange={handleStatusChange} />
          <Select label={t('priority', 'Priority')} options={priorityOptions} value={selectedPriority} onChange={handlePriorityChange} />
          <Select label={t('assignTo', 'Assign To')} options={agentOptions} value={selectedAgent} onChange={handleAgentChange} searchable />
          <div className="pt-4 border-t border-border">
            <Button variant="destructive" fullWidth iconName="AlertTriangle" iconPosition="left" onClick={onEscalate}>
              {t('escalateTicketBtn', 'Escalate Ticket')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">{t('additionalActions', 'Additional Actions')}</h3>
        <div className="space-y-2">
          <Button variant="outline" fullWidth iconName="Link" iconPosition="left" size="sm" onClick={handleLinkRelatedTicket}>
            {t('linkRelatedTicket', 'Link Related Ticket')}
          </Button>
          <Button variant="outline" fullWidth iconName="Copy" iconPosition="left" size="sm" onClick={handleDuplicateTicket}>
            {t('duplicateTicket', 'Duplicate Ticket')}
          </Button>
          <Button variant="outline" fullWidth iconName="Archive" iconPosition="left" size="sm" onClick={handleArchiveTicket}>
            {t('archive', 'Archive')}
          </Button>
          <Button variant="outline" fullWidth iconName="Share2" iconPosition="left" size="sm" onClick={handleShareWithTeam}>
            {t('shareWithTeam', 'Share with Team')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketActions;
