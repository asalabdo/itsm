import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ServiceSelector from './ServiceSelector';

const CategorySelector = ({ selectedCategory, onCategoryChange, selectedService, onServiceSelect, selectedModule, onModuleChange }) => {
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  const modules = [
    { id: 'it-support', name: 'IT Support', nameAr: 'الدعم التقني', icon: 'Monitor' },
    { id: 'hr-services', name: 'HR Services', nameAr: 'خدمات الموارد البشرية', icon: 'Users' },
    { id: 'facilities', name: 'Facilities', nameAr: 'المرافق', icon: 'Building' },
    { id: 'finance', name: 'Finance', nameAr: 'المالية', icon: 'DollarSign' },
  ];

  const categoriesByModule = {
    'it-support': [
      {
        id: 'technical-support',
        name: 'Technical Support',
        nameAr: 'دعم فني',
        icon: 'Wrench',
        description: 'Device repairs, network connections, email issues',
        color: 'var(--color-primary)',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        id: 'device-replacement',
        name: 'Device Replacement Request',
        nameAr: 'طلب إستبدال جهاز',
        icon: 'RefreshCw',
        description: 'Computer, printer, keyboard, mouse replacement',
        color: 'var(--color-warning)',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
      {
        id: 'cyber-security',
        name: 'Cyber Security',
        nameAr: 'الامن السيبراني',
        icon: 'Shield',
        description: 'Security issues, VPN access, antivirus support',
        color: 'var(--color-purple-600)',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      },
      {
        id: 'maintenance-service',
        name: 'Maintenance Service',
        nameAr: 'طلب خدمة صيانة مرفق',
        icon: 'Settings',
        description: 'Facility maintenance, meeting rooms, phone services',
        color: 'var(--color-error)',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
    ],
    'hr-services': [
      {
        id: 'hr-system',
        name: 'HR System',
        nameAr: 'خدمات الموظفين',
        icon: 'Users',
        description: 'Vacation requests, attendance, employee services',
        color: 'var(--color-success)',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        id: 'attendance',
        name: 'Attendance',
        nameAr: 'الحضور والانصراف',
        icon: 'Clock',
        description: 'Attendance system, card issues, time tracking',
        color: 'var(--color-primary)',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
    ],
    'facilities': [
      {
        id: 'maintenance-service',
        name: 'Maintenance Service',
        nameAr: 'طلب خدمة صيانة مرفق',
        icon: 'Settings',
        description: 'Facility maintenance, meeting rooms, phone services',
        color: 'var(--color-error)',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
    ],
    'finance': [
      {
        id: 'finance-system',
        name: 'Finance System',
        nameAr: 'النظام المالي والميزانية',
        icon: 'DollarSign',
        description: 'Financial system issues and requests',
        color: 'var(--color-success)',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        id: 'purchasing',
        name: 'Purchasing',
        nameAr: 'المشتريات',
        icon: 'ShoppingCart',
        description: 'Purchase requests and procurement',
        color: 'var(--color-warning)',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
    ],
  };

  const categories = categoriesByModule[selectedModule] || [];

  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);
    setShowServiceSelector(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Module Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Module <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modules.map((module) => (
              <button
                key={module.id}
                type="button"
                onClick={() => onModuleChange(module.id)}
                className={`p-3 rounded-lg border-2 transition-smooth text-center ${
                  selectedModule === module.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-card border-border hover:border-blue-200'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon
                    name={module.icon}
                    size={20}
                    color={selectedModule === module.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
                  />
                  <div>
                    <p className="text-sm font-medium">{module.name}</p>
                    <p className="text-xs text-muted-foreground">{module.nameAr}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        {selectedModule && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Ticket Category <span className="text-error">*</span>
            </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {categories?.map((category) => (
            <button
              key={category?.id}
              type="button"
              onClick={() => handleCategoryClick(category?.id)}
              className={`p-4 md:p-5 rounded-lg border-2 transition-smooth hover:shadow-elevation-2 text-left ${
                selectedCategory === category?.id
                  ? `${category?.bgColor} ${category?.borderColor} shadow-elevation-2`
                  : 'bg-card border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedCategory === category?.id ? category?.bgColor : 'bg-muted'
                  }`}
                >
                  <Icon
                    name={category?.icon}
                    size={20}
                    color={selectedCategory === category?.id ? category?.color : 'var(--color-muted-foreground)'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                    {category?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {category?.nameAr}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                    {category?.description}
                  </p>
                </div>
                {selectedCategory === category?.id && (
                  <Icon name="CheckCircle2" size={20} color={category?.color} />
                )}
              </div>
            </button>
          ))}
            </div>
          </div>
        )}
        
        {selectedService && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">{selectedService.nameEn}</p>
                <p className="text-xs text-blue-700">{selectedService.nameAr}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowServiceSelector(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showServiceSelector && (
        <ServiceSelector
          category={selectedCategory}
          selectedService={selectedService}
          onServiceSelect={onServiceSelect}
          onClose={() => setShowServiceSelector(false)}
        />
      )}
    </>
  );
};

export default CategorySelector;