import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const IncidentCreationWizard = ({ onIncidentCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: '',
    description: '',
    reportedBy: '',
    contactInfo: '',
    
    // Step 2: Classification
    category: '',
    subcategory: '',
    severity: '',
    impact: '',
    urgency: '',
    priority: '',
    
    // Step 3: Assignment & SLA
    assignmentGroup: '',
    assignedTo: '',
    slaTarget: '',
    
    // Step 4: Additional Details
    location: '',
    affectedServices: [],
    businessJustification: '',
    attachments: []
  });

  const [callerInfo, setCallerInfo] = useState(null);

  const steps = [
    { id: 1, title: 'Basic Information', icon: 'FileText' },
    { id: 2, title: 'Classification', icon: 'Tag' },
    { id: 3, title: 'Assignment', icon: 'Users' },
    { id: 4, title: 'Review & Create', icon: 'CheckCircle' }
  ];

  const categories = {
    'Infrastructure': ['Email Services', 'Database', 'Network', 'Servers'],
    'Application': ['Web Applications', 'Desktop Software', 'Mobile Apps'],
    'Security': ['Access Issues', 'Malware', 'Data Breach'],
    'Hardware': ['Printers', 'Computers', 'Mobile Devices']
  };

  const assignmentGroups = [
    'Level 1 Support',
    'Level 2 Support',
    'Database Team',
    'Network Team',
    'Security Team',
    'Infrastructure Team'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-populate caller info when email is entered
    if (field === 'reportedBy' && value?.includes('@')) {
      // Simulate caller lookup
      setCallerInfo({
        name: 'John Smith',
        department: 'Finance',
        location: 'Building A, Floor 2',
        phone: '+1 555-0123',
        manager: 'Jane Doe'
      });
    }
  };

  const calculatePriority = () => {
    if (formData?.impact && formData?.urgency) {
      const impactLevel = formData?.impact === 'High' ? 3 : formData?.impact === 'Medium' ? 2 : 1;
      const urgencyLevel = formData?.urgency === 'High' ? 3 : formData?.urgency === 'Medium' ? 2 : 1;
      const priority = Math.max(impactLevel, urgencyLevel);
      
      return priority === 3 ? 'P1' : priority === 2 ? 'P2' : priority === 1 ? 'P3' : 'P4';
    }
    return '';
  };

  const getSLATarget = (priority, category) => {
    const slaMatrix = {
      'P1': { response: '15m', resolution: '4h' },
      'P2': { response: '30m', resolution: '8h' },
      'P3': { response: '2h', resolution: '24h' },
      'P4': { response: '4h', resolution: '72h' }
    };
    
    return slaMatrix?.[priority] || { response: '4h', resolution: '72h' };
  };

  const handleStepChange = (step) => {
    if (step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      // Auto-calculate priority when moving from classification step
      if (currentStep === 2) {
        const priority = calculatePriority();
        const sla = getSLATarget(priority, formData?.category);
        setFormData(prev => ({ 
          ...prev, 
          priority,
          slaTarget: `Response: ${sla?.response}, Resolution: ${sla?.resolution}`
        }));
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const newIncident = {
      id: `INC-2025-${String(Math.floor(Math.random() * 1000))?.padStart(3, '0')}`,
      ...formData,
      status: 'New',
      createdAt: new Date(),
      slaDeadline: new Date(Date.now() + (formData.priority === 'P1' ? 4 : formData.priority === 'P2' ? 8 : 24) * 60 * 60 * 1000),
      affectedUsers: Math.floor(Math.random() * 500) + 1,
      estimatedResolution: formData?.priority === 'P1' ? '4 hours' : formData?.priority === 'P2' ? '8 hours' : '1-2 days'
    };
    
    onIncidentCreated(newIncident);
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData?.title && formData?.description && formData?.reportedBy;
      case 2:
        return formData?.category && formData?.severity && formData?.impact && formData?.urgency;
      case 3:
        return formData?.assignmentGroup;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border border-border rounded-lg">
        {/* Progress Steps */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {steps?.map((step, index) => (
              <React.Fragment key={step?.id}>
                <div
                  className={`flex items-center space-x-3 cursor-pointer ${
                    currentStep === step?.id ? 'text-primary' : 
                    currentStep > step?.id ? 'text-success' : 'text-muted-foreground'
                  }`}
                  onClick={() => handleStepChange(step?.id)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step?.id ? 'border-primary bg-primary/10' :
                    currentStep > step?.id ? 'border-success bg-success text-success-foreground': 'border-muted bg-muted/10'
                  }`}>
                    {currentStep > step?.id ? (
                      <Icon name="Check" size={20} />
                    ) : (
                      <Icon name={step?.icon} size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{step?.title}</p>
                    <p className="text-xs">Step {step?.id}</p>
                  </div>
                </div>
                {index < steps?.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step?.id ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Basic Incident Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Incident Title *
                  </label>
                  <input
                    type="text"
                    value={formData?.title}
                    onChange={(e) => handleInputChange('title', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={formData?.description}
                    onChange={(e) => handleInputChange('description', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={4}
                    placeholder="Provide detailed information about the incident, including steps to reproduce, error messages, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reported By *
                  </label>
                  <input
                    type="email"
                    value={formData?.reportedBy}
                    onChange={(e) => handleInputChange('reportedBy', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder="reporter@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contact Information
                  </label>
                  <input
                    type="tel"
                    value={formData?.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder="Phone number or alternative contact"
                  />
                </div>
              </div>

              {/* Auto-populated caller info */}
              {callerInfo && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">Caller Information (Auto-populated)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium text-foreground">{callerInfo?.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="font-medium text-foreground">{callerInfo?.department}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium text-foreground">{callerInfo?.location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium text-foreground">{callerInfo?.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Incident Classification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={formData?.category}
                    onChange={(e) => handleInputChange('category', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categories)?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subcategory
                  </label>
                  <select
                    value={formData?.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    disabled={!formData?.category}
                  >
                    <option value="">Select Subcategory</option>
                    {formData?.category && categories?.[formData?.category]?.map(subcat => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Impact *
                  </label>
                  <select
                    value={formData?.impact}
                    onChange={(e) => handleInputChange('impact', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Select Impact</option>
                    <option value="High">High - Affects large number of users/critical business</option>
                    <option value="Medium">Medium - Affects moderate number of users</option>
                    <option value="Low">Low - Affects few users or non-critical systems</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Urgency *
                  </label>
                  <select
                    value={formData?.urgency}
                    onChange={(e) => handleInputChange('urgency', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Select Urgency</option>
                    <option value="High">High - Needs immediate attention</option>
                    <option value="Medium">Medium - Can wait but needs prompt attention</option>
                    <option value="Low">Low - Can be addressed during normal business hours</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Severity
                  </label>
                  <select
                    value={formData?.severity}
                    onChange={(e) => handleInputChange('severity', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Select Severity</option>
                    <option value="Critical">Critical - System down or major functionality unavailable</option>
                    <option value="High">High - Significant functionality impaired</option>
                    <option value="Medium">Medium - Minor functionality affected</option>
                    <option value="Low">Low - Cosmetic or minor enhancement</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Calculated Priority
                  </label>
                  <div className="p-3 bg-muted/30 border border-border rounded-lg">
                    <span className={`font-medium ${
                      calculatePriority() === 'P1' ? 'text-error' :
                      calculatePriority() === 'P2'? 'text-warning' : 'text-foreground'
                    }`}>
                      {calculatePriority() || 'Select Impact & Urgency'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Assignment & SLA</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Assignment Group *
                  </label>
                  <select
                    value={formData?.assignmentGroup}
                    onChange={(e) => handleInputChange('assignmentGroup', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">Select Assignment Group</option>
                    {assignmentGroups?.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={formData?.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder="Specific technician (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData?.location}
                    onChange={(e) => handleInputChange('location', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder="Physical location if relevant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Justification
                  </label>
                  <textarea
                    value={formData?.businessJustification}
                    onChange={(e) => handleInputChange('businessJustification', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={3}
                    placeholder="Business impact and justification for priority"
                  />
                </div>
              </div>

              {/* SLA Information */}
              {formData?.priority && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">SLA Targets</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <p className="font-medium text-foreground">
                        {getSLATarget(formData?.priority)?.response}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resolution Time:</span>
                      <p className="font-medium text-foreground">
                        {getSLATarget(formData?.priority)?.resolution}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Review & Create Incident</h3>
              
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Basic Information</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">Title:</span> {formData?.title}</p>
                      <p><span className="text-muted-foreground">Reported By:</span> {formData?.reportedBy}</p>
                      <p><span className="text-muted-foreground">Description:</span> {formData?.description?.substring(0, 100)}...</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Classification</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">Category:</span> {formData?.category}</p>
                      <p><span className="text-muted-foreground">Priority:</span> <span className="font-semibold text-primary">{formData?.priority}</span></p>
                      <p><span className="text-muted-foreground">Severity:</span> {formData?.severity}</p>
                      <p><span className="text-muted-foreground">Impact:</span> {formData?.impact}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Assignment</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">Group:</span> {formData?.assignmentGroup}</p>
                      {formData?.assignedTo && <p><span className="text-muted-foreground">Assigned To:</span> {formData?.assignedTo}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">SLA Targets</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">Response:</span> {getSLATarget(formData?.priority)?.response}</p>
                      <p><span className="text-muted-foreground">Resolution:</span> {getSLATarget(formData?.priority)?.resolution}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors"
              >
                Create Incident
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentCreationWizard;