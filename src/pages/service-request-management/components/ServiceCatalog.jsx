import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import {
  CATALOG_CATEGORY_LABELS_AR,
  CATALOG_SERVICE_DESCRIPTIONS_AR,
  CATALOG_SERVICE_NAMES_AR,
  getLocalizedField,
} from '../../../services/catalogLocalization';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { servicesAPI } from '../../../services/serviceRequestsApi';

const ServiceCatalog = ({ expanded = false, onRequestService }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isHiddenCatalogItem = (service) => {
    const name = String(service?.name || '').trim().toLowerCase();
    const category = String(service?.category || '').trim().toLowerCase();
    return category === 'hardware' || name === 'macbook pro m3';
  };

  const localizeText = useCallback((value, map = {}) => {
    const raw = String(value || '').trim();
    return getLocalizedField({ value: raw, valueAr: map[raw.toLowerCase()] }, 'value', map, language) || raw;
  }, [language]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await servicesAPI.getCatalog?.() || { data: [] };
        setServices((res.data || []).filter((service) => !isHiddenCatalogItem(service)));
      } catch (error) {
        console.error('Failed to fetch service catalog:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = useMemo(() => {
    const grouped = services.reduce((acc, service) => {
      const rawCategory = String(service?.category || '').trim();
      const key = rawCategory.toLowerCase();
      if (!key) return acc;
      if (!acc[key]) {
        acc[key] = {
          value: key,
          label: localizeText(rawCategory, CATALOG_CATEGORY_LABELS_AR),
          count: 0,
        };
      }
      acc[key].count += 1;
      return acc;
    }, {});

    return [
      { value: 'all', label: t('allCategories', 'All Categories'), count: services?.length },
      ...Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [localizeText, services, t]);

  const filteredServices = services?.filter(service => {
    const localizedName = getLocalizedField(service, 'name', CATALOG_SERVICE_NAMES_AR, language);
    const localizedDesc = getLocalizedField(service, 'description', CATALOG_SERVICE_DESCRIPTIONS_AR, language);
    const matchesSearch = String(localizedName || '').toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         String(localizedDesc || '').toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || String(service?.category || '').trim().toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServiceSelect = (service) => {
    onRequestService?.(service);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'onboarding': return 'UserPlus';
      case 'equipment': return 'Monitor';
      case 'software': return 'Package';
      case 'security': return 'Shield';
      case 'facilities': return 'Building';
      case 'support': return 'Headphones';
      default: return 'Package';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border operations-shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">{t('serviceCatalog', 'Service Catalog')}</h2>
          <div className="animate-pulse">
            <div className="w-20 h-6 bg-muted rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)]?.map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t('serviceCatalog', 'Service Catalog')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredServices?.length} {t('servicesAvailable', 'services available')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/service-catalog')}>
          <Icon name="Settings" size={16} />
          <span className="ms-2">{t('manage', 'Manage')}</span>
        </Button>
      </div>

      {/* Search and Categories */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchServices', 'Search services...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories?.map(category => (
            <Button
              key={category?.value}
              variant={selectedCategory === category?.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category?.value)}
              className="text-xs"
            >
              <Icon name={getCategoryIcon(category?.value)} size={14} />
              <span className="ms-1">{category?.label}</span>
              <span className="ms-1 opacity-70">({category?.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Service Cards */}
      <div className={`grid grid-cols-1 ${expanded ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-2'} gap-4`}>
        {filteredServices?.map(service => (
          <div
            key={service?.id}
            className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => handleServiceSelect(service)}
          >
            {/* Service Icon and Popularity */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={service?.icon} size={20} className="text-foreground" />
                  </div>
                  <div className="ms-3">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {getLocalizedField(service, 'name', CATALOG_SERVICE_NAMES_AR, language)}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {service?.requiresApproval ? t('approvalRequired', 'Approval required') : t('noApprovalRequired', 'No approval required')}
                    </span>
                  </div>
                </div>
              </div>
              {service?.approvalRequired && (
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  {t('approvalRequired', 'Approval Required')}
                </div>
              )}
            </div>

            {/* Service Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {getLocalizedField(service, 'description', CATALOG_SERVICE_DESCRIPTIONS_AR, language)}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('category', 'Category')}:</span>
                <span className="font-medium text-foreground capitalize">
                  {localizeText(service?.category, CATALOG_CATEGORY_LABELS_AR)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('slaHours', 'SLA Hours')}:</span>
                <span className="font-medium text-foreground">{service?.defaultSlaHours ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('totalRequests', 'Total Requests')}:</span>
                <span className="font-medium text-foreground">{service?.requestCount?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* Request Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={(e) => {
                e?.stopPropagation?.();
                handleServiceSelect(service);
              }}
            >
              <Icon name="Plus" size={14} />
              <span className="ms-2">{t('requestService', 'Request Service')}</span>
            </Button>
          </div>
        ))}
      </div>

      {filteredServices?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t('noServicesFound', 'No services found')}</h3>
          <p className="text-muted-foreground">
            {t('tryAdjustingSearchCategory', 'Try adjusting your search or category filter')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalog;

