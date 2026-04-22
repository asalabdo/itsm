import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { manageEngineAPI } from '../../services/api';
import { normalizeManageEngineList } from '../../services/manageEngineDataUtils';
import QuickStatsBar from './components/QuickStatsBar';
import BulkOperationsToolbar from './components/BulkOperationsToolbar';
import AssetFilterPanel from './components/AssetFilterPanel';
import AssetGridView from './components/AssetGridView';
import AssetDetailPanel from './components/AssetDetailPanel';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import ManageEngineAssetOverview from './components/ManageEngineAssetOverview';
import assetService from '../../services/assetService';
import {
  buildAssetFilterOptions,
  enrichAssetsWithManageEngine,
  filterAssets,
  mergeManageEngineItemIntoAsset,
  normalizeAssetStatus,
} from './utils/assetManageEngineUtils.mjs';

const AssetRegistryAndTracking = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);
  const [userRole] = useState('admin');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [filters, setFilters] = useState({});
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [manageEngineLoading, setManageEngineLoading] = useState(true);
  const [syncingAssetId, setSyncingAssetId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [manageEngineSyncStatus, setManageEngineSyncStatus] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setManageEngineLoading(true);

      const [assetData, catalogRes, operationsRes, syncRes] = await Promise.all([
        assetService.getAll(),
        manageEngineAPI.getCatalog({ source: 'OpManager' }).catch(() => ({ data: [] })),
        manageEngineAPI.getOperations().catch(() => ({ data: [] })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      const mappedAssets = assetData.map((asset) => ({
        id: asset.id,
        assetTag: asset.assetTag,
        assetId: asset.assetTag,
        name: asset.name,
        description: asset.name,
        category: asset.assetType,
        currentOwner: asset.owner ? `${asset.owner.username}` : t('unassigned', 'Unassigned'),
        ownerId: asset.owner?.id || asset.ownerId || null,
        ownershipType: asset.ownershipType || (asset.owner || asset.ownerId ? 'assigned' : 'unassigned'),
        location: asset.location,
        status: normalizeAssetStatus(asset.status),
        value: asset.costAmount ? `$${asset.costAmount.toLocaleString()}` : '$0.00',
        costAmount: asset.costAmount,
        manufacturer: asset.manufacturer,
        model: asset.model,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        decommissionDate: asset.decommissionDate,
        icon: asset.assetType === 'Hardware' ? 'Laptop' : asset.assetType === 'Software' ? 'FileText' : 'Package',
        barcode: `BC-${asset.assetTag}`,
      }));

      // ManageEngine enrichment must only attach by exact asset identity metadata.
      // Display fields such as manufacturer/model/name are intentionally ignored.
      const monitoredItems = normalizeManageEngineList(catalogRes);
      const operationItems = normalizeManageEngineList(operationsRes);
      const enrichedAssets = enrichAssetsWithManageEngine(mappedAssets, monitoredItems, operationItems);

      setAssets(enrichedAssets);
      setManageEngineSyncStatus(syncRes?.data || null);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setManageEngineLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const stats = useMemo(() => ({
    total: assets.length.toString(),
    active: assets.filter((asset) => asset?.status === 'active').length.toString(),
    maintenance: assets.filter((asset) => asset?.status === 'maintenance').length.toString(),
    maintenanceDue: assets.filter((asset) => asset?.maintenanceDaysUntil < 7 && asset?.maintenanceDaysUntil >= 0).length.toString(),
    totalValue: `$${assets.reduce((sum, asset) => sum + parseFloat(asset?.value?.replace(/[^0-9.-]+/g, '') || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }), [assets]);

  const manageEngineOverview = useMemo(() => ({
    monitoredAssets: assets.filter((asset) => asset?.manageEngine?.isMonitored).length,
    assetsWithAlerts: assets.filter((asset) => (asset?.manageEngine?.alertCount || 0) > 0).length,
    assetsWithRequests: assets.filter((asset) => (asset?.manageEngine?.requestCount || 0) > 0).length,
    totalAlerts: assets.reduce((sum, asset) => sum + (asset?.manageEngine?.alertCount || 0), 0),
  }), [assets]);

  const filterOptions = useMemo(() => buildAssetFilterOptions(assets), [assets]);

  useEffect(() => {
    setFilteredAssets(filterAssets(assets, filters));
  }, [filters, assets]);

  const handleSelectAsset = (assetId, checked) => {
    setSelectedAssets((prev) => (
      checked ? [...prev, assetId] : prev.filter((id) => id !== assetId)
    ));
  };

  const handleSelectAll = (checked) => {
    setSelectedAssets(checked ? filteredAssets.map((asset) => asset?.id) : []);
  };

  const handleAssetClick = async (asset) => {
    try {
      const fullAsset = await assetService.getById(asset.id);
      setSelectedAsset({
        ...asset,
        history: fullAsset.history || [],
        relationships: fullAsset.relationships || [],
      });
      setShowDetailPanel(true);
    } catch (error) {
      console.error('Error fetching asset details:', error);
    }
  };

  const handleBulkAction = (action) => {
    if (action === 'schedule-maintenance') {
      navigate('/maintenance-scheduling');
      return;
    }

    if (action === 'export') {
      handleExport();
      return;
    }

    if (action === 'create-ticket') {
      navigate('/ticket-creation');
      return;
    }

    setFeedback({
      type: 'info',
      message: `${t('executed', 'Executed')} ${action} ${t('on', 'on')} ${selectedAssets.length} ${t('assets', 'assets')}.`,
    });
  };

  const handleSyncAssetToManageEngine = useCallback(async (asset) => {
    if (!asset?.id) return;

    setSyncingAssetId(asset.id);
    try {
      const response = await manageEngineAPI.syncAsset(asset.id);
      const item = response?.data?.item || null;
      const message = response?.data?.message || t('assetSyncedToManageEngine', 'Asset sync request sent to ManageEngine.');

      setAssets((prev) => prev.map((candidate) => (
        candidate.id === asset.id ? mergeManageEngineItemIntoAsset(candidate, item) : candidate
      )));
      setFilteredAssets((prev) => prev.map((candidate) => (
        candidate.id === asset.id ? mergeManageEngineItemIntoAsset(candidate, item) : candidate
      )));
      setSelectedAsset((prev) => (
        prev?.id === asset.id ? mergeManageEngineItemIntoAsset(prev, item) : prev
      ));
      setFeedback({ type: 'success', message });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.response?.data?.error || t('assetSyncFailed', 'Failed to sync asset to ManageEngine.'),
      });
    } finally {
      setSyncingAssetId(null);
    }
  }, [t]);

  const handleExport = () => {
    const rows = filteredAssets.map((asset) => ([
      asset.assetId,
      asset.description,
      asset.category,
      asset.currentOwner,
      asset.location,
      asset.status,
    ].join(',')));
    const csv = ['Asset ID,Description,Category,Owner,Location,Status', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asset-registry.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBarcodeScan = (barcode) => {
    const asset = assets.find((item) => item?.barcode === barcode || item?.serialNumber === barcode);
    if (asset) {
      setFeedback({
        type: 'success',
        message: `${t('found', 'Found')} ${asset.description} ${t('from', 'from')} ${t('scan', 'scan')} ${barcode}.`,
      });
      setSelectedAsset(asset);
      setShowDetailPanel(true);
    } else {
      setFeedback({
        type: 'error',
        message: `${t('noAssetFound', 'No asset found with barcode/serial')}: ${barcode}`,
      });
    }
  };

  const handleKeyboardShortcut = useCallback((event) => {
    if (event?.ctrlKey || event?.metaKey) {
      if (event?.key === 'n') {
        event.preventDefault();
        navigate('/manage/assets');
      } else if (event?.key === 't') {
        event.preventDefault();
        navigate('/asset-lifecycle-management');
      } else if (event?.key === 'f') {
        event.preventDefault();
        document.querySelector('input[type="search"]')?.focus();
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  return (
    <>
      <Helmet>
        <title>{t('assetRegistry', 'Asset Registry')} - WorkflowHub</title>
        <meta name="description" content={t('assetRegistryDescription', 'Comprehensive interface for managing assets, tracking, custody operations, and maintenance scheduling across the organization')} />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <BreadcrumbTrail />

        <main className="pt-16">
          <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t('assetRegistry', 'Asset Registry')}</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {t('trackManageAssets', 'Track and manage organizational assets with comprehensive custody chain')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  iconName="Scan"
                  iconPosition="left"
                  onClick={() => setShowScanner(true)}
                  className="text-sm sm:text-base"
                >
                  {t('scanBarcode', 'Scan Barcode')}
                </Button>
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={handleExport}
                  className="text-sm sm:text-base"
                >
                  {t('export', 'Export')}
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => navigate('/manage/assets')}
                  className="text-sm sm:text-base"
                >
                  {t('newAsset', 'New Asset')}
                </Button>
              </div>
            </div>
          </div>

          <QuickStatsBar stats={stats} />
          <ManageEngineAssetOverview
            overview={manageEngineOverview}
            syncStatus={manageEngineSyncStatus}
            loading={manageEngineLoading}
            onRefresh={fetchData}
          />

          {feedback && (
            <div className={`mx-4 sm:mx-6 lg:mx-8 mb-4 rounded-lg border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                : feedback.type === 'error'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                  : 'border-border bg-muted text-muted-foreground'
            }`}>
              {feedback.message}
            </div>
          )}

          <BulkOperationsToolbar
            selectedCount={selectedAssets.length}
            onClearSelection={() => setSelectedAssets([])}
            onBulkAction={handleBulkAction}
          />

          <div className="flex h-[calc(100vh-20rem)]">
            <AssetFilterPanel
              categoryOptions={filterOptions.categoryOptions}
              locationOptions={filterOptions.locationOptions}
              ownershipOptions={filterOptions.ownershipOptions}
              onFilterChange={setFilters}
              isCollapsed={isFilterCollapsed}
              onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
            />

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-hidden">
                <AssetGridView
                  assets={filteredAssets}
                  selectedAssets={selectedAssets}
                  onSelectAsset={handleSelectAsset}
                  onSelectAll={handleSelectAll}
                  onAssetClick={handleAssetClick}
                  userRole={userRole}
                />
              </div>
            </div>

            {showDetailPanel && (
              <AssetDetailPanel
                asset={selectedAsset}
                syncStatus={manageEngineSyncStatus}
                onSyncAsset={handleSyncAssetToManageEngine}
                isSyncingAsset={syncingAssetId === selectedAsset?.id}
                onClose={() => {
                  setShowDetailPanel(false);
                  setSelectedAsset(null);
                }}
                userRole={userRole}
              />
            )}
          </div>
        </main>

        <BarcodeScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleBarcodeScan}
        />

        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-elevation-3 p-3 hidden lg:block">
          <p className="text-xs font-medium mb-2">{t('keyboardShortcuts', 'Keyboard Shortcuts')}</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+N</kbd>
              <span>{t('newAsset', 'New Asset')}</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+T</kbd>
              <span>{t('transfer', 'Transfer')}</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+F</kbd>
              <span>{t('search', 'Search')}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetRegistryAndTracking;
