import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const RequestCreationWizard = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

  const totalSteps = 4;

  useEffect(() => {
    // Mock services for selection
    const mockServices = [
      {
        id: 1,
        name: 'New Employee Setup',
        category: 'onboarding',
        icon: 'UserPlus',
        fields: [
          { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
          { name: 'department', label: 'Department', type: 'select', required: true, options: ['Engineering', 'Marketing', 'Sales', 'HR'] },
          { name: 'role', label: 'Job Role', type: 'text', required: true },
          { name: 'start_date', label: 'Start Date', type: 'date', required: true },
          { name: 'manager', label: 'Direct Manager', type: 'text', required: true }
        ]
      },
      {
        id: 2,
        name: 'Hardware Request',
        category: 'equipment',
        icon: 'Monitor',
        fields: [
          { name: 'equipment_type', label: 'Equipment Type', type: 'select', required: true, options: ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Other'] },
          { name: 'specifications', label: 'Specifications', type: 'textarea', required: true },
          { name: 'business_justification', label: 'Business Justification', type: 'textarea', required: true },
          { name: 'urgency', label: 'Urgency Level', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'] }
        ]
      },
      {
        id: 3,
        name: 'Software License',
        category: 'software',
        icon: 'Package',
        fields: [
          { name: 'software_name', label: 'Software Name', type: 'text', required: true },
          { name: 'license_type', label: 'License Type', type: 'select', required: true, options: ['Individual', 'Team', 'Enterprise'] },
          { name: 'duration', label: 'Duration', type: 'select', required: true, options: ['1 Month', '3 Months', '6 Months', '1 Year'] },
          { name: 'team_members', label: 'Number of Users', type: 'number', required: true }
        ]
      }
    ];
    setServices(mockServices);
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData({});
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
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onClose?.();
      // Show success notification
      console.log('Request submitted:', { service: selectedService, data: formData });
    }, 2000);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedService?.fields?.filter(field => field?.required)
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
              <h3 className="text-lg font-medium text-foreground mb-2">Select a Service</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose the service you'd like to request from our catalog
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {services?.map(service => (
                <div
                  key={service?.id}
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
                    <h4 className="ml-3 font-medium text-foreground">{service?.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize mb-2">
                    {service?.category} • {service?.fields?.length} fields required
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Request Details</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Fill out the required information for your {selectedService?.name} request
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedService?.fields?.map(field => (
                <div key={field?.name}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {field?.label}
                    {field?.required && <span className="text-red-500 ml-1">*</span>}
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
              <h3 className="text-lg font-medium text-foreground mb-2">Review Request</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Please review your request details before submission
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Icon name={selectedService?.icon} size={24} />
                <div className="ml-3">
                  <h4 className="font-medium text-foreground">{selectedService?.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{selectedService?.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedService?.fields?.map(field => (
                  <div key={field?.name} className="flex justify-between">
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
                <div className="ml-3">
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
                <h3 className="text-lg font-medium text-foreground mb-2">Submitting Request</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your request...
                </p>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Check" size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Request Submitted Successfully</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your request has been submitted and assigned ID: REQ-{Date.now()?.toString()?.slice(-6)}
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Your request will be reviewed by the appropriate team</li>
                    <li>2. You'll receive an email confirmation within 15 minutes</li>
                    <li>3. Updates will be sent to your email as the request progresses</li>
                    <li>4. You can track progress in the Active Requests dashboard</li>
                  </ul>
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
          <h2 className="text-xl font-semibold text-foreground">Create New Request</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Step {currentStep} of {totalSteps}
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
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-border">
        <div className="flex space-x-2">
          {currentStep > 1 && currentStep < 4 && (
            <Button variant="outline" onClick={handleBack}>
              <Icon name="ChevronLeft" size={16} />
              <span className="ml-1">Back</span>
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
              <span className="ml-1">Submit Request</span>
            </Button>
          )}

          {currentStep === 4 && !loading && (
            <Button variant="default" onClick={onClose}>
              <span>Close</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCreationWizard;