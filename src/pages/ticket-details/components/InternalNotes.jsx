import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const InternalNotes = ({ notes, onAddNote }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (newNote?.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div
        className="p-4 md:p-6 border-b border-border cursor-pointer hover:bg-muted/30 transition-smooth"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Icon name="Lock" size={18} color="var(--color-warning)" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground">{t('internalNotes', 'Internal Notes')}</h3>
              <p className="text-xs md:text-sm text-muted-foreground caption">
                {t('privateTeamCollaboration', 'Private team collaboration')} • {notes?.length} {t('notes', 'notes')}
              </p>
            </div>
          </div>
          <Icon
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            size={20}
            color="var(--color-muted-foreground)"
          />
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="mb-4 md:mb-6">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e?.target?.value)}
              placeholder={t('addInternalNote', 'Add an internal note (visible only to support team)...')}
              className="w-full min-h-[100px] p-3 md:p-4 bg-background border border-border rounded-lg text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-end mt-3">
              <Button
                type="submit"
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                disabled={!newNote?.trim()}
              >
                Add Note
              </Button>
            </div>
          </form>

          <div className="space-y-3 md:space-y-4">
            {notes?.map((note) => (
              <div key={note?.id} className="flex gap-3 p-3 md:p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="flex-shrink-0">
                  {note?.avatar ? (
                    <Image
                      src={note?.avatar}
                      alt={note?.avatarAlt}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Icon name="User" size={18} color="var(--color-warning)" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm md:text-base font-medium text-foreground">
                      {note?.author}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground caption">
                      {note?.timestamp}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-warning/10 text-warning rounded caption">
                      Internal
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-foreground whitespace-pre-wrap">
                    {note?.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalNotes;