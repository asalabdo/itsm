import React from 'react';
import Icon from '../AppIcon';

const DynamicFormRenderer = ({ config, value, onChange }) => {
  if (!config || !Array.isArray(config)) return null;

  const handleChange = (label, val) => {
    onChange({ ...value, [label]: val });
  };

  return (
    <div className="space-y-4">
      {config.map((field, index) => (
        <div key={index} className="space-y-1.5">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </label>
          
          {field.type === 'text' && (
            <input 
              type="text"
              placeholder={`Enter ${field.label.toLowerCase()}...`}
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
              <option value="">Select option...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {field.type === 'date' && (
            <input 
              type="date"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-ring transition-all"
              value={value[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === 'textarea' && (
            <textarea 
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-all min-h-[100px]"
              value={value[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
            ></textarea>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicFormRenderer;
