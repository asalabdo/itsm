import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionsPanel = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('');
  const [formData, setFormData] = useState({});

  const quickActions = [
    {
      id: 'create-incident',
      title: 'Create Incident',
      description: 'Log new incident ticket',
      icon: 'AlertTriangle',
      color: 'bg-error text-error-foreground',
      form: {
        title: 'Create New Incident',
        fields: [
          { name: 'title', label: 'Incident Title', type: 'text', required: true },
          { name: 'priority', label: 'Priority', type: 'select', options: ['P1', 'P2', 'P3', 'P4'], required: true },
          { name: 'category', label: 'Category', type: 'select', options: ['Hardware', 'Software', 'Network', 'Access'], required: true },
          { name: 'customer', label: 'Affected User', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'escalate-ticket',
      title: 'Escalate Ticket',
      description: 'Escalate to next level',
      icon: 'ArrowUp',
      color: 'bg-warning text-warning-foreground',
      form: {
        title: 'Escalate Ticket',
        fields: [
          { name: 'ticketId', label: 'Ticket ID', type: 'text', required: true },
          { name: 'escalateTo', label: 'Escalate To', type: 'select', options: ['Level 2 Support', 'Manager', 'Specialist Team'], required: true },
          { name: 'reason', label: 'Escalation Reason', type: 'select', options: ['Technical Complexity', 'SLA Breach Risk', 'Employee Request', 'Requires Authorization'], required: true },
          { name: 'notes', label: 'Escalation Notes', type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'request-approval',
      title: 'Request Approval',
      description: 'Submit approval request',
      icon: 'CheckSquare',
      color: 'bg-blue-500 text-white',
      form: {
        title: 'Request Approval',
        fields: [
          { name: 'requestType', label: 'Request Type', type: 'select', options: ['Software Installation', 'System Access', 'Change Request', 'Purchase Order'], required: true },
          { name: 'ticketId', label: 'Related Ticket ID', type: 'text', required: false },
          { name: 'approver', label: 'Approver', type: 'select', options: ['Direct Manager', 'IT Manager', 'Security Team', 'Finance Team'], required: true },
          { name: 'justification', label: 'Business Justification', type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'knowledge-base',
      title: 'Add to Knowledge Base',
      description: 'Share solution with team',
      icon: 'BookOpen',
      color: 'bg-success text-success-foreground',
      form: {
        title: 'Add Knowledge Base Article',
        fields: [
          { name: 'title', label: 'Article Title', type: 'text', required: true },
          { name: 'category', label: 'Category', type: 'select', options: ['Troubleshooting', 'How-To', 'Known Issues', 'Best Practices'], required: true },
          { name: 'tags', label: 'Tags (comma separated)', type: 'text', required: false },
          { name: 'problem', label: 'Problem Description', type: 'textarea', required: true },
          { name: 'solution', label: 'Solution Steps', type: 'textarea', required: true }
        ]
      }
    },
    {
      id: 'schedule-callback',
      title: 'Schedule Callback',
      description: 'Schedule customer callback',
      icon: 'Phone',
      color: 'bg-purple-500 text-white',
      form: {
        title: 'Schedule Employee Callback',
        fields: [
          { name: 'ticketId', label: 'Ticket ID', type: 'text', required: true },
          { name: 'customerName', label: 'Employee Name', type: 'text', required: true },
          { name: 'phoneNumber', label: 'Phone Number', type: 'text', required: true },
          { name: 'preferredTime', label: 'Preferred Time', type: 'datetime-local', required: true },
          { name: 'notes', label: 'Callback Notes', type: 'textarea', required: false }
        ]
      }
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create performance report',
      icon: 'FileText',
      color: 'bg-indigo-500 text-white',
      form: {
        title: 'Generate Performance Report',
        fields: [
          { name: 'reportType', label: 'Report Type', type: 'select', options: ['Daily Summary', 'Weekly Performance', 'Monthly Analysis', 'Custom Range'], required: true },
          { name: 'dateRange', label: 'Date Range', type: 'select', options: ['Today', 'This Week', 'This Month', 'Last 30 Days', 'Custom'], required: true },
          { name: 'includeMetrics', label: 'Include Metrics', type: 'checkbox', options: ['Resolution Time', 'Employee Satisfaction', 'Ticket Volume', 'SLA Compliance'], required: false },
          { name: 'format', label: 'Report Format', type: 'select', options: ['PDF', 'Excel', 'Email Summary'], required: true }
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
      <div className="bg-card border-t border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Zap" size={20} />
          <span>Quick Actions</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions?.map((action) => (
            <button
              key={action?.id}
              onClick={() => handleActionClick(action)}
              className="group p-4 bg-muted/30 hover:bg-muted/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${action?.color}`}>
                  <Icon name={action?.icon} size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">{action?.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{action?.description}</p>
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
            <div className="p-6 border-b border-border">
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
            
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="space-y-4">
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
                        <option value="">Select {field?.label}</option>
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
              
              <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit
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
