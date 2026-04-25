import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import ServiceSelector from './ServiceSelector';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
  selectedService,
  onServiceSelect,
  selectedModule,
  onModuleChange,
  isReadOnly = false,
}) => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const modules = [
    {
      id: 'it-support',
      name: 'IT Support',
      nameAr: 'الدعم التقني',
      icon: 'Monitor',
      description: 'Technical support, incidents, access, devices & security',
      descriptionAr: 'الدعم التقني، الحوادث، الصلاحيات، الأجهزة والأمن',
      color: 'var(--color-primary)',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badge: null,
    },
    {
      id: 'incident-management',
      name: 'Incident Management',
      nameAr: 'إدارة الحوادث',
      icon: 'AlertTriangle',
      description: 'Report and track P1–P3 incidents and outages',
      descriptionAr: 'الإبلاغ عن الحوادث وتتبعها من P1 إلى P3',
      color: 'var(--color-error)',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badge: 'Urgent',
      badgeAr: 'عاجل',
    },
    {
      id: 'service-requests',
      name: 'Service Requests',
      nameAr: 'طلبات الخدمة',
      icon: 'ClipboardList',
      description: 'New equipment, onboarding, offboarding, workspace setup',
      descriptionAr: 'الأجهزة الجديدة، تهيئة الموظفين، إعداد مكان العمل',
      color: 'var(--color-teal-600)',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      badge: null,
    },
    {
      id: 'change-management',
      name: 'Change Management',
      nameAr: 'إدارة التغييرات',
      icon: 'GitBranch',
      description: 'Standard, normal and emergency changes with CAB approval',
      descriptionAr: 'التغييرات الاعتيادية والعادية والطارئة مع اعتماد لجنة التغيير',
      color: 'var(--color-slate-600)',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      badge: null,
    },
    {
      id: 'access-management',
      name: 'Access Management',
      nameAr: 'إدارة الصلاحيات',
      icon: 'KeyRound',
      description: 'User accounts, passwords, permissions, VPN and MFA',
      descriptionAr: 'الحسابات، كلمات المرور، الصلاحيات، VPN والمصادقة الثنائية',
      color: 'var(--color-purple-600)',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badge: null,
    },
    {
      id: 'asset-management',
      name: 'Asset Management',
      nameAr: 'إدارة الأصول',
      icon: 'Boxes',
      description: 'Register, transfer, dispose and audit IT assets',
      descriptionAr: 'تسجيل الأصول، نقلها، إتلافها وجردها',
      color: 'var(--color-amber-600)',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: null,
    },
    {
      id: 'software-licensing',
      name: 'Software & Licensing',
      nameAr: 'البرامج والتراخيص',
      icon: 'Package',
      description: 'License requests, renewals, transfers and compliance',
      descriptionAr: 'طلبات التراخيص، التجديد، النقل والامتثال',
      color: 'var(--color-indigo-600)',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      badge: null,
    },
    {
      id: 'cyber-security',
      name: 'Cyber Security',
      nameAr: 'الأمن السيبراني',
      icon: 'Shield',
      description: 'Phishing, malware, firewall rules and data breach reporting',
      descriptionAr: 'التصيد الاحتيالي، البرامج الضارة، جدار الحماية والإبلاغ عن الاختراقات',
      color: 'var(--color-rose-600)',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      badge: null,
    },
    {
      id: 'knowledge-base',
      name: 'Knowledge Base',
      nameAr: 'قاعدة المعرفة',
      icon: 'BookOpen',
      description: 'Request, update and manage knowledge articles',
      descriptionAr: 'طلب المقالات المعرفية وتحديثها وإدارتها',
      color: 'var(--color-sky-600)',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      badge: null,
    },
    {
      id: 'hr-services',
      name: 'HR Services',
      nameAr: 'خدمات الموارد البشرية',
      icon: 'Users',
      description: 'Vacation, attendance, payroll and employee requests',
      descriptionAr: 'الإجازات، الحضور، الرواتب وطلبات الموظفين',
      color: 'var(--color-green-600)',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badge: null,
    },
    {
      id: 'facilities',
      name: 'Facilities',
      nameAr: 'المرافق',
      icon: 'Building',
      description: 'Maintenance, meeting rooms, car and phone services',
      descriptionAr: 'الصيانة، غرف الاجتماعات، خدمات السيارة والهاتف',
      color: 'var(--color-warning)',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      badge: null,
    },
    {
      id: 'erp-other',
      name: 'ERP — Other Modules',
      nameAr: 'النظام — الوحدات الأخرى',
      icon: 'LayoutGrid',
      description: 'Finance, procurement, inventory, sales and projects modules',
      descriptionAr: 'وحدات المالية، المشتريات، المخزون، المبيعات والمشاريع',
      color: 'var(--color-violet-600)',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      badge: null,
    },
  ];

  const categoriesByModule = {
    'it-support': [
      {
        id: 'technical-support',
        name: 'Technical Support',
        nameAr: 'الدعم التقني',
        icon: 'Wrench',
        description: 'Device repairs, network connections, email issues',
        descriptionAr: 'إصلاح الأجهزة، توصيل الشبكة، مشاكل البريد الإلكتروني',
        color: 'var(--color-primary)',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        id: 'device-replacement',
        name: 'Device Replacement',
        nameAr: 'استبدال الأجهزة',
        icon: 'RefreshCw',
        description: 'Computer, printer, monitor, keyboard, mouse replacement',
        descriptionAr: 'استبدال الحاسب، الطابعة، الشاشة، لوحة المفاتيح، الفأرة',
        color: 'var(--color-warning)',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
      {
        id: 'cyber-security',
        name: 'Cyber Security',
        nameAr: 'الأمن السيبراني',
        icon: 'Shield',
        description: 'Phishing, malware, firewall rules, data breach reporting',
        descriptionAr: 'التصيد الاحتيالي، البرامج الضارة، جدار الحماية، الإبلاغ عن الاختراقات',
        color: 'var(--color-rose-600)',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
      },
      {
        id: 'software-licensing',
        name: 'Software & Licensing',
        nameAr: 'البرامج والتراخيص',
        icon: 'Package',
        description: 'License requests, renewals, transfers and compliance',
        descriptionAr: 'طلبات التراخيص، التجديد، النقل والامتثال',
        color: 'var(--color-indigo-600)',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
      },
      {
        id: 'maintenance-service',
        name: 'Maintenance Service',
        nameAr: 'خدمات الصيانة',
        icon: 'Settings',
        description: 'Facility maintenance, meeting rooms, phone services',
        descriptionAr: 'صيانة المرافق، غرف الاجتماعات، خدمات الهاتف',
        color: 'var(--color-amber-600)',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      },
    ],

    'dg-assistant': [
      {
        id: 'cybersecurity-requests',
        name: 'Cybersecurity Requests',
        nameAr: 'طلبات الأمن السيبراني',
        icon: 'Shield',
        description: 'Password manager, remote access, firewall and security-related requests',
        descriptionAr: 'إدارة كلمات المرور، الوصول عن بعد، الجدار الناري والطلبات الأمنية',
        color: 'var(--color-rose-600)',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
      },
      {
        id: 'noc-requests',
        name: 'Network Operation Center Requests',
        nameAr: 'طلبات مركز عمليات الشبكة',
        icon: 'MonitorDot',
        description: 'NOC service requests and network port changes',
        descriptionAr: 'طلبات خدمات مركز العمليات الشبكية وتغييرات المنافذ',
        color: 'var(--color-blue-600)',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        id: 'infrastructure-service-requests',
        name: 'Infrastructure Service Requests',
        nameAr: 'طلبات خدمات البنية التحتية',
        icon: 'Server',
        description: 'AD, backup, DNS, domain controller, email, server, PAM, permissions',
        descriptionAr: 'خدمات Active Directory والنسخ الاحتياطي وDNS وخوادم النطاق والبريد والخوادم والصلاحيات',
        color: 'var(--color-slate-600)',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
      },
      {
        id: 'network-requests',
        name: 'Network Requests',
        nameAr: 'طلبات الشبكة',
        icon: 'Network',
        description: 'Remote access, firewall, load balancing, and network service changes',
        descriptionAr: 'الوصول عن بعد، الجدار الناري، موازنة الأحمال، وتغييرات خدمات الشبكة',
        color: 'var(--color-cyan-600)',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
      },
      {
        id: 'development-application-requests',
        name: 'Development & Application Requests',
        nameAr: 'طلبات التطوير والتطبيقات',
        icon: 'Code2',
        description: 'Enhancements, data migration, system changes, outage handling, and testing',
        descriptionAr: 'تحسينات، ترحيل البيانات، التغييرات، الانقطاعات، والاختبارات',
        color: 'var(--color-violet-600)',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
      },
      {
        id: 'qa-qc-requests',
        name: 'QA/QC Requests',
        nameAr: 'طلبات الجودة وضبط الجودة',
        icon: 'BadgeCheck',
        description: 'Cloud testing, code review, database testing, quality and security checks',
        descriptionAr: 'اختبارات السحابة، مراجعة الكود، اختبارات قواعد البيانات، الجودة والأمن',
        color: 'var(--color-emerald-600)',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
      },
      {
        id: 'digital-transformation-requests',
        name: 'Digital Transformation Requests',
        nameAr: 'طلبات التحول الرقمي',
        icon: 'Sparkles',
        description: 'Request digital transformation services and automation support',
        descriptionAr: 'طلب خدمات التحول الرقمي ودعم الأتمتة',
        color: 'var(--color-indigo-600)',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
      },
      {
        id: 'technical-support-requests',
        name: 'Technical Support Requests',
        nameAr: 'طلبات الدعم الفني',
        icon: 'Wrench',
        description: 'User account creation, device support, office software, and user updates',
        descriptionAr: 'إنشاء الحسابات، دعم الأجهزة، البرمجيات المكتبية، وتحديث بيانات المستخدم',
        color: 'var(--color-orange-600)',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
      {
        id: 'project-management',
        name: 'Project Management',
        nameAr: 'إدارة المشاريع',
        icon: 'KanbanSquare',
        description: 'Project intake, planning, reporting, and delivery coordination',
        descriptionAr: 'استقبال المشاريع والتخطيط والتقارير والتنسيق أثناء التنفيذ',
        color: 'var(--color-amber-600)',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      },
    ],

    'incident-management': [
      {
        id: 'incident-management',
        name: 'Report an Incident',
        nameAr: 'الإبلاغ عن حادثة',
        icon: 'AlertTriangle',
        description: 'P1–P3 incidents, outages, crashes, security incidents',
        descriptionAr: 'حوادث P1–P3، انقطاع الخدمة، الأعطال، الحوادث الأمنية',
        color: 'var(--color-error)',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
    ],

    'service-requests': [
      {
        id: 'service-requests',
        name: 'General Service Request',
        nameAr: 'طلب خدمة عام',
        icon: 'ClipboardList',
        description: 'New equipment, onboarding, offboarding, workspace setup',
        descriptionAr: 'الأجهزة الجديدة، تهيئة الموظفين، إعداد مكان العمل',
        color: 'var(--color-teal-600)',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
      },
      {
        id: 'asset-management',
        name: 'Asset Management',
        nameAr: 'إدارة الأصول',
        icon: 'Boxes',
        description: 'Register, transfer, dispose and audit IT assets',
        descriptionAr: 'تسجيل الأصول، نقلها، إتلافها وجردها',
        color: 'var(--color-amber-600)',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      },
    ],

    'change-management': [
      {
        id: 'change-management',
        name: 'Submit a Change',
        nameAr: 'تقديم طلب تغيير',
        icon: 'GitBranch',
        description: 'Standard, normal and emergency changes with CAB approval',
        descriptionAr: 'التغييرات الاعتيادية والعادية والطارئة مع اعتماد لجنة التغيير',
        color: 'var(--color-slate-600)',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
      },
    ],

    'access-management': [
      {
        id: 'access-management',
        name: 'Access & Identity',
        nameAr: 'الوصول والهوية',
        icon: 'KeyRound',
        description: 'User accounts, passwords, permissions, VPN and MFA',
        descriptionAr: 'الحسابات، كلمات المرور، الصلاحيات، VPN والمصادقة الثنائية',
        color: 'var(--color-purple-600)',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      },
    ],

    'asset-management': [
      {
        id: 'asset-management',
        name: 'Asset Lifecycle',
        nameAr: 'دورة حياة الأصول',
        icon: 'Boxes',
        description: 'Register, transfer, dispose and audit IT assets',
        descriptionAr: 'تسجيل الأصول، نقلها، إتلافها وجردها',
        color: 'var(--color-amber-600)',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      },
      {
        id: 'device-replacement',
        name: 'Device Replacement',
        nameAr: 'استبدال الأجهزة',
        icon: 'RefreshCw',
        description: 'Computer, printer, monitor, keyboard, mouse replacement',
        descriptionAr: 'استبدال الحاسب، الطابعة، الشاشة، لوحة المفاتيح، الفأرة',
        color: 'var(--color-warning)',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
    ],

    'software-licensing': [
      {
        id: 'software-licensing',
        name: 'Software & Licensing',
        nameAr: 'البرامج والتراخيص',
        icon: 'Package',
        description: 'License requests, renewals, transfers and compliance',
        descriptionAr: 'طلبات التراخيص، التجديد، النقل والامتثال',
        color: 'var(--color-indigo-600)',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
      },
    ],

    'cyber-security': [
      {
        id: 'cyber-security',
        name: 'Cyber Security',
        nameAr: 'الأمن السيبراني',
        icon: 'Shield',
        description: 'Phishing, malware, firewall rules, data breach reporting',
        descriptionAr: 'التصيد الاحتيالي، البرامج الضارة، جدار الحماية، الإبلاغ عن الاختراقات',
        color: 'var(--color-rose-600)',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
      },
    ],

    'knowledge-base': [
      {
        id: 'knowledge-base',
        name: 'Knowledge Articles',
        nameAr: 'المقالات المعرفية',
        icon: 'BookOpen',
        description: 'Request, update and manage knowledge articles',
        descriptionAr: 'طلب المقالات المعرفية وتحديثها وإدارتها',
        color: 'var(--color-sky-600)',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
      },
    ],

    'hr-services': [
      {
        id: 'hr-system',
        name: 'HR System',
        nameAr: 'نظام الموارد البشرية',
        icon: 'Users',
        description: 'Vacation requests, attendance, employee services',
        descriptionAr: 'طلبات الإجازة، الحضور، خدمات الموظفين',
        color: 'var(--color-green-600)',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        id: 'attendance',
        name: 'Attendance',
        nameAr: 'الحضور والانصراف',
        icon: 'Clock',
        description: 'Attendance system, card issues, time tracking',
        descriptionAr: 'نظام الحضور، مشاكل البطاقة، تتبع الوقت',
        color: 'var(--color-primary)',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        id: 'erp-hr',
        name: 'ERP — HR Module',
        nameAr: 'النظام — وحدة الموارد البشرية',
        icon: 'UserCog',
        description: 'HR module users, roles, payroll and workflow issues',
        descriptionAr: 'مستخدمو وحدة الموارد البشرية، الأدوار، الرواتب ومسارات الاعتماد',
        color: 'var(--color-cyan-600)',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
      },
    ],

    'facilities': [
      {
        id: 'maintenance-service',
        name: 'Maintenance Service',
        nameAr: 'خدمات الصيانة',
        icon: 'Settings',
        description: 'Facility maintenance, meeting rooms, phone services',
        descriptionAr: 'صيانة المرافق، غرف الاجتماعات، خدمات الهاتف',
        color: 'var(--color-warning)',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
      {
        id: 'meeting-room',
        name: 'Meeting Room Booking',
        nameAr: 'حجز غرفة اجتماع',
        icon: 'CalendarDays',
        description: 'Reserve and manage meeting room bookings',
        descriptionAr: 'حجز غرف الاجتماعات وإدارتها',
        color: 'var(--color-teal-600)',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
      },
      {
        id: 'car-services',
        name: 'Car Services',
        nameAr: 'خدمات السيارة',
        icon: 'Car',
        description: 'Vehicle booking, maintenance and fleet requests',
        descriptionAr: 'حجز المركبات، الصيانة وطلبات الأسطول',
        color: 'var(--color-slate-600)',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
      },
      {
        id: 'ip-telephone',
        name: 'IP Telephone Services',
        nameAr: 'خدمات الهاتف الشبكي',
        icon: 'Phone',
        description: 'IP phone setup, extension requests and line issues',
        descriptionAr: 'إعداد الهاتف الشبكي، طلبات التحويل ومشاكل الخط',
        color: 'var(--color-indigo-600)',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
      },
    ],

    'finance': [
      {
        id: 'finance-system',
        name: 'Finance System',
        nameAr: 'النظام المالي',
        icon: 'Banknote',
        description: 'Financial system issues, reports and user access',
        descriptionAr: 'مشاكل النظام المالي، التقارير والوصول للمستخدمين',
        color: 'var(--color-emerald-600)',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
      },
      {
        id: 'purchasing',
        name: 'Purchasing',
        nameAr: 'المشتريات',
        icon: 'ShoppingCart',
        description: 'Purchase orders, vendor management and procurement',
        descriptionAr: 'أوامر الشراء، إدارة الموردين والمشتريات',
        color: 'var(--color-warning)',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
      {
        id: 'erp-other',
        name: 'ERP — Other Modules',
        nameAr: 'النظام — الوحدات الأخرى',
        icon: 'LayoutGrid',
        description: 'Finance, procurement, inventory, sales and projects modules',
        descriptionAr: 'وحدات المالية، المشتريات، المخزون، المبيعات والمشاريع',
        color: 'var(--color-violet-600)',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
      },
    ],

    'erp-hr': [
      {
        id: 'erp-hr',
        name: 'ERP — HR Module',
        nameAr: 'النظام — وحدة الموارد البشرية',
        icon: 'UserCog',
        description: 'HR module users, roles, payroll and workflow issues',
        descriptionAr: 'مستخدمو وحدة الموارد البشرية، الأدوار، الرواتب ومسارات الاعتماد',
        color: 'var(--color-cyan-600)',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
      },
    ],

    'erp-other': [
      {
        id: 'erp-other',
        name: 'ERP — Other Modules',
        nameAr: 'النظام — الوحدات الأخرى',
        icon: 'LayoutGrid',
        description: 'Finance, procurement, inventory, sales and projects modules',
        descriptionAr: 'وحدات المالية، المشتريات، المخزون، المبيعات والمشاريع',
        color: 'var(--color-violet-600)',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
      },
    ],
  };

  const categories = categoriesByModule[selectedModule] || [];
  const selectedModuleConfig = modules.find((module) => module.id === selectedModule);
  const selectedCategoryConfig = categories.find((category) => category.id === selectedCategory);
  const visibleModules = selectedModule
    ? modules.filter((module) => module.id === selectedModule)
    : modules;
  const visibleCategories = selectedCategory
    ? categories.filter((category) => category.id === selectedCategory)
    : categories;

  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);
  };

  const getModuleLabel = (module) =>
    language === 'ar' ? module?.nameAr || module?.name : module?.name || module?.nameAr;

  const getCategoryLabel = (category) =>
    language === 'ar' ? category?.nameAr || category?.name : category?.name || category?.nameAr;

  const getServiceLabel = (service) => {
    if (!service) return t('service', 'Service');
    return language === 'ar'
      ? service?.nameAr || service?.name || service?.nameEn || t('service', 'Service')
      : service?.nameEn || service?.name || service?.nameAr || t('service', 'Service');
  };

  const breadcrumbIcon = isRtl ? 'ChevronLeft' : 'ChevronRight';

  return (
    <div
      className={`space-y-8 ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={'text-left'}>
          <label className="block text-sm font-semibold text-foreground mb-1">
            {t('departmentCategoryService', 'Department / Category / Service')}{' '}
            <span className="text-error">*</span>
          </label>
          <p className="text-xs text-muted-foreground">
            {t('pickRouteFlow', 'Pick the route in one flow, from department to category to service.')}
          </p>
        </div>

        {selectedModule && !isReadOnly && (
          <div className={isRtl ? 'text-left' : 'text-right'}>
            <button
              type="button"
              onClick={() => onModuleChange('')}
              className={`inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline ${
                ''
              }`}
            >
              {t('showAllDepartments', 'Show all departments')}
            </button>
          </div>
        )}

        <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
          <motion.div
            className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
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
            {visibleModules.map((module) => (
              <motion.button
                key={module.id}
                type="button"
                disabled={isReadOnly}
                onClick={() => onModuleChange(module.id)}
                className={`relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 group w-full disabled:cursor-default ${
                  selectedModule === module.id
                    ? 'bg-primary/10 border border-primary shadow-elevation-2'
                    : 'bg-card border border-border hover:border-primary/40 hover:bg-primary/5'
                } ${'text-left'}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
                  },
                }}
              >
                <div
                  className={`absolute inset-0 transition-opacity ${
                    selectedModule === module.id ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent" />
                </div>

                <div
                  className={`relative flex items-start gap-3 ${
                    isRtl ? 'flex-row-reverse text-right' : 'text-left'
                  }`}
                >
                  <motion.div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      selectedModule === module.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
                    }`}
                    animate={selectedModule === module.id ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon
                      name={module.icon}
                      size={20}
                      color={selectedModule === module.id ? '#FFFFFF' : undefined}
                    />
                  </motion.div>

                  <div className={`min-w-0 flex-1 ${'text-left'}`}>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {getModuleLabel(module)}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {(categoriesByModule[module.id] || []).length} {t('categoriesAvailable', 'categories available')}
                    </p>

                    {selectedModule === module.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-primary font-medium mt-1"
                      >
                        ✓ {t('selected', 'Selected')}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedModule && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className={'text-left'}>
              <label className="block text-sm font-semibold text-foreground mb-1">
                {t('category', 'Category')} <span className="text-error">*</span>
              </label>
              <p className="text-xs text-muted-foreground">
                {selectedModuleConfig
                  ? `${t('categoriesFor', 'Categories for')} ${getModuleLabel(selectedModuleConfig)}`
                  : t('chooseDepartmentFirst', 'Choose a department first to see categories')}
              </p>
            </div>

            <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
              <motion.div
                className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {visibleCategories?.map((category, idx) => (
                  <motion.button
                    key={category?.id}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleCategoryClick(category?.id)}
                    className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 group w-full h-full disabled:cursor-default disabled:opacity-100 ${
                      selectedCategory === category?.id
                        ? `${category?.bgColor} ${category?.borderColor} border shadow-elevation-2`
                        : 'bg-card border border-border hover:border-primary/30 hover:bg-primary/5'
                    } ${'text-left'}`}
                    whileHover={isReadOnly ? undefined : { scale: 1.02, y: -2 }}
                    whileTap={isReadOnly ? undefined : { scale: 0.98 }}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.9 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.4,
                          ease: [0.34, 1.56, 0.64, 1],
                          delay: idx * 0.05,
                        },
                      },
                    }}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        selectedCategory === category?.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{
                        background: `linear-gradient(to right, ${category?.color}, ${category?.color}00)`,
                      }}
                    />

                    <div
                      className={`relative flex items-start gap-4 ${
                        isRtl ? 'flex-row-reverse text-right' : 'text-left'
                      }`}
                    >
                      <div className={`flex-1 min-w-0 pt-1 ${'text-left'}`}>
                        <div
                          className={`flex items-start gap-2 mb-2 ${
                            isRtl ? 'flex-row-reverse text-right' : 'justify-between text-left'
                          }`}
                        >
                          <motion.div
                            className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedCategory === category?.id
                                ? category?.bgColor
                                : 'bg-muted group-hover:bg-muted/80'
                            }`}
                            whileHover={{ scale: 1.15, rotate: 5 }}
                          >
                            <Icon
                              name={category?.icon}
                              size={22}
                              color={
                                selectedCategory === category?.id
                                  ? category?.color
                                  : 'var(--color-muted-foreground)'
                              }
                            />
                          </motion.div>

                          <div className={`flex-1 ${'text-left'}`}>
                            <h3 className="font-bold text-base text-foreground leading-snug">
                              {getCategoryLabel(category)}
                            </h3>

                            {language !== 'ar' && (
                              <p className="text-xs font-medium text-primary/80 mt-1">
                                {category?.nameAr}
                              </p>
                            )}
                          </div>

                          <AnimatePresence>
                            {selectedCategory === category?.id && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.3 }}
                                className={`flex-shrink-0 mt-1 ${isRtl ? 'mr-2' : 'ml-2'}`}
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                                  <Icon name="Check" size={16} color="#FFFFFF" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {language === 'ar' ? category?.descriptionAr : category?.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {selectedCategory && !isReadOnly && (
              <div className={isRtl ? 'text-left' : 'text-right'}>
                <button
                  type="button"
                  onClick={() => onCategoryChange('')}
                  className={`inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline ${
                    ''
                  }`}
                >
                  {t('showAllCategories', 'Show all categories')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {selectedService ? (
              <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="rounded-full bg-background px-3 py-1 text-muted-foreground">
                    {getModuleLabel(selectedModuleConfig) || t('department', 'Department')}
                  </span>
                  <Icon name={breadcrumbIcon} size={14} className="text-muted-foreground shrink-0" />
                  <span className="rounded-full bg-background px-3 py-1 text-muted-foreground">
                    {getCategoryLabel(selectedCategoryConfig) || t('category', 'Category')}
                  </span>
                  <Icon name={breadcrumbIcon} size={14} className="text-muted-foreground shrink-0" />
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {getServiceLabel(selectedService)}
                  </span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => onServiceSelect(null)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ServiceSelector
                  category={selectedCategory}
                  categoryLabel={
                    language === 'ar'
                      ? selectedCategoryConfig?.nameAr || selectedCategoryConfig?.name || selectedCategory
                      : selectedCategoryConfig?.name || selectedCategoryConfig?.nameAr || selectedCategory
                  }
                  selectedService={selectedService}
                  onServiceSelect={onServiceSelect}
                  onClose={undefined}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySelector;
