import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import TicketDuplicateSuggestions from '../../../components/tickets/TicketDuplicateSuggestions';
import TicketQuickPresetGrid from '../../../components/tickets/TicketQuickPresetGrid';
import TicketRecentReusePanel from '../../../components/tickets/TicketRecentReusePanel';
import assetService from '../../../services/assetService';
import { formatLocalizedValue } from '../../../services/displayValue';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { ticketsAPI } from '../../../services/api';
import { getErpDepartmentOptions, loadErpDepartmentDirectory } from '../../../services/organizationUnits';
import { getLocalizedTicketQuickPreset, TICKET_QUICK_PRESETS } from '../../../services/ticketDepartmentDefaults';

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
  const [erpDepartments, setErpDepartments] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentTicketsLoading, setRecentTicketsLoading] = useState(false);

  const priorityOptions = [
    { value: 'critical', label: t('critical', 'Critical') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') }
  ];

  useEffect(() => {
    let mounted = true;
    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) setErpDepartments(Array.isArray(departments) ? departments : []);
      })
      .catch((error) => {
        console.error('Failed to load ERP departments:', error);
        if (mounted) setErpDepartments([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let mounted = true;

    const loadRecentTickets = async () => {
      setRecentTicketsLoading(true);
      try {
        const response = await ticketsAPI.getAll();
        const tickets = Array.isArray(response?.data) ? response.data : [];
        const currentUserId = Number(currentUser?.id);
        const filteredTickets = Number.isFinite(currentUserId)
          ? tickets.filter((ticket) => {
              const candidateIds = [
                ticket?.requestedById,
                ticket?.assignedToId,
                ticket?.requestedBy?.id,
                ticket?.assignedTo?.id,
              ].map((value) => Number(value)).filter((value) => !Number.isNaN(value) && value > 0);
              return candidateIds.includes(currentUserId);
            })
          : tickets;
        const sorted = [...(filteredTickets.length > 0 ? filteredTickets : tickets)]
          .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
          .slice(0, 4);
        if (mounted) {
          setRecentTickets(sorted);
        }
      } catch {
        if (mounted) {
          setRecentTickets([]);
        }
      } finally {
        if (mounted) {
          setRecentTicketsLoading(false);
        }
      }
    };

    loadRecentTickets();
    return () => {
      mounted = false;
    };
  }, [currentUser?.id, isOpen]);

  const departmentOptions = useMemo(() => getErpDepartmentOptions(erpDepartments, t), [erpDepartments, t]);
  const quickPresets = useMemo(
    () => TICKET_QUICK_PRESETS.map((preset) => getLocalizedTicketQuickPreset(preset, language)),
    [language],
  );

  const categoryOptions = [
    { value: 'hardware-issue', label: t('hardwareIssue', 'Hardware Issue'), requiresAsset: true },
    { value: 'software-issue', label: t('softwareIssue', 'Software Issue'), requiresAsset: true },
    { value: 'asset-request', label: t('assetRequest', 'Asset Request'), requiresAsset: false },
    { value: 'access-request', label: t('accessRequest', 'Access Request'), requiresAsset: false },
    { value: 'general-inquiry', label: t('generalInquiry', 'General Inquiry'), requiresAsset: false },
    { value: 'maintenance', label: t('maintenance', 'Maintenance'), requiresAsset: true },
    { value: 'replacement', label: t('replacementRequest', 'Replacement Request'), requiresAsset: true }
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
          message: t('assetSelectionNotRequiredForThisCategory', 'Asset selection not required for this category')
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
          message: t('assignedAssetsAvailable', '{count} assigned asset(s) available').replace('{count}', String(userAssets?.length))
        });
      } else {
        setAssetValidation({
          checking: false,
          hasAssets: false,
          assets: [],
          message: t('noActiveAssignedAssetsFound', 'No active assigned assets found. Please contact administration.')
        });
      }
    } catch (error) {
      console.error('Error fetching user assets:', error);
      setAssetValidation({
        checking: false,
        hasAssets: false,
        assets: [],
        message: t('errorVerifyingAssets', 'Error verifying assets. Please try again.')
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const applyQuickPreset = (preset) => {
    const mappedCategory = preset?.managementCenterCategory || preset?.category || '';
    const selectedCategory = categoryOptions?.find((option) => option?.value === mappedCategory);
    const assetRequired = selectedCategory?.requiresAsset || false;

    setFormData((prev) => ({
      ...prev,
      title: preset?.subject || preset?.title || '',
      description: preset?.description || '',
      priority: preset?.priority || '',
      department: preset?.department || prev.department,
      category: mappedCategory,
      assetId: assetRequired ? prev.assetId : '',
    }));

    setRequiresAsset(assetRequired);
    setErrors({});
  };

  const applyRecentTicket = (ticket) => {
    const normalizedCategory = String(ticket?.category || '').trim().toLowerCase();
    const matchedCategory =
      categoryOptions.find((option) => option?.value === normalizedCategory)?.value ||
      'general-inquiry';
    const selectedCategory = categoryOptions.find((option) => option?.value === matchedCategory);
    const assetRequired = selectedCategory?.requiresAsset || false;

    setFormData((prev) => ({
      ...prev,
      title: ticket?.title || '',
      description: ticket?.description || '',
      priority: String(ticket?.priority || '').trim().toLowerCase() || prev.priority || 'medium',
      department: prev.department,
      category: matchedCategory,
      assetId: assetRequired ? prev.assetId : '',
    }));

    setRequiresAsset(assetRequired);
    setErrors({});
  };

  const duplicateTickets = useMemo(() => {
    const query = String(formData?.title || '').trim().toLowerCase();
    if (!query) {
      return [];
    }

    return recentTickets.filter((ticket) => {
      const title = String(ticket?.title || ticket?.subject || '').trim().toLowerCase();
      if (!title) {
        return false;
      }

      return title === query || title.includes(query) || query.includes(title);
    }).slice(0, 3);
  }, [formData?.title, recentTickets]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) {
      newErrors.title = t('titleIsRequired', 'Title is required');
    }

    if (!formData?.description?.trim()) {
      newErrors.description = t('descriptionIsRequired', 'Description is required');
    }

    if (!formData?.priority) {
      newErrors.priority = t('priorityIsRequired', 'Priority is required');
    }

    if (!formData?.department) {
      newErrors.department = t('departmentIsRequired', 'Department is required');
    }

    if (!formData?.category) {
      newErrors.category = t('categoryIsRequired', 'Category is required');
    }

    // Asset validation for asset-required categories
    if (requiresAsset) {
      if (!assetValidation?.hasAssets) {
        newErrors.asset = t('assignedAssetRequired', 'You must have an assigned asset to create this type of ticket');
      } else if (!formData?.assetId) {
        newErrors.asset = t('selectAssetForTicket', 'Please select an asset for this ticket');
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
        requester: currentUser?.name || t('currentUser', 'Current User'),
        requesterInitials: currentUser?.initials || 'CU',
        status: 'open',
        statusLabel: 'Open',
        priorityLabel: priorityOptions?.find(p => p?.value === formData?.priority)?.label,
        lastActivity: t('justNow', 'Just now'),
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
        userName: currentUser?.name || t('currentUser', 'Current User'),
        userRole: currentUser?.role || t('employee', 'Employee'),
        action: t('createdSupportTicket', 'Created support ticket'),
        actionType: 'create',
      objectType: 'Ticket',
      objectId: ticket?.id,
      severity: 'low',
      success: true,
      complianceCategory: 'Data Access',
      changes: [
        { field: t('ticketIdHeader', 'Ticket ID'), oldValue: null, newValue: ticket?.id },
        { field: t('category', 'Category'), oldValue: null, newValue: ticket?.category },
        { field: t('assetLinked', 'Asset Linked'), oldValue: null, newValue: ticket?.assetLinked ? t('yes', 'Yes') : t('no', 'No') }
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
            <TicketQuickPresetGrid
              presets={quickPresets}
              onSelect={applyQuickPreset}
              title={t('quickStart', 'Quick Start')}
              description={t('quickCreateModalDesc', 'Start from a shared ticket pattern and adjust the details if needed.')}
              compact
            />

            <TicketRecentReusePanel
              tickets={recentTickets}
              loading={recentTicketsLoading}
              onSelect={applyRecentTicket}
              title={t('recentTickets', 'Recent Tickets')}
              description={t('recentModalDesc', 'Reuse one of your latest tickets and adjust what changed.')}
              emptyLabel={t('noRecentTickets', 'No recent tickets to reuse yet.')}
              compact
            />

            {/* Title */}
            <Input
              label={t('ticketTitle', 'Ticket Title')}
              placeholder={t('briefDescriptionIssue', 'Brief description of the issue')}
              value={formData?.title}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              error={errors?.title}
              required
            />

            <TicketDuplicateSuggestions
              tickets={duplicateTickets}
              title={t('possibleDuplicate', 'Possible duplicate detected')}
              description={t('duplicateWarning', 'We found similar recent tickets. Reusing one can save a few steps.')}
              openLabel={t('reuse', 'Reuse')}
              untitledLabel={t('untiledTicket', 'Untitled ticket')}
              onOpen={applyRecentTicket}
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
                      {assetValidation?.checking ? t('validatingAssetOwnership', 'Validating asset ownership...') : requiresAsset ? t('assetValidation', 'Asset Validation') : t('assetNotRequired', 'Asset Not Required')}
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
                label={t('selectAsset', 'Select Asset')}
                placeholder={t('chooseAssetRelatedToTicket', 'Choose the asset related to this ticket')}
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
                label={t('priority', 'Priority')}
                placeholder={t('selectPriorityLevel', 'Select priority level')}
                options={priorityOptions}
                value={formData?.priority}
                onChange={(value) => handleInputChange('priority', value)}
                error={errors?.priority}
                required
              />

              <Select
                label={t('department', 'Department')}
                placeholder={t('selectDepartment', 'Select department')}
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
                {t('description', 'Description')} <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                placeholder={t('provideDetailedInformation', 'Provide detailed information about your request...')}
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
                  <p className="text-sm font-medium text-foreground">{t('governanceCompliance', 'Governance & Compliance')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('ticketAuditTrailNotice', 'This ticket will be logged in the audit trail. Asset-related tickets are validated against your assigned assets to ensure compliance.')}
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
                {t('cancel', 'Cancel')}
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
                {loading ? t('creating', 'Creating...') : t('createTicket', 'Create Ticket')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTicketModal;
