import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const SearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const quickFilters = [
    { label: 'My Open Tickets', icon: 'Ticket', params: { status: 'Open' } },
    { label: 'High Priority', icon: 'AlertCircle', params: { priority: 'High' } },
    { label: 'Resolved Tickets', icon: 'CheckCircle', params: { status: 'Resolved' } },
    { label: 'Critical Alerts', icon: 'Clock', params: { priority: 'Critical' } },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setIsExpanded(false);
        setShowResults(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event?.metaKey || event?.ctrlKey) && event?.key === 'k') {
        event?.preventDefault();
        setIsExpanded(true);
      }
      if (event?.key === 'Escape') {
        setIsExpanded(false);
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    setShowResults(value?.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsExpanded(false);
      setShowResults(false);
    }
  };

  const handleQuickFilterClick = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });
    navigate(`/search?${searchParams.toString()}`);
    setIsExpanded(false);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      {!isExpanded ? (
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-smooth text-foreground"
          onClick={() => setIsExpanded(true)}
          aria-label="Search"
        >
          <Icon name="Search" size={18} />
          <span className="hidden md:inline text-sm text-muted-foreground caption">
            Search tickets...
          </span>
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background border border-border rounded caption">
            <span>⌘</span>K
          </kbd>
        </button>
      ) : (
        <div className="fixed md:absolute left-0 md:left-auto right-0 top-0 md:top-auto w-full md:w-96 bg-popover border border-border rounded-none md:rounded-md shadow-lg z-dropdown">
          <form onSubmit={handleSearchSubmit} className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Icon name="Search" size={20} color="var(--color-muted-foreground)" />
              <input
                type="text"
                placeholder="Search tickets, customers..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setShowResults(false);
                  setSearchQuery('');
                }}
                className="p-1 hover:bg-muted rounded transition-smooth"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
          </form>

          <div className="max-h-96 overflow-y-auto">
            <div className="py-2 border-t border-border">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground caption">
                Quick Filters
              </div>
              {quickFilters?.map((filter, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-smooth"
                  onClick={() => handleQuickFilterClick(filter?.params)}
                >
                  <Icon
                    name={filter?.icon}
                    size={18}
                    color="var(--color-primary)"
                  />
                  <span className="flex-1 text-left text-sm text-foreground">
                    {filter?.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground caption">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↵</kbd>
                  to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">esc</kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
