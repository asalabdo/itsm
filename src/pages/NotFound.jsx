import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../services/i18n';

const NotFound = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
          </div>
        </div>

        <h2 className="text-2xl font-medium text-onBackground mb-2">{t('pageNotFound', 'Page Not Found')}</h2>
        <p className="text-onBackground/70 mb-8">
          {t('pageNotFoundDescription', 'The page you\'re looking for doesn\'t exist. Let\'s get you back!')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            icon={<Icon name="ArrowLeft" />}
            iconPosition="left"
            onClick={() => window.history?.back()}
          >
            {t('goBack', 'Go Back')}
          </Button>

          <Button
            variant="outline"
            icon={<Icon name="Home" />}
            iconPosition="left"
            onClick={handleGoHome}
          >
            {t('backToHome', 'Back to Home')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
