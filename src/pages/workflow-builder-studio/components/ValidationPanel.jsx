import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';

const ValidationPanel = ({ isOpen, onClose, validationResults }) => {
  const { language } = useLanguage();
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const text = (arText, enText) => (isArabic ? arText : enText);
  const errors = validationResults?.filter(r => r?.type === 'error');
  const warnings = validationResults?.filter(r => r?.type === 'warning');
  const suggestions = validationResults?.filter(r => r?.type === 'suggestion');
  const hasErrors = (errors?.length || 0) > 0;
  const hasWarnings = (warnings?.length || 0) > 0;
  const readinessState = hasErrors
    ? {
        tone: 'error',
        icon: 'XCircle',
        label: text('محظور للإطلاق', 'Blocked for go-live'),
      }
    : {
        tone: 'success',
        icon: 'CheckCircle',
        label: text('جاهز للإطلاق', 'Ready for go-live'),
      };
  const rollbackStatus = hasErrors
    ? {
        tone: 'error',
        icon: 'XCircle',
        label: text(
          'تخطيط التراجع معطل حتى استعادة أخطاء التحقق',
          'Rollback planning is blocked until validation errors are resolved',
        ),
      }
    : hasWarnings
      ? {
          tone: 'warning',
          icon: 'AlertTriangle',
          label: text(
            'يوصى بمراجعة تخطيط التراجع قبل النشر',
            'Rollback review is recommended before deploy',
          ),
        }
      : {
          tone: 'success',
          icon: 'CheckCircle',
          label: text(
            'خطة التراجع جاهزة للإطلاق',
            'Rollback plan is ready for go-live',
          ),
        };
  const goLiveSupportCue = hasErrors
    ? {
        tone: 'error',
        icon: 'AlertTriangle',
        label: text('دعم الإطلاق معلق', 'Go-live support blocked'),
      }
    : hasWarnings
      ? {
          tone: 'warning',
          icon: 'AlertTriangle',
          label: text('دعم الإطلاق قيد المراجعة', 'Go-live support review'),
        }
      : {
          tone: 'success',
          icon: 'CheckCircle',
          label: text('دعم الإطلاق جاهز', 'Go-live support ready'),
        };

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'suggestion':
        return 'Lightbulb';
      default:
        return 'Info';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'suggestion':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background z-1100" onClick={onClose} />
      <div className="fixed inset-4 md:inset-8 lg:inset-x-64 lg:inset-y-16 bg-card border border-border rounded-lg shadow-elevation-5 z-1200 flex flex-col max-w-4xl mx-auto">
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">{text('التحقق من سير العمل', 'Workflow Validation')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {text('راجع مشكلات التكوين والاقتراحات', 'Review configuration issues and suggestions')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
              aria-label={text('إغلاق لوحة التحقق', 'Close validation panel')}
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-error/10 rounded-md">
              <Icon name="XCircle" size={16} className="text-error" />
              <span className="text-sm font-medium">{errors?.length} {text('أخطاء', 'Errors')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 rounded-md">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <span className="text-sm font-medium">{warnings?.length} {text('تحذيرات', 'Warnings')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md">
              <Icon name="Lightbulb" size={16} className="text-primary" />
              <span className="text-sm font-medium">{suggestions?.length} {text('اقتراحات', 'Suggestions')}</span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                readinessState.tone === 'error'
                  ? 'bg-error/10 text-error'
                  : 'bg-success/10 text-success'
              }`}
              aria-live="polite"
            >
              <Icon name={readinessState.icon} size={16} />
              <span>{readinessState.label}</span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${
                rollbackStatus.tone === 'error'
                  ? 'bg-error/10 text-error'
                  : rollbackStatus.tone === 'warning'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-success/10 text-success'
              }`}
              aria-live="polite"
            >
              <Icon name={rollbackStatus.icon} size={14} />
              <span>{rollbackStatus.label}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
          {validationResults?.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Icon name="CheckCircle" size={64} className="mx-auto text-success mb-4" />
                <h3 className="text-lg font-semibold mb-2">{text('كل شيء سليم!', 'All Clear!')}</h3>
                <p className="text-sm text-muted-foreground">
                  {text('لا توجد مشكلات تحقق في سير العمل', 'Your workflow has no validation issues')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {errors?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Icon name="XCircle" size={20} className="text-error" />
                    {text('أخطاء', 'Errors')} ({errors?.length})
                  </h3>
                  <div className="space-y-3">
                    {errors?.map((result, index) => (
                      <div key={index} className="bg-error/5 border border-error/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Icon name={getIcon(result?.type)} size={20} className={getColor(result?.type)} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{result?.message}</p>
                            <p className="text-xs text-muted-foreground mb-2">{result?.details}</p>
                            {result?.suggestion && (
                              <div className="flex items-start gap-2 mt-2 p-2 bg-background rounded">
                                <Icon name="Lightbulb" size={14} className="text-primary mt-0.5" />
                                <p className="text-xs">{result?.suggestion}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {warnings?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={20} className="text-warning" />
                    {text('تحذيرات', 'Warnings')} ({warnings?.length})
                  </h3>
                  <div className="space-y-3">
                    {warnings?.map((result, index) => (
                      <div key={index} className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Icon name={getIcon(result?.type)} size={20} className={getColor(result?.type)} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{result?.message}</p>
                            <p className="text-xs text-muted-foreground">{result?.details}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {suggestions?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Lightbulb" size={20} className="text-primary" />
                    {text('اقتراحات', 'Suggestions')} ({suggestions?.length})
                  </h3>
                  <div className="space-y-3">
                    {suggestions?.map((result, index) => (
                      <div key={index} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Icon name={getIcon(result?.type)} size={20} className={getColor(result?.type)} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{result?.message}</p>
                            <p className="text-xs text-muted-foreground">{result?.details}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-border flex items-center justify-end gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${
              goLiveSupportCue.tone === 'error'
                ? 'bg-error/10 text-error'
                : goLiveSupportCue.tone === 'warning'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-success/10 text-success'
            }`}
            aria-live="polite"
          >
            <Icon name={goLiveSupportCue.icon} size={14} />
            <span>{goLiveSupportCue.label}</span>
          </div>
          <Button
            variant="outline"
            size="default"
            onClick={onClose}
          >
            {text('إغلاق', 'Close')}
          </Button>
          {errors?.length === 0 && (
            <Button
              variant="default"
              size="default"
              iconName="CheckCircle"
              iconPosition="left"
            >
              {text('نشر سير العمل', 'Deploy Workflow')}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ValidationPanel;
