import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

import { useLanguage } from '../../../context/LanguageContext';

const RoutingPreview = ({ category, priority, subject }) => {
  const { isRtl } = useLanguage();
  const getRoutingInfo = () => {
    if (!category || !priority) return null;

    const routingRules = {
      incident: {
        urgent: {
          team: 'Critical Response Team',
          assignee: 'Senior Engineer - On Call',
          sla: '1 hour',
          escalation: 'Immediate manager notification',
          icon: 'Zap',
          color: 'var(--color-error)',
        },
        high: {
          team: 'Priority Support Team',
          assignee: 'Available Senior Agent',
          sla: '4 hours',
          escalation: 'Manager notification after 2 hours',
          icon: 'AlertCircle',
          color: 'var(--color-warning)',
        },
        medium: {
          team: 'General Support Team',
          assignee: 'Next Available Agent',
          sla: '8 hours',
          escalation: 'Standard escalation path',
          icon: 'Info',
          color: 'var(--color-primary)',
        },
        low: {
          team: 'General Support Team',
          assignee: 'Queue Assignment',
          sla: '24 hours',
          escalation: 'Standard escalation path',
          icon: 'MinusCircle',
          color: 'var(--color-muted-foreground)',
        },
      },
      problem: {
        urgent: {
          team: 'Problem Management Team',
          assignee: 'Senior Problem Manager',
          sla: '2 hours',
          escalation: 'Director notification',
          icon: 'Bug',
          color: 'var(--color-error)',
        },
        high: {
          team: 'Problem Management Team',
          assignee: 'Problem Manager',
          sla: '8 hours',
          escalation: 'Manager notification after 4 hours',
          icon: 'Bug',
          color: 'var(--color-warning)',
        },
        medium: {
          team: 'Problem Analysis Team',
          assignee: 'Problem Analyst',
          sla: '24 hours',
          escalation: 'Standard escalation path',
          icon: 'Bug',
          color: 'var(--color-primary)',
        },
        low: {
          team: 'Problem Analysis Team',
          assignee: 'Queue Assignment',
          sla: '48 hours',
          escalation: 'Standard escalation path',
          icon: 'Bug',
          color: 'var(--color-muted-foreground)',
        },
      },
      change: {
        urgent: {
          team: 'Emergency Change Team',
          assignee: 'Change Manager - Emergency',
          sla: '4 hours',
          escalation: 'CAB emergency approval',
          icon: 'GitBranch',
          color: 'var(--color-error)',
        },
        high: {
          team: 'Change Management Team',
          assignee: 'Senior Change Manager',
          sla: '12 hours',
          escalation: 'CAB approval required',
          icon: 'GitBranch',
          color: 'var(--color-warning)',
        },
        medium: {
          team: 'Change Management Team',
          assignee: 'Change Coordinator',
          sla: '48 hours',
          escalation: 'Standard CAB review',
          icon: 'GitBranch',
          color: 'var(--color-primary)',
        },
        low: {
          team: 'Change Management Team',
          assignee: 'Change Coordinator',
          sla: '5 days',
          escalation: 'Standard CAB review',
          icon: 'GitBranch',
          color: 'var(--color-muted-foreground)',
        },
      },
    };

    return routingRules?.[category]?.[priority];
  };

  const routingInfo = getRoutingInfo();

  if (!routingInfo) return null;

  const routingItems = [
    { icon: 'Users', label: 'Assigned Team', value: routingInfo?.team },
    { icon: 'UserCheck', label: 'Assignee', value: routingInfo?.assignee },
    { icon: 'Clock', label: 'Response SLA', value: routingInfo?.sla },
    { icon: 'TrendingUp', label: 'Escalation Path', value: routingInfo?.escalation },
  ];

  return (
    <motion.div 
      className="p-4 md:p-5 bg-primary/5 border border-primary/30 rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <motion.div 
        className={`flex items-start gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Icon name="Route" size={20} color="var(--color-primary)" />
        </motion.div>
        <div className={`flex-1 min-w-0 ${'text-left'}`}>
          <h3 className="font-semibold text-foreground mb-1">
            Automated Routing Preview
          </h3>
          <p className="text-sm text-muted-foreground caption">
            Based on category and priority selection
          </p>
        </div>
      </motion.div>

      <motion.div 
        className="space-y-3"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {routingItems.map((item, idx) => (
          <motion.div 
            key={idx}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors duration-300"
            variants={{
              hidden: { opacity: 0, x: isRtl ? 10 : -10 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.3 }
              },
            }}
            whileHover={{ x: isRtl ? -4 : 4 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon 
                name={item.icon} 
                size={18} 
                color="var(--color-muted-foreground)" 
                className="mt-0.5 flex-shrink-0" 
              />
            </motion.div>
            <div className={`flex-1 min-w-0 ${'text-left'}`}>
              <p className="text-xs text-muted-foreground caption mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {subject && subject?.length > 10 && (
        <motion.div 
          className="mt-4 pt-4 border-t border-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className={`flex items-center gap-2 text-sm text-success ${isRtl ? 'flex-row-reverse' : ''}`}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Icon name="CheckCircle2" size={16} />
            </motion.div>
            <span className="font-medium">Routing rules validated</span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RoutingPreview;