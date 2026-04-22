import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { groupRequestsByDepartment, inferServiceRouting } from '../../../services/requestRouting';
import { serviceRequestsAPI } from '../../../services/api';
import { loadErpDepartmentDirectory } from '../../../services/organizationUnits';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const DepartmentServiceOwnershipPanel = ({ serviceRequests = [], onOpenDepartment, onRefresh }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [busyKey, setBusyKey] = useState('');
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

  const departmentBuckets = useMemo(
    () => groupRequestsByDepartment(serviceRequests, erpDepartments),
    [serviceRequests, erpDepartments]
  );

  const handleClaimNext = async (bucket, service) => {
    const currentUser = getStoredUser();
    const currentUserId = currentUser?.id;
    if (!currentUserId) {
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'warning', message: t('loginRequired', 'Please log in to claim requests.') }
      }));
      return;
    }

    const request = serviceRequests.find((item) => {
      const routing = inferServiceRouting(item);
      const departmentMatch = (bucket?.department || '').toLowerCase() === String(item?.department || item?.requestedBy?.department || routing.department || '').toLowerCase();
      const serviceMatch = String(service?.key || '').toLowerCase() === String(routing?.key || '').toLowerCase();
      const openStatus = !['completed', 'fulfilled', 'closed', 'resolved', 'rejected'].includes(String(item?.status || '').toLowerCase());
      const unassigned = !item?.assignedToId;
      return departmentMatch && serviceMatch && openStatus && unassigned;
    });

    if (!request) {
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'info', message: t('noOpenRequest', 'No open unassigned request found for this service.') }
      }));
      return;
    }

    const busyId = `${bucket?.department || 'unknown'}:${service?.key || 'service'}`;
    try {
      setBusyKey(busyId);
      await serviceRequestsAPI.update(request.id, { assignedToId: currentUserId });
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'success', message: t('requestClaimed', 'Request assigned to you successfully.') }
      }));
      window.dispatchEvent(new CustomEvent('itsm:refresh'));
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to claim request:', error);
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'error', message: t('claimFailed', 'Failed to assign the request.') }
      }));
    } finally {
      setBusyKey('');
    }
  };

  return (
    <section className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {t('departmentOwnership', 'Department Service Ownership')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('departmentOwnershipDesc', 'Requests are grouped by department and service so each team can see its queue.')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="GitBranch" size={16} />
          <span>{departmentBuckets.length} {t('departments', 'departments')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {departmentBuckets.map((bucket) => (
          <div key={bucket.department} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{bucket.department}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {bucket.total} {t('requests', 'requests')} | {bucket.open} {t('open', 'open')} | {bucket.overdue} {t('overdue', 'overdue')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                  {bucket.urgent} {t('urgent', 'urgent')}
                </span>
                <Button variant="outline" size="sm" onClick={() => onOpenDepartment?.(bucket)}>
                  {t('view', 'View')}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {bucket.services.map((service) => (
                <div key={service.key} className="flex items-center justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.count} {t('requests', 'requests')} | {service.assigned} {t('assigned', 'assigned')} | {service.pending} {t('pending', 'pending')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {Math.round((service.assigned / Math.max(service.count, 1)) * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClaimNext(bucket, service)}
                      disabled={busyKey === `${bucket.department}:${service.key}` || service.pending === 0}
                    >
                      {busyKey === `${bucket.department}:${service.key}`
                        ? t('claiming', 'Claiming...')
                        : t('claimNext', 'Claim next')}
                    </Button>
                    <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DepartmentServiceOwnershipPanel;
