import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { ticketsAPI } from '../../services/api';

const SearchResults = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusOptions = [
    { value: '', label: t('allStatuses', 'All Statuses') },
    { value: 'Open', label: t('open', 'Open') },
    { value: 'In Progress', label: t('inProgress', 'In Progress') },
    { value: 'Pending', label: t('pending', 'Pending') },
    { value: 'Resolved', label: t('resolved', 'Resolved') },
    { value: 'Closed', label: t('closed', 'Closed') },
  ];

  const priorityOptions = [
    { value: '', label: t('allPriorities', 'All Priorities') },
    { value: 'Critical', label: t('critical', 'Critical') },
    { value: 'High', label: t('high', 'High') },
    { value: 'Medium', label: t('medium', 'Medium') },
    { value: 'Low', label: t('low', 'Low') },
  ];

  const runSearch = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await ticketsAPI.search(params);
      setResults(response.data || []);
    } catch (searchError) {
      console.error('Ticket search failed:', searchError);
      setError(t('loadingTicketResults', 'Failed to load search results.'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      search: searchParams.get('q') || undefined,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      category: searchParams.get('category') || undefined,
    };
    runSearch(params);
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextParams = {};
    if (query.trim()) nextParams.q = query.trim();
    if (status) nextParams.status = status;
    if (priority) nextParams.priority = priority;
    setSearchParams(nextParams);
  };

  const openTicket = (ticket) => {
    navigate(`/ticket-details/${ticket.id}`);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
            {t('searchResults', 'Search Results')}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground caption mt-1">
            {t('searchResultsDescription', 'Search the live ticket interface then jump directly to ticket details.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px_auto] gap-3">
            <Input
              type="search"
              label={t('search', 'Search')}
              placeholder={t('searchPlaceholderLong', 'Ticket number, title, requester, or description')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              label={t('status', 'Status')}
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            <Select
              label={t('priority', 'Priority')}
              options={priorityOptions}
              value={priority}
              onChange={setPriority}
            />
            <div className="flex items-end">
              <Button type="submit" variant="default" iconName="Search" iconPosition="left" className="w-full md:w-auto">
                {t('search', 'Search')}
              </Button>
            </div>
          </div>
        </form>

        <div className="mb-6">
          <ManageEngineOnPremSnapshot
            compact
            title={t('manageEngineSearchContext', 'ManageEngine Search Context')}
            description={t('manageEngineSearchContextDesc', 'Use ServiceDesk and OpManager activity as live context while searching local tickets.')}
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              {t('loadingTicketResults', 'Loading ticket results...')}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <Icon name="Inbox" size={40} className="mx-auto mb-3 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground mb-1">{t('noTicketsFound', 'No tickets found')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('tryDifferentSearch', 'Try a different search term or relax the filters.')}
              </p>
            </div>
          ) : (
            results.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => openTicket(ticket)}
                className="w-full text-left rounded-lg border border-border bg-card p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {ticket.ticketNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {ticket.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-1 truncate">
                      {ticket.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded-full bg-muted">{ticket.priority}</span>
                    <span className="px-2 py-1 rounded-full bg-muted">{ticket.category}</span>
                    <span className="px-2 py-1 rounded-full bg-muted">
                        {ticket.requestedBy?.username || t('notAssigned', 'Not assigned')}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
