import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const PriorityBadge = ({ priority }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const getPriorityLabel = () => {
    const priorityKey = priority?.toLowerCase();
    const priorityTranslations = {
      'urgent': t('priorityUrgent', 'Urgent'),
      'high': t('priorityHigh', 'High'),
      'medium': t('priorityMedium', 'Medium'),
      'low': t('priorityLow', 'Low'),
    };
    return priorityTranslations[priorityKey] || priority;
  };

  const getPriorityStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-md text-xs md:text-sm font-medium border caption ${getPriorityStyles()}`}>
      {getPriorityLabel()}
    </span>
  );
};

export default PriorityBadge;