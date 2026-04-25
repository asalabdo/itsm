import Icon from '../AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const defaultSteps = [
  'Intake',
  'Match service/org',
  'Manager review',
  'ERP fan-out',
  'Third-party submit',
  'Close'
];

const getStepTranslation = (step, t) => {
  const stepMap = {
    'Intake': 'intake',
    'Classify': 'classify',
    'Assign': 'assign',
    'ERP fan-out': 'erpFanOut',
    'Resolve': 'resolve',
    'Close': 'closeStep',
    'Manager review': 'managerReview',
    'Match service/org': 'matchServiceOrg',
    'Third-party submit': 'thirdPartySubmit',
  };
  
  const key = stepMap[step];
  return key ? t(key, step) : step;
};

const WorkflowStatusStrip = ({
  title = 'Workflow Route',
  subtitle = 'Showing the current execution path and the last control action.',
  service = 'Dynamic Service',
  organization = 'Unassigned Organization',
  mode = 'Workflow',
  lastAction = 'Waiting for next action',
  activeStep = 0,
  steps = defaultSteps,
  deploymentReadiness,
  onShowAll,
}) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const resolvedSteps = Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps;
  const translatedSteps = resolvedSteps.map(step => getStepTranslation(step, t));
  const readinessToneClasses = {
    destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
    success: 'border-success/20 bg-success/10 text-success',
  };

  return (
    <section className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-primary/10 via-card to-muted/30 px-5 md:px-6 py-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
              <Icon name="Workflow" size={14} />
              <span>{t('workflowRoute', title)}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">{service}</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">{t('showingCurrentExecutionPath', subtitle)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {deploymentReadiness && (
              <div
                className={`px-3 py-2 rounded-xl border text-xs font-semibold uppercase tracking-[0.18em] ${readinessToneClasses[deploymentReadiness.tone] || readinessToneClasses.success}`}
                title={deploymentReadiness.description}
              >
                {deploymentReadiness.label}
              </div>
            )}
            <div className="px-3 py-2 rounded-xl bg-background border border-border">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t('dynamicService', 'Service')}</p>
              <p className="text-sm font-semibold text-foreground">{service}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-background border border-border">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t('organizationUnassigned', 'Organization')}</p>
              <p className="text-sm font-semibold text-foreground">{organization}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-background border border-border">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t('mode', 'Mode')}</p>
              <p className="text-sm font-semibold text-foreground">{mode}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-background border border-border">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t('lastAction', 'Last action')}</p>
              <p className="text-sm font-semibold text-foreground max-w-[260px] truncate">{lastAction}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-6 py-5">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Route" size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">{t('workflowStages', 'Workflow stages')}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
              {translatedSteps.map((step, index) => {
                const isActive = index === activeStep;
                const isComplete = index < activeStep;

                return (
                  <div
                    key={step}
                    className={`rounded-2xl border px-3 py-3 transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/10'
                        : isComplete
                          ? 'border-success/20 bg-success/5'
                          : 'border-border bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isComplete
                            ? 'bg-success text-success-foreground'
                            : 'bg-background text-muted-foreground border border-border'
                      }`}>
                        {isComplete ? (
                          <Icon name="Check" size={14} />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t('step', 'Step')} {index + 1}</p>
                        <p className="text-sm font-medium text-foreground truncate">{step}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {onShowAll && (
            <div className="xl:self-end">
              <button
                type="button"
                onClick={onShowAll}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Icon name="List" size={16} />
                {t('showAllActions', 'Show all actions')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkflowStatusStrip;
