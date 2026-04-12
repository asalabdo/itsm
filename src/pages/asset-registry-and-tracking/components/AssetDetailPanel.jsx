import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const AssetDetailPanel = ({ asset, onClose, userRole }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!asset) {
    return (
      <div className="w-full lg:w-96 bg-card border-l border-border flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Select an asset to view details</p>
        </div>
      </div>);

  }

  const tabs = [
    { id: 'details', label: 'Details', icon: 'Info' },
    { id: 'relationships', label: 'Relationships', icon: 'Link' },
    { id: 'history', label: 'History', icon: 'History' }];

  const isTabVisible = (tab) => {
    if (!tab?.roleRequired) return true;
    return tab?.roleRequired?.includes(userRole);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success',
      retired: 'bg-muted text-muted-foreground',
      maintenance: 'bg-warning/10 text-warning',
      completed: 'bg-success/10 text-success',
      scheduled: 'bg-primary/10 text-primary'
    };
    return colors?.[status] || colors?.inactive;
  };

  return (
    <div className="w-full lg:w-96 bg-card border-l border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Asset Details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label="Close details">
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name={asset?.icon} size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1">{asset?.description}</h3>
            <p className="text-sm text-muted-foreground mt-1">{asset?.assetId}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mt-2 ${getStatusColor(asset?.status)}`}>
              {asset?.status?.charAt(0)?.toUpperCase() + asset?.status?.slice(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="border-b border-border">
        <div className="flex overflow-x-auto scrollbar-custom">
          {tabs?.filter(isTabVisible)?.map((tab) =>
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${activeTab === tab?.id ?
                  'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`
              }>
              <Icon name={tab?.icon} size={16} />
              {tab?.label}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
        {activeTab === 'details' &&
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Manufacturer / Model</label>
              <p className="text-sm mt-1">{asset?.manufacturer || 'N/A'} {asset?.model}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
              <p className="text-sm mt-1">{asset?.category}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Owner</label>
              <div className="flex items-center gap-2 mt-1">
                <Icon name="User" size={16} className="text-muted-foreground" />
                <span className="text-sm">{asset?.currentOwner}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="MapPin" size={14} className="text-muted-foreground" />
                <span className="text-sm">{asset?.location}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Serial Number</label>
              <p className="text-sm mt-1 data-text">{asset?.serialNumber}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchase Date</label>
              <p className="text-sm mt-1">{asset?.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        }

        {activeTab === 'relationships' &&
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Asset Dependencies</h4>
            {asset?.relationships?.length > 0 ? (
              asset.relationships.map((rel) => (
                <div key={rel.id} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-primary uppercase">{rel.relationshipType}</span>
                    <span className="text-sm">{rel.sourceAssetId === asset.id ? rel.targetAssetName : rel.sourceAssetName}</span>
                  </div>
                  <Icon name={rel.sourceAssetId === asset.id ? "ArrowRight" : "ArrowLeft"} size={16} className="text-muted-foreground" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No relationships mapped.</p>
            )}
            <Button variant="outline" size="sm" fullWidth iconName="Plus" iconPosition="left">
              Link New Asset
            </Button>
          </div>
        }

        {activeTab === 'history' &&
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Audit Log</h4>
            <div className="relative pl-4 border-l-2 border-border space-y-6">
              {asset?.history?.length > 0 ? (
                asset.history.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.action}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.oldValue && <span>From <span className="text-foreground">{item.oldValue}</span> </span>}
                        {item.newValue && <span>To <span className="text-foreground">{item.newValue}</span></span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground italic uppercase">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>{item.username}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No history available.</p>
              )}
            </div>
          </div>
        }


      </div>
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="default" fullWidth iconName="ArrowRightLeft" iconPosition="left">
          Transfer Asset
        </Button>
        <Button variant="outline" fullWidth iconName="Wrench" iconPosition="left">
          Schedule Maintenance
        </Button>
      </div>
    </div>);

};

export default AssetDetailPanel;