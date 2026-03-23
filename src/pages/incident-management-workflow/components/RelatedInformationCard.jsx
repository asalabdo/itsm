import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RelatedInformationCard = ({ incident }) => {
  const [activeTab, setActiveTab] = useState('assets');

  const relatedAssets = [
    {
      id: 'SRV-001',
      name: 'Email Server Primary',
      type: 'Server',
      status: 'Down',
      location: 'Data Center A',
      lastChecked: new Date(Date.now() - 15 * 60 * 1000),
      criticality: 'High'
    },
    {
      id: 'NET-005',
      name: 'Core Switch 1',
      type: 'Network Equipment',
      status: 'Operational',
      location: 'Data Center A',
      lastChecked: new Date(Date.now() - 5 * 60 * 1000),
      criticality: 'Critical'
    }
  ];

  const affectedUsers = [
    {
      name: 'Finance Department',
      userCount: 45,
      impact: 'High',
      contactPerson: 'Jane Smith',
      phone: '+1 555-0145',
      alternativeAccess: 'Web client available'
    },
    {
      name: 'Sales Team',
      userCount: 78,
      impact: 'Critical',
      contactPerson: 'Mike Johnson',
      phone: '+1 555-0167',
      alternativeAccess: 'Mobile app only'
    },
    {
      name: 'Support Staff',
      userCount: 23,
      impact: 'Medium',
      contactPerson: 'Sarah Davis',
      phone: '+1 555-0134',
      alternativeAccess: 'Backup system'
    }
  ];

  const historicalIncidents = [
    {
      id: 'INC-2025-001',
      title: 'Email Server Performance Degradation',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'Resolved',
      resolution: 'Restarted email services and optimized database',
      similarity: 85
    },
    {
      id: 'INC-2024-456',
      title: 'Mail Server Connectivity Issues',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'Closed',
      resolution: 'Network configuration update required',
      similarity: 70
    },
    {
      id: 'INC-2024-234',
      title: 'Exchange Server Outage',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'Closed',
      resolution: 'Hardware replacement - power supply failure',
      similarity: 60
    }
  ];

  const knowledgeArticles = [
    {
      id: 'KB-001',
      title: 'Email Server Troubleshooting Guide',
      category: 'Infrastructure',
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      rating: 4.8,
      views: 1247,
      helpful: true
    },
    {
      id: 'KB-045',
      title: 'Exchange Server Recovery Procedures',
      category: 'Infrastructure',
      lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      rating: 4.5,
      views: 892,
      helpful: true
    },
    {
      id: 'KB-123',
      title: 'Network Connectivity Diagnostics',
      category: 'Network',
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rating: 4.2,
      views: 456,
      helpful: false
    }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'down': return 'text-error bg-error/10 border-error';
      case 'operational': return 'text-success bg-success/10 border-success';
      case 'warning': return 'text-warning bg-warning/10 border-warning';
      default: return 'text-muted-foreground bg-muted/10 border-muted';
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality?.toLowerCase()) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-blue-500';
      case 'low': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={12}
        className={`${index < Math.floor(rating) ? 'text-warning fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  const formatTimeAgo = (date) => {
    const diff = Date.now() - date?.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const tabs = [
    { id: 'assets', label: 'Assets', icon: 'Server', count: relatedAssets?.length },
    { id: 'users', label: 'Affected Users', icon: 'Users', count: affectedUsers?.length },
    { id: 'history', label: 'History', icon: 'Clock', count: historicalIncidents?.length },
    { id: 'knowledge', label: 'Knowledge', icon: 'BookOpen', count: knowledgeArticles?.length }
  ];

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Related Information</h3>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {tabs?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab?.icon} size={14} />
              <span>{tab?.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                activeTab === tab?.id 
                  ? 'bg-primary-foreground/20' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {tab?.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {/* Related Assets */}
        {activeTab === 'assets' && (
          <div className="divide-y divide-border">
            {relatedAssets?.map(asset => (
              <div key={asset?.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{asset?.name}</h4>
                    <p className="text-sm text-muted-foreground">{asset?.id} • {asset?.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(asset?.status)}`}>
                    {asset?.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium text-foreground">{asset?.location}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Criticality:</span>
                    <p className={`font-medium ${getCriticalityColor(asset?.criticality)}`}>
                      {asset?.criticality}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Last checked: {formatTimeAgo(asset?.lastChecked)}
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-1 hover:bg-muted rounded">
                      <Icon name="Eye" size={12} className="text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <Icon name="Settings" size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Affected Users */}
        {activeTab === 'users' && (
          <div className="divide-y divide-border">
            {affectedUsers?.map((group, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{group?.name}</h4>
                    <p className="text-sm text-muted-foreground">{group?.userCount} users affected</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    group?.impact === 'Critical' ? 'bg-error/10 text-error' :
                    group?.impact === 'High'? 'bg-warning/10 text-warning' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {group?.impact} Impact
                  </span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-medium text-foreground">{group?.contactPerson}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium text-foreground">{group?.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alternative Access:</span>
                    <p className="font-medium text-foreground">{group?.alternativeAccess}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors">
                      Notify
                    </button>
                    <button className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 transition-colors">
                      Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Historical Incidents */}
        {activeTab === 'history' && (
          <div className="divide-y divide-border">
            {historicalIncidents?.map(historyItem => (
              <div key={historyItem?.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">{historyItem?.title}</h4>
                    <p className="text-xs text-muted-foreground">{historyItem?.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-success/10 text-success rounded">
                      {historyItem?.similarity}% similar
                    </span>
                    <span className="px-2 py-1 text-xs bg-muted/10 text-muted-foreground rounded">
                      {historyItem?.status}
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-foreground">
                    <span className="font-medium text-muted-foreground">Resolution: </span>
                    {historyItem?.resolution}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {historyItem?.date?.toLocaleDateString()}
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-1 hover:bg-muted rounded">
                      <Icon name="Eye" size={12} className="text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <Icon name="Copy" size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Knowledge Articles */}
        {activeTab === 'knowledge' && (
          <div className="divide-y divide-border">
            {knowledgeArticles?.map(article => (
              <div key={article?.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">{article?.title}</h4>
                    <p className="text-xs text-muted-foreground">{article?.id} • {article?.category}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {article?.helpful && (
                      <Icon name="ThumbsUp" size={12} className="text-success" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {article?.views} views
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-xs mb-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-0.5">
                      {renderStars(article?.rating)}
                    </div>
                    <span className="text-muted-foreground">({article?.rating})</span>
                  </div>
                  <span className="text-muted-foreground">
                    Updated {formatTimeAgo(article?.lastUpdated)}
                  </span>
                </div>
                
                <div className="flex items-center justify-end">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors">
                      View
                    </button>
                    <button className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 transition-colors">
                      Apply Solution
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-accent text-accent-foreground text-xs rounded hover:bg-accent/90 transition-colors">
            Link Asset
          </button>
          <button className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 transition-colors">
            Add User Group
          </button>
          <button className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded hover:bg-muted/80 transition-colors">
            Create KB Article
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelatedInformationCard;