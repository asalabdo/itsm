import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { knowledgeBaseAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const fallbackArticles = [
  {
    id: 1,
    title: 'How to reset your password',
    description: 'Step-by-step guide to recover and reset your account password securely',
    category: 'Account & Billing',
    views: 2847,
    helpful: 94,
    lastUpdated: '2026-01-05',
    readTime: '3 min',
  },
  {
    id: 2,
    title: 'Troubleshooting login issues',
    description: 'Common solutions for authentication problems and login errors',
    category: 'Technical Issues',
    views: 2156,
    helpful: 89,
    lastUpdated: '2026-01-04',
    readTime: '5 min',
  },
  {
    id: 3,
    title: 'Understanding your billing cycle',
    description: 'Learn about subscription plans, payment methods, and invoice management',
    category: 'Account & Billing',
    views: 1923,
    helpful: 92,
    lastUpdated: '2026-01-03',
    readTime: '4 min',
  },
  {
    id: 4,
    title: 'Setting up two-factor authentication',
    description: 'Enhance your account security with 2FA setup instructions',
    category: 'Security & Privacy',
    views: 1745,
    helpful: 96,
    lastUpdated: '2026-01-02',
    readTime: '6 min',
  },
  {
    id: 5,
    title: 'Mobile app installation guide',
    description: 'Download and install our mobile application on iOS and Android devices',
    category: 'Getting Started',
    views: 1632,
    helpful: 88,
    lastUpdated: '2026-01-01',
    readTime: '4 min',
  },
  {
    id: 6,
    title: 'Data export and backup options',
    description: 'Export your data and create backups for safekeeping',
    category: 'Features & Usage',
    views: 1421,
    helpful: 85,
    lastUpdated: '2025-12-30',
    readTime: '7 min',
  },
];

const KnowledgeBaseSection = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularArticles, setPopularArticles] = useState(fallbackArticles);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const res = await knowledgeBaseAPI.getArticles();
        const articles = Array.isArray(res?.data) && res.data.length > 0 ? res.data.map((article) => ({
          id: article.id,
          title: article.title,
          description: article.summary || article.content || '',
          category: article.category || 'General',
          views: article.views || 0,
          helpful: 90,
          lastUpdated: new Date().toISOString().slice(0, 10),
          readTime: '4 min',
        })) : fallbackArticles;
        setPopularArticles(articles);
      } catch (error) {
        setPopularArticles(fallbackArticles);
      }
    };

    loadArticles();
  }, []);

  const categoryBase = [
    { id: 'all', label: t('allTopics', 'All Topics'), icon: 'Grid' },
    { id: 'getting-started', label: t('gettingStarted', 'Getting Started'), icon: 'Rocket' },
    { id: 'account', label: t('accountBilling', 'Account & Billing'), icon: 'CreditCard' },
    { id: 'technical', label: t('technicalIssues', 'Technical Issues'), icon: 'Wrench' },
    { id: 'features', label: t('featuresUsage', 'Features & Usage'), icon: 'Zap' },
    { id: 'security', label: t('securityPrivacy', 'Security & Privacy'), icon: 'Shield' },
  ];

  const troubleshootingGuides = [
    {
      id: 1,
      title: t('paymentProcessingErrors', 'Payment Processing Errors'),
      steps: [
        t('verifyCardDetails', 'Verify card details'),
        t('checkBillingAddress', 'Check billing address'),
        t('contactYourBank', 'Contact your bank'),
        t('tryAlternativePayment', 'Try alternative payment method')
      ],
      icon: 'CreditCard',
    },
    {
      id: 2,
      title: t('emailNotificationIssues', 'Email Notification Issues'),
      steps: [
        t('checkSpamFolder', 'Check spam folder'),
        t('verifyEmailSettings', 'Verify email settings'),
        t('whitelistDomain', 'Whitelist our domain'),
        t('updateNotificationPrefs', 'Update notification preferences')
      ],
      icon: 'Mail',
    },
    {
      id: 3,
      title: t('slowPerformance', 'Slow Performance'),
      steps: [
        t('clearBrowserCache', 'Clear browser cache'),
        t('disableExtensions', 'Disable extensions'),
        t('checkInternetConnection', 'Check internet connection'),
        t('tryDifferentBrowser', 'Try different browser')
      ],
      icon: 'Gauge',
    },
  ];

  const filteredArticles = popularArticles?.filter((article) => {
    const matchesSearch = article?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         article?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           article?.category?.toLowerCase()?.includes(selectedCategory?.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = categoryBase.map((category) => ({
    ...category,
    count: category.id === 'all'
      ? popularArticles.length
      : popularArticles.filter((article) => article?.category?.toLowerCase()?.includes(category.label.toLowerCase())).length,
  }));

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Book" size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
              {t('knowledgeBase', 'Knowledge Base')}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {t('knowledgeBaseSubtitle', 'Find answers and solutions to common questions')}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <Input
            type="search"
            placeholder={t('searchArticlesPlaceholder', 'Search articles, guides, and FAQs...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={`p-3 md:p-4 rounded-lg border-2 transition-smooth hover-lift ${
                selectedCategory === category?.id
                  ? 'border-primary bg-primary/10' :'border-border bg-background hover:border-primary/50'
              }`}
            >
              <Icon
                name={category?.icon}
                size={24}
                color={selectedCategory === category?.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
                className="mx-auto mb-2"
              />
              <div className="text-xs md:text-sm font-medium text-foreground text-center line-clamp-2 mb-1">
                {category?.label}
              </div>
              <div className="text-xs text-muted-foreground text-center caption data-text">
                {category?.count} {t('articles', 'articles')}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
          {t('popularArticles', 'Popular Articles')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredArticles?.map((article) => (
          <button
              key={article?.id}
              onClick={() => navigate('/knowledge-base')}
              className="group bg-background border border-border rounded-lg p-4 md:p-5 hover:border-primary hover:shadow-elevation-3 transition-smooth cursor-pointer hover-lift"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded caption">
                  {article?.category}
                </span>
                <Icon name="ExternalLink" size={16} className="opacity-0 group-hover:opacity-100 transition-smooth" color="var(--color-primary)" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-foreground mb-2 line-clamp-2">
                {article?.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {article?.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground caption">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Icon name="Eye" size={14} />
                    {article?.views?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ThumbsUp" size={14} />
                    {article?.helpful}%
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  {article?.readTime}
                </span>
              </div>
            </button>
          ))}
        </div>

        {filteredArticles?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Search" size={48} className="mx-auto mb-4 opacity-30" color="var(--color-muted-foreground)" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('noArticlesFound', 'No articles found')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('tryAdjustingSearch', 'Try adjusting your search or browse different categories')}
            </p>
          </div>
        )}
      </div>
      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
          {t('quickTroubleshootingGuides', 'Quick Troubleshooting Guides')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {troubleshootingGuides?.map((guide) => (
            <div
              key={guide?.id}
              className="bg-background border border-border rounded-lg p-4 md:p-5 hover:border-primary hover:shadow-elevation-2 transition-smooth"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={guide?.icon} size={20} color="var(--color-primary)" />
                </div>
                <h4 className="text-base font-semibold text-foreground">
                  {guide?.title}
                </h4>
              </div>
              <ol className="space-y-2">
                {guide?.steps?.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium data-text">
                      {index + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 md:p-8 border border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center">
              <Icon name="MessageCircle" size={32} color="#FFFFFF" />
            </div>
          </div>
          <div className={`flex-1 text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
              {t('cantFindLookingFor', 'Can\'t find what you\'re looking for?')}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {t('supportTeamHelp', 'Our support team is here to help. Get personalized assistance from our experts.')}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button variant="default" iconName="MessageCircle" iconPosition="left" onClick={() => navigate('/ticket-chatbot')}>
                {t('chatWithSupport', 'Chat with Support')}
              </Button>
              <Button variant="outline" iconName="Mail" iconPosition="left" onClick={() => navigate('/ticket-creation')}>
                {t('emailSupport', 'Email Support')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseSection;
