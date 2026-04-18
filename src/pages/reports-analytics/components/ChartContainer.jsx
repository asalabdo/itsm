import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ChartContainer = ({ title, description, children, onExport, onRefresh, actions }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground caption">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                iconName="RefreshCw"
                onClick={onRefresh}
                className="flex-shrink-0"
              >
                {t('refresh', 'Refresh')}
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                onClick={onExport}
                className="flex-shrink-0"
              >
                {t('export', 'Export')}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
