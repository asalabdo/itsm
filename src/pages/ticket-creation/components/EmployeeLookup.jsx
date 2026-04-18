import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import { organizationUnitAPI } from '../../../services/api';
import { formatLocalizedValue, getLocalizedDisplayName } from '../../../services/displayValue';
import { ORG_UNIT_SOURCES, groupByOrganizationUnit, getOrganizationUnitLabel } from '../../../services/organizationUnits';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AVATAR_BACKGROUNDS = [
  'bg-sky-500/15 text-sky-600',
  'bg-emerald-500/15 text-emerald-600',
  'bg-amber-500/15 text-amber-600',
  'bg-rose-500/15 text-rose-600',
  'bg-violet-500/15 text-violet-600',
  'bg-cyan-500/15 text-cyan-600',
];

const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'U';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

const getAvatarTone = (name) => {
  const seed = String(name || 'user')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_BACKGROUNDS[seed % AVATAR_BACKGROUNDS.length];
};

const EmployeeLookup = ({ selectedEmployee, onEmployeeSelect }) => {
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);

      try {
        const responses = await Promise.all(
          ORG_UNIT_SOURCES.map((source) => organizationUnitAPI.getUsers(source.id, 100, 0))
        );

        const seen = new Set();
        const merged = [];

        responses.forEach((response, index) => {
          const source = ORG_UNIT_SOURCES[index];
          const items =
            response?.data?.result?.items ||
            response?.data?.result ||
            response?.data?.items ||
            response?.data ||
            [];

          (Array.isArray(items) ? items : []).forEach((employee) => {
            const identity = employee?.user || employee?.currentUser || employee?.member || employee?.person || employee || {};
            const name = getLocalizedDisplayName(identity) || getLocalizedDisplayName(employee) || 'Unknown user';
            const username = formatLocalizedValue(identity?.userName || identity?.username || employee?.userName || employee?.username) || name;
            const email = formatLocalizedValue(identity?.emailAddress || identity?.email || employee?.emailAddress || employee?.email);
            const department = formatLocalizedValue(employee?.organizationUnitName || employee?.organizationUnit?.displayName || source.label);
            const jobTitle = formatLocalizedValue(identity?.jobTitle || identity?.title || employee?.jobTitle || employee?.title || department);
            const ticketCount = Number(employee?.ticketCount || employee?.ticketsCount || 0);
            const key = String(identity?.id || employee?.id || username || email || name || `${source.id}-${merged.length}`);

            if (seen.has(key)) {
              return;
            }

            seen.add(key);
            merged.push({
              ...employee,
              ...identity,
              id: identity?.id || employee?.id || key,
              name,
              fullName: name,
              username,
              userName: username,
              email,
              emailAddress: email,
              department,
              jobTitle,
              organizationUnitId: source.id,
              organizationUnitName: source.label,
              ticketCount,
            });
          });
        });

        setEmployees(merged);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const getEmployeeLabel = (employee) =>
    getLocalizedDisplayName(employee) ||
    formatLocalizedValue(employee?.fullName) ||
    formatLocalizedValue(employee?.name) ||
    formatLocalizedValue(employee?.username) ||
    `User ${employee?.id || ''}`.trim();

  const renderAvatar = (employee) => {
    const label = getEmployeeLabel(employee);
    const initials = getInitials(label);
    const toneClass = getAvatarTone(label);

    if (employee?.avatar) {
      return (
        <Image
          src={employee?.avatar}
          alt={employee?.avatarAlt || label}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0 bg-muted"
        />
      );
    }

    return (
      <div
        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${toneClass}`}
        aria-hidden="true"
      >
        {initials}
      </div>
    );
  };

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
    const value = e?.target?.value || '';
    setSearchQuery(value);

    if (value.length > 0) {
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
    setSearchQuery(getEmployeeLabel(employee));
    setShowResults(false);
  };

  const filteredEmployees = employees.filter((employee) => {
    const query = searchQuery.toLowerCase();
    return (
      getEmployeeLabel(employee).toLowerCase().includes(query) ||
      formatLocalizedValue(employee?.email).toLowerCase().includes(query) ||
      formatLocalizedValue(employee?.department).toLowerCase().includes(query) ||
      formatLocalizedValue(employee?.jobTitle).toLowerCase().includes(query)
    );
  });
  const groupedEmployees = groupByOrganizationUnit(
    filteredEmployees,
    (employee) => employee?.organizationUnitId || employee?.organizationUnit?.id,
    (employee) => getOrganizationUnitLabel(employee?.organizationUnitId || employee?.organizationUnit?.id, employee?.organizationUnitName || employee?.department)
  );

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
        <Input
          label={t('employee', 'Employee')}
          type="text"
          placeholder={t('searchEmployeePlaceholder', 'Start typing to search for existing employees')}
          value={searchQuery}
          onChange={handleSearchChange}
          required
          description={t('searchEmployeeDesc', 'Start typing to search for existing employees')}
        />

        <AnimatePresence>
          {showResults && (
            <motion.div
              className={`absolute top-full ${isRtl ? 'right-0 left-0' : 'left-0 right-0'} mt-2 bg-popover border border-border rounded-xl shadow-elevation-3 z-50 max-h-80 overflow-y-auto`}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading || loadingEmployees ? (
                <div className="p-8 text-center">
                  <Icon name="Loader2" size={32} className="mx-auto mb-2 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">{t('searchingEmployees', 'Searching employees...')}</p>
                </div>
              ) : filteredEmployees.length > 0 ? (
                <motion.div
                  className="py-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {groupedEmployees.map((group) => (
                    <div key={group.key} className="py-1">
                      <div className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {group.label}
                        <span className={`${isRtl ? 'mr-2' : 'ml-2'} text-primary`}>({group.items.length})</span>
                      </div>
                      {group.items.map((employee) => (
                        <motion.button
                          key={employee?.id}
                          type="button"
                          onClick={() => handleEmployeeSelect(employee)}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-all duration-300 text-left rounded-lg mx-1`}
                          whileHover={{ x: isRtl ? -4 : 4 }}
                          whileTap={{ scale: 0.98 }}
                          variants={{
                            hidden: { opacity: 0, x: isRtl ? 10 : -10 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
                          }}
                        >
                          {renderAvatar(employee)}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {getEmployeeLabel(employee)}
                              </h4>
                              <motion.span
                                className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded caption whitespace-nowrap"
                                whileHover={{ scale: 1.05 }}
                              >
                                {employee?.ticketCount || 0} {t('tickets', 'tickets')}
                              </motion.span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate caption">
                              {formatLocalizedValue(employee?.email) || t('na', 'N/A')}
                            </p>
                            <p className="text-xs text-muted-foreground truncate caption">
                              {[formatLocalizedValue(employee?.department), formatLocalizedValue(employee?.jobTitle)].filter(Boolean).join(' • ') || t('noDepartment', 'No department')}
                            </p>
                          </div>

                          <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: isRtl ? -4 : 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon name={isRtl ? "ChevronLeft" : "ChevronRight"} size={18} color="var(--color-muted-foreground)" />
                          </motion.div>
                        </motion.button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <div className="p-8 text-center">
                  <Icon name="UserX" size={32} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground mb-2">{t('noEmployeesFound', 'No employees found')}</p>
                  <p className="text-xs text-muted-foreground caption">{t('tryDifferentSearchTerm', 'Try a different search term')}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            className="p-4 bg-muted/50 rounded-xl border border-border"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {renderAvatar(selectedEmployee)}
              </motion.div>

              <div className={`flex-1 min-w-0 ${'text-left'}`}>
                <h4 className="font-semibold text-foreground mb-1">{getEmployeeLabel(selectedEmployee)}</h4>
                <motion.div
                  className="space-y-1"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.p
                    className={`text-sm text-muted-foreground caption flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  >
                    <Icon name="Mail" size={14} />
                    {formatLocalizedValue(selectedEmployee?.email) || t('na', 'N/A')}
                  </motion.p>
                  <motion.p
                    className={`text-sm text-muted-foreground caption flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  >
                    <Icon name="Building2" size={14} />
                    {[formatLocalizedValue(selectedEmployee?.department), formatLocalizedValue(selectedEmployee?.jobTitle)].filter(Boolean).join(' • ') || t('noDepartment', 'No department')}
                  </motion.p>
                  <motion.p
                    className={`text-sm text-muted-foreground caption flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  >
                    <Icon name="Phone" size={14} />
                    {formatLocalizedValue(selectedEmployee?.phoneNumber || selectedEmployee?.phone) || t('noPhone', 'No phone')}
                  </motion.p>
                </motion.div>
              </div>

              <motion.button
                type="button"
                onClick={() => {
                  onEmployeeSelect(null);
                  setSearchQuery('');
                }}
                className="p-1 hover:bg-muted rounded transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon name="X" size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeLookup;
