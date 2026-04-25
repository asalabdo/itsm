import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { getLocalizedTicketQuickPreset, TICKET_QUICK_PRESETS } from '../../services/ticketDepartmentDefaults';
import { getPortalIncidentEntryState, getPortalQuickPresetEntryState } from '../../pages/ticket-creation/portalIncidentSeed';

const TicketLaunchMenu = ({
  buttonClassName = '',
  buttonLabel,
  buttonVariant = 'default',
  buttonSize = 'sm',
  showText = true,
  title,
}) => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const quickPresets = useMemo(
    () => TICKET_QUICK_PRESETS.slice(0, 3).map((preset) => getLocalizedTicketQuickPreset(preset, language)),
    [language],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const openFullTicketFlow = () => {
    navigate('/ticket-creation');
    setOpen(false);
  };

  const openIncidentFlow = () => {
    navigate('/ticket-creation', { state: getPortalIncidentEntryState() });
    setOpen(false);
  };

  const openQuickPreset = (presetId) => {
    navigate('/ticket-creation', { state: getPortalQuickPresetEntryState(presetId) });
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={buttonClassName}
        onClick={() => setOpen((prev) => !prev)}
        title={title || t('newTicket', 'New Ticket')}
      >
        <Icon name="Plus" size={15} />
        {showText ? <span className="text-xs font-medium">{buttonLabel || t('newTicket', 'New Ticket')}</span> : null}
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} />
      </Button>

      {open ? (
        <div className={`absolute top-full mt-2 w-80 rounded-2xl border border-border bg-popover shadow-lg z-[1300] ${isRtl ? 'left-0' : 'right-0'}`}>
          <div className="p-4 space-y-4">
            <div className="text-left">
              <h3 className="text-sm font-semibold text-popover-foreground">{t('launchTicketFlow', 'Launch Ticket Flow')}</h3>
              <p className="text-xs text-muted-foreground">{t('launchTicketFlowDesc', 'Start a full ticket, open the incident flow, or use a common preset.')}</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={openFullTicketFlow}
                className="rounded-xl border border-border bg-background px-4 py-3 text-left hover:border-primary/40 hover:shadow-elevation-2 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t('newTicket', 'New Ticket')}</div>
                    <div className="text-xs text-muted-foreground">{t('openFullTicketForm', 'Open the full guided ticket form.')}</div>
                  </div>
                  <Icon name="FilePlus2" size={18} className="text-primary shrink-0" />
                </div>
              </button>

              <button
                type="button"
                onClick={openIncidentFlow}
                className="rounded-xl border border-border bg-background px-4 py-3 text-left hover:border-primary/40 hover:shadow-elevation-2 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t('incidentFlow', 'Incident Flow')}</div>
                    <div className="text-xs text-muted-foreground">{t('openIncidentFlow', 'Jump into the incident intake workflow.')}</div>
                  </div>
                  <Icon name="AlertCircle" size={18} className="text-primary shrink-0" />
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('commonRequests', 'Common Requests')}</div>
              <div className="space-y-2">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => openQuickPreset(preset.id)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-left hover:border-primary/40 hover:shadow-elevation-2 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{preset.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{preset.subject}</div>
                      </div>
                      <Icon name="Zap" size={16} className="text-primary shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TicketLaunchMenu;
