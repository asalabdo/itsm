import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import Icon from '../../../components/AppIcon';
import { ticketsAPI } from '../../../services/api';

const PriorityBanner = ({ tickets = [] }) => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const urgentIncidents = tickets.length > 0 ? tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').map(t => ({
    backendId: t.id,
    id: t.ticketNumber,
    title: t.title,
    priority: t.priority === 'Critical' ? 'P1' : 'P2',
    slaRemaining: t.dueDate ? Math.max(0, Math.floor((new Date(t.dueDate) - new Date()) / 60000)) : 120,
    assignedTo: t.assignedToName || 'Unassigned',
    escalationWarning: t.dueDate ? new Date(t.dueDate) < new Date(Date.now() + 30 * 60000) : false,
    createdAt: new Date(t.createdAt)
  })) : [];
  const handleAccept = async () => {
    if (!currentIncident?.backendId) return;
    await ticketsAPI.update(currentIncident.backendId, { status: 'In Progress' });
    navigate(`/ticket-details/${currentIncident.backendId}`);
  };

  const handleEscalate = async () => {
    if (!currentIncident?.backendId) return;
    await ticketsAPI.update(currentIncident.backendId, { priority: 'Critical', status: 'In Progress' });
    navigate('/manager-dashboard');
  };


  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (urgentIncidents?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % urgentIncidents?.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [urgentIncidents?.length]);

  const formatSLATime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSLAColor = (minutes, escalation) => {
    if (escalation || minutes < 30) return 'text-error';
    if (minutes < 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  if (urgentIncidents?.length === 0) return null;

  const currentIncident = urgentIncidents?.[currentIndex];

  return (
    <div className={`relative px-6 py-5 border-b-2 ${
      currentIncident?.priority === 'P1' ? 'bg-error/10 border-error' : 'bg-warning/10 border-warning'
    }`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className={`flex items-center gap-4 flex-1 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-md ${
            currentIncident?.priority === 'P1' ?'bg-error text-error-foreground' :'bg-warning text-warning-foreground'
          }`}>
            <Icon name="AlertTriangle" size={18} />
            <span className="whitespace-nowrap">{currentIncident?.priority}</span>
            <span className="whitespace-nowrap">{t('urgent', 'URGENT')}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base mb-1 truncate">
              <span className="font-mono">{currentIncident?.id}</span>
              <span className={isRtl ? 'mr-2' : 'ml-2'}>:</span>
              <span className={isRtl ? 'mr-2' : 'ml-2'}>{currentIncident?.title}</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('assigned', 'Assigned')} {new Date(currentIncident.createdAt)?.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={isRtl ? 'text-left' : 'text-right'}>
            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Icon name="Clock" size={18} className="text-muted-foreground" />
              <span className={`font-bold text-base ${getSLAColor(currentIncident?.slaRemaining, currentIncident?.escalationWarning)}`}>
                {formatSLATime(currentIncident?.slaRemaining)}
              </span>
              <span className="text-muted-foreground">{t('remaining', 'remaining')}</span>
              {currentIncident?.escalationWarning && (
                <Icon name="AlertCircle" size={18} className="text-error animate-pulse" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('slaBreachWarning', 'SLA Breach Warning')}</p>
          </div>

          <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <button onClick={handleAccept} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-md whitespace-nowrap">
              {t('accept', 'Accept')}
            </button>
            <button onClick={handleEscalate} className="px-5 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-md whitespace-nowrap">
              {t('escalate', 'Escalate')}
            </button>
          </div>
        </div>
      </div>
      {/* Pagination dots */}
      {urgentIncidents?.length > 1 && (
        <div className={`flex justify-center gap-2 mt-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {urgentIncidents?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-foreground scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityBanner;