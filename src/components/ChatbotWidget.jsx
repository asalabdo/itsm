import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';
import Icon from './AppIcon';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../services/i18n';
import { streamTicketChatResponse } from '../services/ticketChatService';

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `${t('hiWelcome', 'Hi, Welcome to GFSA...')} I'm your AI assistant here to help you with all your IT service needs.`,
      timestamp: new Date()
    },
    {
      id: 2,
      role: 'assistant', 
      content: `${t('canHelpYouWith', 'I can help you with...')}\n\n1. Creating a Ticket\n2. Checking a Ticket's Status\n3. Answering Questions about tickets\n4. Troubleshooting a common IT issue\n\nPlease select an option by typing the number (1-4).`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, streamingMessage, isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage?.trim() || isLoading) return;

    const userMessage = inputMessage?.trim();
    setInputMessage('');

    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Check if user selected option 1 (Creating a Ticket)
    if (userMessage === '1' || userMessage.toLowerCase().includes('creating') || userMessage.toLowerCase().includes('create ticket')) {
      const categoryMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Great! I can help you create a ticket. Please select a category:\n\n1- Technical Support (Device repairs, network issues)\n2- Device Replacement (Computer, printer, peripherals)\n3- HR Services (Vacation requests, attendance)\n4- Cyber Security (VPN access, security issues)\n5- Maintenance Services (Facility repairs, meeting rooms)\n\nWhat type of ticket would you like to create?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, categoryMessage]);
      return;
    }

    try {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');

      await streamTicketChatResponse(
        userMessage,
        chatHistory,
        (chunk) => {
          setStreamingMessage(prev => prev + chunk);
        },
        {}
      )?.then(({ response, updatedHistory }) => {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setChatHistory(updatedHistory);
        setStreamingMessage('');
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      });
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or visit the full AI Assistant page.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-110"
        aria-label={t('toggleChatbot', 'Toggle chatbot')}
      >
        {isOpen ? (
          <Icon name="X" className="w-6 h-6" />
        ) : (
          <>
            <Icon name="MessageCircle" className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-card rounded-lg shadow-2xl border border-border flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Icon name="Bot" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t('aiAssistant', 'AI Assistant')}</h3>
                <p className="text-xs opacity-90">{t('alwaysHereToHelp', 'Always here to help')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/ticket-chatbot')}
                className="p-1.5 hover:bg-primary-foreground/20 rounded transition-colors"
                aria-label={t('openFullChat', 'Open full chat')}
              >
                <Icon name="Maximize2" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-primary-foreground/20 rounded transition-colors"
                aria-label={t('closeChat', 'Close chat')}
              >
                <Icon name="X" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {messages?.map((message) => (
              <div
                key={message?.id}
                className={`flex gap-2 ${
                  message?.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message?.role === 'user' ?'bg-primary text-primary-foreground' :'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <Icon
                    name={message?.role === 'user' ? 'User' : 'Bot'}
                    className="w-3 h-3"
                  />
                </div>
                <div
                  className={`flex-1 max-w-[75%] ${
                    message?.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg px-3 py-2 ${
                      message?.role === 'user' ?'bg-primary text-primary-foreground' :'bg-card text-foreground border border-border'
                    }`}
                  >
                    <p className="text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(message?.content) }}></p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatTime(message?.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Bot" className="w-3 h-3" />
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="inline-block rounded-lg px-3 py-2 bg-card text-foreground border border-border">
                    <p className="text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(streamingMessage) }}></p>
                    <span className="inline-block w-1.5 h-3 bg-primary ml-1 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && !streamingMessage && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Bot" className="w-3 h-3" />
                </div>
                <div className="inline-block rounded-lg px-3 py-2 bg-card border border-border">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card rounded-b-lg">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder={t('typeMessage', 'Type a message...')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e?.target?.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 h-9 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage?.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Icon name="Loader2" className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon name="Send" className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;