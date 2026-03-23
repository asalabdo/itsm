import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ServiceSelector = ({ category, selectedService, onServiceSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const servicesByCategory = {
    'technical-support': [
      { id: 'transfer-device', nameEn: 'Transfer Device', nameAr: 'نقل جهاز' },
      { id: 'repair-device', nameEn: 'Repair (Device/Printer/Monitor...etc)', nameAr: 'إصلاح (جهاز/طابعة/شاشة ... الخ )' },
      { id: 'network-connection', nameEn: 'Network connection', nameAr: 'توصيل نقطة شبكية' },
      { id: 'change-email', nameEn: 'Change Email', nameAr: 'إصلاح بريد إلكتروني' },
      { id: 'create-email', nameEn: 'Create new Email', nameAr: 'طلب انشاء بريد إلكتروني' },
      { id: 'other-tech', nameEn: 'Other', nameAr: 'اخرى' },
    ],
    'device-replacement': [
      { id: 'computer-replacement', nameEn: 'Computer Replacement', nameAr: 'إستبدال جهاز حاسب آلي' },
      { id: 'printer-replacement', nameEn: 'Printer Replacement', nameAr: 'إستبدال طابعة' },
      { id: 'keyboard-replacement', nameEn: 'Keyboard Replacement', nameAr: 'استبدال لوحة المفاتيح' },
      { id: 'mouse-replacement', nameEn: 'Mouse Replacement', nameAr: 'استبدال فأرة' },
    ],
    'hr-system': [
      { id: 'cancel-vacation', nameEn: 'Request to cancel rest, permission, or vacations', nameAr: 'طلب الغاء راحة او استئذان أو الإجازات' },
      { id: 'vacation-edit', nameEn: 'Vacation request edit', nameAr: 'تعديل طلب الاجازة' },
      { id: 'travel-edit', nameEn: 'Travel request edit', nameAr: 'تعديل طلب الانتداب' },
      { id: 'overtime-edit', nameEn: 'Overtime request edit', nameAr: 'تعديل طلب العمل الاضافي' },
      { id: 'hr-issue', nameEn: 'Request Issue', nameAr: 'مشكلة في النظام' },
      { id: 'other-hr', nameEn: 'Other', nameAr: 'اخرى' },
    ],
    'maintenance-service': [
      { id: 'maintenance-service', nameEn: 'New Maintenance Service', nameAr: 'طلب صيانة' },
      { id: 'ip-telephone', nameEn: 'IP Telephone Services', nameAr: 'خدمات الهاتف الشبكي' },
      { id: 'car-services', nameEn: 'Car Services', nameAr: 'خدمات السيارة' },
      { id: 'meeting-room', nameEn: 'Meeting room Request', nameAr: 'طلب غرفة اجتماع' },
    ],
    'cyber-security': [
      { id: 'internet-disconnection', nameEn: 'Internet disconnection', nameAr: 'انقطاع الانترنت' },
      { id: 'network-access-control', nameEn: 'Network access control', nameAr: 'التحكم في الوصول للشبكة' },
      { id: 'antivirus', nameEn: 'Antivirus software', nameAr: 'برامج مكافحة الفيروسات' },
      { id: 'vpn-access', nameEn: 'VPN Access', nameAr: 'الاتصال عن بعد (VPN)' },
      { id: 'usb-access', nameEn: 'USB Access', nameAr: 'اتاحة استخدام وحدة التخزين (USB)' },
      { id: 'report-suspicious', nameEn: 'Report suspicious websites and links', nameAr: 'الإبلاغ عن مواقع وروابط مشبوهة' },
      { id: 'report-phishing', nameEn: 'Report phishing and anonymous emails', nameAr: 'الإبلاغ عن إيميلات تصيدية ومجهولة المصدر' },
    ],
    'other': [
      { id: 'general-issue', nameEn: 'Issue', nameAr: 'اذكر السبب' },
    ],
  };

  const services = servicesByCategory[category] || [];
  
  const filteredServices = services.filter(service =>
    service.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.nameAr.includes(searchQuery)
  );

  const handleServiceSelect = (service) => {
    if (service.nameAr === 'اذكر السبب') {
      // Don't close modal for "Issue" service, show textarea instead
      onServiceSelect(service);
    } else {
      onServiceSelect(service);
      onClose();
    }
  };

  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Select Service</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <Icon name="X" size={20} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-2">
            {filteredServices.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`w-full p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors ${
                  selectedService?.id === service.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900">{service.nameEn}</div>
                <div className="text-sm text-gray-600 mt-1">{service.nameAr}</div>
              </button>
            ))}
          </div>
          
          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No services found
            </div>
          )}
        </div>
        
        {selectedService?.nameAr === 'اذكر السبب' && (
          <div className="p-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please specify the reason:
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please describe your issue in detail..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelector;