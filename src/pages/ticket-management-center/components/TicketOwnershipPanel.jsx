import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { groupTicketsByDepartment } from '../../../services/ticketRouting';
import { loadErpDepartmentDirectory } from '../../../services/organizationUnits';

const TicketOwnershipPanel = ({ tickets = [], onOpenDepartment }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [erpDepartments, setErpDepartments] = useState([]);

  useEffect(() => {
    let mounted = true;

    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) {
          setErpDepartments(Array.isArray(departments) ? departments : []);
        }
      })
      .catch((error) => {
        console.error('Failed to load ERP departments:', error);
        if (mounted) {
          setErpDepartments([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const buckets = useMemo(() => groupTicketsByDepartment(tickets, erpDepartments), [tickets, erpDepartments]);

  return (
    <section className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {t('ticketDepartmentOwnership', 'Ticket Department Ownership')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('ticketDepartmentOwnershipDesc', 'See which departments own the current incident and request load.')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Building2" size={16} />
          <span>{buckets.length} {t('departments', 'departments')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {buckets.map((bucket) => (
          <div key={bucket.department} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{bucket.department}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {bucket.total} {t('tickets', 'tickets')} | {bucket.open} {t('open', 'open')} | {bucket.overdue} {t('overdue', 'overdue')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onOpenDepartment?.(bucket)}>
                {t('view', 'View')}
              </Button>
            </div>

            <div className="space-y-2">
              {bucket.tickets.slice(0, 4).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      #{ticket.id} | {ticket.assignee || t('unassigned', 'Unassigned')}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {ticket.priorityLabel || ticket.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TicketOwnershipPanel;
