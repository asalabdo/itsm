import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { ticketsAPI } from '../../services/api';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await ticketsAPI.search(params);
      setResults(response.data || []);
    } catch (searchError) {
      console.error('Ticket search failed:', searchError);
      setError('We could not load search results right now.');
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
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
            Search Results
          </h1>
          <p className="text-sm md:text-base text-muted-foreground caption mt-1">
            Search the live ticket API, then jump directly into ticket details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px_auto] gap-3">
            <Input
              type="search"
              label="Search"
              placeholder="Ticket number, title, requester, or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            <Select
              label="Priority"
              options={priorityOptions}
              value={priority}
              onChange={setPriority}
            />
            <div className="flex items-end">
              <Button type="submit" variant="default" iconName="Search" iconPosition="left" className="w-full md:w-auto">
                Search
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              Loading ticket results...
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <Icon name="Inbox" size={40} className="mx-auto mb-3 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground mb-1">No tickets found</h2>
              <p className="text-sm text-muted-foreground">
                Try a different search term or loosen the filters.
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
                      {ticket.requestedBy?.username || 'Unassigned'}
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
