import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AgentPerformanceTable = () => {
  const [sortField, setSortField] = useState('resolved');
  const [sortDirection, setSortDirection] = useState('desc');

  const agents = [
  {
    id: 1,
    name: "Sarah Alrashedea",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1a9e8814c-1763296696290.png",
    avatarAlt: "Professional headshot of woman with brown hair in business attire smiling at camera",
    assigned: 48,
    resolved: 45,
    pending: 3,
    avgResolutionTime: "3.2h",
    satisfaction: 4.8,
    slaCompliance: 96
  },
  {
    id: 2,
    name: "Abdulrahman Salem",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1b96df5c7-1763298849215.png",
    avatarAlt: "Professional headshot of Asian man with black hair in navy suit with confident expression",
    assigned: 52,
    resolved: 48,
    pending: 4,
    avgResolutionTime: "2.8h",
    satisfaction: 4.9,
    slaCompliance: 98
  },
  {
    id: 3,
    name: "Abdullah Aldosri",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1975607e9-1763295500639.png",
    avatarAlt: "Professional headshot of Hispanic woman with long dark hair in white blouse smiling warmly",
    assigned: 45,
    resolved: 42,
    pending: 3,
    avgResolutionTime: "3.5h",
    satisfaction: 4.7,
    slaCompliance: 94
  },
  {
    id: 4,
    name: "Thamer Almazini",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1d90a96ad-1763299909299.png",
    avatarAlt: "Professional headshot of man with short brown hair in gray suit with friendly smile",
    assigned: 41,
    resolved: 38,
    pending: 3,
    avgResolutionTime: "4.1h",
    satisfaction: 4.6,
    slaCompliance: 92
  },
  {
    id: 5,
    name: "Amira Alkhargi",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#110d6e0d8-1763301538824.png",
    avatarAlt: "Professional headshot of Indian woman with black hair in professional attire with warm expression",
    assigned: 50,
    resolved: 47,
    pending: 3,
    avgResolutionTime: "3.0h",
    satisfaction: 4.9,
    slaCompliance: 97
  }];


  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAgents = [...agents]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'avgResolutionTime') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <Icon name="ChevronsUpDown" size={16} className="text-muted-foreground" />;
    }
    return sortDirection === 'asc' ?
    <Icon name="ChevronUp" size={16} className="text-primary" /> :

    <Icon name="ChevronDown" size={16} className="text-primary" />;

  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Users" size={20} color="var(--color-primary)" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Agent Performance</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Agent</th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-smooth"
                onClick={() => handleSort('assigned')}>

                <div className="flex items-center gap-2">
                  Assigned
                  <SortIcon field="assigned" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-smooth"
                onClick={() => handleSort('resolved')}>

                <div className="flex items-center gap-2">
                  Resolved
                  <SortIcon field="resolved" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-smooth"
                onClick={() => handleSort('pending')}>

                <div className="flex items-center gap-2">
                  Pending
                  <SortIcon field="pending" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-smooth"
                onClick={() => handleSort('avgResolutionTime')}>

                <div className="flex items-center gap-2">
                  Avg Time
                  <SortIcon field="avgResolutionTime" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-smooth"
                onClick={() => handleSort('satisfaction')}>

                <div className="flex items-center gap-2">
                  CSAT
                  <SortIcon field="satisfaction" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-smooth"
                onClick={() => handleSort('slaCompliance')}>

                <div className="flex items-center gap-2">
                  SLA %
                  <SortIcon field="slaCompliance" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAgents?.map((agent, index) =>
            <tr
              key={agent?.id}
              className={`border-t border-border hover:bg-muted/30 transition-smooth ${
              index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`
              }>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                    src={agent?.avatar}
                    alt={agent?.avatarAlt}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />

                    <span className="text-sm font-medium text-foreground">{agent?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground data-text">{agent?.assigned}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-success font-medium data-text">{agent?.resolved}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-warning font-medium data-text">{agent?.pending}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground data-text">{agent?.avgResolutionTime}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={14} color="var(--color-warning)" fill="var(--color-warning)" />
                    <span className="text-sm text-foreground data-text">{agent?.satisfaction}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                  className={`text-sm font-medium data-text ${
                  agent?.slaCompliance >= 95 ? 'text-success' : agent?.slaCompliance >= 90 ? 'text-warning' : 'text-error'}`
                  }>

                    {agent?.slaCompliance}%
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

};

export default AgentPerformanceTable;