import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TicketCreationCard = () => {
  const navigate = useNavigate();

  const ticketCategories = [
    {
      id: 'incident',
      title: 'Report an Incident',
      description: 'Report technical issues, bugs, or service disruptions that need immediate attention',
      icon: 'AlertCircle',
      color: 'var(--color-error)',
      bgColor: 'bg-error/10',
    },
    {
      id: 'problem',
      title: 'Report a Problem',
      description: 'Identify recurring issues or root causes that require investigation and permanent fix',
      icon: 'AlertTriangle',
      color: 'var(--color-warning)',
      bgColor: 'bg-warning/10',
    },
    {
      id: 'change',
      title: 'Request a Change',
      description: 'Submit requests for new features, modifications, or system enhancements',
      icon: 'GitBranch',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10',
    },
  ];

  const handleCategoryClick = (categoryId) => {
    navigate('/ticket-creation', { state: { category: categoryId } });
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-1 md:mb-2">
            Create New Ticket
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Select a category to get started with your support request
          </p>
        </div>
        <div className="hidden lg:block">
          <Icon name="Plus" size={32} color="var(--color-primary)" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {ticketCategories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => handleCategoryClick(category?.id)}
            className="group relative bg-background border-2 border-border rounded-lg p-4 md:p-6 text-left hover:border-primary hover:shadow-elevation-3 transition-smooth hover-lift"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ${category?.bgColor} rounded-lg flex items-center justify-center mb-3 md:mb-4 transition-smooth group-hover:scale-110`}>
              <Icon name={category?.icon} size={28} color={category?.color} />
            </div>
            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-foreground mb-2">
              {category?.title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground line-clamp-3">
              {category?.description}
            </p>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-smooth">
              <Icon name="ArrowRight" size={20} color="var(--color-primary)" />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 md:mt-8 p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex-shrink-0">
            <Icon name="Info" size={20} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm md:text-base font-medium text-foreground mb-1">
              Need help choosing?
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">
              Not sure which category fits your issue? Check our knowledge base for common solutions or contact support for guidance.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" iconName="Book" iconPosition="left">
                Browse Knowledge Base
              </Button>
              <Button variant="ghost" size="sm" iconName="MessageCircle" iconPosition="left">
                Chat with Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCreationCard;