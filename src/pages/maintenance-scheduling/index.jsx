import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { assetsAPI, ticketsAPI } from '../../services/api';

const MaintenanceScheduling = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const [allAssets, setAllAssets] = useState([]);
  const [scheduledMaintenances, setScheduledMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    assetId: '',
    type: 'preventive',
    priority: 'medium',
    scheduledDate: '',
    estimatedHours: '2',
    technician: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetsRes, ticketsRes] = await Promise.all([
          assetsAPI.getAll().catch(() => ({ data: [] })),
          ticketsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const fetchedAssets = Array.isArray(assetsRes.data) ? assetsRes.data : [];
        setAllAssets(fetchedAssets);

        const maintenanceTickets = (Array.isArray(ticketsRes.data) ? ticketsRes.data : [])
          .filter(t => String(t.category || '').toLowerCase().includes('maintenance') ||
                       String(t.workflowStage || '').toLowerCase().includes('maintenance'));

        setScheduledMaintenances(maintenanceTickets.map(ticket => ({
          id: ticket.id,
          assetId: ticket.assetId || ticket.relatedAssetId,
          assetName: ticket.assetName || ticket.title,
          type: String(t.category || '').toLowerCase().includes('preventive') ? 'preventive' : 'corrective',
          priority: ticket.priority || 'medium',
          scheduledDate: ticket.scheduledDate || ticket.dueDate,
          technician: ticket.assignedTo || ticket.technician,
          status: ticket.status,
        })));
      } catch (error) {
        console.error('Failed to fetch maintenance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const maintenanceAssets = useMemo(() => {
    return allAssets.filter(a =>
      String(a.status || '').toLowerCase().includes('maintenance') ||
      a.nextMaintenanceDate
    );
  }, [allAssets]);

  const handleToggleAsset = (assetId) => {
    setSelectedAssetIds(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleOpenModal = (assetId = null) => {
    if (assetId) {
      setSelectedAssetIds([assetId]);
    }
    setScheduleForm({
      assetId: assetId || selectedAssetIds[0] || '',
      type: 'preventive',
      priority: 'medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedHours: '2',
      technician: '',
      notes: '',
    });
    setShowScheduleModal(true);
  };

  const handleScheduleMaintenance = async () => {
    const assetsToSchedule = selectedAssetIds.length > 0 ? selectedAssetIds : (scheduleForm.assetId ? [scheduleForm.assetId] : []);
    
    if (assetsToSchedule.length === 0 || !scheduleForm.scheduledDate) {
      setFeedback({ type: 'error', message: t('selectAssetFirst', 'يرجى اختيار أصل أولاً') });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      for (const assetId of assetsToSchedule) {
        const asset = allAssets.find(a => a.id === assetId);
        await ticketsAPI.create({
          title: `${t('maintenance', 'Maintenance')}: ${asset?.name || assetId}`,
          category: `maintenance-${scheduleForm.type}`,
          priority: scheduleForm.priority,
          relatedAssetId: assetId,
          dueDate: scheduleForm.scheduledDate,
          estimatedHours: parseInt(scheduleForm.estimatedHours) || 2,
          assignedTo: scheduleForm.technician,
          description: scheduleForm.notes,
          workflowStage: 'maintenance',
        });
      }

      setFeedback({ type: 'success', message: t('scheduledSuccess', 'تم جدولة الصيانة بنجاح') });
      setSelectedAssetIds([]);
      setShowScheduleModal(false);

      const [, ticketsRes] = await Promise.all([
        assetsAPI.getAll().catch(() => ({ data: [] })),
        ticketsAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const maintenanceTickets = (Array.isArray(ticketsRes.data) ? ticketsRes.data : [])
        .filter(t => String(t.category || '').toLowerCase().includes('maintenance'));

      setScheduledMaintenances(maintenanceTickets.map(ticket => ({
        id: ticket.id,
        assetId: ticket.assetId || ticket.relatedAssetId,
        assetName: ticket.assetName || ticket.title,
        type: String(t.category || '').toLowerCase().includes('preventive') ? 'preventive' : 'corrective',
        priority: ticket.priority || 'medium',
        scheduledDate: ticket.scheduledDate || ticket.dueDate,
        technician: ticket.assignedTo || ticket.technician,
        status: ticket.status,
      })));
    } catch (error) {
      console.error('Failed to schedule maintenance:', error);
      setFeedback({ type: 'error', message: t('scheduleFailed', 'فشل في جدولة الصيانة') });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => ({
    totalScheduled: scheduledMaintenances.length,
    preventive: scheduledMaintenances.filter(m => m.type === 'preventive').length,
    corrective: scheduledMaintenances.filter(m => m.type === 'corrective').length,
    overdue: scheduledMaintenances.filter(m => m.scheduledDate && new Date(m.scheduledDate) < new Date()).length,
  }), [scheduledMaintenances]);

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors?.[priority?.toLowerCase()] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('maintenanceScheduling', 'جدولة الصيانة')}
                </h1>
                <p className="text-muted-foreground">
                  {t('maintenanceSchedulingDesc', 'إدارة جدولة الصيانة الوقائية والتصحيحية للأصول')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={() => setShowScheduleModal(true)}
                >
                  {t('newSchedule', 'جدولة جديدة')}
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => setShowScheduleModal(true)}
                >
                  {t('scheduleMaintenance', 'جدولة صيانة')}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Calendar" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalScheduled}</p>
                  <p className="text-sm text-muted-foreground">{t('totalScheduled', 'المجموع')}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="ShieldCheck" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.preventive}</p>
                  <p className="text-sm text-muted-foreground">{t('preventive', 'وقائية')}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Wrench" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.corrective}</p>
                  <p className="text-sm text-muted-foreground">{t('corrective', 'تصحيحية')}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-error" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">{t('overdue', 'متأخرة')}</p>
                </div>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`mb-6 p-4 rounded-lg border ${
              feedback.type === 'success'
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-error/10 border-error/30 text-error'
            }`}>
              <div className="flex items-center gap-2">
                <Icon name={feedback.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={20} />
                <span>{feedback.message}</span>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('assetsForMaintenance', 'الأصول المعرضة للصيانة')}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal()}
                disabled={selectedAssetIds.length === 0}
              >
                {t('scheduleSelected', 'جدولة المحدد')} ({selectedAssetIds.length})
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader" size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : maintenanceAssets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maintenanceAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleToggleAsset(asset.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAssetIds.includes(asset.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedAssetIds.includes(asset.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedAssetIds.includes(asset.id) && (
                          <Icon name="Check" size={12} className="text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.assetTag}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            String(asset.status || '').toLowerCase().includes('maintenance')
                              ? 'bg-warning/10 text-warning'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {asset.status || t('maintenance', 'صيانة')}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Plus"
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(asset.id); }}
                          >
                            {t('add', 'إضافة')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                <p>{t('noAssetsForMaintenance', 'لا توجد أصول في وضع الصيانة')}</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/asset-registry-and-tracking')}
                  className="mt-2"
                >
                  {t('browseAssets', 'تصفح سجل الأصول')}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{t('scheduledMaintenances', 'الصيانات المجدولة')}</h2>
            {scheduledMaintenances.length > 0 ? (
              <div className="space-y-3">
                {scheduledMaintenances.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon name="Wrench" size={18} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.assetName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.type === 'preventive' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {item.type === 'preventive' ? t('preventive', 'وقائية') : t('corrective', 'تصحيحية')}
                      </span>
                      <Button variant="ghost" size="sm" iconName="MoreVertical" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noScheduledMaintenances', 'لا توجد صيانات مجدولة')}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">{t('scheduleMaintenance', 'جدولة صيانة جديدة')}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-muted rounded">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('asset', 'الأصل')}</label>
                <select
                  value={scheduleForm.assetId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, assetId: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                >
                  <option value="">{t('selectAsset', 'اختر أصل...')}</option>
                  {(selectedAssetIds.length > 0 ? selectedAssetIds : allAssets.map(a => a.id)).map(id => {
                    const asset = allAssets.find(a => a.id === id);
                    return asset ? (
                      <option key={id} value={id}>{asset.name} ({asset.assetTag})</option>
                    ) : null;
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('maintenanceType', 'نوع الصيانة')}</label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  >
                    <option value="preventive">{t('preventive', 'وقائية')}</option>
                    <option value="corrective">{t('corrective', 'تصحيحية')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('priority', 'الأولوية')}</label>
                  <select
                    value={scheduleForm.priority}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, priority: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  >
                    <option value="low">{t('low', 'منخفضة')}</option>
                    <option value="medium">{t('medium', 'متوسطة')}</option>
                    <option value="high">{t('high', 'عالية')}</option>
                    <option value="critical">{t('critical', 'حرجة')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('scheduledDate', 'التاريخ')}</label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('estimatedHours', 'المدة (ساعات)')}</label>
                  <input
                    type="number"
                    min="1"
                    value={scheduleForm.estimatedHours}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, estimatedHours: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('technician', 'الفني')}</label>
                <input
                  type="text"
                  value={scheduleForm.technician}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, technician: e.target.value })}
                  placeholder={t('technicianName', 'اسم الفني')}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('notes', 'ملاحظات')}</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder={t('maintenanceNotes', 'ملاحظات إضافية عن الصيانة')}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                {t('cancel', 'إلغاء')}
              </Button>
              <Button
                variant="default"
                onClick={handleScheduleMaintenance}
                disabled={submitting || (!scheduleForm.assetId && selectedAssetIds.length === 0) || !scheduleForm.scheduledDate}
              >
                {submitting ? t('scheduling', 'جارِ الجدولة...') : t('schedule', 'جدولة')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceScheduling;