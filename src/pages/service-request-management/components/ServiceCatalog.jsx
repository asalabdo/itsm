import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceCatalog = ({ expanded = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Mock service catalog data
    const mockServices = [
      {
        id: 1,
        name: 'New Employee Setup',
        category: 'onboarding',
        description: 'Complete setup for new employee including accounts, equipment, and access',
        icon: 'UserPlus',
        approvalRequired: true,
        fulfillmentTime: '2-3 business days',
        cost: '$250',
        popularity: 95,
        requestCount: 847,
        fields: ['employee_name', 'department', 'role', 'start_date', 'manager']
      },
      {
        id: 2,
        name: 'Hardware Request',
        category: 'equipment',
        description: 'Request laptops, monitors, peripherals, and other hardware',
        icon: 'Monitor',
        approvalRequired: true,
        fulfillmentTime: '3-5 business days',
        cost: 'Varies',
        popularity: 88,
        requestCount: 623,
        fields: ['equipment_type', 'specifications', 'business_justification', 'urgency']
      },
      {
        id: 3,
        name: 'Software License',
        category: 'software',
        description: 'Request access to software applications and license renewals',
        icon: 'Package',
        approvalRequired: true,
        fulfillmentTime: '1-2 business days',
        cost: 'License dependent',
        popularity: 92,
        requestCount: 1205,
        fields: ['software_name', 'license_type', 'duration', 'team_members']
      },
      {
        id: 4,
        name: 'Access Request',
        category: 'security',
        description: 'Request access to systems, applications, or data repositories',
        icon: 'Key',
        approvalRequired: true,
        fulfillmentTime: '1 business day',
        cost: 'Free',
        popularity: 87,
        requestCount: 934,
        fields: ['system_name', 'access_level', 'business_justification', 'duration']
      },
      {
        id: 5,
        name: 'Meeting Room Booking',
        category: 'facilities',
        description: 'Reserve conference rooms and meeting spaces',
        icon: 'Calendar',
        approvalRequired: false,
        fulfillmentTime: 'Immediate',
        cost: 'Free',
        popularity: 76,
        requestCount: 2341,
        fields: ['room_preference', 'date', 'time', 'duration', 'attendees']
      },
      {
        id: 6,
        name: 'IT Support',
        category: 'support',
        description: 'Technical support for hardware, software, and connectivity issues',
        icon: 'Headphones',
        approvalRequired: false,
        fulfillmentTime: '2-4 hours',
        cost: 'Free',
        popularity: 83,
        requestCount: 1876,
        fields: ['issue_type', 'priority', 'description', 'affected_systems']
      }
    ];

    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 800);
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories', count: services?.length },
    { value: 'onboarding', label: 'Onboarding', count: services?.filter(s => s?.category === 'onboarding')?.length },
    { value: 'equipment', label: 'Equipment', count: services?.filter(s => s?.category === 'equipment')?.length },
    { value: 'software', label: 'Software', count: services?.filter(s => s?.category === 'software')?.length },
    { value: 'security', label: 'Security', count: services?.filter(s => s?.category === 'security')?.length },
    { value: 'facilities', label: 'Facilities', count: services?.filter(s => s?.category === 'facilities')?.length },
    { value: 'support', label: 'Support', count: services?.filter(s => s?.category === 'support')?.length }
  ];

  const filteredServices = services?.filter(service => {
    const matchesSearch = service?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         service?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServiceSelect = (service) => {
    console.log('Selected service:', service);
    // In a real application, this would trigger the request creation wizard
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

  const getPopularityColor = (popularity) => {
    if (popularity >= 90) return 'bg-green-500';
    if (popularity >= 80) return 'bg-blue-500';
    if (popularity >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border operations-shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Service Catalog</h2>
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
          <h2 className="text-xl font-semibold text-foreground">Service Catalog</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredServices?.length} services available
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Settings" size={16} />
          <span className="ml-2">Manage</span>
        </Button>
      </div>

      {/* Search and Categories */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
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
              <span className="ml-1">{category?.label}</span>
              <span className="ml-1 opacity-70">({category?.count})</span>
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
                <div className="ml-3">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {service?.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${getPopularityColor(service?.popularity)}`}></div>
                    <span className="text-xs text-muted-foreground">{service?.popularity}% popularity</span>
                  </div>
                </div>
              </div>
              {service?.approvalRequired && (
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Approval Required
                </div>
              )}
            </div>

            {/* Service Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {service?.description}
            </p>

            {/* Service Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fulfillment Time:</span>
                <span className="font-medium text-foreground">{service?.fulfillmentTime}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-medium text-foreground">{service?.cost}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Requests:</span>
                <span className="font-medium text-foreground">{service?.requestCount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Request Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <Icon name="Plus" size={14} />
              <span className="ml-2">Request Service</span>
            </Button>
          </div>
        ))}
      </div>

      {filteredServices?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No services found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalog;