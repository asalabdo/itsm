import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import Icon from '../../../components/AppIcon';

const QuickActionsPanel = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('');
  const [formData, setFormData] = useState({});

  const quickActions = [
    {
      id: 'create-incident',
      title: t('createIncident', 'Create Incident'),
      description: t('logNewIncidentTicket', 'Log new incident ticket'),
      icon: 'AlertTriangle',
      color: 'bg-error text-error-foreground',
      form: {
        title: t('createNewIncident', 'Create New Incident'),
        fields: [
          { name: 'title', label: t('incidentTitle', 'Incident Title'), type: 'text', required: true },
          { name: 'priority', label: t('priority', 'Priority'), type: 'select', options: ['P1', 'P2', 'P3', 'P4'], required: true },
          { name: 'category', label: t('category', 'Category'), type: 'select', options: ['Hardware', 'Software', 'Network', 'Access'], required: true },
          { name: 'customer', label: t('affectedUser', 'Affected User'), type: 'text', required: true },
          { name: 'description', label: t('description', 'Description'), type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'escalate-ticket',
      title: t('escalateTicket', 'Escalate Ticket'),
      description: t('escalateToNextLevel', 'Escalate to next level'),
      icon: 'ArrowUp',
      color: 'bg-warning text-warning-foreground',
      form: {
        title: t('escalateTicket', 'Escalate Ticket'),
        fields: [
          { name: 'ticketId', label: t('ticketId', 'Ticket ID'), type: 'text', required: true },
          { name: 'escalateTo', label: t('escalateTo', 'Escalate To'), type: 'select', options: [t('level2Support', 'Level 2 Support'), t('manager', 'Manager'), t('specialistTeam', 'Specialist Team')], required: true },
          { name: 'reason', label: t('escalationReason', 'Escalation Reason'), type: 'select', options: [t('technicalComplexity', 'Technical Complexity'), t('slaBreachRisk', 'SLA Breach Risk'), t('employeeRequest', 'Employee Request'), t('requiresAuthorization', 'Requires Authorization')], required: true },
          { name: 'notes', label: t('escalationNotes', 'Escalation Notes'), type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'request-approval',
      title: t('requestApproval', 'Request Approval'),
      description: t('submitApprovalRequest', 'Submit approval request'),
      icon: 'CheckSquare',
      color: 'bg-blue-500 text-white',
      form: {
        title: t('requestApproval', 'Request Approval'),
        fields: [
          { name: 'requestType', label: t('requestType', 'Request Type'), type: 'select', options: [t('softwareInstallation', 'Software Installation'), t('systemAccess', 'System Access'), t('changeRequest', 'Change Request'), t('purchaseOrder', 'Purchase Order')], required: true },
          { name: 'ticketId', label: t('relatedTicketId', 'Related Ticket ID'), type: 'text', required: false },
          { name: 'approver', label: t('approver', 'Approver'), type: 'select', options: [t('directManager', 'Direct Manager'), t('itManager', 'IT Manager'), t('securityTeam', 'Security Team'), t('financeTeam', 'Finance Team')], required: true },
          { name: 'justification', label: t('businessJustification', 'Business Justification'), type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'knowledge-base',
      title: t('addToKnowledgeBase', 'Add to Knowledge Base'),
      description: t('shareSolutionWithTeam', 'Share solution with team'),
      icon: 'BookOpen',
      color: 'bg-success text-success-foreground',
      form: {
        title: t('addToKnowledgeBase', 'Add to Knowledge Base'),
        fields: [
          { name: 'title', label: t('articleTitle', 'Article Title'), type: 'text', required: true },
          { name: 'category', label: t('category', 'Category'), type: 'select', options: [t('troubleshooting', 'Troubleshooting'), t('howTo', 'How-To'), t('knownIssues', 'Known Issues'), t('bestPractices', 'Best Practices')], required: true },
          { name: 'tags', label: t('tagsCommaSeparated', 'Tags (comma separated)'), type: 'text', required: false },
          { name: 'problem', label: t('problemDescription', 'Problem Description'), type: 'textarea', required: true },
          { name: 'solution', label: t('solutionSteps', 'Solution Steps'), type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'schedule-callback',
      title: t('scheduleCallback', 'Schedule Callback'),
      description: t('scheduleCustomerCallback', 'Schedule customer callback'),
      icon: 'Phone',
      color: 'bg-purple-500 text-white',
      form: {
        title: t('scheduleEmployeeCallback', 'Schedule Employee Callback'),
        fields: [
          { name: 'ticketId', label: t('ticketId', 'Ticket ID'), type: 'text', required: true },
          { name: 'customerName', label: t('employeeName', 'Employee Name'), type: 'text', required: true },
          { name: 'phoneNumber', label: t('phoneNumber', 'Phone Number'), type: 'text', required: true },
          { name: 'preferredTime', label: t('preferredTime', 'Preferred Time'), type: 'datetime-local', required: true },
          { name: 'notes', label: t('callbackNotes', 'Callback Notes'), type: 'textarea', required: false }
        ]
      }
    },
    {
      id: 'generate-report',
      title: t('generateReport', 'Generate Report'),
      description: t('createPerformanceReport', 'Create performance report'),
      icon: 'FileText',
      color: 'bg-indigo-500 text-white',
      form: {
        title: t('generatePerformanceReport', 'Generate Performance Report'),
        fields: [
          { name: 'reportType', label: t('reportType', 'Report Type'), type: 'select', options: [t('dailySummary', 'Daily Summary'), t('weeklyPerformance', 'Weekly Performance'), t('monthlyAnalysis', 'Monthly Analysis'), t('customRange', 'Custom Range')], required: true },
          { name: 'dateRange', label: t('dateRange', 'Date Range'), type: 'select', options: [t('today', 'Today'), t('thisWeek', 'This Week'), t('thisMonth', 'This Month'), t('last30Days', 'Last 30 Days'), t('customRange', 'Custom')], required: true },
          { name: 'includeMetrics', label: t('includeMetrics', 'Include Metrics'), type: 'checkbox', options: [t('resolutionTime', 'Resolution Time'), t('employeeSatisfaction', 'Employee Satisfaction'), t('ticketVolume', 'Ticket Volume'), t('slaCompliance', 'SLA Compliance')], required: false },
          { name: 'format', label: t('reportFormat', 'Report Format'), type: 'select', options: [t('pdf', 'PDF'), t('excel', 'Excel'), t('emailSummary', 'Email Summary')], required: true }
        ]
      }
    }
  ];

  const handleActionClick = (action) => {
    setFormType(action?.id);
    setFormData({});
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    const actionHandlers = {
      'create-incident': () => navigate('/ticket-creation'),
      'escalate-ticket': () => formData?.ticketId
        ? navigate(`/ticket-details/${encodeURIComponent(formData.ticketId)}`)
        : navigate('/ticket-management-center'),
      'request-approval': () => navigate('/approval-queue-manager'),
      'knowledge-base': () => navigate('/search?category=knowledge'),
      'schedule-callback': () => navigate('/ticket-chatbot'),
      'generate-report': () => navigate('/reports-analytics')
    };

    actionHandlers?.[formType]?.();

    setShowForm(false);
    setFormData({});
    setFormType('');
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const currentAction = quickActions?.find(action => action?.id === formType);

  return (
    <>
      <div className="bg-gradient-to-b from-muted/20 to-card border-t-2 border-border p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <h3 className={`text-xl font-bold text-foreground mb-6 flex items-center ${isRtl ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={20} className="text-primary-foreground" />
          </div>
          <span>{t('quickActions', 'Quick Actions')}</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions?.map((action) => (
            <button
              key={action?.id}
              onClick={() => handleActionClick(action)}
              className="group p-5 bg-card border border-border hover:border-primary/50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md ${action?.color}`}>
                  <Icon name={action?.icon} size={26} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{action?.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1.5">{action?.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Form Modal */}
      {showForm && currentAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {currentAction?.form?.title}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-8">
              <div className="space-y-6">
                {currentAction?.form?.fields?.map((field) => (
                  <div key={field?.name}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {field?.label}
                      {field?.required && <span className="text-error ml-1">*</span>}
                    </label>
                    
                    {field?.type === 'text' && (
                      <input
                        type="text"
                        value={formData?.[field?.name] || ''}
                        onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                        className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                        required={field?.required}
                      />
                    )}
                    
                    {field?.type === 'select' && (
                      <select
                        value={formData?.[field?.name] || ''}
                        onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                        className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                        required={field?.required}
                      >
                        <option value="">{t('selectLabel', 'Select')} {field?.label}</option>
                        {field?.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    
                    {field?.type === 'textarea' && (
                      <textarea
                        value={formData?.[field?.name] || ''}
                        onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                        className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                        rows={4}
                        required={field?.required}
                      />
                    )}
                    
                    {field?.type === 'datetime-local' && (
                      <input
                        type="datetime-local"
                        value={formData?.[field?.name] || ''}
                        onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
                        className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                        required={field?.required}
                      />
                    )}
                    
                    {field?.type === 'checkbox' && (
                      <div className="space-y-2">
                        {field?.options?.map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData?.[field?.name]?.includes(option) || false}
                              onChange={(e) => {
                                const current = formData?.[field?.name] || [];
                                const updated = e?.target?.checked
                                  ? [...current, option]
                                  : current?.filter(item => item !== option);
                                handleInputChange(field?.name, updated);
                              }}
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className={`flex justify-end mt-8 pt-6 border-t border-border ${isRtl ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t('submit', 'Submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActionsPanel;
