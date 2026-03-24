import assetService from '../../services/assetService';

const AssetRegistryAndTracking = () => {
    const [userRole] = useState('admin');
    const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [filters, setFilters] = useState({});
    const [showDetailPanel, setShowDetailPanel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await assetService.getAll();
            const mappedAssets = data.map(asset => ({
                id: asset.id,
                assetId: asset.assetTag,
                description: asset.name,
                category: asset.assetType,
                currentOwner: asset.owner ? `${asset.owner.username}` : 'Unassigned',
                location: asset.location,
                status: (asset.status || 'Active').toLowerCase(),
                value: asset.costAmount ? `$${asset.costAmount.toLocaleString()}` : '$0.00',
                costAmount: asset.costAmount,
                manufacturer: asset.manufacturer,
                model: asset.model,
                serialNumber: asset.serialNumber,
                purchaseDate: asset.purchaseDate,
                icon: asset.assetType === 'Hardware' ? 'Laptop' : asset.assetType === 'Software' ? 'FileText' : 'Package',
                barcode: `BC-${asset.assetTag}`
            }));
            setAssets(mappedAssets);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    fetchData();
  }, []);

  const [filteredAssets, setFilteredAssets] = useState([]);

  const stats = {
    total: assets?.length?.toString(),
    active: assets?.filter((a) => a?.status === 'active')?.length?.toString(),
    maintenance: assets?.filter((a) => a?.status === 'maintenance')?.length?.toString(),
    maintenanceDue: assets?.filter((a) => a?.maintenanceDaysUntil < 7 && a?.maintenanceDaysUntil >= 0)?.length?.toString(),
    totalValue: `$${assets?.reduce((sum, a) => sum + parseFloat(a?.value?.replace(/[^0-9.-]+/g, '') || 0), 0)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  };

  useEffect(() => {
    let filtered = [...assets];

    if (filters?.searchQuery) {
      const query = filters?.searchQuery?.toLowerCase();
      filtered = filtered?.filter((asset) =>
      asset?.assetId?.toLowerCase()?.includes(query) ||
      asset?.description?.toLowerCase()?.includes(query) ||
      asset?.serialNumber?.toLowerCase()?.includes(query) ||
      asset?.barcode?.toLowerCase()?.includes(query)
      );
    }

    if (filters?.category) {
      filtered = filtered?.filter((asset) => asset?.category === filters?.category);
    }

    if (filters?.location) {
      filtered = filtered?.filter((asset) => asset?.location === filters?.location);
    }

    if (filters?.status && filters?.status?.length > 0) {
      filtered = filtered?.filter((asset) => filters?.status?.includes(asset?.status));
    }

    if (filters?.valueRange?.min) {
      filtered = filtered?.filter((asset) =>
      parseFloat(asset?.value?.replace(/[^0-9.-]+/g, '')) >= parseFloat(filters?.valueRange?.min)
      );
    }

    if (filters?.valueRange?.max) {
      filtered = filtered?.filter((asset) =>
      parseFloat(asset?.value?.replace(/[^0-9.-]+/g, '')) <= parseFloat(filters?.valueRange?.max)
      );
    }

    if (filters?.maintenanceStatus && filters?.maintenanceStatus?.length > 0) {
      filtered = filtered?.filter((asset) => {
        if (filters?.maintenanceStatus?.includes('due') && asset?.maintenanceDaysUntil >= 0 && asset?.maintenanceDaysUntil <= 7) return true;
        if (filters?.maintenanceStatus?.includes('overdue') && asset?.maintenanceDaysUntil < 0) return true;
        if (filters?.maintenanceStatus?.includes('scheduled') && asset?.maintenanceDaysUntil > 7) return true;
        return false;
      });
    }

    setFilteredAssets(filtered);
  }, [filters, assets]);

  const handleSelectAsset = (assetId, checked) => {
    setSelectedAssets((prev) =>
    checked ? [...prev, assetId] : prev?.filter((id) => id !== assetId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedAssets(checked ? filteredAssets?.map((a) => a?.id) : []);
  };

    const handleAssetClick = async (asset) => {
        try {
            setLoading(true);
            const fullAsset = await assetService.getById(asset.id);
            setSelectedAsset({
                ...asset,
                history: fullAsset.history || [],
                relationships: fullAsset.relationships || []
            });
            setShowDetailPanel(true);
        } catch (error) {
            console.error('Error fetching asset details:', error);
        } finally {
            setLoading(false);
        }
    };

  const handleBulkAction = (action) => {
    console.log(`Performing bulk action: ${action} on ${selectedAssets?.length} assets`);
    // Implement bulk action logic here
  };

  const handleBarcodeScan = (barcode) => {
    const asset = assets?.find((a) => a?.barcode === barcode || a?.serialNumber === barcode);
    if (asset) {
      setSelectedAsset(asset);
      setShowDetailPanel(true);
    } else {
      alert(`No asset found with barcode/serial: ${barcode}`);
    }
  };

  const handleKeyboardShortcut = (e) => {
    if (e?.ctrlKey || e?.metaKey) {
      if (e?.key === 'n') {
        e?.preventDefault();
        console.log('Create new asset');
      } else if (e?.key === 't') {
        e?.preventDefault();
        console.log('Transfer asset');
      } else if (e?.key === 'f') {
        e?.preventDefault();
        document.querySelector('input[type="search"]')?.focus();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  return (
    <>
      <Helmet>
        <title>Asset Registry and Tracking - WorkflowHub</title>
        <meta name="description" content="Comprehensive asset management interface for tracking, custody operations, and maintenance scheduling across your organization" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-16">
          <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Asset Registry</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Track and manage organizational assets with comprehensive custody chain
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  iconName="Scan"
                  iconPosition="left"
                  onClick={() => setShowScanner(true)}
                  className="text-sm sm:text-base">

                  Scan Barcode
                </Button>
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  className="text-sm sm:text-base">

                  Export
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  className="text-sm sm:text-base">

                  New Asset
                </Button>
              </div>
            </div>
          </div>

          <QuickStatsBar stats={stats} />

          <BulkOperationsToolbar
            selectedCount={selectedAssets?.length}
            onClearSelection={() => setSelectedAssets([])}
            onBulkAction={handleBulkAction} />


          <div className="flex h-[calc(100vh-16rem)]">
            <AssetFilterPanel
              onFilterChange={setFilters}
              isCollapsed={isFilterCollapsed}
              onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)} />


            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-hidden">
                <AssetGridView
                  assets={filteredAssets}
                  selectedAssets={selectedAssets}
                  onSelectAsset={handleSelectAsset}
                  onSelectAll={handleSelectAll}
                  onAssetClick={handleAssetClick}
                  userRole={userRole} />

              </div>
            </div>

            {showDetailPanel &&
            <AssetDetailPanel
              asset={selectedAsset}
              onClose={() => {
                setShowDetailPanel(false);
                setSelectedAsset(null);
              }}
              userRole={userRole} />

            }
          </div>
        </main>

        <BarcodeScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleBarcodeScan} />


        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-elevation-3 p-3 hidden lg:block">
          <p className="text-xs font-medium mb-2">Keyboard Shortcuts</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+N</kbd>
              <span>New Asset</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+T</kbd>
              <span>Transfer</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+F</kbd>
              <span>Search</span>
            </div>
          </div>
        </div>
      </div>
    </>);

};

export default AssetRegistryAndTracking;