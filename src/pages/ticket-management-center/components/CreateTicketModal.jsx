import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import assetService from '../../../services/assetService';
import { formatLocalizedValue } from '../../../services/displayValue';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const CreateTicketModal = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    department: '',
    category: '',
    assetId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [assetValidation, setAssetValidation] = useState({
    checking: false,
    hasAssets: false,
    assets: [],
    message: ''
  });
  const [requiresAsset, setRequiresAsset] = useState(false);

  const priorityOptions = [
    { value: 'critical', label: formatLocalizedValue('Critical') },
    { value: 'high', label: formatLocalizedValue('High') },
    { value: 'medium', label: formatLocalizedValue('Medium') },
    { value: 'low', label: formatLocalizedValue('Low') }
  ];

  const departmentOptions = [
    { value: 'it', label: formatLocalizedValue('IT Support') },
    { value: 'hr', label: formatLocalizedValue('Human Resources') },
    { value: 'finance', label: formatLocalizedValue('Finance') },
    { value: 'operations', label: formatLocalizedValue('Operations') },
    { value: 'facilities', label: formatLocalizedValue('Facilities') }
  ];

  const categoryOptions = [
    { value: 'hardware-issue', label: formatLocalizedValue('Hardware Issue'), requiresAsset: true },
    { value: 'software-issue', label: formatLocalizedValue('Software Issue'), requiresAsset: true },
    { value: 'asset-request', label: formatLocalizedValue('Asset Request'), requiresAsset: false },
    { value: 'access-request', label: formatLocalizedValue('Access Request'), requiresAsset: false },
    { value: 'general-inquiry', label: formatLocalizedValue('General Inquiry'), requiresAsset: false },
    { value: 'maintenance', label: formatLocalizedValue('Maintenance'), requiresAsset: true },
    { value: 'replacement', label: formatLocalizedValue('Replacement Request'), requiresAsset: true }
  ];

  // Validate asset ownership when category changes
  useEffect(() => {
    if (formData?.category) {
      const selectedCategory = categoryOptions?.find(cat => cat?.value === formData?.category);
      const assetRequired = selectedCategory?.requiresAsset || false;
      setRequiresAsset(assetRequired);

      if (assetRequired) {
        validateAssetOwnership();
      } else {
        setAssetValidation({
          checking: false,
          hasAssets: true,
          assets: [],
          message: formatLocalizedValue('Asset selection not required for this category')
        });
        setFormData(prev => ({ ...prev, assetId: '' }));
      }
    }
  }, [formData?.category]);

  const validateAssetOwnership = async () => {
    setAssetValidation({ checking: true, hasAssets: false, assets: [], message: '' });

    try {
      const userId = currentUser?.id || 1; // Fallback to 1 if no currentUser.id
      const data = await assetService.getByOwnerId(userId);
      const userAssets = data
        ?.filter(asset => asset?.status?.toLowerCase() === 'active')
        ?.map(asset => ({
          id: asset.id,
          assetId: asset.assetTag,
          description: asset.name,
          category: asset.assetType,
          status: asset.status,
          serialNumber: asset.serialNumber
        }));

      if (userAssets?.length > 0) {
        setAssetValidation({
          checking: false,
          hasAssets: true,
          assets: userAssets,
        message: `${userAssets?.length} ${formatLocalizedValue('assigned asset(s) available') || 'assigned asset(s) available'}`
      });
      } else {
        setAssetValidation({
          checking: false,
          hasAssets: false,
          assets: [],
        message: formatLocalizedValue('No active assigned assets found. Please contact administration.')
      });
      }
    } catch (error) {
      console.error('Error fetching user assets:', error);
      setAssetValidation({
        checking: false,
        hasAssets: false,
        assets: [],
        message: formatLocalizedValue('Error verifying assets. Please try again.')
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData?.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!formData?.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData?.category) {
      newErrors.category = 'Category is required';
    }

    // Asset validation for asset-required categories
    if (requiresAsset) {
      if (!assetValidation?.hasAssets) {
        newErrors.asset = 'You must have an assigned asset to create this type of ticket';
      } else if (!formData?.assetId) {
        newErrors.asset = 'Please select an asset for this ticket';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newTicket = {
        id: `TKT-${Math.floor(Math.random() * 10000)}`,
        ...formData,
        requester: currentUser?.name || 'Current User',
        requesterInitials: currentUser?.initials || 'CU',
        status: 'open',
        statusLabel: 'Open',
        priorityLabel: priorityOptions?.find(p => p?.value === formData?.priority)?.label,
        lastActivity: 'Just now',
        hasAttachment: false,
        createdAt: new Date()?.toISOString(),
        assetLinked: requiresAsset && formData?.assetId ? true : false
      };

      // Log audit trail
      logAuditTrail(newTicket);

      onSubmit(newTicket);
      resetForm();
      setLoading(false);
      onClose();
    }, 1000);
  };

  const logAuditTrail = (ticket) => {
    const auditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date()?.toISOString(),
      userName: currentUser?.name || 'Current User',
      userRole: currentUser?.role || 'Employee',
      action: 'Created support ticket',
      actionType: 'create',
      objectType: 'Ticket',
      objectId: ticket?.id,
      severity: 'low',
      success: true,
      complianceCategory: 'Data Access',
      changes: [
        { field: 'Ticket ID', oldValue: null, newValue: ticket?.id },
        { field: 'Category', oldValue: null, newValue: ticket?.category },
        { field: 'Asset Linked', oldValue: null, newValue: ticket?.assetLinked ? 'Yes' : 'No' }
      ]
    };

    console.log('Audit Trail Entry:', auditEntry);
    // In production, this would call an API to store the audit log
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: '',
      department: '',
      category: '',
      assetId: ''
    });
    setErrors({});
    setAssetValidation({
      checking: false,
      hasAssets: false,
      assets: [],
      message: ''
    });
    setRequiresAsset(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const assetOptions = assetValidation?.assets?.map(asset => ({
    value: asset?.assetId,
    label: `${asset?.assetId} - ${asset?.description}`,
    description: asset?.serialNumber
  }));

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-1300"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-1400 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-elevation-5 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Plus" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t('createNewTicket', 'Create New Ticket')}</h2>
                <p className="text-sm text-muted-foreground">{t('submitSupportRequest', 'Submit a support request')}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
              aria-label={t('closeModal', 'Close modal')}
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto scrollbar-custom p-6 space-y-6">
            {/* Title */}
            <Input
              label={t('ticketTitle', 'Ticket Title')}
              placeholder={t('briefDescriptionIssue', 'Brief description of the issue')}
              value={formData?.title}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              error={errors?.title}
              required
            />

            {/* Category */}
            <Select
              label={t('category', 'Category')}
              placeholder={t('selectTicketCategory', 'Select ticket category')}
              options={categoryOptions}
              value={formData?.category}
              onChange={(value) => handleInputChange('category', value)}
              error={errors?.category}
              required
            />

            {/* Asset Validation Message */}
            {formData?.category && (
              <div className={`p-4 rounded-lg border ${
                assetValidation?.checking ? 'bg-muted/50 border-border' : requiresAsset && !assetValidation?.hasAssets ?'bg-error/10 border-error': requiresAsset && assetValidation?.hasAssets ?'bg-success/10 border-success': 'bg-muted/50 border-border'
              }`}>
                <div className="flex items-start gap-3">
                  <Icon
                    name={
                      assetValidation?.checking ? 'Loader' : requiresAsset && !assetValidation?.hasAssets ?'AlertTriangle': requiresAsset && assetValidation?.hasAssets ?'CheckCircle': 'Info'
                    }
                    size={20}
                    className={`mt-0.5 ${
                      assetValidation?.checking ? 'text-muted-foreground animate-spin' :
                      requiresAsset && !assetValidation?.hasAssets ? 'text-error': requiresAsset && assetValidation?.hasAssets ?'text-success': 'text-muted-foreground'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {assetValidation?.checking ? 'Validating asset ownership...' : requiresAsset ?'Asset Validation' : 'Asset Not Required'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assetValidation?.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Asset Selection (only if required and assets available) */}
            {requiresAsset && assetValidation?.hasAssets && (
              <Select
                label="Select Asset"
                placeholder="Choose the asset related to this ticket"
                options={assetOptions}
                value={formData?.assetId}
                onChange={(value) => handleInputChange('assetId', value)}
                error={errors?.asset}
                searchable
                required
              />
            )}

            {/* Priority and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Priority"
                placeholder="Select priority level"
                options={priorityOptions}
                value={formData?.priority}
                onChange={(value) => handleInputChange('priority', value)}
                error={errors?.priority}
                required
              />

              <Select
                label="Department"
                placeholder="Select department"
                options={departmentOptions}
                value={formData?.department}
                onChange={(value) => handleInputChange('department', value)}
                error={errors?.department}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                placeholder="Provide detailed information about your request..."
                rows={5}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
              {errors?.description && (
                <p className="text-sm text-destructive">{errors?.description}</p>
              )}
            </div>

            {/* Governance Notice */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <Icon name="Shield" size={20} className="text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Governance & Compliance</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This ticket will be logged in the audit trail. Asset-related tickets are validated against your assigned assets to ensure compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Send"
                iconPosition="left"
                onClick={handleSubmit}
                className="flex-1"
                loading={loading}
                disabled={loading || (requiresAsset && !assetValidation?.hasAssets)}
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTicketModal;
