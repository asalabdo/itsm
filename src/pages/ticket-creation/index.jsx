import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import CategorySelector from './components/CategorySelector';
import EmployeeLookup from './components/EmployeeLookup';
import TemplateSelector from './components/TemplateSelector';
import FileUploader from './components/FileUploader';
import RoutingPreview from './components/RoutingPreview';
import { ticketsAPI } from '../../services/api';

const TicketCreation = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState(null);

  const [formData, setFormData] = useState({
    module: '',
    category: '',
    service: null,
    employee: null,
    priority: '',
    subject: '',
    description: '',
    department: '',
    impact: '',
    urgency: '',
    attachments: [],
  });

  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', description: 'Critical business impact' },
    { value: 'high', label: 'High', description: 'Significant impact on operations' },
    { value: 'medium', label: 'Medium', description: 'Moderate impact' },
    { value: 'low', label: 'Low', description: 'Minimal impact' },
  ];

  const departmentOptions = [
    { value: 'it', label: 'IT Support' },
    { value: 'network', label: 'Network Operations' },
    { value: 'security', label: 'Security Team' },
    { value: 'database', label: 'Database Administration' },
    { value: 'application', label: 'Application Support' },
  ];

  const impactOptions = [
    { value: 'critical', label: 'Critical', description: 'Multiple users/systems affected' },
    { value: 'high', label: 'High', description: 'Department-wide impact' },
    { value: 'medium', label: 'Medium', description: 'Team-level impact' },
    { value: 'low', label: 'Low', description: 'Individual user impact' },
  ];

  const urgencyOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Requires immediate attention' },
    { value: 'high', label: 'High', description: 'Within 4 hours' },
    { value: 'medium', label: 'Medium', description: 'Within 24 hours' },
    { value: 'low', label: 'Low', description: 'Can wait 48+ hours' },
  ];

  const handleModuleChange = (module) => {
    setFormData({ ...formData, module, category: '', service: null });
    setErrors({ ...errors, module: '' });
  };

  const handleCategoryChange = (category) => {
    setFormData({ ...formData, category, service: null });
    setErrors({ ...errors, category: '' });
  };

  const handleServiceSelect = (service) => {
    setFormData({ ...formData, service });
  };

  const handleEmployeeSelect = (employee) => {
    setFormData({ ...formData, employee });
    setErrors({ ...errors, employee: '' });
  };

  const handleTemplateSelect = (templateFields) => {
    setFormData({
      ...formData,
      subject: templateFields?.subject,
      description: templateFields?.description,
      priority: templateFields?.priority,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleAttachmentsChange = (attachments) => {
    setFormData({ ...formData, attachments });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.category) {
      newErrors.category = 'Please select a ticket category';
    }

    if (!formData?.employee) {
      newErrors.employee = 'Please select a employee';
    }

    if (!formData?.priority) {
      newErrors.priority = 'Please select a priority level';
    }

    if (!formData?.subject || formData?.subject?.trim()?.length < 10) {
      newErrors.subject = 'Subject must be at least 10 characters';
    }

    if (!formData?.description || formData?.description?.trim()?.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData?.department) {
      newErrors.department = 'Please select a department';
    }

    if (!formData?.impact) {
      newErrors.impact = 'Please select impact level';
    }

    if (!formData?.urgency) {
      newErrors.urgency = 'Please select urgency level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ticketsAPI.create({
        title: formData.subject,
        description: formData.description,
        priority: formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1),
        category: formData.category,
        urgency: formData.urgency === 'immediate' ? 1.0 : formData.urgency === 'high' ? 0.8 : formData.urgency === 'medium' ? 0.5 : 0.2,
        impact: formData.impact === 'critical' ? 1.0 : formData.impact === 'high' ? 0.8 : formData.impact === 'medium' ? 0.5 : 0.2,
      });
      setGeneratedTicketId(res.data?.ticketNumber || `TKT-${res.data?.id}`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/ticket-details');
  };

  const handleReset = () => {
    setFormData({
      category: '',
      employee: null,
      priority: '',
      subject: '',
      description: '',
      department: '',
      impact: '',
      urgency: '',
      attachments: [],
    });
    setErrors({});
  };

  return (
    <>
      <Helmet>
        <title>Create New Ticket - SupportFlow Pro</title>
        <meta name="description" content="Create and submit new support tickets with automated routing and workflow management" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <BreadcrumbTrail />

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="Plus" size={24} color="#FFFFFF" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
                  Create New Ticket
                </h1>
                <p className="text-sm md:text-base text-muted-foreground caption mt-1">
                  Submit a new support request with automated routing
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
                    Ticket Information
                  </h2>

                  <div className="space-y-4 md:space-y-5">
                    <CategorySelector
                      selectedModule={formData?.module}
                      onModuleChange={handleModuleChange}
                      selectedCategory={formData?.category}
                      onCategoryChange={handleCategoryChange}
                      selectedService={formData?.service}
                      onServiceSelect={handleServiceSelect}
                    />
                    {errors?.category && (
                      <p className="text-sm text-error caption">{errors?.category}</p>
                    )}

                    {formData?.category && (
                      <TemplateSelector
                        category={formData?.category}
                        onTemplateSelect={handleTemplateSelect}
                      />
                    )}

                    <EmployeeLookup
                      selectedEmployee={formData?.employee}
                      onEmployeeSelect={handleEmployeeSelect}
                    />
                    {errors?.employee && (
                      <p className="text-sm text-error caption">{errors?.employee}</p>
                    )}

                    <Select
                      label="Priority"
                      placeholder="Select priority level"
                      options={priorityOptions}
                      value={formData?.priority}
                      onChange={(value) => handleInputChange('priority', value)}
                      required
                      error={errors?.priority}
                    />

                    <Input
                      label="Subject"
                      type="text"
                      placeholder="Brief description of the issue"
                      value={formData?.subject}
                      onChange={(e) => handleInputChange('subject', e?.target?.value)}
                      required
                      error={errors?.subject}
                      description="Provide a clear, concise subject line"
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Description <span className="text-error">*</span>
                      </label>
                      <textarea
                        value={formData?.description}
                        onChange={(e) => handleInputChange('description', e?.target?.value)}
                        placeholder="Detailed description of the issue, including steps to reproduce, expected vs actual behavior, and any error messages..."
                        rows={8}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background resize-none"
                      />
                      {errors?.description && (
                        <p className="text-sm text-error caption">{errors?.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground caption">
                        Minimum 20 characters required
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Department"
                        placeholder="Select department"
                        options={departmentOptions}
                        value={formData?.department}
                        onChange={(value) => handleInputChange('department', value)}
                        required
                        error={errors?.department}
                      />

                      <Select
                        label="Impact"
                        placeholder="Select impact level"
                        options={impactOptions}
                        value={formData?.impact}
                        onChange={(value) => handleInputChange('impact', value)}
                        required
                        error={errors?.impact}
                      />
                    </div>

                    <Select
                      label="Urgency"
                      placeholder="Select urgency level"
                      options={urgencyOptions}
                      value={formData?.urgency}
                      onChange={(value) => handleInputChange('urgency', value)}
                      required
                      error={errors?.urgency}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
                    Attachments
                  </h2>
                  <FileUploader
                    attachments={formData?.attachments}
                    onAttachmentsChange={handleAttachmentsChange}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-elevation-1 sticky top-20">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Ticket Summary
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Category</span>
                      <span className="text-sm font-medium text-foreground capitalize">
                        {formData?.category || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Employee</span>
                      <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                        {formData?.employee?.name || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Priority</span>
                      <span className="text-sm font-medium text-foreground capitalize">
                        {formData?.priority || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Department</span>
                      <span className="text-sm font-medium text-foreground">
                        {departmentOptions?.find(d => d?.value === formData?.department)?.label || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground caption">Attachments</span>
                      <span className="text-sm font-medium text-foreground">
                        {formData?.attachments?.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      fullWidth
                      loading={isSubmitting}
                      iconName="Send"
                      iconPosition="right"
                    >
                      {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      fullWidth
                      onClick={handleReset}
                      iconName="RotateCcw"
                      iconPosition="left"
                    >
                      Reset Form
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      fullWidth
                      onClick={() => navigate('/agent-dashboard')}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                {formData?.category && formData?.priority && (
                  <RoutingPreview
                    category={formData?.category}
                    priority={formData?.priority}
                    subject={formData?.subject}
                  />
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-card border border-border rounded-lg shadow-elevation-5 max-w-md w-full p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={40} color="var(--color-success)" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                Ticket Created Successfully!
              </h2>
              <p className="text-sm md:text-base text-muted-foreground caption mb-4">
                Your ticket has been submitted and assigned to the appropriate team
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Icon name="Ticket" size={20} color="var(--color-primary)" />
                <span className="text-lg font-semibold text-primary data-text">
                  {generatedTicketId}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="default"
                size="lg"
                fullWidth
                onClick={handleModalClose}
                iconName="Eye"
                iconPosition="right"
              >
                View Ticket Details
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                }}
                iconName="Plus"
                iconPosition="left"
              >
                Create Another Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketCreation;