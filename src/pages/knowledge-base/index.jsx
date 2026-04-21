import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { knowledgeBaseAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { getLocalizedKnowledgeBaseField } from '../../services/knowledgeBaseLocalization';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const loadErrorText = getTranslation(language, 'knowledgeBaseLoadFailed', 'Failed to load knowledge base articles.');

  const translateCategory = (category) => {
    const categoryMap = {
      'Access': t('categoryAccess', 'Access'),
      'Hardware': t('categoryHardware', 'Hardware'),
      'Requests': t('categoryRequests', 'Requests'),
      'Asset': t('categoryAsset', 'Asset'),
      'Process': t('categoryProcess', 'Process'),
      'Software': t('categorySoftware', 'Software'),
      'Email': t('categoryEmail', 'Email'),
      'Network': t('categoryNetwork', 'Network'),
      'Printing': t('categoryPrinting', 'Printing'),
      'Incident': t('categoryIncident', 'Incident'),
      'Problem': t('categoryProblem', 'Problem'),
      'Service Request': t('categoryServiceRequest', 'Service Request'),
    };
    return categoryMap[category] || category;
  };

  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const res = query.trim()
          ? await knowledgeBaseAPI.search(query.trim())
          : await knowledgeBaseAPI.getArticles();
        const data = Array.isArray(res.data) ? res.data : [];
        setArticles(data);
        setSelectedArticle(data[0] || null);
      } catch {
        setArticles([]);
        setSelectedArticle(null);
        setLoadError(loadErrorText);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadArticles, 200);
    return () => clearTimeout(timer);
  }, [query, loadErrorText]);

  const categories = useMemo(() => {
    const keys = new Set(articles.map((article) => article.category).filter(Boolean));
    return [t('all', 'All'), ...Array.from(keys)];
  }, [articles, language]);

  const filteredArticles = useMemo(
    () => articles.filter((article) => (selectedCategory === t('all', 'All') || selectedCategory === 'All') || article.category === selectedCategory),
    [articles, selectedCategory, language]
  );

  const featuredArticles = useMemo(
    () => filteredArticles.filter((article) => article.isFeatured),
    [filteredArticles]
  );

  const popularArticles = useMemo(
    () => [...filteredArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6),
    [filteredArticles]
  );

  const categoryCards = useMemo(() => {
    const grouped = new Map();
    articles.forEach((article) => {
      const key = article.category || 'Uncategorized';
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });
    return Array.from(grouped.entries()).map(([name, count]) => ({ name, count }));
  }, [articles]);

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return articles
      .filter((article) => article.id !== selectedArticle.id && article.category === selectedArticle.category)
      .slice(0, 3);
  }, [articles, selectedArticle]);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />

      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6 md:p-10 shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.45),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.25),_transparent_30%)]" />
            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                  <Icon name="BookOpen" size={14} />
                  {t('knowledgeBaseTitle', 'Knowledge Base')}
                </div>
                <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
                  {t('knowledgeBaseSubtitle', 'Find answers and solutions to common questions')}
                </h1>
                <p className="text-white/75 max-w-2xl">
                  {t('knowledgeBaseDescription', 'Search approved articles, open related tickets, and reduce escalations with fast self-service resolution.')}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 min-w-[280px]">
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <div className="text-2xl font-semibold">{articles.length}</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">{t('articles', 'Articles')}</div>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <div className="text-2xl font-semibold">{featuredArticles.length}</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">{t('featured', 'Featured')}</div>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <div className="text-2xl font-semibold">{filteredArticles.length}</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">{t('shown', 'Shown')}</div>
                </div>
              </div>
            </div>
          </section>

          <ManageEngineOnPremSnapshot
            compact
            title={t('manageEngineKnowledgeContext', 'ManageEngine Knowledge Context')}
            description={t('manageEngineKnowledgeContextDesc', 'ServiceDesk requests and OpManager alerts that can guide article updates, runbooks, and self-service coverage.')}
          />

          {loadError && (
            <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              {loadError}
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground shadow-elevation-1">
              {t('loadingKnowledgeBase', 'Loading knowledge base articles...')}
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-elevation-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="relative flex-1">
                    <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('searchArticlesPlaceholder', 'Search troubleshooting steps, policies, or runbooks...')}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button variant="outline" onClick={() => navigate('/ticket-creation')}>
                    {t('createTicket', 'Create Ticket')}
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === category
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                        }`}
                    >
                      {translateCategory(category)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
                <h2 className={`text-xl font-semibold text-foreground mb-4`}>
                  {t('allTopics', 'All Topics')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryCards.length > 0 ? categoryCards.map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => setSelectedCategory(category.name)}
                      className={`p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors`}
                    >
                      <div className={`flex items-center gap-3 mb-2`}>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon name="BookOpen" size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{translateCategory(category.name)}</h3>
                          <p className="text-xs text-muted-foreground">{category.count} {t('articlesCount', 'articles')}</p>
                        </div>
                      </div>
                    </button>
                  )) : (
                    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground md:col-span-3">
                      {t('noKnowledgeCategories', 'No categories available yet.')}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
                <h2 className={`text-xl font-semibold text-foreground mb-4`}>
                  {t('popularArticles', 'Popular Articles')}
                </h2>
                <div className="space-y-4">
                  {popularArticles.length > 0 ? popularArticles.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {translateCategory(article.category)}
                          </span>
                          {article.isFeatured && (
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-500/10 px-2 py-1 rounded-full">
                              {t('recommended', 'Recommended')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{getLocalizedKnowledgeBaseField(article, 'title', language)}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{getLocalizedKnowledgeBaseField(article, 'summary', language)}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{article.views || 0} {t('views', 'views')}</span>
                          <span>{(article.tags || []).slice(0, 3).join(', ') || t('noTags', 'No tags')}</span>
                        </div>
                      </div>
                    </button>
                  )) : (
                    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                      {t('noArticlesFound', 'No articles found.')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-center justify-between mb-4`}>
                  <div>
                    <h2 className={`text-lg font-semibold text-foreground`}>
                      {t('articleDetail', 'Article Detail')}
                    </h2>
                    <p className={`text-sm text-muted-foreground`}>
                      {t('openTopicToSeeArticle', 'Open a topic to see the full article.')}
                    </p>
                  </div>
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>

                {selectedArticle ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border px-2 py-1 text-[11px] font-semibold bg-muted text-muted-foreground border-border">
                        {translateCategory(selectedArticle.category)}
                      </span>
                      {selectedArticle.isFeatured && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          {t('recommended', 'Recommended')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{getLocalizedKnowledgeBaseField(selectedArticle, 'title', language)}</h3>
                    <p className="text-sm text-muted-foreground">{getLocalizedKnowledgeBaseField(selectedArticle, 'content', language)}</p>
                    <div className="rounded-xl bg-muted/40 p-4 text-sm text-foreground">
                      <div className="mb-2 font-medium">{t('suggestedNextSteps', 'Suggested next steps')}</div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• {t('checkRelevantService', 'Check the relevant service or category in ticket creation.')}</li>
                        <li>• {t('openTicketIfUnresolved', 'Open a ticket if the issue is unresolved after following the steps.')}</li>
                        <li>• {t('escalateIfSLARisk', 'Escalate to the right queue if SLA risk is high.')}</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="default" onClick={() => navigate('/ticket-creation')}>
                        {t('createTicket', 'Create Ticket')}
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/ticket-chatbot')}>
                        {t('askAssistant', 'Ask Assistant')}
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/service-catalog')}>
                        {t('openServices', 'Open Services')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    {t('selectArticleToRead', 'Select an article to read the approved steps and related actions.')}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('relatedArticles', 'Related Articles')}
                </h3>
                <div className="mt-4 space-y-3">
                  {relatedArticles.length > 0 ? relatedArticles.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => setSelectedArticle(article)}
                      className="w-full rounded-xl border border-border p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <div className="text-sm font-semibold text-foreground">{getLocalizedKnowledgeBaseField(article, 'title', language)}</div>
                      <div className="text-xs text-muted-foreground mt-1">{getLocalizedKnowledgeBaseField(article, 'summary', language)}</div>
                    </button>
                  )) : (
                    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      {t('noRelatedArticles', 'No related articles available.')}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeBase;
