import React from 'react';
import Icon from '../AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import DatePickerInput from './DatePickerInput';

const DynamicFormRenderer = ({ config, value, onChange }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const getLocalizedLabel = (label) => {
    const translations = {
      'Reason for request': language === 'ar' ? 'سبب الطلب' : 'Reason for request',
      'Department': language === 'ar' ? 'القسم' : 'Department',
      'Visitor Name': language === 'ar' ? 'اسم الزائر' : 'Visitor Name',
      'Expiry Date': language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date',
      'Justification': language === 'ar' ? 'التبرير' : 'Justification',
    };
    return translations[label] || label;
  };

  const getLocalizedOption = (option) => {
    const translations = {
      'Creative': language === 'ar' ? 'إبداعي' : 'Creative',
      'Marketing': language === 'ar' ? 'تسويق' : 'Marketing',
      'Product': language === 'ar' ? 'منتج' : 'Product',
    };
    return translations[option] || option;
  };

  const handleChange = (label, val) => {
    onChange({ ...value, [label]: val });
  };

  return (
    <div className="space-y-4">
      {config.map((field, index) => {
        const fieldLabel = getLocalizedLabel(field.label);
        return (
        <div key={index} className="space-y-1.5">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            {fieldLabel}
            {field.required && <span className="text-destructive">*</span>}
          </label>
          
          {field.type === 'text' && (
            <input 
              type="text"
              placeholder={`${language === 'ar' ? 'أدخل' : 'Enter'} ${fieldLabel.toLowerCase()}...`}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-all"
              value={value[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === 'select' && (
            <select 
              className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-ring transition-all bg-background text-foreground"
              value={value[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
            >
              <option value="">{t('selectOptionDots', 'Select option...')}</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{getLocalizedOption(opt)}</option>
              ))}
            </select>
          )}

          {field.type === 'date' && (
            <DatePickerInput
              label={fieldLabel}
              value={value[field.label] || ''}
              onChange={(dateValue) => handleChange(field.label, dateValue)}
              required={field.required}
            />
          )}

          {field.type === 'textarea' && (
            <textarea 
              placeholder={`${language === 'ar' ? 'أدخل' : 'Enter'} ${fieldLabel.toLowerCase()}...`}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-all min-h-[100px]"
              value={value[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
            ></textarea>
          )}
        </div>
        );
      })}
    </div>
  );
};

export default DynamicFormRenderer;
