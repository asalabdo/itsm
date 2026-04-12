import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReplyComposer = ({ onSendReply }) => {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message?.trim()) {
      onSendReply({ message, isInternal });
      setMessage('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Reply to Customer</h3>
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-smooth ${
              isInternal
                ? 'bg-warning/10 text-warning border border-warning/20' :'bg-muted text-muted-foreground border border-border'
            }`}
            onClick={() => setIsInternal(!isInternal)}
          >
            <Icon name="Lock" size={16} />
            {isInternal ? 'Internal Note' : 'Public Reply'}
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 md:p-6">
        <textarea
          value={message}
          onChange={(e) => setMessage(e?.target?.value)}
          placeholder={
            isInternal
              ? 'Add an internal note (visible only to support team)...'
              : 'Type your reply to the customer...'
          }
          className="w-full min-h-[150px] p-3 md:p-4 bg-background border border-border rounded-lg text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="p-2 hover:bg-muted rounded transition-smooth"
              title="Attach file"
            >
              <Icon name="Paperclip" size={20} color="var(--color-muted-foreground)" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-muted rounded transition-smooth"
              title="Insert template"
            >
              <Icon name="FileText" size={20} color="var(--color-muted-foreground)" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-muted rounded transition-smooth"
              title="Insert emoji"
            >
              <Icon name="Smile" size={20} color="var(--color-muted-foreground)" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMessage('')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              iconName="Send"
              iconPosition="left"
              disabled={!message?.trim()}
            >
              {isInternal ? 'Add Note' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReplyComposer;