import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsBar = ({ onRefresh, onSchedule, onShare, onExport, lastUpdated }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>Last updated: {lastUpdated}</span>
          <button
            onClick={onRefresh}
            className="p-1 rounded-md hover:bg-muted transition-smooth"
            aria-label="Refresh data"
          >
            <Icon name="RefreshCw" size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            iconName="Calendar"
            iconPosition="left"
            onClick={onSchedule}
          >
            Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Share2"
            iconPosition="left"
            onClick={onShare}
          >
            Share
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsBar;