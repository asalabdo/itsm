import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { knowledgeBaseAPI } from '../../services/api';

const fallbackArticles = [
  {
    id: 1,
    title: 'Resetting VPN and MFA Access',
    category: 'Access',
    summary: 'Step-by-step recovery for VPN authentication and multi-factor enrollment issues.',
    content: 'Use this article when users cannot authenticate to VPN, lose their MFA device, or need to re-enroll a new phone.',
    tags: ['vpn', 'mfa', 'access', 'security'],
    isFeatured: true,
    views: 128
  },
  {
    id: 2,
    title: 'Printer and Driver Troubleshooting',
    category: 'Hardware',
    summary: 'Resolve common printer queue, driver, and spooler failures quickly.',
    content: 'Check the print spooler service, clear stuck jobs, reinstall drivers, and validate network discovery.',
    tags: ['printer', 'driver', 'hardware', 'spooler'],
    isFeatured: true,
    views: 94
  },
  {
    id: 3,
    title: 'Laptop Replacement Standard',
    category: 'Asset',
    summary: 'Policy for requesting, approving, and handing over replacement devices.',
    content: 'Use when devices are beyond warranty, damaged, or do not meet performance requirements.',
    tags: ['asset', 'hardware', 'replacement'],
    views: 71
  },
  {
    id: 4,
    title: 'Service Desk Escalation Matrix',
    category: 'Process',
    summary: 'Who owns which escalation tier and when to page management or vendors.',
    content: 'Map incident severity to response owners and escalation deadlines to keep SLA compliance high.',
    tags: ['escalation', 'sla', 'process'],
    views: 65
  },
  {
    id: 5,
    title: 'Software Access Request Checklist',
    category: 'Requests',
    summary: 'Minimum approval and validation steps before assigning an application license.',
    content: 'Use for common software requests to avoid back-and-forth and ensure compliance.',
    tags: ['software', 'request', 'approval'],
    views: 88
  }
];

const categoryPalette = {
  Access: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Hardware: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  Asset: 'bg-violet-500/10 text-violet-700 border-violet-200',
  Process: 'bg-amber-500/10 text-amber-700 border-amber-200',
  Requests: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
};

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const res = query.trim() ? await knowledgeBaseAPI.search(query.trim()) : await knowledgeBaseAPI.getArticles();
        const data = Array.isArray(res.data) ? res.data : [];
        setArticles(data);
        setSelectedArticle(data.length > 0 ? data[0] : null);
      } catch (error) {
        const fallback = query.trim()
          ? fallbackArticles.filter((article) =>
              [article.title, article.summary, article.content, ...(article.tags || [])]
                .join(' ')
                .toLowerCase()
                .includes(query.trim().toLowerCase())
            )
          : fallbackArticles;
        setArticles(fallback);
        setSelectedArticle(fallback.length > 0 ? fallback[0] : null);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadArticles, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const categories = useMemo(() => {
    const keys = new Set(articles.map((article) => article.category));
    return ['All', ...Array.from(keys)];
  }, [articles]);

  const filteredArticles = articles.filter((article) =>
    selectedCategory === 'All' || article.category === selectedCategory
  );

  const featuredArticles = filteredArticles.filter((article) => article.isFeatured);

  return (
    <div className="min-h-screen bg-background">
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
                  Knowledge Base
                </div>
                <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
                  One place for fixes, runbooks, and service desk guidance.
                </h1>
                <p className="text-white/75 max-w-2xl">
                  Search approved articles, open related tickets, and reduce escalations with fast self-service resolution.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 min-w-[280px]">
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <div className="text-2xl font-semibold">{articles.length}</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">Articles</div>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <div className="text-2xl font-semibold">{featuredArticles.length}</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">Featured</div>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <div className="text-2xl font-semibold">{filteredArticles.length}</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">Shown</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-elevation-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="relative flex-1">
                    <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search troubleshooting steps, policies, or runbooks..."
                      className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button variant="outline" onClick={() => navigate('/ticket-creation')}>
                    Create Ticket
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedCategory === category
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {(loading ? Array.from({ length: 3 }) : filteredArticles).map((article, index) => (
                  <button
                    key={article?.id || index}
                    type="button"
                    onClick={() => article && setSelectedArticle(article)}
                    className={`text-left rounded-2xl border p-5 transition-all ${
                      selectedArticle?.id === article?.id ? 'border-primary bg-primary/5 shadow-elevation-2' : 'border-border bg-card hover:border-primary/40 hover:shadow-elevation-1'
                    }`}
                  >
                    {loading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-5 w-2/3 rounded bg-muted" />
                        <div className="h-4 w-full rounded bg-muted" />
                        <div className="h-4 w-5/6 rounded bg-muted" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${categoryPalette[article.category] || 'bg-muted text-muted-foreground border-border'}`}>
                                {article.category}
                              </span>
                              {article.isFeatured && (
                                <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
                                  Featured
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{article.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>{article.views} views</div>
                            <div className="mt-1">{article.tags?.length || 0} tags</div>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {article.tags?.map((tag) => (
                            <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Article Detail</h2>
                    <p className="text-sm text-muted-foreground">Open a topic to see the full article.</p>
                  </div>
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>

                {selectedArticle ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${categoryPalette[selectedArticle.category] || 'bg-muted text-muted-foreground border-border'}`}>
                        {selectedArticle.category}
                      </span>
                      {selectedArticle.isFeatured && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          Recommended
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{selectedArticle.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedArticle.content}</p>
                    <div className="rounded-xl bg-muted/40 p-4 text-sm text-foreground">
                      <div className="mb-2 font-medium">Suggested next steps</div>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Check the relevant service or category in ticket creation.</li>
                        <li>• Open a ticket if the issue is unresolved after following the steps.</li>
                        <li>• Escalate to the right queue if SLA risk is high.</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="default" onClick={() => navigate('/ticket-creation')}>
                        Create Ticket
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/ticket-chatbot')}>
                        Ask Assistant
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/service-catalog')}>
                        Open Services
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Select an article to read the approved steps and related actions.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-elevation-1">
                <h3 className="text-lg font-semibold">Self-service shortcuts</h3>
                <p className="mt-2 text-sm text-white/70">Use these when the answer is not in the article.</p>
                <div className="mt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={() => navigate('/ticket-chatbot')}>
                    Virtual Agent
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={() => navigate('/customer-portal')}>
                    Customer Portal
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={() => navigate('/ticket-management-center')}>
                    Service Desk
                  </Button>
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
