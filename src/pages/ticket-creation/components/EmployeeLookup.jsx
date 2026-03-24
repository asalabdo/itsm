import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';

const EmployeeLookup = ({ selectedEmployee, onEmployeeSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const [employees, setEmployees] = React.useState([]);
  const [loadingEmployees, setLoadingEmployees] = React.useState(false);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const { usersAPI } = await import('../../../services/api');
        const res = await usersAPI.getAll();
        setEmployees(res.data || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const mockEmployees = employees;


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);

    if (value?.length > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
      }, 300);
    } else {
      setShowResults(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    onEmployeeSelect(employee);
    setSearchQuery(employee?.name);
    setShowResults(false);
  };

  const filteredEmployees = mockEmployees?.filter(
    (employee) =>
    employee?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    employee?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    employee?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="relative">
        <Input
          label="Employee"
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={handleSearchChange}
          required
          description="Start typing to search for existing employees" />

        
        {showResults &&
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 max-h-80 overflow-y-auto">
            {isLoading ?
          <div className="p-8 text-center">
                <Icon name="Loader2" size={32} className="mx-auto mb-2 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching employees...</p>
              </div> :
          filteredEmployees?.length > 0 ?
          <div className="py-2">
                {filteredEmployees?.map((employee) =>
            <button
              key={employee?.id}
              type="button"
              onClick={() => handleEmployeeSelect(employee)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-smooth text-left">

                    <Image
                src={employee?.avatar}
                alt={employee?.avatarAlt}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {employee?.name}
                        </h4>
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded caption whitespace-nowrap">
                          {employee?.ticketCount} tickets
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate caption">
                        {employee?.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate caption">
                        {employee?.company}
                      </p>
                    </div>
                    <Icon name="ChevronRight" size={18} color="var(--color-muted-foreground)" />
                  </button>
            )}
              </div> :

          <div className="p-8 text-center">
                <Icon name="UserX" size={32} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground mb-2">No employees found</p>
                <p className="text-xs text-muted-foreground caption">
                  Try a different search term
                </p>
              </div>
          }
          </div>
        }
      </div>
      {selectedEmployee &&
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Image
            src={selectedEmployee?.avatar}
            alt={selectedEmployee?.avatarAlt}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1">{selectedEmployee?.name}</h4>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground caption flex items-center gap-2">
                  <Icon name="Mail" size={14} />
                  {selectedEmployee?.email}
                </p>
                <p className="text-sm text-muted-foreground caption flex items-center gap-2">
                  <Icon name="Building2" size={14} />
                  {selectedEmployee?.company}
                </p>
                <p className="text-sm text-muted-foreground caption flex items-center gap-2">
                  <Icon name="Phone" size={14} />
                  {selectedEmployee?.phone}
                </p>
              </div>
            </div>
            <button
            type="button"
            onClick={() => {
              onEmployeeSelect(null);
              setSearchQuery('');
            }}
            className="p-1 hover:bg-muted rounded transition-smooth">

              <Icon name="X" size={18} />
            </button>
          </div>
        </div>
      }
    </div>);

};

export default EmployeeLookup;