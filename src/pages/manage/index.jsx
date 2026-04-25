import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import entities from '../../crud/entities';
import schemas from '../../crud/schemas';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const getEntityCount = (entityKey) => {
  try {
    const raw = localStorage.getItem(`crud:${entityKey}`);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items.length : 0;
  } catch {
    return 0;
  }
};

const ManageIndex = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  return (
    <>
      <Helmet>
        <title>{t('dataManagement', 'Data Management')} - ITSM Hub</title>
        <meta
          name="description"
          content="Central entry point for CRUD-driven ITSM administration pages."
        />
      </Helmet>

      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <BreadcrumbTrail />

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-elevation-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Icon name="Database" size={14} />
                  {t('adminWorkspace', 'Admin workspace')}
                </div>
                <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-foreground">
                  {t('dataManagement', 'Data Management')}
                </h1>
                <p className="mt-2 text-sm md:text-base text-muted-foreground">
                  {t(
                    'dataManagementDescription',
                    'Open the lightweight CRUD pages for SLA, priorities, escalations, and ticket workflow settings from one place.'
                  )}
                </p>
              </div>
              <Button asChild variant="outline" iconName="Workflow" iconPosition="left">
                <Link to="/workflow-builder-studio">{t('workflowBuilder', 'Workflow Builder')}</Link>
              </Button>
            </div>
          </section>

          <div className="mt-6">
            <ManageEngineOnPremSnapshot
              compact
              title={t('manageEngineAdminData', 'ManageEngine Admin Data')}
              description={t('manageEngineAdminDataDesc', 'Review live ServiceDesk requests plus OpManager 12.8.270 services and alerts while maintaining local SLA, priority, workflow, and reference data.')}
            />
          </div>

          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {entities.map((entity) => {
              const schema = schemas[entity.key];
              const count = getEntityCount(entity.key);

              return (
                <article
                  key={entity.key}
                  className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {entity.abbrev}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-foreground">
                        {schema?.label || entity.label}
                      </h2>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {count} {t('records', 'records')}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {t(
                      'crudFieldsAvailable',
                      'Manage the stored records and open the generated create/edit forms for this module.'
                    )}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {(schema?.fields || []).slice(0, 3).map((field) => (
                      <span key={field.key} className="rounded-full bg-muted px-3 py-1">
                        {field.label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Button asChild size="sm" iconName="ArrowRight" iconPosition="right">
                      <Link to={`/manage/${entity.key}`}>{t('openList', 'Open list')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" iconName="Plus" iconPosition="left">
                      <Link to={`/manage/${entity.key}/new`}>{t('createNew', 'Create new')}</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </>
  );
};

export default ManageIndex;
