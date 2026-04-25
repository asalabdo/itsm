import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { streamTicketChatResponse } from '../../services/ticketChatService';
import { ticketsAPI } from '../../services/api';
import Icon from '../../components/AppIcon';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const TicketChatbot = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: t(
        'ticketChatWelcome',
        'Hello! I am your ServiceDesk assistant. I can help you create tickets, check ticket status, answer questions, and provide troubleshooting guidance. How can I assist you today?'
      ),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      return Number(user?.id) || null;
    } catch {
      return null;
    }
  })();

  const localizeStatus = (value) => {
    const raw = String(value || '').trim();
    if (!isArabic) return raw;
    const map = {
      open: 'مفتوحة',
      new: 'جديدة',
      assigned: 'مُسندة',
      'in progress': 'قيد التنفيذ',
      resolved: 'محلولة',
      closed: 'مغلقة',
      pending: 'قيد الانتظار',
    };
    return map[raw.toLowerCase()] || raw;
  };

  const localizePriority = (value) => {
    const raw = String(value || '').trim();
    if (!isArabic) return raw;
    const map = {
      critical: 'حرجة',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
    };
    return map[raw.toLowerCase()] || raw;
  };

  useEffect(() => {
    const loadTickets = async () => {
      setLoadingTickets(true);
      try {
        const res = await ticketsAPI.getAll();
        const rawTickets = Array.isArray(res?.data) ? res.data : [];
        const filtered = currentUserId
          ? rawTickets.filter((ticket) => {
              const candidateIds = [
                ticket?.requestedById,
                ticket?.assignedToId,
                ticket?.requestedBy?.id,
                ticket?.assignedTo?.id,
                ticket?.ownerId,
                ticket?.createdById,
              ].map((value) => Number(value)).filter((value) => !Number.isNaN(value) && value > 0);
              return candidateIds.includes(currentUserId);
            })
          : rawTickets;
        setTickets((filtered.length > 0 ? filtered : rawTickets).slice(0, 5));
      } catch {
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    };

    loadTickets();
  }, [currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage?.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');

    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newUserMessage]);

    const context = {
      tickets: tickets.map((ticket) => ({
        id: ticket?.ticketNumber || `TKT-${ticket?.id}`,
        subject: ticket?.title || ticket?.subject || t('untitledTicket', 'Untitled ticket'),
        status: ticket?.status || 'Open',
        priority: ticket?.priority || 'Medium'
      })),
      userName: t('currentUser', 'Current User')
    };

    try {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');

      await streamTicketChatResponse(
        userMessage,
        chatHistory,
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        },
        context
      )?.then(({ response, updatedHistory }) => {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setChatHistory(updatedHistory);
        setStreamingMessage('');
      });
    } catch (err) {
      setError(err?.message || t('failedToGetResponse', 'Failed to get response. Please try again.'));
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: t('chatCleared', 'Chat cleared. How can I assist you today?'),
        timestamp: new Date()
      }
    ]);
    setChatHistory([]);
    setError('');
  };

  const quickActions = [
    { label: t('createTicket', 'Create a ticket'), icon: 'Plus', prompt: t('createTicketPrompt', 'I need to create a new support ticket') },
    { label: t('checkTicketStatus', 'Check ticket status'), icon: 'Search', prompt: t('checkTicketStatusPrompt', 'Can you check the status of my tickets?') },
    { label: t('vpnTroubleshooting', 'VPN troubleshooting'), icon: 'Wifi', prompt: t('vpnTroubleshootingPrompt', 'I am having VPN connection issues') },
    { label: t('passwordReset', 'Password reset'), icon: 'Key', prompt: t('passwordResetPrompt', 'I need help resetting my password') }
  ];

  const handleQuickAction = (prompt) => {
    setInputMessage(prompt);
    inputRef?.current?.focus();
  };

  const formatMessage = (content) =>
    content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ManageEngineOnPremSnapshot
          compact
          title={t('manageEngineAssistantContext', 'ManageEngine Assistant Context')}
          description={t('manageEngineAssistantContextDesc', 'Live ServiceDesk requests plus OpManager 12.8.270 services and alerts help the assistant guide ticket creation safely.')}
        />

        <div className="mt-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Bot" className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t('aiTicketAssistant', 'AI Ticket Assistant')}</h1>
                  <p className="text-sm text-muted-foreground">
                    {t('aiTicketAssistantSubtitle', 'Powered by Gemini AI and live ticket context')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClearChat} disabled={isLoading}>
                  <Icon name="Trash2" className="w-4 h-4 mr-2" />
                  {t('clearChat', 'Clear Chat')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/ticket-creation')}>
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  {t('createTicket', 'Create Ticket')}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{t('liveContext', 'Live Context')}</h2>
              <span className="text-xs text-muted-foreground">
                {loadingTickets
                  ? t('loadingTickets', 'Loading tickets...')
                  : t('ticketsAvailable', '{count} ticket(s) available').replace('{count}', String(tickets.length))}
              </span>
            </div>
            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {ticket.ticketNumber || `TKT-${ticket.id}`}
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                      {ticket.title || ticket.subject || t('untitledTicket', 'Untitled ticket')}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {localizeStatus(ticket.status || 'Open')} • {localizePriority(ticket.priority || 'Medium')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                {t('noRecentTickets', 'No recent tickets were found for the current user.')}
              </div>
            )}
          </div>

          {messages?.length <= 1 && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">{t('quickActions', 'Quick Actions')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name={action.icon} className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="h-[600px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <Icon name={message.role === 'user' ? 'User' : 'Bot'} className="w-4 h-4" />
                  </div>

                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block rounded-lg px-4 py-3 ${
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              ))}

              {isStreaming && streamingMessage && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Bot" className="w-4 h-4" />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="inline-block rounded-lg px-4 py-3 bg-muted text-foreground">
                      <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(streamingMessage) }} />
                      <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !streamingMessage && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Bot" className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block rounded-lg px-4 py-3 bg-muted">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertCircle" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">{t('error', 'Error')}</p>
                      <p className="text-sm text-destructive/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-4 bg-muted/30">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={t('typeYourMessage', 'Type your message... (Press Enter to send)')}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e?.target?.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!inputMessage?.trim() || isLoading} size="lg">
                  {isLoading ? <Icon name="Loader2" className="w-5 h-5 animate-spin" /> : <Icon name="Send" className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('ticketChatDisclaimer', 'AI responses are based on live ticket context. For critical issues, please create a formal ticket.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketChatbot;
