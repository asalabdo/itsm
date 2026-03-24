import React, { useState, useEffect } from 'react';
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

const TicketDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ticketId = id || searchParams.get('id') || '4521';
  
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await ticketsAPI.getById(ticketId);
        setTicketData(res.data || null);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch ticket:', err);
        setTicketData(null);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  const [messages, setMessages] = useState([]);
  const [internalNotes, setInternalNotes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [timeTracking, setTimeTracking] = useState({ totalTime: 0, sessions: [] });
  const [auditTrail, setAuditTrail] = useState([]);

  const handleStatusChange = (newStatus) => {
    console.log('Status changed to:', newStatus);
  };

  const handlePriorityChange = (newPriority) => {
    console.log('Priority changed to:', newPriority);
  };

  const handleAssign = (agentId) => {
    console.log('Assigned to agent:', agentId);
  };

  const handleEscalate = () => {
    console.log('Ticket escalated');
  };

  const handleAddNote = (note) => {
    console.log('Internal note added:', note);
  };

  const handleUploadFiles = (files) => {
    console.log('Files uploaded:', files);
  };

  const handleStartTimer = () => {
    console.log('Timer started');
  };

  const handleStopTimer = (duration) => {
    console.log('Timer stopped. Duration:', duration);
  };

  const handleSubmitSurvey = (survey) => {
    console.log('Survey submitted:', survey);
  };

  const handleSendReply = (reply) => {
    console.log('Reply sent:', reply);
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
            <TicketHeader ticket={ticketData || defaultTicketData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <ConversationThread messages={messages} />
                
                <InternalNotes notes={internalNotes} onAddNote={handleAddNote} />
                
                <ReplyComposer onSendReply={handleSendReply} />
                
                <FileAttachments attachments={attachments} onUpload={handleUploadFiles} />
                
                <AuditTrail activities={auditTrail} />
              </div>

              <div className="space-y-4 md:space-y-6">
                <TicketActions
                  ticket={ticketData || defaultTicketData}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onAssign={handleAssign}
                  onEscalate={handleEscalate} />

                
                <TimeTracking
                  totalTime={timeTracking?.totalTime}
                  sessions={timeTracking?.sessions}
                  onStartTimer={handleStartTimer}
                  onStopTimer={handleStopTimer} />

                
                <CustomerSatisfaction
                  isResolved={(ticketData || defaultTicketData)?.status === 'Resolved'}
                  onSubmitSurvey={handleSubmitSurvey} />

              </div>
            </div>
          </div>
        </main>
      )}
    </div>);

};

export default TicketDetails;