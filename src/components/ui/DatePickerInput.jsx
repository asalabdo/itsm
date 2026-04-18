import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isValid, parse } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Icon from '../AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const DatePickerInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required, 
  error, 
  description,
  className = '' 
}) => {
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);
  
  const dateLocale = language === 'ar' ? ar : enUS;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getStartPadding = () => {
    const firstDay = startOfMonth(currentMonth);
    const dayOfWeek = firstDay.getDay();
    return isRtl ? (7 - dayOfWeek) % 7 : dayOfWeek;
  };

  const handleDateSelect = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val) {
      onChange(val);
    }
  };

  const displayValue = value ? format(new Date(value), 'dd/MM/yyyy') : '';

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = isRtl 
    ? ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className={`text-sm font-medium text-left ${error ? 'text-destructive' : 'text-foreground'}`}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          dir="ltr"
          readOnly
          value={displayValue}
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder || t('selectDate', 'Select date')}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${error ? 'border-destructive' : 'border-border'} ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors ${isRtl ? 'left-2' : 'right-2'}`}
        >
          <Icon name="Calendar" size={18} className="text-muted-foreground" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-2 z-50 bg-popover border border-border rounded-xl shadow-elevation-3 p-3 min-w-[280px]`}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name={isRtl ? "ChevronRight" : "ChevronLeft"} size={18} />
              </button>
              <span className="text-sm font-semibold text-foreground">
                {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name={isRtl ? "ChevronLeft" : "ChevronRight"} size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getStartPadding() }).map((_, index) => (
                <div key={`pad-${index}`} className="w-8 h-8" />
              ))}
              {getDaysInMonth().map((date, index) => {
                const isSelected = value && isSameDay(date, new Date(value));
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground font-semibold' 
                        : isToday 
                          ? 'bg-primary/20 text-primary font-medium'
                          : 'hover:bg-muted'
                    }`}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <input
                type="date"
                dir="ltr"
                value={value || ''}
                onChange={handleInputChange}
                className="w-full text-sm bg-background border border-border rounded-lg px-2 py-1"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default DatePickerInput;