// components/ui/Select.jsx - Shadcn style Select
import React, { useState } from "react";
import { ChevronDown, Check, Search, X, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "./Button";
import Input from "./Input";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../services/i18n";

const isGroupOption = (option) => Array.isArray(option?.options);

const flattenOptions = (items = []) =>
    (Array.isArray(items) ? items : []).flatMap((option) =>
        isGroupOption(option) ? flattenOptions(option.options) : [option]
    );

const normalizeGroupedOptions = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
        return [];
    }

    if (items.some(isGroupOption)) {
        return items;
    }

    const grouped = new Map();
    const ungrouped = [];

    items.forEach((option) => {
        const groupLabel = option?.group || option?.groupLabel || option?.section;
        if (!groupLabel) {
            ungrouped.push(option);
            return;
        }

        if (!grouped.has(groupLabel)) {
            grouped.set(groupLabel, []);
        }

        grouped.get(groupLabel).push({ ...option });
    });

    const groupedOptions = Array.from(grouped.entries()).map(([label, groupItems]) => ({
        label,
        options: groupItems,
    }));

    return [...ungrouped, ...groupedOptions];
};

const filterGroupedOptions = (items = [], searchTerm = "") => {
    if (!searchTerm) {
        return items;
    }

    const normalizedTerm = String(searchTerm).toLowerCase();

    return (Array.isArray(items) ? items : [])
        .map((option) => {
            if (isGroupOption(option)) {
                const filteredChildren = filterGroupedOptions(option.options, searchTerm);
                return filteredChildren.length > 0
                    ? { ...option, options: filteredChildren }
                    : null;
            }

            const label = String(option?.label || "").toLowerCase();
            const value = String(option?.value || "").toLowerCase();
            const description = String(option?.description || "").toLowerCase();
            return label.includes(normalizedTerm) || value.includes(normalizedTerm) || description.includes(normalizedTerm)
                ? option
                : null;
        })
        .filter(Boolean);
};

const renderOptions = (items, { onSelect, isSelected, multiple, isRtl }) => (
    (Array.isArray(items) ? items : []).map((option) => {
        if (isGroupOption(option)) {
            return (
                <div key={`group-${String(option?.label || option?.value)}`} className="py-1">
                    <div className={cn("px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground bg-muted/30", isRtl ? 'text-right' : 'text-left')}>
                        {option?.label}
                    </div>
                    <div>
                        {renderOptions(option.options, { onSelect, isSelected, multiple, isRtl })}
                    </div>
                </div>
            );
        }

        return (
            <div
                key={option?.value}
                className={cn(
                    "relative flex cursor-pointer select-none items-start gap-2 rounded-sm px-3 py-2 text-sm outline-none hover:bg-muted hover:text-foreground",
                    isSelected(option?.value) && "bg-primary text-primary-foreground",
                    option?.disabled && "pointer-events-none opacity-50"
                )}
                onClick={() => !option?.disabled && onSelect(option)}
            >
                <div className="min-w-0 flex-1">
                    <div className={cn('truncate', isRtl ? 'text-right' : 'text-left')}>{option?.label}</div>
                    {option?.description && (
                        <div className={cn(
                            "mt-0.5 text-xs truncate",
                            isSelected(option?.value) ? "text-primary-foreground/80" : "text-muted-foreground",
                            isRtl ? 'text-right' : 'text-left'
                        )}>
                            {option.description}
                        </div>
                    )}
                </div>
                {multiple && isSelected(option?.value) && (
                    <Check className="h-4 w-4 shrink-0 mt-0.5" />
                )}
            </div>
        );
    })
);

const Select = React.forwardRef(({
    className,
    options = [],
    value,
    defaultValue,
    placeholder,
    multiple = false,
    disabled = false,
    required = false,
    label,
    description,
    error,
    searchable = false,
    clearable = false,
    loading = false,
    id,
    name,
    onChange,
    onOpenChange,
    ...props
}, ref) => {
    const { language, isRtl } = useLanguage();
    const t = (key, fallback) => getTranslation(language, key, fallback);

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Generate unique ID if not provided
    const selectId = id || `select-${Math.random()?.toString(36)?.substr(2, 9)}`;

    // Filter options based on search
    const normalizedOptions = normalizeGroupedOptions(options);
    const filteredOptions = searchable && searchTerm
        ? filterGroupedOptions(normalizedOptions, searchTerm)
        : normalizedOptions;

    const flatOptions = flattenOptions(normalizedOptions);

    // Get selected option(s) for display
    const getSelectedDisplay = () => {
        if (!value) return placeholder || t('selectOption', 'Select an option');

        if (multiple) {
            const selectedOptions = flatOptions?.filter(opt => value?.includes(opt?.value));
            if (selectedOptions?.length === 0) return placeholder || t('selectOption', 'Select an option');
            if (selectedOptions?.length === 1) return selectedOptions?.[0]?.label;
            return `${selectedOptions?.length} ${t('itemsSelected', 'items selected')}`;
        }

        const selectedOption = flatOptions?.find(opt => opt?.value === value);
        return selectedOption ? selectedOption?.label : (placeholder || t('selectOption', 'Select an option'));
    };

    const handleToggle = () => {
        if (!disabled) {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            onOpenChange?.(newIsOpen);
            if (!newIsOpen) {
                setSearchTerm("");
            }
        }
    };

    const handleOptionSelect = (option) => {
        if (multiple) {
            const newValue = value || [];
            const updatedValue = newValue?.includes(option?.value)
                ? newValue?.filter(v => v !== option?.value)
                : [...newValue, option?.value];
            onChange?.(updatedValue);
        } else {
            onChange?.(option?.value);
            setIsOpen(false);
            onOpenChange?.(false);
        }
    };

    const handleClear = (e) => {
        e?.stopPropagation();
        onChange?.(multiple ? [] : '');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e?.target?.value);
    };

    const isSelected = (optionValue) => {
        if (multiple) {
            return value?.includes(optionValue) || false;
        }
        return value === optionValue;
    };

    const hasValue = multiple ? value?.length > 0 : value !== undefined && value !== '';

    return (
        <div className={cn("relative", className)} dir={isRtl ? 'rtl' : 'ltr'}>
            {label && (
                <label
                    htmlFor={selectId}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className={cn(
                        `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block ${isRtl ? 'text-right' : 'text-left'}`,
                        error ? "text-destructive" : "text-foreground"
                    )}
                >
                    {label}
                    {required && <span className={cn('text-destructive', isRtl ? 'mr-1' : 'ml-1')}>*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    ref={ref}
                    id={selectId}
                    type="button"
                    className={cn(
                        `flex h-10 w-full items-center justify-between rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isRtl ? 'flex-row-reverse' : ''}`,
                        error && "border-destructive focus:ring-destructive",
                        !hasValue && "text-muted-foreground"
                    )}
                    onClick={handleToggle}
                    disabled={disabled}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    {...props}
                >
                    <span className={cn('truncate', isRtl ? 'text-right' : 'text-left')}>{getSelectedDisplay()}</span>

                    <div className="flex items-center gap-1">
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {clearable && hasValue && !loading && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={handleClear}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}

                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180", isRtl && "-scale-x-100")} />
                    </div>
                </button>

                {/* Hidden native select for form submission */}
                <select
                    name={name}
                    value={value || ''}
                    onChange={() => { }} // Controlled by our custom logic
                    className="sr-only"
                    tabIndex={-1}
                    multiple={multiple}
                    required={required}
                >
                    <option value="">{t('selectDots', 'Select...')}</option>
                    {flatOptions?.map(option => (
                        <option key={option?.value} className={isRtl ? 'text-right' : 'text-left'} value={option?.value}>
                            {option?.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown */}
                {isOpen && (
                    <div dir={isRtl ? 'rtl' : 'ltr'} className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg overflow-hidden">
                        {searchable && (
                            <div className="p-2 border-b border-border">
                                <div className="relative">
                                    <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRtl ? 'right-2' : 'left-2')} />
                                    <Input
                                        placeholder={t('searchOptions', 'Search options...')}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        dir={isRtl ? 'rtl' : 'ltr'}
                                        className={isRtl ? 'pr-8 text-right' : 'pl-8 text-left'}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="py-1 max-h-60 overflow-auto">
                            {filteredOptions?.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    {searchTerm ? t('noOptionsFound', 'No options found') : t('noOptionsAvailable', 'No options available')}
                                </div>
                            ) : (
                                renderOptions(filteredOptions, {
                                        onSelect: handleOptionSelect,
                                        isSelected,
                                        multiple,
                                        isRtl,
                                    })
                            )}
                        </div>
                    </div>
                )}
            </div>
            {description && !error && (
                <p className={cn('text-sm text-muted-foreground mt-1', isRtl ? 'text-right' : 'text-left')}>
                    {description}
                </p>
            )}
            {error && (
                <p className={cn('text-sm text-destructive mt-1', isRtl ? 'text-right' : 'text-left')}>
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = "Select";

export default Select;
