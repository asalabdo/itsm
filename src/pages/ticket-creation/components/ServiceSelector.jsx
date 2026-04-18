import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ServiceSelector = ({ category, categoryLabel, selectedService, onServiceSelect, onClose }) => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchQuery, setSearchQuery] = useState('');

const servicesByCategory = {
  "cybersecurity-requests": [
    { "id": "cs-password-manager", "nameEn": "Password Manager Requests", "nameAr": "طلبات مدير كلمات المرور" },
    { "id": "cs-pass-through-email", "nameEn": "Pass through email", "nameAr": "تمرير البريد الإلكتروني" },
    { "id": "cs-remote-access", "nameEn": "Remote Access", "nameAr": "الوصول عن بُعد" },
    { "id": "cs-firewall-services", "nameEn": "Firewall services", "nameAr": "خدمات الجدار الناري" },
    { "id": "cs-website-availability", "nameEn": "Website availability service", "nameAr": "خدمة توفر الموقع الإلكتروني" },
    { "id": "cs-usb-port", "nameEn": "USB port service", "nameAr": "خدمة منفذ USB" },
    { "id": "cs-antivirus", "nameEn": "Antivirus / Malware Issue", "nameAr": "مشكلة مكافحة الفيروسات والبرمجيات الخبيثة" },
    { "id": "cs-phishing", "nameEn": "Report Phishing Email", "nameAr": "الإبلاغ عن بريد التصيد" },
    { "id": "cs-suspicious-link", "nameEn": "Report Suspicious Website or Link", "nameAr": "الإبلاغ عن موقع أو رابط مشبوه" },
    { "id": "cs-usb-access", "nameEn": "USB Access Request", "nameAr": "طلب وصول USB" },
    { "id": "cs-nac", "nameEn": "Network Access Control", "nameAr": "التحكم في الوصول للشبكة" },
    { "id": "cs-data-breach", "nameEn": "Report Suspected Data Breach", "nameAr": "الإبلاغ عن تسريب بيانات مشتبه به" },
    { "id": "cs-firewall-rule", "nameEn": "Firewall Rule Request", "nameAr": "طلب قاعدة جدار ناري" },
    { "id": "cs-other-security", "nameEn": "Other Cyber Security Service Request", "nameAr": "طلب خدمة أمنية أخرى" }
  ],
"noc-requests": [
    { "id": "noc-service", "nameEn": "Request NOC Service", "nameAr": "طلب خدمة مركز العمليات" },
    { "id": "noc-ports", "nameEn": "Open or Close Network Communication Ports", "nameAr": "فتح أو إغلاق منافذ الاتصال الشبكي" }
  ],
  "infrastructure-service-requests": [
    { "id": "infra-active-directory", "nameEn": "Active Directory Services", "nameAr": "خدمات Active Directory" },
    { "id": "infra-backup", "nameEn": "Backup Services", "nameAr": "خدمات النسخ الاحتياطي" },
    { "id": "infra-dns", "nameEn": "DNS", "nameAr": "DNS" },
    { "id": "infra-domain-controller", "nameEn": "Domain Controller", "nameAr": "متحكم النطاق" },
    { "id": "infra-email", "nameEn": "Email Services", "nameAr": "خدمات البريد الإلكتروني" },
    { "id": "infra-permission", "nameEn": "Permission Services", "nameAr": "خدمات الصلاحيات" },
    { "id": "infra-server", "nameEn": "Server Services", "nameAr": "خدمات الخوادم" },
    { "id": "infra-pam", "nameEn": "PAM", "nameAr": "إدارة الوصول المميز" },
    { "id": "infra-other", "nameEn": "Other Request", "nameAr": "طلب آخر" }
  ],
  "network-requests": [
    { "id": "net-firewall", "nameEn": "Firewall services", "nameAr": "خدمات الجدار الناري" },
    { "id": "net-load-balancing", "nameEn": "Load balancing services", "nameAr": "خدمات موازنة الأحمال" },
    { "id": "net-services", "nameEn": "Network services", "nameAr": "خدمات الشبكات" },
    { "id": "net-remote-access", "nameEn": "Remote Access", "nameAr": "الوصول عن بُعد" },
    { "id": "net-other", "nameEn": "Other Network Service Requests", "nameAr": "طلبات شبكات أخرى" }
  ],
"development-application-requests": [
    { "id": "dev-data-migration", "nameEn": "Data Migration", "nameAr": "ترحيل البيانات" },
    { "id": "dev-major-enhancement", "nameEn": "Major Service Enhancement", "nameAr": "تحسين رئيسي للخدمة" },
    { "id": "dev-minor-modification", "nameEn": "Minor modification", "nameAr": "تعديل بسيط" },
    { "id": "dev-minor-enhancement", "nameEn": "Minor Service Enhancement", "nameAr": "تحسين بسيط للخدمة" },
    { "id": "dev-modify-ip", "nameEn": "Modify IP", "nameAr": "تعديل عنوان IP" },
    { "id": "dev-network-failure", "nameEn": "Network Failure", "nameAr": "فشل الشبكة" },
    { "id": "dev-new-feature", "nameEn": "New Feature Request", "nameAr": "طلب ميزة جديدة" },
    { "id": "dev-new-tool", "nameEn": "New Tool Request", "nameAr": "طلب أداة جديدة" },
    { "id": "dev-password-reset", "nameEn": "Password Reset", "nameAr": "إعادة تعيين كلمة المرور" },
    { "id": "dev-performance-improvement", "nameEn": "Performance Improvement", "nameAr": "تحسين الأداء" },
    { "id": "dev-other", "nameEn": "Other Development & Application service Request", "nameAr": "طلب خدمة تطوير أو تطبيق أخرى" },
    { "id": "dev-request-domain", "nameEn": "Request New Domain", "nameAr": "طلب نطاق جديد" },
    { "id": "dev-server-outage", "nameEn": "Server Outage", "nameAr": "انقطاع الخادم" },
    { "id": "dev-service-testing", "nameEn": "Service Testing", "nameAr": "اختبار الخدمة" },
    { "id": "dev-system-down", "nameEn": "System Down", "nameAr": "تعطل النظام" },
    { "id": "dev-system-testing", "nameEn": "System Testing", "nameAr": "اختبار النظام" },
    { "id": "dev-system-upgrade", "nameEn": "System Upgrade", "nameAr": "ترقية النظام" }
  ],
  "qa-qc-requests": [
    { "id": "qa-cloud-testing", "nameEn": "Cloud Testing", "nameAr": "اختبار السحابة" },
    { "id": "qa-code-review", "nameEn": "Code Review", "nameAr": "مراجعة الكود" },
    { "id": "qa-database-testing", "nameEn": "Database Testing", "nameAr": "اختبار قواعد البيانات" },
    { "id": "qa-faction-testing", "nameEn": "Faction Testing", "nameAr": "اختبار الفصيل" },
    { "id": "qa-other", "nameEn": "Other QA/QC Requests", "nameAr": "طلبات ضمان الجودة / مراقبة الجودة أخرى" },
    { "id": "qa-quality-control", "nameEn": "Quality Control", "nameAr": "ضبط الجودة" },
    { "id": "qa-security-control", "nameEn": "Security Control", "nameAr": "التحكم الأمني" },
    { "id": "qa-services-testing", "nameEn": "Services Testing", "nameAr": "اختبار الخدمات" }
  ],
  "digital-transformation-requests": [
    { "id": "dt-services", "nameEn": "Request Digital Transformation Services", "nameAr": "طلب خدمات التحول الرقمي" }
  ],
  "technical-support-requests": [
    { "id": "ts-create-account", "nameEn": "Create User Account", "nameAr": "إنشاء حساب مستخدم" },
    { "id": "ts-device-fix", "nameEn": "Fix User Device Issues", "nameAr": "إصلاح مشاكل جهاز المستخدم" },
    { "id": "ts-office-install", "nameEn": "Install Office Software", "nameAr": "تثبيت برنامج Office" },
    { "id": "ts-user-system-update", "nameEn": "Update User-Related Systems", "nameAr": "تحديث الأنظمة المتعلقة بالمستخدم" },
    { "id": "ts-edit-user", "nameEn": "Modify User Details", "nameAr": "تعديل بيانات المستخدم" },
    { "id": "ts-password-reset", "nameEn": "Password Reset Request", "nameAr": "طلب إعادة تعيين كلمة المرور" },
    { "id": "ts-specialized-software", "nameEn": "Install Specialized Software", "nameAr": "تثبيت برنامج متخصص" },
    { "id": "ts-ms-office", "nameEn": "Install MS Office", "nameAr": "تثبيت Microsoft Office" },
    { "id": "ts-recording", "nameEn": "Voice Recording Request", "nameAr": "طلب تسجيل صوتي" },
    { "id": "ts-new-device", "nameEn": "Request New Device", "nameAr": "طلب جهاز جديد" },
    { "id": "ts-monitor", "nameEn": "Request Monitor", "nameAr": "طلب شاشة" },
    { "id": "ts-keyboard-mouse", "nameEn": "Keyboard / Mouse / Accessories", "nameAr": "طلب لوحة مفاتيح أو فأرة أو ملحقات" },
    { "id": "ts-other-support", "nameEn": "Other Technical Support Request", "nameAr": "طلب دعم تقني آخر" }
  ],

  "technical-support": [
    { "id": "ts-device-not-working", "nameEn": "Device Not Working", "nameAr": "الجهاز لا يعمل" },
    { "id": "ts-slow-performance", "nameEn": "Slow Performance", "nameAr": "أداء بطيء" },
    { "id": "ts-blue-screen", "nameEn": "Blue Screen / System Crash", "nameAr": "الشاشة الزرقاء / تعطل النظام" },
    { "id": "ts-monitor-issue", "nameEn": "Monitor Issue", "nameAr": "مشكلة في الشاشة" },
    { "id": "ts-printer-issue", "nameEn": "Printer Issue", "nameAr": "مشكلة في الطابعة" },
    { "id": "ts-keyboard-mouse-issue", "nameEn": "Keyboard / Mouse Issue", "nameAr": "مشكلة في لوحة المفاتيح أو الفأرة" },
    { "id": "ts-network-connection", "nameEn": "Network Connection Issue", "nameAr": "مشكلة في الاتصال بالشبكة" },
    { "id": "ts-internet-access", "nameEn": "Internet Access Issue", "nameAr": "مشكلة في الوصول للإنترنت" },
    { "id": "ts-email-issue", "nameEn": "Email Issue", "nameAr": "مشكلة في البريد الإلكتروني" },
    { "id": "ts-transfer-device", "nameEn": "Transfer Device", "nameAr": "نقل جهاز" },
    { "id": "ts-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
"project-management": [
    { "id": "pm-request", "nameEn": "Project management", "nameAr": "إدارة المشاريع" }
  ],
  "access-management": [
    { "id": "am-new-account", "nameEn": "Create New User Account", "nameAr": "إنشاء حساب مستخدم جديد" },
    { "id": "am-disable-account", "nameEn": "Disable / Terminate User Account", "nameAr": "تعطيل أو إنهاء حساب مستخدم" },
    { "id": "am-reset-password", "nameEn": "Password Reset", "nameAr": "إعادة تعيين كلمة المرور" },
    { "id": "am-unlock-account", "nameEn": "Unlock Account", "nameAr": "فتح حساب مقفل" },
    { "id": "am-grant-permission", "nameEn": "Grant / Modify Permissions", "nameAr": "منح أو تعديل الصلاحيات" },
    { "id": "am-revoke-access", "nameEn": "Revoke Access", "nameAr": "إلغاء الوصول" },
    { "id": "am-shared-mailbox", "nameEn": "Shared Mailbox Access", "nameAr": "الوصول إلى صندوق بريد مشترك" },
    { "id": "am-distribution-group", "nameEn": "Distribution Group Management", "nameAr": "إدارة مجموعات التوزيع" },
    { "id": "am-vpn", "nameEn": "VPN Access Request", "nameAr": "طلب الوصول عبر VPN" },
    { "id": "am-mfa", "nameEn": "MFA Setup or Reset", "nameAr": "إعداد أو إعادة تعيين المصادقة الثنائية" },
    { "id": "am-other", "nameEn": "Other", "nameAr": "أخرى" }
],
 "asset-management": [
    { "id": "ast-register", "nameEn": "Register New Asset", "nameAr": "تسجيل أصل جديد" },
    { "id": "ast-transfer", "nameEn": "Asset Transfer Between Employees", "nameAr": "نقل أصل بين الموظفين" },
    { "id": "ast-disposal", "nameEn": "Asset Disposal Request", "nameAr": "طلب إتلاف أصل" },
    { "id": "ast-audit", "nameEn": "Asset Audit / Inventory Check", "nameAr": "جرد أو تدقيق الأصول" },
    { "id": "ast-lost-stolen", "nameEn": "Report Lost or Stolen Asset", "nameAr": "الإبلاغ عن أصل مفقود أو مسروق" },
    { "id": "ast-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "change-management": [
    { "id": "cm-standard", "nameEn": "Standard Change Request", "nameAr": "طلب تغيير اعتيادي" },
    { "id": "cm-emergency", "nameEn": "Emergency Change Request", "nameAr": "طلب تغيير طارئ" },
    { "id": "cm-normal", "nameEn": "Normal Change Request", "nameAr": "طلب تغيير عادي" },
    { "id": "cm-system-update", "nameEn": "System or Application Update", "nameAr": "تحديث نظام أو تطبيق" },
    { "id": "cm-config", "nameEn": "Configuration Change", "nameAr": "تغيير في الإعدادات" },
    { "id": "cm-rollback", "nameEn": "Rollback Request", "nameAr": "طلب التراجع عن تغيير" },
    { "id": "cm-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
"cyber-security": [
    { "id": "cs-antivirus", "nameEn": "Antivirus / Malware Issue", "nameAr": "مشكلة في مكافحة الفيروسات أو البرمجيات الخبيثة" },
    { "id": "cs-phishing", "nameEn": "Report Phishing Email", "nameAr": "الإبلاغ عن بريد تصيد احتيالي" },
    { "id": "cs-suspicious-link", "nameEn": "Report Suspicious Website or Link", "nameAr": "الإبلاغ عن موقع أو رابط مشبوه" },
    { "id": "cs-usb", "nameEn": "USB Access Request", "nameAr": "طلب وصول USB" },
    { "id": "cs-nac", "nameEn": "Network Access Control", "nameAr": "التحكم في الوصول للشبكة" },
    { "id": "cs-data-breach", "nameEn": "Report Suspected Data Breach", "nameAr": "الإبلاغ عن اختراق بيانات مشتبه به" },
    { "id": "cs-firewall", "nameEn": "Firewall Rule Request", "nameAr": "طلب قاعدة جدار ناري" },
    { "id": "cs-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
"device-replacement": [
    { "id": "dr-computer", "nameEn": "Computer Replacement", "nameAr": "استبدال جهاز حاسوب آلي" },
    { "id": "dr-printer", "nameEn": "Printer Replacement", "nameAr": "استبدال طابعة" },
    { "id": "dr-keyboard", "nameEn": "Keyboard Replacement", "nameAr": "استبدال لوحة المفاتيح" },
    { "id": "dr-mouse", "nameEn": "Mouse Replacement", "nameAr": "استبدال فأرة" },
    { "id": "dr-monitor", "nameEn": "Monitor Replacement", "nameAr": "استبدال شاشة" },
    { "id": "dr-headset", "nameEn": "Headset Replacement", "nameAr": "استبدال سماعة" },
    { "id": "dr-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
"erp-hr": [
    { "id": "ehr-new-user", "nameEn": "New HR Module User", "nameAr": "إنشاء مستخدم في وحدة الموارد البشرية" },
    { "id": "ehr-role-change", "nameEn": "Change HR Role or Permissions", "nameAr": "تغيير دور أو صلاحيات الموارد البشرية" },
    { "id": "ehr-employee-data", "nameEn": "Employee Data Correction", "nameAr": "تصحيح بيانات موظف" },
    { "id": "ehr-payroll", "nameEn": "Payroll Processing Issue", "nameAr": "مشكلة في معالجة الرواتب" },
    { "id": "ehr-leave", "nameEn": "Leave Policy or Setup Issue", "nameAr": "مشكلة في سياسة أو إعداد الإجازات" },
    { "id": "ehr-workflow", "nameEn": "HR Approval Workflow Issue", "nameAr": "مشكلة في مسار اعتماد الموارد البشرية" },
    { "id": "ehr-report", "nameEn": "HR Report Request", "nameAr": "طلب تقرير موارد بشرية" },
    { "id": "ehr-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "erp-other": [
    { "id": "erp-finance", "nameEn": "Finance Module Issue", "nameAr": "مشكلة في وحدة المالية" },
    { "id": "erp-procurement", "nameEn": "Procurement Module Issue", "nameAr": "مشكلة في وحدة المشتريات" },
    { "id": "erp-inventory", "nameEn": "Inventory Module Issue", "nameAr": "مشكلة في وحدة المخزون" },
    { "id": "erp-sales", "nameEn": "Sales Module Issue", "nameAr": "مشكلة في وحدة المبيعات" },
    { "id": "erp-projects", "nameEn": "Projects Module Issue", "nameAr": "مشكلة في وحدة المشاريع" },
    { "id": "erp-new-user", "nameEn": "New ERP User Account", "nameAr": "إنشاء حساب مستخدم في النظام" },
    { "id": "erp-role-change", "nameEn": "Change ERP Role or Permissions", "nameAr": "تغيير دور أو صلاحيات النظام" },
    { "id": "erp-data-correction", "nameEn": "Data Entry Correction", "nameAr": "تصحيح إدخال البيانات" },
    { "id": "erp-report", "nameEn": "Custom Report Request", "nameAr": "طلب تقرير مخصص" },
    { "id": "erp-workflow", "nameEn": "Workflow Approval Issue", "nameAr": "مشكلة في مسار الاعتماد" },
    { "id": "erp-integration", "nameEn": "System Integration Issue", "nameAr": "مشكلة في تكامل الأنظمة" },
    { "id": "erp-training", "nameEn": "ERP Training Request", "nameAr": "طلب تدريب على النظام" },
    { "id": "erp-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "hr-system": [
    { "id": "hrs-cancel-vacation", "nameEn": "Cancel Rest / Permission / Vacation", "nameAr": "إلغاء راحة أو إذن أو إجازة" },
    { "id": "hrs-vacation-edit", "nameEn": "Edit Vacation Request", "nameAr": "تعديل طلب الإجازة" },
    { "id": "hrs-travel-edit", "nameEn": "Edit Travel Request", "nameAr": "تعديل طلب السفر" },
    { "id": "hrs-overtime-edit", "nameEn": "Edit Overtime Request", "nameAr": "تعديل طلب العمل الإضافي" },
    { "id": "hrs-system-issue", "nameEn": "System Issue", "nameAr": "مشكلة في النظام" },
    { "id": "hrs-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "incident-management": [
    { "id": "im-p1", "nameEn": "Critical Incident (P1) — Full Outage", "nameAr": "حادثة حرجة (P1) — انقطاع كامل" },
    { "id": "im-p2", "nameEn": "Major Incident (P2) — Partial Outage", "nameAr": "حادثة كبرى (P2) — انقطاع جزئي" },
    { "id": "im-p3", "nameEn": "Minor Incident (P3) — Degraded Service", "nameAr": "حادثة بسيطة (P3) — تراجع في الخدمة" },
    { "id": "im-hardware-failure", "nameEn": "Hardware Failure", "nameAr": "عطل في hardware" },
    { "id": "im-software-crash", "nameEn": "Software Crash or Error", "nameAr": "انهيار برنامج أو خطأ تقني" },
    { "id": "im-network-outage", "nameEn": "Network Outage", "nameAr": "انقطاع الشبكة" },
    { "id": "im-data-loss", "nameEn": "Data Loss or Corruption", "nameAr": "فقدان البيانات أو تلفها" },
    { "id": "im-security-incident", "nameEn": "Security Incident", "nameAr": "حادث أمني" },
    { "id": "im-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "knowledge-base": [
    { "id": "kb-new-article", "nameEn": "Request New Knowledge Article", "nameAr": "طلب مقال معرفي جديد" },
    { "id": "kb-update-article", "nameEn": "Update Existing Article", "nameAr": "تحديث مقال موجود" },
    { "id": "kb-broken-link", "nameEn": "Report Broken Link or Outdated Content", "nameAr": "الإبلاغ عن رابط معطل أو محتوى قديم" },
    { "id": "kb-access", "nameEn": "Knowledge Base Access Issue", "nameAr": "مشكلة في الوصول لقاعدة المعرفة" },
    { "id": "kb-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "maintenance-service": [
    { "id": "ms-new-request", "nameEn": "New Maintenance Request", "nameAr": "طلب صيانة جديد" },
    { "id": "ms-ip-telephone", "nameEn": "IP Telephone Services", "nameAr": "خدمات الهاتف IP" },
    { "id": "ms-car-services", "nameEn": "Car Services", "nameAr": "خدمات السيارات" },
    { "id": "ms-meeting-room", "nameEn": "Meeting Room Request", "nameAr": "طلب غرفة اجتماعات" },
    { "id": "ms-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
"service-requests": [
    { "id": "sr-new-equipment", "nameEn": "New Equipment Request", "nameAr": "طلب جهاز جديد" },
    { "id": "sr-software-install", "nameEn": "Software Installation", "nameAr": "تثبيت برنامج" },
    { "id": "sr-peripheral", "nameEn": "Peripheral Device Request", "nameAr": "طلب جهاز طرفي" },
    { "id": "sr-workspace-setup", "nameEn": "Workspace Setup", "nameAr": "إعداد مكان العمل" },
    { "id": "sr-onboarding", "nameEn": "New Employee Onboarding", "nameAr": "تهيئة موظف جديد" },
    { "id": "sr-offboarding", "nameEn": "Employee Offboarding", "nameAr": "إنهاء خدمات موظف" },
    { "id": "sr-business-card", "nameEn": "Business Card Request", "nameAr": "طلب بطاقة عمل" },
    { "id": "sr-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "software-licensing": [
    { "id": "sl-new-license", "nameEn": "Request New License", "nameAr": "طلب ترخيص جديد" },
    { "id": "sl-renew-license", "nameEn": "Renew Existing License", "nameAr": "تجديد ترخيص" },
    { "id": "sl-transfer-license", "nameEn": "Transfer License to Another User", "nameAr": "نقل ترخيص لمستخدم آخر" },
    { "id": "sl-revoke-license", "nameEn": "Revoke License", "nameAr": "إلغاء ترخيص" },
    { "id": "sl-upgrade", "nameEn": "Software Upgrade Request", "nameAr": "طلب ترقية برنامج" },
    { "id": "sl-audit", "nameEn": "License Audit / Compliance Check", "nameAr": "تدقيق التراخيص والامتثال" },
    { "id": "sl-other", "nameEn": "Other", "nameAr": "أخرى" }
  ],
  "other": [
    { "id": "general-issue", "nameEn": "Issue", "nameAr": "اذكر السبب" }
  ]
};

const serviceArabicOverrides = {
  // Access Management
  'am-new-account': 'إنشاء حساب مستخدم جديد',
  'am-disable-account': 'تعطيل أو إنهاء حساب مستخدم',
  'am-reset-password': 'إعادة تعيين كلمة المرور',
  'am-unlock-account': 'فتح حساب مقفل',
  'am-grant-permission': 'منح أو تعديل الصلاحيات',
  'am-revoke-access': 'إلغاء الوصول',
  'am-shared-mailbox': 'الوصول إلى صندوق بريد مشترك',
  'am-distribution-group': 'إدارة مجموعات التوزيع',
  'am-vpn': 'طلب الوصول عبر VPN',
  'am-mfa': 'إعداد أو إعادة تعيين المصادقة الثنائية',
  'am-other': 'أخرى',

  // Asset Management
  'ast-register': 'تسجيل أصل جديد',
  'ast-transfer': 'نقل أصل بين الموظفين',
  'ast-disposal': 'طلب إتلاف أصل',
  'ast-audit': 'جرد أو تدقيق الأصول',
  'ast-lost-stolen': 'الإبلاغ عن أصل مفقود أو مسروق',
  'ast-other': 'أخرى',

  // Device Replacement
  'dr-computer': 'استبدال جهاز حاسوب',
  'dr-printer': 'استبدال طابعة',
  'dr-keyboard': 'استبدال لوحة مفاتيح',
  'dr-mouse': 'استبدال فأرة',
  'dr-monitor': 'استبدال شاشة',
  'dr-headset': 'استبدال سماعة',
  'dr-other': 'أخرى',

  // Service Requests
  'sr-new-equipment': 'طلب جهاز جديد',
  'sr-software-install': 'تثبيت برنامج',
  'sr-peripheral': 'طلب جهاز طرفي',
  'sr-workspace-setup': 'إعداد مكان العمل',
  'sr-onboarding': 'تهيئة موظف جديد',
  'sr-offboarding': 'إنهاء خدمات موظف',
  'sr-business-card': 'طلب بطاقة عمل',
  'sr-other': 'أخرى',

  // Software & Licensing
  'sl-new-license': 'طلب ترخيص جديد',
  'sl-renew-license': 'تجديد ترخيص',
  'sl-transfer-license': 'نقل ترخيص لمستخدم آخر',
  'sl-revoke-license': 'إلغاء ترخيص',
  'sl-upgrade': 'طلب ترقية برنامج',
  'sl-audit': 'تدقيق التراخيص والامتثال',
  'sl-other': 'أخرى',

  // Technical Support (high-level requests)
  'ts-create-account': 'إنشاء حساب مستخدم',
  'ts-device-fix': 'إصلاح مشاكل الجهاز',
  'ts-office-install': 'تثبيت Microsoft Office',
  'ts-user-system-update': 'تحديث الأنظمة المرتبطة بالمستخدم',
  'ts-edit-user': 'تعديل بيانات المستخدم',
  'ts-password-reset': 'طلب إعادة تعيين كلمة المرور',
  'ts-specialized-software': 'تثبيت برنامج متخصص',
  'ts-ms-office': 'تثبيت Microsoft Office',
  'ts-recording': 'طلب تسجيل صوتي',
  'ts-new-device': 'طلب جهاز جديد',
  'ts-monitor': 'طلب شاشة',
  'ts-keyboard-mouse': 'Keyboard / Mouse / Accessories',
  'ts-other-support': 'أخرى',

  // Generic
  'general-issue': 'اذكر السبب',

  // Cybersecurity requests
  'cs-password-manager': 'طلبات مدير كلمات المرور',
  'cs-pass-through-email': 'تمرير البريد الإلكتروني',
  'cs-remote-access': 'الوصول عن بعد',
  'cs-firewall-services': 'خدمات جدار الحماية',
  'cs-website-availability': 'خدمة توافر الموقع الإلكتروني',
  'cs-usb-port': 'خدمة منفذ USB',
  'cs-antivirus': 'مشكلة مكافحة الفيروسات والبرمجيات الخبيثة',
  'cs-phishing': 'الإبلاغ عن بريد التصيد',
  'cs-suspicious-link': 'الإبلاغ عن موقع أو رابط مشبوه',
  'cs-usb-access': 'طلب وصول USB',
  'cs-usb': 'طلب وصول USB',
  'cs-nac': 'التحكم في الوصول للشبكة',
  'cs-data-breach': 'الإبلاغ عن تسريب بيانات مشتبه به',
  'cs-firewall-rule': 'طلب قاعدة جدار ناري',
  'cs-firewall': 'طلب قاعدة جدار ناري',
  'cs-other-security': 'طلب خدمة أمن سيبراني أخرى',
  'cs-other': 'أخرى',

  // NOC
  'noc-service': 'طلب خدمة NOC',
  'noc-ports': 'فتح أو إغلاق منافذ الاتصال الشبكي',

  // Infrastructure
  'infra-active-directory': 'خدمات Active Directory',
  'infra-backup': 'خدمات النسخ الاحتياطي',
  'infra-dns': 'خدمات DNS',
  'infra-domain-controller': 'متحكم النطاق',
  'infra-email': 'خدمات البريد الإلكتروني',
  'infra-permission': 'خدمات الصلاحيات',
  'infra-server': 'خدمات الخوادم',
  'infra-pam': 'إدارة وصول المميز',
  'infra-other': 'طلب آخر',

  // Network
  'net-firewall': 'خدمات جدار الحماية',
  'net-load-balancing': 'خدمات موزن التحميل',
  'net-services': 'خدمات الشبكة',
  'net-remote-access': 'الوصول عن بعد',
  'net-other': 'طلبات شبكة أخرى',

  // Development
  'dev-data-migration': 'ترحيل البيانات',
  'dev-major-enhancement': 'تحسين خدمة كبير',
  'dev-minor-modification': 'تعديل بسيط',
  'dev-minor-enhancement': 'تحسين بسيط للخدمة',
  'dev-modify-ip': 'تعديل عنوان IP',
  'dev-network-failure': 'فشل الشبكة',
  'dev-new-feature': 'طلب ميزة جديدة',
  'dev-new-tool': 'طلب أداة جديدة',
  'dev-password-reset': 'إعادة تعيين كلمة المرور',
  'dev-performance-improvement': 'تحسين الأداء',
  'dev-other': 'طلب تطوير آخر',
  'dev-request-domain': 'طلب نطاق جديد',
  'dev-server-outage': 'انقطاع الخادم',
  'dev-service-testing': 'اختبار الخدمة',
  'dev-system-down': 'انخفاض النظام',
  'dev-system-testing': 'اختبار النظام',
  'dev-system-upgrade': 'ترقية النظام',

  // QA/QC
  'qa-cloud-testing': 'اختبار السحابة',
  'qa-code-review': 'مراجعة الكود',
  'qa-database-testing': 'اختبار قاعدة البيانات',
  'qa-faction-testing': 'اختبار Faction',
  'qa-other': 'طلبات QA/QC أخرى',
  'qa-quality-control': 'مراقبة الجودة',
  'qa-security-control': 'مراقبة الأمان',
  'qa-services-testing': 'اختبار الخدمات',

  // Digital transformation
  'dt-services': 'طلب خدمات التحول الرقمي',

  // Project management
  'pm-request': 'إدارة المشروع',

  // Device technical issues (technical-support)
  'ts-device-not-working': 'الجهاز لا يعمل',
  'ts-slow-performance': 'أداء بطيء',
  'ts-blue-screen': 'الشاشة الزرقاء / تعطل النظام',
  'ts-monitor-issue': 'مشكلة في الشاشة',
  'ts-printer-issue': 'مشكلة في الطابعة',
  'ts-keyboard-mouse-issue': 'Keyboard / Mouse Issue',
  'ts-network-connection': 'مشكلة في الاتصال بالشبكة',
  'ts-internet-access': 'مشكلة في الوصول للإنترنت',
  'ts-email-issue': 'مشكلة في البريد الإلكتروني',
  'ts-transfer-device': 'نقل جهاز',
  'ts-other': 'أخرى',

  // Project/ERP/HR related
  'ehr-new-user': 'إنشاء مستخدم جديد في وحدة الموارد البشرية',
  'ehr-role-change': 'تغيير دور أو صلاحيات الموارد البشرية',
  'ehr-employee-data': 'تصحيح بيانات الموظف',
  'ehr-payroll': 'مشكلة في معالجة الرواتب',
  'ehr-leave': 'مشكلة في سياسة أو إعداد الإجازات',
  'ehr-workflow': 'مشكلة في سير موافقات الموارد البشرية',
  'ehr-report': 'طلب تقرير HR',
  'ehr-other': 'أخرى',

  // ERP other
  'erp-finance': 'مشكلة وحدة المالية',
  'erp-procurement': 'مشكلة وحدة المشتريات',
  'erp-inventory': 'مشكلة وحدة المخزون',
  'erp-sales': 'مشكلة وحدة المبيعات',
  'erp-projects': 'مشكلة وحدة المشاريع',
  'erp-new-user': 'إنشاء مستخدم جديد في النظام',
  'erp-role-change': 'تغيير دور أو صلاحيات في النظام',
  'erp-data-correction': 'تصحيح إدخال البيانات',
  'erp-report': 'طلب تقرير مخصص',
  'erp-workflow': 'مشكلة في سير العمل',

  // HR system
  'hrs-cancel-vacation': 'إلغاء راحة أو إجازة',
  'hrs-vacation-edit': 'تعديل طلب إجازة',
  'hrs-travel-edit': 'تعديل طلب سفر',
  'hrs-overtime-edit': 'تعديل طلب عمل إضافي',
  'hrs-system-issue': 'مشكلة في النظام',
  'hrs-other': 'أخرى',

  // Incident management
  'im-p1': 'حادثة حرجة (P1) — انقطاع كامل',
  'im-p2': 'حادثة كبيرة (P2) — انقطاع جزئي',
  'im-p3': 'حادثة طفيفة (P3) — خدمة متدهورة',
  'im-hardware-failure': 'فشل في الأجهزة',
  'im-software-crash': 'تحطم أو خطأ في البرنامج',
  'im-network-outage': 'انقطاع الشبكة',
  'im-data-loss': 'فقدان أو تلف البيانات',
  'im-security-incident': 'حادثة أمنية',
  'im-other': 'أخرى',

  // Knowledge base
  'kb-new-article': 'طلب مقالة معرفة جديدة',
  'kb-update-article': 'تحديث مقالة موجودة',
  'kb-broken-link': 'الإبلاغ عن رابط مكسور أو محتوى قديم',
  'kb-access': 'مشكلة في الوصول لقاعدة المعرفة',
  'kb-other': 'أخرى',

  // Maintenance
  'ms-new-request': 'طلب صيانة جديد',
  'ms-ip-telephone': 'خدمات الهاتف IP',
  'ms-car-services': 'خدمات السيارات',
  'ms-meeting-room': 'طلب غرفة اجتماع',
  'ms-other': 'أخرى',
  'other': 'أخرى'
};

// Normalize Arabic labels at load time to avoid mojibake showing in the UI.
// Uses serviceArabicOverrides where available, otherwise keeps existing nameAr.
Object.keys(servicesByCategory).forEach((cat) => {
  servicesByCategory[cat] = servicesByCategory[cat].map((s) => ({
    ...s,
    nameAr: serviceArabicOverrides[s.id] || s.nameAr || ''
  }));
});

  const services = servicesByCategory[category] || [];
  
  const filteredServices = services.filter((service) => {
    const arabicLabel = serviceArabicOverrides[service.id] || '';
    const query = searchQuery.toLowerCase();
    return service.nameEn.toLowerCase().includes(query) || arabicLabel.includes(searchQuery);
  });

  const getArabicLabel = (service) => serviceArabicOverrides[service.id] || '';

  const handleServiceSelect = (service) => {
    if (service.id === 'general-issue') {
      // Don't close modal for "Issue" service, show textarea instead
      onServiceSelect(service);
    } else {
      onServiceSelect(service);
      onClose();
    }
  };

  if (!category) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <div className={`flex items-start justify-between gap-4`}>
          <div className={'text-left'}>
            <h3 className="text-base font-semibold text-foreground">{t('selectService', 'Select Service')}</h3>
            <p className="text-xs text-muted-foreground">{t('chooseServiceFrom', 'Choose a service from')} {categoryLabel || category}.</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" type="button">
              <Icon name="X" size={18} />
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder={t('searchServices', 'Search services...') }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-3">
        <div className="text-xs text-muted-foreground">
          {filteredServices.length} {t('servicesAvailable', 'services available')}
        </div>

        <div className="space-y-1">
          {filteredServices.map((service, index) => (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 ${'text-left'} transition-all hover:border-primary/40 hover:bg-primary/5 ${
                selectedService?.id === service.id ? 'border-primary bg-primary/10' : 'border-border bg-background'
              }`}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <div className={`flex items-center gap-2 ${''}`}>
                  <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    selectedService?.id === service.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                    <div className={`min-w-0 ${ 'text-left'}`}>
                      <div className="text-sm font-medium text-foreground truncate">{language === 'ar' ? (serviceArabicOverrides[service.id] || service.nameEn) : service.nameEn}</div>
                      {getArabicLabel(service) && language !== 'ar' && (
                        <div className="text-xs text-muted-foreground truncate" dir="rtl">{getArabicLabel(service)}</div>
                      )}
                    </div>
                </div>
              </div>
              <Icon name={isRtl ? "ChevronLeft" : "ChevronRight"} size={14} className="shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 py-6 text-center text-sm text-muted-foreground">
            {t('noServicesFound', 'No services found')}
          </div>
        )}

        {selectedService?.id === 'general-issue' && (
          <div className="rounded-xl border border-border bg-muted/20 p-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <label className={`block text-sm font-medium text-foreground mb-2 ${ 'text-left'}`}>
              {t('pleaseSpecifyReason', 'Please specify the reason:')}
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('describeIssuePlaceholder', 'Please describe your issue in detail...') }
            />
            {onClose && (
              <div className={`mt-4 flex justify-end gap-2 ${''}`}>
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                  type="button"
                >
                  {t('confirm', 'Confirm')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelector;

