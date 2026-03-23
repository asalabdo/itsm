import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TicketActions = ({ ticket, onStatusChange, onPriorityChange, onAssign, onEscalate }) => {
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status);
  const [selectedPriority, setSelectedPriority] = useState(ticket?.priority);
  const [selectedAgent, setSelectedAgent] = useState(ticket?.assignedTo?.id);

  const statusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Pending', label: 'Pending Customer' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' },
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'High', label: 'High Priority' },
    { value: 'Urgent', label: 'Urgent' },
  ];

  const agentOptions = [
    { value: 'agent1', label: 'Sarah Mitchell' },
    { value: 'agent2', label: 'Michael Chen' },
    { value: 'agent3', label: 'Emily Rodriguez' },
    { value: 'agent4', label: 'David Thompson' },
  ];

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    onStatusChange(value);
  };

  const handlePriorityChange = (value) => {
    setSelectedPriority(value);
    onPriorityChange(value);
  };

  const handleAgentChange = (value) => {
    setSelectedAgent(value);
    onAssign(value);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">Quick Actions</h3>

        <div className="space-y-4 md:space-y-6">
          <div>
            <Select
              label="Status"
              options={statusOptions}
              value={selectedStatus}
              onChange={handleStatusChange}
            />
          </div>

          <div>
            <Select
              label="Priority"
              options={priorityOptions}
              value={selectedPriority}
              onChange={handlePriorityChange}
            />
          </div>

          <div>
            <Select
              label="Assign To"
              options={agentOptions}
              value={selectedAgent}
              onChange={handleAgentChange}
              searchable
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              fullWidth
              iconName="AlertTriangle"
              iconPosition="left"
              onClick={onEscalate}
            >
              Escalate Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Additional Actions</h3>

        <div className="space-y-2">
          <Button
            variant="outline"
            fullWidth
            iconName="Link"
            iconPosition="left"
            size="sm"
          >
            Link Related Ticket
          </Button>

          <Button
            variant="outline"
            fullWidth
            iconName="Copy"
            iconPosition="left"
            size="sm"
          >
            Duplicate Ticket
          </Button>

          <Button
            variant="outline"
            fullWidth
            iconName="Archive"
            iconPosition="left"
            size="sm"
          >
            Archive
          </Button>

          <Button
            variant="outline"
            fullWidth
            iconName="Share2"
            iconPosition="left"
            size="sm"
          >
            Share with Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketActions;