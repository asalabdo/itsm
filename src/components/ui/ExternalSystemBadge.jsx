import React from 'react';

const ExternalSystemBadge = ({ externalSystem, externalId }) => {
  if (!externalSystem) return null;

  const getSystemColor = (system) => {
    switch (system?.toLowerCase()) {
      case 'manageengine':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300';
      case 'servicenow':
        return 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300';
      case 'jira':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-300';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getSystemIcon = (system) => {
    switch (system?.toLowerCase()) {
      case 'manageengine':
        return '🔗';
      case 'servicenow':
        return '🎯';
      case 'jira':
        return '📋';
      default:
        return '🔗';
    }
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getSystemColor(externalSystem)}`}>
      <span className="mr-1">{getSystemIcon(externalSystem)}</span>
      <span className="capitalize">{externalSystem}</span>
      {externalId && (
        <span className="ml-1 text-xs opacity-75">#{externalId}</span>
      )}
    </div>
  );
};

export default ExternalSystemBadge;
