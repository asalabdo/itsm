import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import Icon from '../../../components/AppIcon';
import { ticketsAPI } from '../../../services/api';

const ActiveTicketsCard = ({ tickets = [], filter, loading }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const activeTickets = tickets.length > 0 ? tickets.map(t => ({
    backendId: t.id,
    id: t.ticketNumber,
    title: t.title,
    priority: t.priority === 'Critical' ? 'P1' : t.priority === 'High' ? 'P2' : 'P3',
    status: t.status,
    customer: t.requestedByName || 'Unknown',
    department: t.department || 'General',
    slaTime: t.dueDate ? Math.max(0, Math.floor((new Date(t.dueDate) - new Date()) / 60000)) : 240,
    category: t.category || 'General',
    assignedAt: new Date(t.createdAt),
    description: t.description
  })) : [];

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'text-error border-error bg-error/10';
      case 'P2': return 'text-warning border-warning bg-warning/10';
      case 'P3': return 'text-blue-500 border-blue-500 bg-blue-500/10';
      default: return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'bg-blue-500/10 text-blue-500';
      case 'In Progress': return 'bg-warning/10 text-warning';
      case 'Resolved': return 'bg-success/10 text-success';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const formatTimeAgo = (date) => {
    const minutes = Math.floor((Date.now() - date?.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const filteredTickets = activeTickets?.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return ['P1', 'P2']?.includes(ticket?.priority);
    if (filter === 'overdue') return ticket?.slaTime < 60;
    if (filter === 'assigned') return ticket?.status === 'Open';
    return true;
  });

  const handleStatusChange = async (ticketId, newStatus) => {
    const ticket = activeTickets.find(t => t.id === ticketId);
    if (!ticket?.backendId) return;
    await ticketsAPI.update(ticket.backendId, { status: newStatus });
    window.dispatchEvent(new CustomEvent('itsm:refresh'));
    setSelectedTicket(null);
    setStatusUpdate('');
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Inbox" size={20} />
            <span>{t('activeTicketsCard', 'Active Tickets')} ({filteredTickets?.length})</span>
          </h3>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="Filter" size={16} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="RefreshCw" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">{t('loadingActiveTickets', 'Loading active tickets...')}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            {t('noOpenTickets', 'No open tickets match the current filter.')}
          </div>
        ) : filteredTickets?.map((ticket) => (
          <div
            key={ticket?.id}
            className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded border font-medium ${getPriorityColor(ticket?.priority)}`}>
                    {ticket?.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(ticket?.status)}`}>
                    {ticket?.status}
                  </span>
                </div>
                
                <h4 className="font-medium text-foreground text-sm mb-1">{ticket?.id}</h4>
                <p className="text-sm text-foreground mb-2">{ticket?.title}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{ticket?.customer}</span>
                  <span>•</span>
                  <span>{ticket?.department}</span>
                  <span>•</span>
                  <span>{ticket?.category}</span>
                </div>
              </div>
              
              <div className="text-right text-xs text-muted-foreground ml-4">
                <p>{formatTimeAgo(ticket?.assignedAt)}</p>
                <p className="mt-1">SLA: {Math.floor(ticket?.slaTime / 60)}h {ticket?.slaTime % 60}m</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex space-x-2">
                <button
                  onClick={async (e) => {
                    e?.stopPropagation();
                    await handleStatusChange(ticket?.id, 'In Progress');
                    navigate(`/ticket-details/${ticket?.backendId}`);
                  }}
                  className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors"
                >
                  {t('startWork', 'Start Work')}
                </button>
                <button
                  onClick={async (e) => {
                    e?.stopPropagation();
                    if (ticket?.backendId) {
                      await ticketsAPI.update(ticket.backendId, { priority: 'Critical' });
                    }
                    navigate(`/ticket-details/${ticket?.backendId}`);
                  }}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 transition-colors"
                >
                  {t('escalate', 'Escalate')}
                </button>
              </div>
              
              <div className="flex space-x-1">
                <button onClick={() => ticket?.backendId && navigate(`/ticket-details/${ticket.backendId}`)} className="p-1 hover:bg-muted rounded" title={t('openDetails', 'Open details')}>
                  <Icon name="MessageSquare" size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => ticket?.backendId && navigate(`/ticket-details/${ticket.backendId}`)} className="p-1 hover:bg-muted rounded" title={t('attachments', 'Attachments')}>
                  <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => ticket?.backendId && navigate(`/ticket-details/${ticket.backendId}`)} className="p-1 hover:bg-muted rounded" title={t('moreActions', 'More actions')}>
                  <Icon name="MoreHorizontal" size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{selectedTicket?.id}</h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('description', 'Description')}</label>
                  <p className="text-foreground">{selectedTicket?.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('customer', 'Customer')}</label>
                    <p className="text-foreground">{selectedTicket?.customer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('department', 'Department')}</label>
                    <p className="text-foreground">{selectedTicket?.department}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('statusUpdate', 'Status Update')}</label>
                  <textarea
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e?.target?.value)}
                    className="w-full p-3 mt-1 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                    placeholder={t('addStatusUpdate', 'Add a status update...')}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket?.id, 'In Progress')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t('updateStatus', 'Update Status')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTicketsCard;
