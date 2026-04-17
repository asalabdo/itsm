import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ConversationThread = ({ messages }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'customer':
        return { name: 'User', color: 'var(--color-primary)' };
      case 'agent':
        return { name: 'UserCheck', color: 'var(--color-success)' };
      case 'system':
        return { name: 'Bot', color: 'var(--color-muted-foreground)' };
      default:
        return { name: 'MessageSquare', color: 'var(--color-muted-foreground)' };
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">{t('conversationHistory', 'Conversation History')}</h2>
          <span className="text-xs md:text-sm text-muted-foreground caption">
            {messages?.length} {t('messages', 'messages')}
          </span>
        </div>
      </div>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-h-[600px] overflow-y-auto">
        {messages?.map((message) => {
          const icon = getMessageTypeIcon(message?.type);
          const isEmployee = message?.type === 'customer';
          const isSystem = message?.type === 'system';

          return (
            <div key={message?.id} className={`flex gap-3 md:gap-4 ${isSystem ? 'justify-center' : ''}`}>
              {!isSystem && (
                <div className="flex-shrink-0">
                  {message?.avatar ? (
                    <Image
                      src={message?.avatar}
                      alt={message?.avatarAlt}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                      isEmployee ? 'bg-primary/10' : 'bg-success/10'
                    }`}>
                      <Icon name={icon?.name} size={18} color={icon?.color} />
                    </div>
                  )}
                </div>
              )}
              <div className={`flex-1 min-w-0 ${isSystem ? 'max-w-md' : ''}`}>
                {!isSystem && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm md:text-base font-medium text-foreground">
                      {message?.sender}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground caption">
                      {message?.timestamp}
                    </span>
                    {message?.type === 'agent' && (
                      <span className="px-2 py-0.5 text-xs bg-success/10 text-success rounded caption">
                        Agent
                      </span>
                    )}
                  </div>
                )}

                <div className={`rounded-lg p-3 md:p-4 ${
                  isSystem
                    ? 'bg-muted text-center text-xs md:text-sm text-muted-foreground'
                    : isEmployee
                    ? 'bg-primary/5 border border-primary/20' :'bg-muted'
                }`}>
                  <p className="text-sm md:text-base text-foreground whitespace-pre-wrap">
                    {message?.content}
                  </p>

                  {message?.attachments && message?.attachments?.length > 0 && (
                    <div className="mt-3 md:mt-4 space-y-2">
                      {message?.attachments?.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 md:p-3 bg-background rounded border border-border hover:bg-muted transition-smooth cursor-pointer"
                        >
                          <Icon name="Paperclip" size={16} color="var(--color-muted-foreground)" />
                          <span className="text-xs md:text-sm text-foreground truncate flex-1">
                            {attachment?.name}
                          </span>
                          <span className="text-xs text-muted-foreground caption whitespace-nowrap">
                            {attachment?.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationThread;