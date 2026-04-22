import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { ticketsAPI } from '../../../services/api';
import { loadErpDepartmentDirectory, getErpDepartmentOptions } from '../../../services/organizationUnits';

const IncidentCreationWizard = ({ onIncidentCreated, categoryOptions = [], assignmentGroupOptions = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erpDepartments, setErpDepartments] = useState([]);
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
    { id: 1, title: isArabic ? 'المعلومات الأساسية' : 'Basic Information', icon: 'FileText' },
    { id: 2, title: isArabic ? 'التصنيف' : 'Classification', icon: 'Tag' },
    { id: 3, title: isArabic ? 'التعيين' : 'Assignment', icon: 'Users' },
    { id: 4, title: isArabic ? 'مراجعة وإنشاء' : 'Review & Create', icon: 'CheckCircle' }
  ];

  const categoryItems = useMemo(() => categoryOptions || [], [categoryOptions]);
  const assignmentGroupItems = useMemo(() => assignmentGroupOptions || [], [assignmentGroupOptions]);
  const departmentOptions = useMemo(() => getErpDepartmentOptions(erpDepartments, t), [erpDepartments, t]);

  useEffect(() => {
    let mounted = true;

    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) {
          setErpDepartments(Array.isArray(departments) ? departments : []);
        }
      })
      .catch((error) => {
        console.error('Failed to load ERP departments:', error);
        if (mounted) {
          setErpDepartments([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-populate caller info when email is entered
    if (field === 'reportedBy' && value?.includes('@')) {
      const financeDepartment = departmentOptions.find((option) => String(option?.label || '').toLowerCase().includes('finance'))?.label || (isArabic ? 'المالية' : 'Finance');
      // Simulate caller lookup
      setCallerInfo({
        name: isArabic ? 'جون سميث' : 'John Smith',
        department: financeDepartment,
        location: isArabic ? 'المبنى A، الطابق 2' : 'Building A, Floor 2',
        phone: '+1 555-0123',
        manager: isArabic ? 'جين دو' : 'Jane Doe'
      });
    }
  };

  const calculatePriority = () => {
    if (formData?.impact && formData?.urgency) {
      const impactLevel = formData?.impact === 'High' ? 3 : formData?.impact === 'Medium' ? 2 : 1;
      const urgencyLevel = formData?.urgency === 'High' ? 3 : formData?.urgency === 'Medium' ? 2 : 1;
      const priority = Math.max(impactLevel, urgencyLevel);
      
      return priority === 3 ? (isArabic ? 'حرج' : 'Critical') : priority === 2 ? (isArabic ? 'عالي' : 'High') : (isArabic ? 'متوسط' : 'Medium');
    }
    return '';
  };

  const getSLATarget = (priority, category) => {
    const slaMatrix = {
      'Critical': { response: '15m', resolution: '4h' },
      'High': { response: '30m', resolution: '8h' },
      'Medium': { response: '2h', resolution: '24h' },
      'Low': { response: '4h', resolution: '72h' }
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority || 'Medium',
        category: formData.category,
        urgency: formData.urgency === 'High' ? 0.9 : formData.urgency === 'Medium' ? 0.5 : 0.1,
        impact: formData.impact === 'High' ? 0.9 : formData.impact === 'Medium' ? 0.5 : 0.1
      };
      
      const response = await ticketsAPI.create(payload);
      onIncidentCreated(response.data);
    } catch (err) {
      console.error('Failed to create incident:', err);
      alert(isArabic ? 'فشل إنشاء البلاغ. حاول مرة أخرى.' : 'Failed to create incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'معلومات البلاغ الأساسية' : 'Basic Incident Information'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'عنوان البلاغ' : 'Incident Title'} *
                  </label>
                  <input
                    type="text"
                    value={formData?.title}
                    onChange={(e) => handleInputChange('title', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder={isArabic ? 'وصف موجز للمشكلة' : 'Brief description of the issue'}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الوصف التفصيلي' : 'Detailed Description'} *
                  </label>
                  <textarea
                    value={formData?.description}
                    onChange={(e) => handleInputChange('description', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={4}
                    placeholder={isArabic ? 'قدّم معلومات تفصيلية عن البلاغ، بما في ذلك خطوات إعادة الإنتاج ورسائل الخطأ...' : 'Provide detailed information about the incident, including steps to reproduce, error messages, etc.'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'تم الإبلاغ بواسطة' : 'Reported By'} *
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
                    {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                  </label>
                  <input
                    type="tel"
                    value={formData?.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder={isArabic ? 'رقم الهاتف أو وسيلة تواصل بديلة' : 'Phone number or alternative contact'}
                  />
                </div>
              </div>

              {/* Auto-populated caller info */}
              {callerInfo && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">{isArabic ? 'معلومات المُبلّغ (تمت تعبئتها تلقائيًا)' : 'Caller Information (Auto-populated)'}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'الاسم:' : 'Name:'}</span>
                      <p className="font-medium text-foreground">{callerInfo?.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'القسم:' : 'Department:'}</span>
                      <p className="font-medium text-foreground">{callerInfo?.department}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'الموقع:' : 'Location:'}</span>
                      <p className="font-medium text-foreground">{callerInfo?.location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'الهاتف:' : 'Phone:'}</span>
                      <p className="font-medium text-foreground">{callerInfo?.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'تصنيف البلاغ' : 'Incident Classification'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الفئة' : 'Category'} *
                  </label>
                  {categoryItems?.length > 0 ? (
                    <select
                      value={formData?.category}
                      onChange={(e) => handleInputChange('category', e?.target?.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="">{isArabic ? 'اختر الفئة' : 'Select Category'}</option>
                      {categoryItems?.map(cat => (
                        <option key={cat?.value} value={cat?.label}>{cat?.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData?.category}
                      onChange={(e) => handleInputChange('category', e?.target?.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                      placeholder={isArabic ? 'أدخل الفئة من بيانات البلاغ الحية' : 'Enter category from live incident data'}
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الفئة الفرعية' : 'Subcategory'}
                  </label>
                  <input
                    type="text"
                    value={formData?.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder={isArabic ? 'أدخل الفئة الفرعية' : 'Enter subcategory'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الأثر' : 'Impact'} *
                  </label>
                  <select
                    value={formData?.impact}
                    onChange={(e) => handleInputChange('impact', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">{isArabic ? 'اختر الأثر' : 'Select Impact'}</option>
                    <option value="High">{isArabic ? 'عالٍ - يؤثر على عدد كبير من المستخدمين/الأعمال الحرجة' : 'High - Affects large number of users/critical business'}</option>
                    <option value="Medium">{isArabic ? 'متوسط - يؤثر على عدد متوسط من المستخدمين' : 'Medium - Affects moderate number of users'}</option>
                    <option value="Low">{isArabic ? 'منخفض - يؤثر على عدد قليل من المستخدمين أو الأنظمة غير الحرجة' : 'Low - Affects few users or non-critical systems'}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الاستعجال' : 'Urgency'} *
                  </label>
                  <select
                    value={formData?.urgency}
                    onChange={(e) => handleInputChange('urgency', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">{isArabic ? 'اختر الاستعجال' : 'Select Urgency'}</option>
                    <option value="High">{isArabic ? 'عالٍ - يحتاج إلى اهتمام فوري' : 'High - Needs immediate attention'}</option>
                    <option value="Medium">{isArabic ? 'متوسط - يمكن الانتظار لكنه يحتاج إلى اهتمام سريع' : 'Medium - Can wait but needs prompt attention'}</option>
                    <option value="Low">{isArabic ? 'منخفض - يمكن التعامل معه خلال ساعات العمل' : 'Low - Can be addressed during normal business hours'}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الخطورة' : 'Severity'}
                  </label>
                  <select
                    value={formData?.severity}
                    onChange={(e) => handleInputChange('severity', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="">{isArabic ? 'اختر الخطورة' : 'Select Severity'}</option>
                    <option value="Critical">{isArabic ? 'حرج - النظام متوقف أو الوظائف الرئيسية غير متاحة' : 'Critical - System down or major functionality unavailable'}</option>
                    <option value="High">{isArabic ? 'عالٍ - تضرر كبير في الوظائف' : 'High - Significant functionality impaired'}</option>
                    <option value="Medium">{isArabic ? 'متوسط - تأثرت وظائف بسيطة' : 'Medium - Minor functionality affected'}</option>
                    <option value="Low">{isArabic ? 'منخفض - تحسين تجميلي أو بسيط' : 'Low - Cosmetic or minor enhancement'}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الأولوية المحسوبة' : 'Calculated Priority'}
                  </label>
                  <div className="p-3 bg-muted/30 border border-border rounded-lg">
                    <span className={`font-medium ${
                      calculatePriority() === 'P1' ? 'text-error' :
                      calculatePriority() === 'P2'? 'text-warning' : 'text-foreground'
                    }`}>
                      {calculatePriority() || (isArabic ? 'اختر الأثر والاستعجال' : 'Select Impact & Urgency')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'التعيين و SLA' : 'Assignment & SLA'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'مجموعة التعيين' : 'Assignment Group'} *
                  </label>
                  {assignmentGroupItems?.length > 0 ? (
                    <select
                      value={formData?.assignmentGroup}
                      onChange={(e) => handleInputChange('assignmentGroup', e?.target?.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="">{isArabic ? 'اختر مجموعة التعيين' : 'Select Assignment Group'}</option>
                      {assignmentGroupItems?.map(group => (
                        <option key={group?.value} value={group?.label}>{group?.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData?.assignmentGroup}
                      onChange={(e) => handleInputChange('assignmentGroup', e?.target?.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                      placeholder={isArabic ? 'أدخل مجموعة التعيين من البيانات الحية' : 'Enter assignment group from live data'}
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'مُسند إلى' : 'Assigned To'}
                  </label>
                  <input
                    type="text"
                    value={formData?.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder={isArabic ? 'فني محدد (اختياري)' : 'Specific technician (optional)'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'الموقع' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={formData?.location}
                    onChange={(e) => handleInputChange('location', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    placeholder={isArabic ? 'الموقع الفعلي إذا كان ذا صلة' : 'Physical location if relevant'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isArabic ? 'المبرر التجاري' : 'Business Justification'}
                  </label>
                  <textarea
                    value={formData?.businessJustification}
                    onChange={(e) => handleInputChange('businessJustification', e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                    rows={3}
                    placeholder={isArabic ? 'الأثر التجاري والمبرر للأولوية' : 'Business impact and justification for priority'}
                  />
                </div>
              </div>

              {/* SLA Information */}
              {formData?.priority && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">{isArabic ? 'أهداف SLA' : 'SLA Targets'}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'زمن الاستجابة:' : 'Response Time:'}</span>
                      <p className="font-medium text-foreground">
                        {getSLATarget(formData?.priority)?.response}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'زمن الحل:' : 'Resolution Time:'}</span>
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
              <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'مراجعة وإنشاء البلاغ' : 'Review & Create Incident'}</h3>
              
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">{isArabic ? 'العنوان:' : 'Title:'}</span> {formData?.title}</p>
                      <p><span className="text-muted-foreground">{isArabic ? 'تم الإبلاغ بواسطة:' : 'Reported By:'}</span> {formData?.reportedBy}</p>
                      <p><span className="text-muted-foreground">{isArabic ? 'الوصف:' : 'Description:'}</span> {formData?.description?.substring(0, 100)}...</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{isArabic ? 'التصنيف' : 'Classification'}</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">{isArabic ? 'الفئة:' : 'Category:'}</span> {formData?.category}</p>
                      <p><span className="text-muted-foreground">{isArabic ? 'الأولوية:' : 'Priority:'}</span> <span className="font-semibold text-primary">{formData?.priority}</span></p>
                      <p><span className="text-muted-foreground">{isArabic ? 'الخطورة:' : 'Severity:'}</span> {formData?.severity}</p>
                      <p><span className="text-muted-foreground">{isArabic ? 'الأثر:' : 'Impact:'}</span> {formData?.impact}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{isArabic ? 'التعيين' : 'Assignment'}</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">{isArabic ? 'المجموعة:' : 'Group:'}</span> {formData?.assignmentGroup}</p>
                      {formData?.assignedTo && <p><span className="text-muted-foreground">{isArabic ? 'مُسند إلى:' : 'Assigned To:'}</span> {formData?.assignedTo}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{isArabic ? 'أهداف SLA' : 'SLA Targets'}</h4>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">{isArabic ? 'الاستجابة:' : 'Response:'}</span> {getSLATarget(formData?.priority)?.response}</p>
                      <p><span className="text-muted-foreground">{isArabic ? 'الحل:' : 'Resolution:'}</span> {getSLATarget(formData?.priority)?.resolution}</p>
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
            {isArabic ? 'السابق' : 'Previous'}
          </button>
          
          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isArabic ? 'التالي' : 'Next'}
              </button>
            ) : (
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isArabic ? 'جارٍ الإنشاء...' : 'Creating...'}
                  </>
                ) : (isArabic ? 'إنشاء بلاغ' : 'Create Incident')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentCreationWizard;
