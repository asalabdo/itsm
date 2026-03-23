import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { streamTicketChatResponse } from '../../services/ticketChatService';
import Icon from '../../components/AppIcon';

const TicketChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your ServiceDesk Pro assistant. I can help you create tickets, check ticket status, answer questions, and provide troubleshooting guidance. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock user tickets for context
  const userTickets = [
    { id: 'TKT-1001', subject: 'Unable to access company email', status: 'Open', priority: 'High' },
    { id: 'TKT-1002', subject: 'VPN connection issues', status: 'In-Progress', priority: 'Critical' }
  ];

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage?.trim() || isLoading) return;

    const userMessage = inputMessage?.trim();
    setInputMessage('');
    setError('');

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Prepare context
    const context = {
      tickets: userTickets,
      userName: 'Current User'
    };

    try {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');

      // Use streaming for better UX
      await streamTicketChatResponse(
        userMessage,
        chatHistory,
        (chunk) => {
          setStreamingMessage(prev => prev + chunk);
        },
        context
      )?.then(({ response, updatedHistory }) => {
        // Add assistant message
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setChatHistory(updatedHistory);
        setStreamingMessage('');
      });
    } catch (err) {
      setError(err?.message || 'Failed to get response. Please try again.');
      // Remove streaming message on error
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
        content: 'Chat cleared. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
    setChatHistory([]);
    setError('');
  };

  const quickActions = [
    { label: 'Create a ticket', icon: 'Plus', prompt: 'I need to create a new support ticket' },
    { label: 'Check ticket status', icon: 'Search', prompt: 'Can you check the status of my tickets?' },
    { label: 'VPN troubleshooting', icon: 'Wifi', prompt: 'I\'m having VPN connection issues' },
    { label: 'Password reset', icon: 'Key', prompt: 'I need help resetting my password' }
  ];

  const handleQuickAction = (prompt) => {
    setInputMessage(prompt);
    inputRef?.current?.focus();
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/agent-dashboard' },
            { label: 'AI Assistant', path: '/ticket-chatbot' }
          ]}
        />

        <div className="mt-6">
          {/* Header */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Bot" className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">AI Ticket Assistant</h1>
                  <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  disabled={isLoading}
                >
                  <Icon name="Trash2" className="w-4 h-4 mr-2" />
                  Clear Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/ticket-creation')}
                >
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {messages?.length <= 1 && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions?.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action?.prompt)}
                    className="flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name={action?.icon} className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Container */}
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            {/* Messages Area */}
            <div className="h-[600px] overflow-y-auto p-6 space-y-4">
              {messages?.map((message) => (
                <div
                  key={message?.id}
                  className={`flex gap-3 ${
                    message?.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message?.role === 'user' ?'bg-primary text-primary-foreground' :'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <Icon
                      name={message?.role === 'user' ? 'User' : 'Bot'}
                      className="w-4 h-4"
                    />
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message?.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block rounded-lg px-4 py-3 ${
                        message?.role === 'user' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(message?.content) }}></p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(message?.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Streaming Message */}
              {isStreaming && streamingMessage && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Bot" className="w-4 h-4" />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="inline-block rounded-lg px-4 py-3 bg-muted text-foreground">
                      <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(streamingMessage) }}></p>
                      <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
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

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertCircle" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Error</p>
                      <p className="text-sm text-destructive/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 bg-muted/30">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message... (Press Enter to send)"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e?.target?.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage?.trim() || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <Icon name="Loader2" className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon name="Send" className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                AI-powered responses may not always be accurate. For critical issues, please create a formal ticket.
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle" className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Create Tickets</p>
                  <p className="text-xs text-muted-foreground">Through conversation</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Search" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Check Status</p>
                  <p className="text-xs text-muted-foreground">Real-time updates</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <Icon name="Lightbulb" className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Get Help</p>
                  <p className="text-xs text-muted-foreground">Instant answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketChatbot;