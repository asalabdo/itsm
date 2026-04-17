import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { assetsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const emptyForm = {
  assetTag: '',
  name: '',
  assetType: 'Hardware',
  serialNumber: '',
  model: '',
  manufacturer: '',
  costAmount: '',
  purchaseDate: '',
  ownerId: '',
  location: '',
  description: '',
  status: 'Active',
  decommissionDate: ''
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} ريال`;
};

const mapAsset = (asset) => ({
  id: asset.id,
  assetTag: asset.assetTag,
  name: asset.name,
  assetType: asset.assetType,
  serialNumber: asset.serialNumber,
  model: asset.model || '',
  manufacturer: asset.manufacturer || '',
  costAmount: asset.costAmount ?? 0,
  purchaseDate: asset.purchaseDate || '',
  ownerId: asset.owner?.id || '',
  ownerName: asset.owner ? `${asset.owner.firstName || ''} ${asset.owner.lastName || ''}`.trim() || asset.owner.username : 'Unassigned',
  location: asset.location || '',
  status: asset.status || 'Active',
  description: asset.description || '',
  relationships: asset.relationships || [],
  history: asset.history || []
});

const AssetField = ({ label, children, hint }) => (
  <label className="block space-y-1">
    <span className="text-sm font-medium text-foreground">{label}</span>
    {children}
    {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

const ManageAssets = () => {
  const navigate = useNavigate();
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await assetsAPI.getAll();
      setAssets((res?.data || []).map(mapAsset));
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const search = query.trim().toLowerCase();
    const matchesSearch = !search
      || [asset.assetTag, asset.name, asset.serialNumber, asset.manufacturer, asset.model, asset.ownerName, asset.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    const matchesStatus = statusFilter === 'all' || String(asset.status).toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || String(asset.assetType).toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: assets.length,
    active: assets.filter((asset) => String(asset.status).toLowerCase() === 'active').length,
    maintenance: assets.filter((asset) => String(asset.status).toLowerCase() === 'maintenance').length,
    value: assets.reduce((sum, asset) => sum + Number(asset.costAmount || 0), 0)
  };

  const openCreate = () => {
    setEditingAssetId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (asset) => {
    setEditingAssetId(asset.id);
    setForm({
      assetTag: asset.assetTag || '',
      name: asset.name || '',
      assetType: asset.assetType || 'Hardware',
      serialNumber: asset.serialNumber || '',
      model: asset.model || '',
      manufacturer: asset.manufacturer || '',
      costAmount: asset.costAmount || '',
      purchaseDate: asset.purchaseDate ? String(asset.purchaseDate).slice(0, 10) : '',
      ownerId: asset.ownerId || '',
      location: asset.location || '',
      description: asset.description || '',
      status: asset.status || 'Active',
      decommissionDate: asset.decommissionDate ? String(asset.decommissionDate).slice(0, 10) : ''
    });
    setFormError('');
    setShowForm(true);
  };

  const openDetails = async (asset) => {
    try {
      const res = await assetsAPI.getById(asset.id);
      setSelectedAsset(mapAsset(res?.data || asset));
    } catch (error) {
      console.error('Failed to load asset details:', error);
      setSelectedAsset(asset);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAssetId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const saveAsset = async (event) => {
    event.preventDefault();
    const validationError = !form.assetTag.trim()
      ? 'Asset tag is required.'
      : !form.name.trim()
        ? 'Asset name is required.'
        : !form.assetType.trim()
          ? 'Asset type is required.'
          : !form.serialNumber.trim()
            ? 'Serial number is required.'
            : !form.location.trim()
              ? 'Location is required.'
              : '';

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError('');
      const payload = {
        assetTag: form.assetTag.trim(),
        name: form.name.trim(),
        assetType: form.assetType.trim(),
        serialNumber: form.serialNumber.trim(),
        model: form.model.trim() || null,
        manufacturer: form.manufacturer.trim() || null,
        costAmount: form.costAmount === '' ? null : Number(form.costAmount),
        purchaseDate: form.purchaseDate || null,
        ownerId: form.ownerId === '' ? null : Number(form.ownerId),
        location: form.location.trim(),
        description: form.description.trim() || null
      };

      if (editingAssetId) {
        await assetsAPI.update(editingAssetId, {
          name: payload.name,
          status: form.status,
          location: payload.location,
          ownerId: payload.ownerId,
          costAmount: payload.costAmount,
          decommissionDate: form.decommissionDate || null
        });
      } else {
        await assetsAPI.create(payload);
      }

      await loadAssets();
      closeForm();
      setSelectedAsset(null);
      } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Failed to save asset.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAsset = async (asset) => {
    const confirmDelete = window.confirm(`Delete asset ${asset.assetTag}?`);
    if (!confirmDelete) return;

    try {
      await assetsAPI.delete(asset.id);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      await loadAssets();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Assets - ITSM Hub</title>
        <meta
          name="description"
          content="Create, edit, and track assets with live backend data."
        />
      </Helmet>
      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <BreadcrumbTrail />

        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t('manageAssets', 'Manage Assets')}</h1>
              <p className={`text-sm md:text-base text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('assetInventoryDescription', 'Live asset inventory, ownership, and lifecycle operations')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" iconName="RefreshCw" onClick={loadAssets} disabled={loading}>
                {t('refresh', 'Refresh')}
              </Button>
              <Button variant="outline" iconName="Package" onClick={() => navigate('/asset-registry-and-tracking')}>
                {t('registry', 'Registry')}
              </Button>
              <Button variant="default" iconName="Plus" iconPosition="left" onClick={openCreate}>
                {t('newAsset', 'New Asset')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
              <p className={`text-xs text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('totalAssets', 'Total Assets')}</p>
              <p className={`text-2xl font-semibold text-foreground mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{stats.total}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
              <p className={`text-xs text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('active', 'Active')}</p>
              <p className={`text-2xl font-semibold text-success mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{stats.active}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
              <p className={`text-xs text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('maintenance', 'Maintenance')}</p>
              <p className={`text-2xl font-semibold text-warning mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{stats.maintenance}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
              <p className={`text-xs text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('totalValue', 'Total Value')}</p>
              <p className={`text-2xl font-semibold text-foreground mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{formatCurrency(stats.value)}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-elevation-1 mb-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <label className="block">
                <span className={`text-xs font-medium text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>Search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by tag, name, owner, serial..."
                  className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ${isRtl ? 'text-right' : 'text-left'}`}
                />
              </label>
              <label className="block">
                <span className={`text-xs font-medium text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </label>
              <label className="block">
                <span className={`text-xs font-medium text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>Type</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  <option value="all">All</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="peripheral">Peripheral</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="p-4 md:p-5 border-b border-border flex items-center justify-between gap-3">
                <div>
                  <h2 className={`text-lg font-semibold text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('assetInventory', 'Asset Inventory')}</h2>
                  <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{filteredAssets.length} {t('matchingAssets', 'matching assets')}</p>
                </div>
              </div>

              {loading ? (
                <div className="p-10 text-center text-muted-foreground">{t('loadingAssets', 'Loading assets...')}</div>
              ) : filteredAssets.length === 0 ? (
                <div className="p-10 text-center">
                  <Icon name="Package" size={40} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-foreground">{t('noAssetsFound', 'No assets found')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('assetFilterTip', 'Try a different filter or create a new asset.')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium text-muted-foreground uppercase`}>{t('asset', 'Asset')}</th>
                        <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium text-muted-foreground uppercase`}>{t('type', 'Type')}</th>
                        <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium text-muted-foreground uppercase`}>{t('owner', 'Owner')}</th>
                        <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium text-muted-foreground uppercase`}>{t('location', 'Location')}</th>
                        <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium text-muted-foreground uppercase`}>{t('status', 'Status')}</th>
                        <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'} text-xs font-medium text-muted-foreground uppercase`}>{t('value', 'Value')}</th>
                        <th className={`px-4 py-3 ${isRtl ? 'text-left' : 'text-right'} text-xs font-medium text-muted-foreground uppercase`}>{t('actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map((asset) => (
                        <tr
                          key={asset.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => openDetails(asset)}
                              className={isRtl ? 'text-right' : 'text-left'}
                            >
                              <div className="font-medium text-foreground">{asset.assetTag}</div>
                              <div className="text-sm text-muted-foreground">{asset.name}</div>
                            </button>
                          </td>
                          <td className={`px-4 py-4 text-sm text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{asset.assetType}</td>
                          <td className={`px-4 py-4 text-sm text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{asset.ownerName}</td>
                          <td className={`px-4 py-4 text-sm text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{asset.location}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              String(asset.status).toLowerCase() === 'active'
                                ? 'bg-success/10 text-success'
                                : String(asset.status).toLowerCase() === 'maintenance'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-muted/10 text-muted-foreground'
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                          <td className={`px-4 py-4 text-sm text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{formatCurrency(asset.costAmount)}</td>
                          <td className="px-4 py-4">
                            <div className={`flex items-center gap-2 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                              <button
                                type="button"
                                onClick={() => openDetails(asset)}
                                className="p-2 rounded-md hover:bg-muted"
                                title="View"
                              >
                                <Icon name="Eye" size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(asset)}
                                className="p-2 rounded-md hover:bg-muted"
                                title="Edit"
                              >
                                <Icon name="Pencil" size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAsset(asset)}
                                className="p-2 rounded-md hover:bg-muted text-error"
                                title="Delete"
                              >
                                <Icon name="Trash2" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-5" dir={isRtl ? 'rtl' : 'ltr'}>
              <h2 className={`text-lg font-semibold text-foreground mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('assetDetails', 'Asset Details')}</h2>
              {selectedAsset ? (
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('assetTag', 'Asset Tag')}</p>
                    <p className={`font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{selectedAsset.assetTag}</p>
                  </div>
                  <div>
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('name', 'Name')}</p>
                    <p className={`font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{selectedAsset.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('owner', 'Owner')}</p>
                    <p className={`font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{selectedAsset.ownerName}</p>
                  </div>
                  <div>
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('serialNumber', 'Serial Number')}</p>
                    <p className={`font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{selectedAsset.serialNumber || t('notAvailable', 'N/A')}</p>
                  </div>
                  <div>
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('historyEntries', 'History Entries')}</p>
                    <p className={`font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{selectedAsset.history.length}</p>
                  </div>
                  <div>
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('relationships', 'Relationships')}</p>
                    <p className={`font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{selectedAsset.relationships.length}</p>
                  </div>
                  <div className="pt-3 border-t border-border flex flex-col gap-2">
                    <Button variant="outline" onClick={() => navigate('/asset-registry-and-tracking')}>
                      {t('openRegistry', 'Open Registry')}
                    </Button>
                    <Button onClick={() => openEdit(selectedAsset)}>{t('editAsset', 'Edit Asset')}</Button>
                  </div>
                </div>
              ) : (
                <div className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t('selectAssetTip', 'Select an asset from the table to see ownership, history, and relationships.')}
                </div>
              )}
            </div>
          </div>
        </main>

        {showForm && (
          <div className="fixed inset-0 z-[1500] bg-black/50 flex items-center justify-center p-4">
            <form onSubmit={saveAsset} className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{editingAssetId ? 'Edit Asset' : 'New Asset'}</h2>
                  <p className="text-sm text-muted-foreground">Save asset details to the backend</p>
                </div>
                <button type="button" onClick={closeForm} className="p-2 rounded-md hover:bg-muted">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="md:col-span-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}
                <AssetField label="Asset Tag">
                  <input value={form.assetTag} onChange={(e) => setForm((prev) => ({ ...prev, assetTag: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Name">
                  <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Asset Type">
                  <input value={form.assetType} onChange={(e) => setForm((prev) => ({ ...prev, assetType: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Serial Number">
                  <input value={form.serialNumber} onChange={(e) => setForm((prev) => ({ ...prev, serialNumber: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Manufacturer">
                  <input value={form.manufacturer} onChange={(e) => setForm((prev) => ({ ...prev, manufacturer: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Model">
                  <input value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Cost Amount">
                  <input type="number" min="0" step="0.01" value={form.costAmount} onChange={(e) => setForm((prev) => ({ ...prev, costAmount: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Purchase Date">
                  <input type="date" value={form.purchaseDate} onChange={(e) => setForm((prev) => ({ ...prev, purchaseDate: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Owner ID" hint="Use the numeric user ID from the users page.">
                  <input type="number" min="1" value={form.ownerId} onChange={(e) => setForm((prev) => ({ ...prev, ownerId: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Location">
                  <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                <AssetField label="Description">
                  <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </AssetField>
                {editingAssetId && (
                  <>
                    <AssetField label="Status">
                      <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </AssetField>
                    <AssetField label="Decommission Date">
                      <input type="date" value={form.decommissionDate} onChange={(e) => setForm((prev) => ({ ...prev, decommissionDate: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                    </AssetField>
                  </>
                )}
              </div>

              <div className="p-5 border-t border-border flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Asset'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageAssets;
