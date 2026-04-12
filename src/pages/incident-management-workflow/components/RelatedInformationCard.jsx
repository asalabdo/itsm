import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { assetsAPI, knowledgeBaseAPI, ticketsAPI } from '../../../services/api';

const RelatedInformationCard = ({ incident }) => {
  const [activeTab, setActiveTab] = useState('assets');
  const [relatedAssets, setRelatedAssets] = useState([]);
  const [affectedUsers, setAffectedUsers] = useState([]);
  const [historicalIncidents, setHistoricalIncidents] = useState([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalize = (value) => String(value || '').trim();

  useEffect(() => {
    let cancelled = false;

    const fetchRelated = async () => {
      if (!incident?.id) {
        setRelatedAssets([]);
        setAffectedUsers([]);
        setHistoricalIncidents([]);
        setKnowledgeArticles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const query = normalize(incident?.category || incident?.title || incident?.ticketNumber);
        const [ticketsResponse, knowledgeResponse, assetsResponse] = await Promise.all([
          ticketsAPI.search({ search: query || incident?.title || '' }).catch(() => ({ data: [] })),
          knowledgeBaseAPI.search(query || incident?.title || '').catch(() => ({ data: [] })),
          assetsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const relatedTickets = (ticketsResponse?.data || []).filter((ticket) => String(ticket?.id) !== String(incident?.id));
        const mappedIncidents = relatedTickets.slice(0, 5).map((ticket) => ({
          id: ticket?.ticketNumber || `INC-${ticket?.id}`,
          title: ticket?.title || 'Related incident',
          date: ticket?.resolvedAt || ticket?.updatedAt || ticket?.createdAt,
          status: ticket?.status || 'Open',
          resolution: ticket?.resolutionNotes || ticket?.description || 'No resolution notes recorded.',
          similarity: ticket?.category && incident?.category && normalize(ticket?.category).toLowerCase() === normalize(incident?.category).toLowerCase() ? 90 : 60,
        }));

        const groupedUsers = relatedTickets.reduce((acc, ticket) => {
          const requester = ticket?.requestedBy;
          const groupName = requester?.department || requester?.firstName || requester?.lastName || ticket?.department || 'Unassigned';
          const label = normalize(groupName) || 'Unassigned';
          if (!acc[label]) {
            acc[label] = {
              name: label,
              userCount: 0,
              impact: ticket?.priority || 'Medium',
              contactPerson: requester?.firstName ? `${requester?.firstName || ''} ${requester?.lastName || ''}`.trim() : ticket?.requestedByName || 'Unknown',
              phone: requester?.phoneNumber || requester?.phone || 'N/A',
              alternativeAccess: ticket?.status || 'Check ticket updates',
            };
          }
          acc[label].userCount += 1;
          return acc;
        }, {});

        const mappedAssets = (assetsResponse?.data || [])
          .filter((asset) => {
            const incidentOwnerId = incident?.requestedBy?.id || incident?.requestedById;
            const incidentAssigneeId = incident?.assignedTo?.id || incident?.assignedToId;
            return (
              (incidentOwnerId && String(asset?.ownerId) === String(incidentOwnerId)) ||
              (incidentAssigneeId && String(asset?.ownerId) === String(incidentAssigneeId)) ||
              (normalize(asset?.category).toLowerCase() === normalize(incident?.category).toLowerCase())
            );
          })
          .slice(0, 5)
          .map((asset) => ({
            id: asset?.assetTag || `AST-${asset?.id}`,
            name: asset?.name || asset?.assetName || 'Related asset',
            type: asset?.assetType || asset?.type || 'Asset',
            status: asset?.status || 'Unknown',
            location: asset?.location || asset?.site || 'N/A',
            lastChecked: asset?.updatedAt || asset?.createdAt || new Date().toISOString(),
            criticality: asset?.criticality || 'Medium',
          }));

        const mappedArticles = (knowledgeResponse?.data || knowledgeResponse || [])
          .map((article) => ({
            id: article?.id || article?.articleNumber || `KB-${Math.random().toString(36).slice(2, 7)}`,
            title: article?.title || article?.name || 'Knowledge article',
            category: article?.category || incident?.category || 'General',
            lastUpdated: article?.updatedAt || article?.createdAt || new Date().toISOString(),
            rating: article?.rating || 0,
            views: article?.viewCount || article?.views || 0,
            helpful: Boolean(article?.isHelpful || article?.helpful),
          }))
          .slice(0, 5);

        if (!cancelled) {
          setHistoricalIncidents(mappedIncidents);
          setAffectedUsers(Object.values(groupedUsers).slice(0, 5));
          setRelatedAssets(mappedAssets);
          setKnowledgeArticles(mappedArticles);
        }
      } catch (error) {
        console.error('Failed to load related incident data:', error);
        if (!cancelled) {
          setRelatedAssets([]);
          setAffectedUsers([]);
          setHistoricalIncidents([]);
          setKnowledgeArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [incident?.id, incident?.title, incident?.category]);

  const tabs = useMemo(() => [
    { id: 'assets', label: 'Assets', icon: 'Server', count: relatedAssets?.length },
    { id: 'users', label: 'Affected Users', icon: 'Users', count: affectedUsers?.length },
    { id: 'history', label: 'History', icon: 'Clock', count: historicalIncidents?.length },
    { id: 'knowledge', label: 'Knowledge', icon: 'BookOpen', count: knowledgeArticles?.length },
  ], [affectedUsers?.length, historicalIncidents?.length, knowledgeArticles?.length, relatedAssets?.length]);

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
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Unknown';
    const diff = Date.now() - parsed.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Related Information</h3>

        <div className="flex space-x-1 mt-4 overflow-x-auto">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading related data from backend...</div>
        ) : activeTab === 'assets' ? (
          <div className="divide-y divide-border">
            {relatedAssets?.length > 0 ? relatedAssets?.map((asset) => (
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
            )) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No related assets found in the live inventory.
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="divide-y divide-border">
            {affectedUsers?.length > 0 ? affectedUsers?.map((group, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{group?.name}</h4>
                    <p className="text-sm text-muted-foreground">{group?.userCount} users affected</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    group?.impact?.toLowerCase() === 'critical' ? 'bg-error/10 text-error' :
                    group?.impact?.toLowerCase() === 'high' ? 'bg-warning/10 text-warning' : 'bg-blue-500/10 text-blue-500'
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
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No affected user groups were returned by the backend for this incident.
              </div>
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="divide-y divide-border">
            {historicalIncidents?.length > 0 ? historicalIncidents?.map((historyItem) => (
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
                    {formatTimeAgo(historyItem?.date)}
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
            )) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No historical incidents were returned for the current search.
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {knowledgeArticles?.length > 0 ? knowledgeArticles?.map((article) => (
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
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No knowledge base articles matched the live incident data.
              </div>
            )}
          </div>
        )}
      </div>

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
