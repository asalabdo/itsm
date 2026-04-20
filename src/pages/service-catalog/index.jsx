import { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import serviceRequestService from '../../services/serviceRequestService';
import { manageEngineAPI } from '../../services/api';
import DynamicFormRenderer from '../../components/ui/DynamicFormRenderer';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import {
  CATALOG_CATEGORY_LABELS_AR,
  CATALOG_EXTERNAL_PRIORITY_LABELS_AR,
  CATALOG_EXTERNAL_STATUS_LABELS_AR,
  CATALOG_SERVICE_DESCRIPTIONS_AR,
  CATALOG_SERVICE_NAMES_AR,
  getLocalizedField,
} from '../../services/catalogLocalization';

const ServiceCatalogHub = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [catalog, setCatalog] = useState([]);
  const [externalCatalog, setExternalCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [externalSourceFilter, setExternalSourceFilter] = useState('');
  const [externalTypeFilter, setExternalTypeFilter] = useState('');
  const [externalStatusFilter, setExternalStatusFilter] = useState('');

  const isHiddenCatalogItem = (item) => {
    const name = String(item?.name || '').trim().toLowerCase();
    const category = String(item?.category || '').trim().toLowerCase();
    return category === 'hardware' || name === 'macbook pro m3';
  };

  const localizeText = (value, map = {}) => {
    const raw = String(value || '').trim();
    return getLocalizedField({ value: raw, valueAr: map[raw.toLowerCase()] }, 'value', map, language) || raw;
  };

  const localizeName = (item) => getLocalizedField(item, 'name', CATALOG_SERVICE_NAMES_AR, language);

  const localizeDescription = (item) => getLocalizedField(item, 'description', CATALOG_SERVICE_DESCRIPTIONS_AR, language);

  useEffect(() => {
    fetchCatalog();
    // Refetch when ManageEngine catalog filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSourceFilter, externalTypeFilter, externalStatusFilter, searchQuery]);

  const fetchCatalog = async () => {
    try {
      const [internalCatalog, externalResponse] = await Promise.all([
        serviceRequestService.getCatalog(),
        manageEngineAPI.getCatalog({
          source: externalSourceFilter || undefined,
          type: externalTypeFilter || undefined,
          status: externalStatusFilter || undefined,
          search: searchQuery || undefined,
        }).catch(() => ({ data: [] }))
      ]);

      setCatalog(internalCatalog);
      setExternalCatalog(Array.isArray(externalResponse?.data) ? externalResponse.data : []);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const localizedSelectedName = localizeName(selectedItem);

      if (selectedItem?.isExternal) {
        setMessage({ type: 'success', text: t('externalServiceLoaded', 'External service details loaded successfully.') });
        setSelectedItem(null);
        setFormData({});
        return;
      }

      await serviceRequestService.submitRequest({
        title: `${t('requestFor', 'Request for')} ${localizedSelectedName}`,
        description: `${t('userRequested', 'User requested')} ${localizedSelectedName} ${t('viaServiceCatalog', 'via Service Catalog.')}`,
        catalogItemId: selectedItem.id,
        customDataJson: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: t('requestSubmittedSuccess', 'Request submitted successfully.') });
      setSelectedItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({ type: 'error', text: t('failedToSubmitRequest', 'Failed to submit request.') });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const mergedCatalog = [
      ...catalog,
      ...externalCatalog.map((item) => ({
        id: `${item.source}-${item.externalId}`,
        name: item.name,
        description: item.description,
        category: item.category || item.source,
        icon: item.source === 'OpManager' ? 'Radar' : 'Layers3',
        defaultSlaHours: item.itemType === 'alert' ? 1 : 0,
        requiresApproval: false,
        formConfigJson: '[]',
        sourceSystem: item.source,
        sourceType: item.itemType,
        sourceStatus: item.status,
        sourcePriority: item.priority,
        owner: item.owner,
        externalUrl: item.externalUrl,
        metadata: item.metadata || {},
        isExternal: true,
      }))
    ];

    const visibleCatalog = mergedCatalog.filter((item) => !isHiddenCatalogItem(item));
    if (!query) return visibleCatalog;
    return visibleCatalog.filter((item) => {
      const name = localizeName(item);
      const desc = localizeDescription(item);
      const cat = localizeText(item?.category, CATALOG_CATEGORY_LABELS_AR);
      return [name, desc, cat].join(' ').toLowerCase().includes(query);
    });
  }, [catalog, externalCatalog, searchQuery, language]);
  const filteredCategories = [...new Set(filteredCatalog.map(item => {
    return localizeText(item.category, CATALOG_CATEGORY_LABELS_AR);
  }))];
  const externalSummary = useMemo(() => ({
    total: filteredCatalog.filter((item) => item.isExternal).length,
    serviceDesk: filteredCatalog.filter((item) => item.isExternal && item.sourceSystem === 'ServiceDesk').length,
    opManager: filteredCatalog.filter((item) => item.isExternal && item.sourceSystem === 'OpManager').length,
  }), [filteredCatalog]);

  return (
    <>
      <Helmet>
        <title>{t('serviceCatalogTitle', 'Service Catalog')} - ITSM</title>
      </Helmet>
      <Header />
      <BreadcrumbTrail />
      <main className="pt-16 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('serviceCatalogTitle', 'Service Catalog')}</h1>
              <p className="text-muted-foreground mt-1">{t('serviceCatalogSubtitle', 'Browse and request IT services and equipment.')}</p>
            </div>
            <Input
              type="search"
              placeholder={t('searchServicesPlaceholder', 'Search services, categories, or descriptions...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="max-w-xl"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              <select
                value={externalSourceFilter}
                onChange={(e) => setExternalSourceFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t('allExternalSources', 'All external sources')}</option>
                <option value="ServiceDesk">{t('serviceDesk', 'ServiceDesk')}</option>
                <option value="OpManager">{t('opManager', 'OpManager')}</option>
              </select>
              <select
                value={externalTypeFilter}
                onChange={(e) => setExternalTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t('allExternalTypes', 'All external types')}</option>
                <option value="catalog">{t('catalog', 'Catalog')}</option>
                <option value="service">{t('services', 'Services')}</option>
              </select>
              <select
                value={externalStatusFilter}
                onChange={(e) => setExternalStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t('allStatuses', 'All statuses')}</option>
                <option value="active">{t('active', 'Active')}</option>
                <option value="enabled">{t('enabled', 'Enabled')}</option>
                <option value="available">{t('available', 'Available')}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {t('externalItems', 'External items')}: {externalSummary.total}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              ServiceDesk: {externalSummary.serviceDesk}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              OpManager: {externalSummary.opManager}
            </span>
          </div>

          {message && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-700'
            }`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              {t('loadingCatalog', 'Loading catalog...')}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Icon name="PackageSearch" size={36} className="mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold mt-4">{t('noServicesFound', 'No services found')}</h2>
              <p className="text-muted-foreground mt-2">{t('tryDifferentKeyword', 'Try a different keyword or clear the search to see the full catalog.')}</p>
            </div>
          ) : (
              filteredCategories.map(category => (
                <div key={category} className="space-y-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.filter(item => {
                    const cat = localizeText(item.category, CATALOG_CATEGORY_LABELS_AR);
                    return cat === category;
                  }).map(item => {
                    const localizedName = localizeName(item);
                    const localizedDesc = localizeDescription(item);
                    return (
                    <div 
                      key={item.id}
                      className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors">
                          <Icon name={item.icon || 'Package'} size={24} className="text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {item.isExternal
                            ? `${item.sourceSystem} ${item.sourceType}`
                            : `${t('sla', 'SLA')}: ${item.defaultSlaHours}h`}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{localizedName}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{localizedDesc}</p>
                      {item.isExternal && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {item.sourceStatus && <span className="rounded-full bg-muted px-2 py-1">{localizeText(item.sourceStatus, CATALOG_EXTERNAL_STATUS_LABELS_AR)}</span>}
                          {item.sourcePriority && <span className="rounded-full bg-muted px-2 py-1">{localizeText(item.sourcePriority, CATALOG_EXTERNAL_PRIORITY_LABELS_AR)}</span>}
                        </div>
                      )}
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="mt-6 w-full py-2.5 bg-muted text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
                      >
                        <Icon name="Plus" size={18} />
                        {item.isExternal ? t('viewDetails', 'View Details') : t('requestNow', 'Request Now')}
                      </button>
                    </div>
                  )})}
                </div>
              </div>
            ))
          )}

          {/* Request Modal */}
          {selectedItem && (() => {
            const localizedName = localizeName(selectedItem);
            return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{t('newRequestTitle', 'New {serviceName} Request').replace('{serviceName}', localizedName)}</h3>
                  <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleRequest} className="p-6 space-y-6">
                  <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-4">
                    <Icon name="Info" size={20} className="text-blue-600 mt-1" />
                    <p className="text-sm text-blue-800 flex-1">
                      {selectedItem.isExternal
                        ? `${t('externalSource', 'External source')}: ${selectedItem.sourceSystem}. ${selectedItem.sourceStatus || t('sourceDataLoaded', 'Live source data loaded from ManageEngine.')}`
                        : `${t('youAreRequesting', 'You are requesting')} ${localizedName}. ${selectedItem.requiresApproval ? t('requiresManagerApproval', 'This request requires manager approval.') : t('willBeFulfilledImmediately', 'This request will be fulfilled immediately upon submission.')}`}
                    </p>
                  </div>

                  {/* Dynamic Form Fields */}
                  {selectedItem.isExternal ? (
                    <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('sourceSystem', 'Source System')}</span>
                        <span className="font-medium text-foreground">{selectedItem.sourceSystem}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('itemType', 'Item Type')}</span>
                        <span className="font-medium text-foreground">{selectedItem.sourceType}</span>
                      </div>
                      {selectedItem.owner && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('owner', 'Owner')}</span>
                          <span className="font-medium text-foreground">{selectedItem.owner}</span>
                        </div>
                      )}
                      {Object.keys(selectedItem.metadata || {}).length > 0 && (
                        <div className="pt-2 border-t border-border space-y-2">
                          {Object.entries(selectedItem.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-sm gap-3">
                              <span className="text-muted-foreground capitalize">{key}</span>
                              <span className="font-medium text-foreground text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedItem.externalUrl && (
                        <a
                          href={selectedItem.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Icon name="ExternalLink" size={16} />
                          {t('openInSourceSystem', 'Open in source system')}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <DynamicFormRenderer 
                        config={JSON.parse(selectedItem.formConfigJson || '[]')}
                        value={formData}
                        onChange={setFormData}
                      />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 py-3 font-bold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {selectedItem.isExternal
                        ? t('close', 'Close')
                        : submitting ? t('submitting', 'Submitting...') : t('submitRequest', 'Submit Request')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            );
          })()}
        </div>
      </main>
    </>
  );
};

export default ServiceCatalogHub;


