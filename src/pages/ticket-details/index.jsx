import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import TicketHeader from './components/TicketHeader';
import ConversationThread from './components/ConversationThread';
import InternalNotes from './components/InternalNotes';
import TicketActions from './components/TicketActions';
import FileAttachments from './components/FileAttachments';
import TimeTracking from './components/TimeTracking';
import AuditTrail from './components/AuditTrail';
import CustomerSatisfaction from './components/CustomerSatisfaction';
import ReplyComposer from './components/ReplyComposer';
import { ticketsAPI } from '../../services/api';
import { markBackendReady } from '../../services/backendAvailability';

const getCurrentUserId = () => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return 1;
    const user = JSON.parse(rawUser);
    return Number(user?.id) || 1;
  } catch {
    return 1;
  }
};

const formatTicketDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const mapConversationMessages = (ticket) => {
  const comments = ticket?.comments || ticket?.Comments || [];
  const initialMessage = ticket?.description
    ? [{
        id: `ticket-${ticket.id}-initial`,
        type: 'customer',
        sender: ticket?.requestedBy?.username || ticket?.requestedBy?.firstName || 'Requester',
        timestamp: formatTicketDate(ticket?.createdAt).time,
        content: ticket.description,
      }]
    : [];

  const commentMessages = comments
    .filter((comment) => !comment?.comment?.startsWith('[Internal]'))
    .map((comment) => ({
      id: comment?.id,
      type: comment?.user?.role === 'EndUser' ? 'customer' : 'agent',
      sender: comment?.user?.username || comment?.user?.name || 'Agent',
      timestamp: formatTicketDate(comment?.createdAt).time,
      content: comment?.comment,
    }));

  return [...initialMessage, ...commentMessages];
};

const mapInternalNotes = (ticket) => {
  const comments = ticket?.comments || ticket?.Comments || [];

  return comments
    .filter((comment) => comment?.comment?.startsWith('[Internal]'))
    .map((comment) => ({
      id: comment?.id,
      author: comment?.user?.username || comment?.user?.name || 'Agent',
      timestamp: formatTicketDate(comment?.createdAt).time,
      content: comment?.comment.replace(/^\[Internal\]\s*/, ''),
      avatar: null,
      avatarAlt: comment?.user?.username || 'Agent',
    }));
};

const mapAuditTrail = (ticket) => {
  const activities = ticket?.activities || ticket?.Activities || [];
  return activities.map((activity) => {
    const action = (activity?.action || '').toLowerCase();
    let type = 'comment';

    if (action.includes('status')) type = 'status_change';
    else if (action.includes('priority')) type = 'priority_change';
    else if (action.includes('assign')) type = 'assignment';
    else if (action.includes('escalat')) type = 'escalation';
    else if (action.includes('attachment')) type = 'attachment';

    return {
      id: activity?.id,
      type,
      user: activity?.user?.username || activity?.user?.name || 'System',
      action: activity?.action,
      timestamp: formatTicketDate(activity?.timestamp).time,
      details: [activity?.oldValue, activity?.newValue].filter(Boolean).join(' → ') || undefined,
    };
  });
};

// Timestamps from PostgreSQL via Npgsql's EnableLegacyTimestampBehavior come back
// WITHOUT a 'Z' timezone suffix. JS then treats them as local time, which adds the
// UTC offset (e.g. UTC+3 = 10800 s) to every elapsed-time calculation. This helper
// forces all bare datetime strings to be interpreted as UTC.
const parseUtcTimestamp = (value) => {
  if (!value) return null;
  const str = String(value);
  // Already has a timezone designator – parse as-is
  if (str.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(str)) {
    return new Date(str);
  }
  // No timezone info → backend stored UTC without the 'Z'; append it.
  return new Date(str + 'Z');
};

const parseTimeTracking = (ticket) => {
  const activities = [...(ticket?.activities || ticket?.Activities || [])]
    .filter((activity) => ['TimeTrackingStarted', 'TimeTrackingStopped'].includes(activity?.action))
    .sort((a, b) => {
      const ta = parseUtcTimestamp(a?.timestamp);
      const tb = parseUtcTimestamp(b?.timestamp);
      return (ta?.getTime() ?? 0) - (tb?.getTime() ?? 0);
    });

  const sessions = [];
  let pendingStart = null;
  let totalSeconds = 0;

  activities.forEach((activity) => {
    if (activity?.action === 'TimeTrackingStarted') {
      pendingStart = activity;
      return;
    }

    if (activity?.action === 'TimeTrackingStopped') {
      const durationSeconds = Number(activity?.newValue || activity?.oldValue || 0);
      totalSeconds += Number.isFinite(durationSeconds) ? durationSeconds : 0;
      sessions.unshift({
        id: activity?.id,
        agent: activity?.user?.fullName || activity?.user?.username || 'Agent',
        date: (parseUtcTimestamp(activity?.timestamp) ?? new Date()).toLocaleString(),
        duration: Number.isFinite(durationSeconds) ? durationSeconds : 0,
      });
      pendingStart = null;
    }
  });

  const currentSessionStartedAt = parseUtcTimestamp(pendingStart?.timestamp);
  const activeSession = currentSessionStartedAt ? {
    id: pendingStart?.id,
    agent: pendingStart?.user?.fullName || pendingStart?.user?.username || 'Agent',
    date: currentSessionStartedAt.toLocaleString(),
    duration: Math.max(0, Math.floor((Date.now() - currentSessionStartedAt.getTime()) / 1000)),
  } : null;
  const isTracking = Boolean(currentSessionStartedAt);
  const currentSessionSeconds = isTracking
    ? Math.max(0, Math.floor((Date.now() - currentSessionStartedAt.getTime()) / 1000))
    : 0;

  return {
    isTracking,
    currentSessionSeconds,
    totalSeconds: totalSeconds + currentSessionSeconds,
    sessions: activeSession ? [activeSession, ...sessions].slice(0, 3) : sessions.slice(0, 3),
  };
};

const TicketDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ticketId = id || searchParams.get('id') || '4521';

  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTicket = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await ticketsAPI.getById(ticketId);
      setTicketData(res.data || null);
      setError(null);
      markBackendReady(true);
    } catch (err) {
      setTicketData(null);
      setError(err);
      markBackendReady(false);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const ticket = ticketData || {
    id: ticketId,
    ticketNumber: `TKT-${ticketId}`,
    title: 'Ticket details unavailable',
    description: 'No ticket was found for this id.',
    priority: 'Medium',
    status: 'Open',
    category: 'Incident',
    requestedBy: { username: 'Unknown requester' },
    assignedTo: { username: 'Unassigned' },
    createdAt: new Date().toISOString(),
    slaDueDate: null,
    slaRemainingMinutes: null,
  };

  const messages = mapConversationMessages(ticketData || ticket);
  const internalNotes = mapInternalNotes(ticketData || ticket);
  const auditTrail = mapAuditTrail(ticketData || ticket);

  const handleStatusChange = async (newStatus) => {
    if (!ticketData?.id) return;
    await ticketsAPI.updateStatus(ticketData.id, newStatus);
    await fetchTicket(true); // Silent refresh
  };

  const handlePriorityChange = async (newPriority) => {
    if (!ticketData?.id) return;
    await ticketsAPI.updatePriority(ticketData.id, newPriority);
    await fetchTicket(true); // Silent refresh
  };

  const handleAssign = async (agent) => {
    if (!ticketData?.id) return;
    const assignedToId = Number(agent?.id ?? agent);
    if (Number.isNaN(assignedToId)) return;
    try {
      const assignedTo = typeof agent === 'object' && agent !== null ? agent : { id: assignedToId };
      const response = await ticketsAPI.assign(ticketData.id, {
        assignedToId,
        assignedTo,
      });
      const updatedTicket = response?.data || {
        ...ticketData,
        assignedTo: {
          ...(ticketData?.assignedTo || {}),
          ...assignedTo,
          id: assignedToId,
        },
      };
      setTicketData(updatedTicket);
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: {
          type: 'success',
          message: 'Assignee saved successfully.',
        },
      }));
      await fetchTicket(true); // Silent refresh
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: {
          type: 'error',
          message: 'Failed to save assignee.',
        },
      }));
      throw error;
    }
  };

  const handleEscalate = async ({ escalateTo, reason } = {}) => {
    if (!ticketData?.id) return;
    try {
      const response = await ticketsAPI.escalate(ticketData.id, {
        userId: escalateTo || getCurrentUserId(),
        reason: reason || 'Escalated from ticket details',
      });
      if (response?.data) {
        setTicketData(response.data);
      }
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'success', message: 'Ticket escalated successfully.' }
      }));
      try {
        await fetchTicket(true); // Silent refresh
      } catch (refreshErr) {
        console.error('Ticket escalated but refresh failed:', refreshErr);
      }
    } catch (err) {
      try {
        const fallbackResponse = await ticketsAPI.update(ticketData.id, {
          priority: 'Critical',
          status: 'In Progress',
        });
        if (fallbackResponse?.data) {
          setTicketData(fallbackResponse.data);
        }
        window.dispatchEvent(new CustomEvent('itsm:toast', {
          detail: {
            type: 'success',
            message: 'Ticket escalated successfully.',
          }
        }));
        try {
          await fetchTicket(true); // Silent refresh
        } catch (refreshErr) {
          console.error('Ticket escalated via fallback but refresh failed:', refreshErr);
        }
      } catch (fallbackErr) {
        console.error('Failed to escalate ticket:', err, fallbackErr);
        alert('Failed to escalate ticket.');
      }
    }
  };

  const handleAddNote = async (note) => {
    if (!ticketData?.id) return;
    await ticketsAPI.addInternalNote(ticketData.id, {
      userId: getCurrentUserId(),
      text: note,
    });
    await fetchTicket(true); // Silent refresh
  };

  const handleUploadFiles = (files) => {
    if (!ticketData?.id) return;

    const upload = async () => {
      const list = Array.isArray(files) ? files.filter(Boolean) : [];
      if (!list.length) {
        window.dispatchEvent(new CustomEvent('itsm:toast', {
          detail: {
            type: 'warning',
            message: 'No files selected.'
          }
        }));
        return;
      }

      try {
        await Promise.all(list.map((file) => ticketsAPI.uploadAttachment(ticketData.id, file)));
        window.dispatchEvent(new CustomEvent('itsm:toast', {
          detail: {
            type: 'success',
            message: `${list.length} file${list.length > 1 ? 's' : ''} uploaded successfully.`
          }
        }));
        await fetchTicket(true); // Silent refresh
      } catch (error) {
        console.error('Failed to upload ticket attachments:', error);
        window.dispatchEvent(new CustomEvent('itsm:toast', {
          detail: {
            type: 'error',
            message: 'Failed to upload one or more files.'
          }
        }));
      }
    };

    upload();
  };

  const handleStartTimer = async () => {
    if (!ticketData?.id) return;
    await ticketsAPI.startTimeTracking(ticketData.id, { userId: getCurrentUserId() });
    await fetchTicket(true); // Silent refresh
  };

  const handleStopTimer = async (duration) => {
    if (!ticketData?.id) return;
    await ticketsAPI.stopTimeTracking(ticketData.id, {
      userId: getCurrentUserId(),
      durationSeconds: duration,
    });
    await fetchTicket(true); // Silent refresh
  };

  const handleSubmitSurvey = async (survey) => {
    if (!ticketData?.id) return;
    await ticketsAPI.submitFeedback(ticketData.id, {
      userId: getCurrentUserId(),
      rating: survey.rating,
      feedback: survey.feedback,
    });
    await fetchTicket(true); // Silent refresh
  };

  const handleSendReply = async (reply) => {
    if (!ticketData?.id || !reply?.message?.trim()) return;
    if (reply.isInternal) {
      await ticketsAPI.addInternalNote(ticketData.id, {
        userId: getCurrentUserId(),
        text: reply.message,
      });
    } else {
      await ticketsAPI.addReply(ticketData.id, {
        userId: getCurrentUserId(),
        text: reply.message,
      });
    }
    try {
      await fetchTicket(true); // Silent refresh
    } catch (refreshErr) {
      console.error('Reply saved but refresh failed:', refreshErr);
    }
  };

  const createdAt = formatTicketDate(ticket?.createdAt);
  const timeTracking = parseTimeTracking(ticket);
  const displayAttachments = (ticket?.attachments || []).map((attachment) => ({
    id: attachment?.id,
    name: attachment?.fileName,
    type: attachment?.contentType,
    size: attachment?.contentLength,
    uploadedBy: attachment?.uploadedBy || 'System',
    url: attachment?.fileUrl,
    createdAt: attachment?.createdAt,
  }));

  const viewTicket = {
    id: ticket?.ticketNumber || ticket?.id || ticketId,
    title: ticket?.title,
    description: ticket?.description,
    priority: ticket?.priority,
    status: ticket?.status,
    category: ticket?.category,
    requestedBy: ticket?.requestedBy,
    customer: ticket?.requestedBy,
    assignedTo: ticket?.assignedTo,
    createdAt: ticket?.createdAt,
    createdDate: createdAt.date,
    createdTime: createdAt.time,
    slaDeadline: ticket?.slaDueDate ? formatTicketDate(ticket.slaDueDate).date : '-',
    slaRemaining: ticket?.slaRemainingMinutes != null
      ? `${ticket.slaRemainingMinutes} min remaining`
      : ticket?.slaStatus || '-',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      {loading ? (
        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading ticket details...</p>
            </div>
          </div>
        </main>
      ) : (
        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px] mx-auto">
          <div className="space-y-4 md:space-y-6">
            <TicketHeader ticket={viewTicket} />

            {error && !ticketData && (
              <div className="rounded-lg border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
                We could not load this ticket from the backend, so you are seeing a fallback view.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <ConversationThread messages={messages} />
                <InternalNotes notes={internalNotes} onAddNote={handleAddNote} />
                <ReplyComposer onSendReply={handleSendReply} />
                <FileAttachments attachments={displayAttachments} onUpload={handleUploadFiles} />
                <AuditTrail activities={auditTrail} />
              </div>

              <div className="space-y-4 md:space-y-6">
                <TicketActions
                  ticket={viewTicket}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onAssign={handleAssign}
                  onEscalate={handleEscalate}
                />

                <TimeTracking
                  totalTime={timeTracking.totalSeconds}
                  sessions={timeTracking.sessions}
                  isTracking={timeTracking.isTracking}
                  currentSessionTime={timeTracking.currentSessionSeconds}
                  onStartTimer={handleStartTimer}
                  onStopTimer={handleStopTimer}
                />

                <CustomerSatisfaction
                  isResolved={ticket?.status === 'Resolved'}
                  onSubmitSurvey={handleSubmitSurvey}
                />
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default TicketDetails;
