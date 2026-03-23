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
  { id: 'history', label: 'History', icon: 'History' },
  { id: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
  { id: 'financial', label: 'Financial', icon: 'DollarSign', roleRequired: ['admin', 'finance'] }];


  const transferHistory = [
  {
    id: 1,
    from: "John Smith",
    fromAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1aef10a9f-1763294632369.png",
    fromAvatarAlt: "Professional headshot of Caucasian man with short brown hair in navy suit",
    to: "Sarah Johnson",
    toAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f15f8eab-1763300157173.png",
    toAvatarAlt: "Professional headshot of African American woman with long black hair in gray blazer",
    date: "01/05/2026",
    reason: "Department transfer",
    approvedBy: "Michael Chen"
  },
  {
    id: 2,
    from: "David Wilson",
    fromAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_157aec79d-1763301412520.png",
    fromAvatarAlt: "Professional headshot of Asian man with glasses and short black hair in white shirt",
    to: "John Smith",
    toAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1aef10a9f-1763294632369.png",
    toAvatarAlt: "Professional headshot of Caucasian man with short brown hair in navy suit",
    date: "11/20/2025",
    reason: "Project assignment",
    approvedBy: "Lisa Anderson"
  }];


  const maintenanceRecords = [
  {
    id: 1,
    type: "Routine Inspection",
    date: "12/15/2025",
    technician: "Tech Support Team",
    status: "completed",
    notes: "All systems functioning normally. Battery health at 87%."
  },
  {
    id: 2,
    type: "Hardware Upgrade",
    date: "09/10/2025",
    technician: "IT Department",
    status: "completed",
    notes: "RAM upgraded from 8GB to 16GB. Performance improved significantly."
  },
  {
    id: 3,
    type: "Preventive Maintenance",
    date: "01/20/2026",
    technician: "Scheduled",
    status: "scheduled",
    notes: "Quarterly maintenance check scheduled."
  }];


  const financialData = {
    purchasePrice: "$1,299.00",
    purchaseDate: "03/15/2024",
    currentValue: "$899.00",
    depreciationRate: "20% annually",
    totalDepreciation: "$400.00",
    warrantyExpiry: "03/15/2027",
    insuranceValue: "$950.00",
    maintenanceCost: "$125.00"
  };

  const isTabVisible = (tab) => {
    if (!tab?.roleRequired) return true;
    return tab?.roleRequired?.includes(userRole);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success',
      inactive: 'bg-muted text-muted-foreground',
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
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
            activeTab === tab?.id ?
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
              <p className="text-sm mt-1">{asset?.category}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Owner</label>
              <div className="flex items-center gap-2 mt-1">
                <Image
                src={asset?.ownerAvatar}
                alt={asset?.ownerAvatarAlt}
                className="w-8 h-8 rounded-full object-cover" />

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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Barcode</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm data-text">{asset?.barcode}</p>
                <button className="p-1 rounded hover:bg-muted transition-smooth">
                  <Icon name="QrCode" size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Maintenance</label>
              <p className="text-sm mt-1">{asset?.maintenance}</p>
            </div>
          </div>
        }

        {activeTab === 'history' &&
        <div className="space-y-4">
            <h4 className="text-sm font-semibold">Transfer History</h4>
            {transferHistory?.map((transfer) =>
          <div key={transfer?.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Image
                src={transfer?.fromAvatar}
                alt={transfer?.fromAvatarAlt}
                className="w-6 h-6 rounded-full object-cover" />

                  <span className="text-sm">{transfer?.from}</span>
                  <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                  <Image
                src={transfer?.toAvatar}
                alt={transfer?.toAvatarAlt}
                className="w-6 h-6 rounded-full object-cover" />

                  <span className="text-sm">{transfer?.to}</span>
                </div>
                <p className="text-xs text-muted-foreground">{transfer?.date}</p>
                <p className="text-xs mt-1">{transfer?.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">Approved by: {transfer?.approvedBy}</p>
              </div>
          )}
          </div>
        }

        {activeTab === 'maintenance' &&
        <div className="space-y-4">
            <h4 className="text-sm font-semibold">Maintenance Records</h4>
            {maintenanceRecords?.map((record) =>
          <div key={record?.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{record?.type}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(record?.status)}`}>
                    {record?.status?.charAt(0)?.toUpperCase() + record?.status?.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{record?.date}</p>
                <p className="text-xs mt-1">Technician: {record?.technician}</p>
                <p className="text-xs text-muted-foreground mt-2">{record?.notes}</p>
              </div>
          )}
          </div>
        }

        {activeTab === 'financial' && userRole !== 'staff' &&
        <div className="space-y-4">
            <h4 className="text-sm font-semibold">Financial Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchase Price</label>
                <p className="text-sm font-medium mt-1 data-text">{financialData?.purchasePrice}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Value</label>
                <p className="text-sm font-medium mt-1 data-text">{financialData?.currentValue}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchase Date</label>
                <p className="text-sm mt-1">{financialData?.purchaseDate}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Depreciation</label>
                <p className="text-sm mt-1 data-text">{financialData?.totalDepreciation}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warranty Expiry</label>
                <p className="text-sm mt-1">{financialData?.warrantyExpiry}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Insurance Value</label>
                <p className="text-sm mt-1 data-text">{financialData?.insuranceValue}</p>
              </div>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="TrendingDown" size={16} className="text-primary" />
                <span className="text-xs font-medium">Depreciation Rate</span>
              </div>
              <p className="text-sm">{financialData?.depreciationRate}</p>
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