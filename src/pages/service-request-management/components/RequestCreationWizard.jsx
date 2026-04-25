import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import serviceRequestService from '../../../services/serviceRequestService';

const RequestCreationWizard = ({ onClose }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ requestTitle: '' });
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const totalSteps = 4;

  const isHiddenCatalogItem = (item) => {
    const name = String(item?.name || '').trim().toLowerCase();
    const category = String(item?.category || '').trim().toLowerCase();
    return category === 'hardware' || name === 'macbook pro m3';
  };

  const parseFormConfig = (value) => {
    if (!value) return [];
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const catalog = await serviceRequestService.getCatalog();
        if (catalog && catalog.length > 0) {
          setServices(
            catalog
              .filter((item) => !isHiddenCatalogItem(item))
              .map((item) => {
              const parsedFields = parseFormConfig(item?.formConfigJson || item?.FormConfigJson);
              return {
                ...item,
                name: item?.name || item?.Name || 'Service Request',
                category: item?.category || item?.Category || 'general',
                icon: item?.icon || item?.Icon || 'ClipboardList',
                fields: parsedFields.length > 0 ? parsedFields : (item?.fields || []),
              };
              })
          );
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Failed to fetch request catalog:', error);
        setServices([]);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (!services.length || selectedService) return;

    const params = new URLSearchParams(window.location.search);
    const catalogItemId = Number(params.get('catalogItem'));
    if (!catalogItemId) return;

    const matchingService = services.find((service) => Number(service?.id) === catalogItemId);
    if (matchingService) {
      handleServiceSelect(matchingService);
    }
  }, [services, selectedService]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData({ requestTitle: service?.name ? `${service.name} request` : '' });
    setErrorMessage('');
    setCurrentStep(2);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      setErrorMessage(isArabic ? 'يرجى اختيار خدمة قبل إرسال الطلب.' : 'Please select a service before submitting your request.');
      return;
    }

    const missingFields = (selectedService?.fields || [])
      .filter((field) => field?.required)
      .filter((field) => {
        const value = formData?.[field?.name];
        return value === undefined || value === null || String(value).trim() === '';
      });

    if (!String(formData?.requestTitle || '').trim()) {
      setCurrentStep(2);
      setErrorMessage(isArabic ? 'عنوان الطلب مطلوب.' : 'Request title is required.');
      return;
    }

    if (missingFields.length > 0) {
      setCurrentStep(2);
      setErrorMessage(isArabic
        ? `يرجى استكمال الحقول المطلوبة: ${missingFields.map((field) => field?.label).join(', ')}.`
        : `Please complete all required fields: ${missingFields.map((field) => field?.label).join(', ')}.`);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const requestPayload = {
        title: formData?.requestTitle?.trim() || `${selectedService?.name || 'Service'} ${isArabic ? 'طلب' : 'request'}`,
        description: `${selectedService?.name || (isArabic ? 'طلب خدمة' : 'Service request')} ${isArabic ? 'تم إرساله من معالج الفهرس.' : 'submitted from the catalog wizard.'}`,
        catalogItemId: Number(selectedService?.id),
        priority: formData?.priority || formData?.urgency || 'Medium',
        customDataJson: JSON.stringify(formData),
      };
      const response = await serviceRequestService.submitRequest({
        ...requestPayload,
      });
      setSubmittedRequest(response || null);
      setCurrentStep(4);
    } catch (error) {
      console.error('Failed to submit request:', error);
      setErrorMessage(error?.response?.data?.message || error?.message || (isArabic ? 'فشل إرسال الطلب. حاول مرة أخرى.' : 'Failed to submit request. Please try again.'));
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return Boolean(formData?.requestTitle?.trim()) && selectedService?.fields?.filter(field => field?.required)
          ?.every(field => formData?.[field?.name]);
      case 3:
        return true; // Review step
      case 4:
        return true; // Submission step
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">{isArabic ? 'اختر خدمة' : 'Select a Service'}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isArabic ? 'اختر الخدمة التي تريد طلبها من الفهرس' : "Choose the service you'd like to request from our catalog"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {services?.length > 0 ? services?.map((service, index) => (
                <div
                  key={service?.id ?? service?.catalogItemId ?? service?.name ?? `service-${index}`}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedService?.id === service?.id 
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Icon name={service?.icon} size={20} />
                    </div>
                    <h4 className="ms-3 font-medium text-foreground">{service?.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize mb-2">
                    {service?.category} • {service?.fields?.length} fields required
                  </p>
                </div>
              )) : (
                <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                  <Icon name="Package" size={24} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">{isArabic ? 'لم يتم العثور على عناصر في الفهرس' : 'No service catalog items found'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isArabic ? 'أضف عناصر فهرس نشطة في الخلفية لتفعيل إرسال الطلبات.' : 'Add active catalog items in the backend to enable request submission.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">{isArabic ? 'تفاصيل الطلب' : 'Request Details'}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isArabic ? `أكمل المعلومات المطلوبة لطلب ${selectedService?.name || ''}` : `Fill out the required information for your ${selectedService?.name} request`}
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {isArabic ? 'عنوان الطلب' : 'Request Title'} <span className="text-red-500 ms-1">*</span>
                </label>
                <Input
                  type="text"
                  value={formData?.requestTitle || ''}
                  onChange={(e) => handleInputChange('requestTitle', e?.target?.value)}
                  placeholder={isArabic ? `أدخل عنوان طلب ${selectedService?.name || 'الخدمة'}` : `Enter ${selectedService?.name || 'service'} request title`}
                  required
                />
              </div>

                {selectedService?.fields?.map((field, index) => (
                  <div key={field?.name || field?.label || `field-${index}`}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {field?.label}
                      {field?.required && <span className="text-red-500 ms-1">*</span>}
                    </label>
                  
                  {field?.type === 'text' && (
                    <Input
                      type="text"
                      value={formData?.[field?.name] || ''}
                      onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                      placeholder={`Enter ${field?.label?.toLowerCase()}`}
                      required={field?.required}
                    />
                  )}
                  
                  {field?.type === 'select' && (
                    <Select
                      options={field?.options?.map(opt => ({ value: opt, label: opt }))}
                      value={formData?.[field?.name] || ''}
                      onChange={(value) => handleInputChange(field?.name, value)}
                      placeholder={`Select ${field?.label?.toLowerCase()}`}
                    />
                  )}
                  
                  {field?.type === 'textarea' && (
                    <textarea
                      value={formData?.[field?.name] || ''}
                      onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                      placeholder={`Enter ${field?.label?.toLowerCase()}`}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required={field?.required}
                    />
                  )}
                  
                  {field?.type === 'date' && (
                    <Input
                      type="date"
                      value={formData?.[field?.name] || ''}
                      onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                      required={field?.required}
                    />
                  )}
                  
                  {field?.type === 'number' && (
                    <Input
                      type="number"
                      value={formData?.[field?.name] || ''}
                      onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                      placeholder={`Enter ${field?.label?.toLowerCase()}`}
                      required={field?.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">{isArabic ? 'مراجعة الطلب' : 'Review Request'}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isArabic ? 'يرجى مراجعة تفاصيل الطلب قبل الإرسال' : 'Please review your request details before submission'}
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Icon name={selectedService?.icon} size={24} />
                <div className="ms-3">
                  <h4 className="font-medium text-foreground">{selectedService?.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{selectedService?.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{isArabic ? 'عنوان الطلب:' : 'Request Title:'}</span>
                  <span className="text-sm font-medium text-foreground">
                    {formData?.requestTitle || `${selectedService?.name} request`}
                  </span>
                </div>
                {selectedService?.fields?.map((field, index) => (
                  <div key={field?.name || field?.label || `field-${index}`} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{field?.label}:</span>
                    <span className="text-sm font-medium text-foreground">
                      {formData?.[field?.name] || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Icon name="Info" size={16} className="text-yellow-600 mt-0.5" />
                <div className="ms-3">
                  <h5 className="text-sm font-medium text-yellow-800">Important Information</h5>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                    <li>• Your request will be reviewed by the appropriate team</li>
                    <li>• You'll receive email notifications about status updates</li>
                    <li>• Average processing time: 2-5 business days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            {loading ? (
              <div>
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-foreground mb-2">{isArabic ? 'جارٍ إرسال الطلب' : 'Submitting Request'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'يرجى الانتظار أثناء معالجة طلبك...' : 'Please wait while we process your request...'}
                </p>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Check" size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{isArabic ? 'تم إرسال الطلب بنجاح' : 'Request Submitted Successfully'}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {isArabic ? 'تم إرسال طلبك وتم تعيين المعرف:' : 'Your request has been submitted and assigned ID:'} {submittedRequest?.requestNumber || submittedRequest?.RequestNumber || `REQ-${Date.now()?.toString()?.slice(-6)}`}
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-foreground mb-2">{isArabic ? 'ما الخطوة التالية؟' : 'What happens next?'}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Your request will be reviewed by the appropriate team</li>
                    <li>2. You'll receive an email confirmation within 15 minutes</li>
                    <li>3. Updates will be sent to your email as the request progresses</li>
                    <li>4. You can track progress in the Active Requests dashboard</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="default"
                    onClick={() => navigate(`/service-request-management?view=requests${submittedRequest?.requestNumber ? `&request=${encodeURIComponent(submittedRequest.requestNumber)}` : ''}`)}
                  >
                    <Icon name="List" size={16} />
                    <span className="ms-1">{isArabic ? 'تتبع الطلب' : 'Track Request'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(submittedRequest?.requestNumber ? `/fulfillment-center?request=${encodeURIComponent(submittedRequest.requestNumber)}` : '/fulfillment-center')}
                  >
                    <Icon name="ArrowRight" size={16} />
                    <span className="ms-1">{isArabic ? 'فتح مركز التنفيذ' : 'Open Fulfillment Center'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{isArabic ? 'إنشاء طلب جديد' : 'Create New Request'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isArabic ? 'الخطوة' : 'Step'} {currentStep} {isArabic ? 'من' : 'of'} {totalSteps}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                i + 1 <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1 <= currentStep ? (
                  i + 1 < currentStep ? <Icon name="Check" size={16} /> : i + 1
                ) : (
                  i + 1
                )}
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-12 h-0.5 ${
                  i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Service</span>
          <span>Details</span>
          <span>Review</span>
          <span>Submit</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-border">
        <div className="flex space-x-2">
          {currentStep > 1 && currentStep < 4 && (
            <Button variant="outline" onClick={handleBack}>
              <Icon name="ChevronLeft" size={16} />
              <span className="ms-1">Back</span>
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {currentStep < 3 && (
            <Button
              variant="default"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              <span className="mr-1">Next</span>
              <Icon name="ChevronRight" size={16} />
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={loading}
            >
              <Icon name="Send" size={16} />
              <span className="ms-1">Submit Request</span>
            </Button>
          )}

          {currentStep === 4 && !loading && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/service-request-management?view=requests')}>
                <Icon name="List" size={16} />
                <span className="ms-1">View Requests</span>
              </Button>
              <Button variant="default" onClick={onClose}>
                <span>Close</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCreationWizard;
