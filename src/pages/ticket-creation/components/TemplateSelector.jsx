import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';

const TemplateSelector = ({ category, onTemplateSelect }) => {
  const { isRtl } = useLanguage();
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = {
    incident: [
      {
        id: 'login-issue',
        name: 'Login Issues',
        icon: 'LogIn',
        description: 'User unable to access account or authenticate',
        fields: {
          subject: 'Unable to login to account',
          description: `User is experiencing login difficulties.\n\nSteps to reproduce:\n1. Navigate to login page\n2. Enter credentials\n3. Click login button\n\nExpected: Successful login\nActual: Error message displayed`,
          priority: 'high',
        },
      },
      {
        id: 'performance',
        name: 'Performance Issues',
        icon: 'Gauge',
        description: 'System running slow or unresponsive',
        fields: {
          subject: 'Application performance degradation',
          description: `System is experiencing significant slowdown.\n\nAffected areas:\n- Page load times\n- API response times\n- Database queries\n\nImpact: Multiple users affected`,
          priority: 'urgent',
        },
      },
      {
        id: 'data-loss',
        name: 'Data Loss',
        icon: 'Database',
        description: 'Missing or corrupted data',
        fields: {
          subject: 'Data integrity issue detected',
          description: `Data appears to be missing or corrupted.\n\nAffected data:\n- Records count\n- Time period\n- Affected users\n\nUrgent investigation required`,
          priority: 'urgent',
        },
      },
    ],
    problem: [
      {
        id: 'recurring-error',
        name: 'Recurring Error',
        icon: 'RefreshCw',
        description: 'Repeated system errors requiring investigation',
        fields: {
          subject: 'Recurring error pattern identified',
          description: `Multiple incidents reported with similar symptoms.\n\nError pattern:\n- Frequency\n- Affected components\n- Common factors\n\nRoot cause analysis needed`,
          priority: 'high',
        },
      },
      {
        id: 'capacity',
        name: 'Capacity Planning',
        icon: 'TrendingUp',
        description: 'Resource utilization concerns',
        fields: {
          subject: 'Resource capacity concerns',
          description: `System resources approaching limits.\n\nMetrics:\n- CPU utilization\n- Memory usage\n- Storage capacity\n\nProactive planning required`,
          priority: 'medium',
        },
      },
    ],
    change: [
      {
        id: 'feature-request',
        name: 'Feature Request',
        icon: 'Sparkles',
        description: 'New functionality or enhancement',
        fields: {
          subject: 'Feature enhancement request',
          description: `Proposed feature enhancement.\n\nBusiness justification:\n- User benefit\n- Expected impact\n- Priority rationale\n\nImplementation considerations needed`,
          priority: 'medium',
        },
      },
      {
        id: 'config-change',
        name: 'Configuration Change',
        icon: 'Settings',
        description: 'System configuration modification',
        fields: {
          subject: 'Configuration change request',
          description: `System configuration modification required.\n\nProposed changes:\n- Configuration items\n- Expected outcome\n- Rollback plan\n\nApproval and testing needed`,
          priority: 'medium',
        },
      },
      {
        id: 'deployment',
        name: 'Deployment Request',
        icon: 'Rocket',
        description: 'Software deployment or update',
        fields: {
          subject: 'Deployment request',
          description: `Software deployment required.\n\nDeployment details:\n- Version/build number\n- Target environment\n- Deployment window\n- Rollback strategy\n\nChange approval required`,
          priority: 'high',
        },
      },
    ],
  };

  const categoryTemplates = templates?.[category] || [];

  const handleTemplateClick = (template) => {
    onTemplateSelect(template?.fields);
    setShowTemplates(false);
  };

  if (categoryTemplates?.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
        <label className={`block text-sm font-medium text-foreground ${'text-left'}`}>
          Use Template (Optional)
        </label>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            iconName={showTemplates ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? 'Hide' : 'Show'} Templates
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {categoryTemplates?.map((template) => (
              <motion.button
                key={template?.id}
                type="button"
                onClick={() => handleTemplateClick(template)}
                className={`p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-elevation-2 transition-all duration-300 ${'text-left'}`}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                <div className={`flex items-start gap-3 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon name={template?.icon} size={20} color="var(--color-primary)" />
                  </motion.div>
                  <div className={`flex-1 min-w-0 ${'text-left'}`}>
                    <h4 className="font-semibold text-sm text-foreground mb-1">
                      {template?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 caption">
                      {template?.description}
                    </p>
                  </div>
                </div>
                <motion.div 
                  className={`flex items-center gap-2 text-xs text-primary caption ${isRtl ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon name="FileText" size={14} />
                  <span>Use this template</span>
                </motion.div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateSelector;