import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerSatisfaction = ({ isResolved, onSubmitSurvey }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (rating > 0) {
      onSubmitSurvey({ rating, feedback });
      setSubmitted(true);
    }
  };

  if (!isResolved) {
    return null;
  }

  if (submitted) {
    return (
      <div className="bg-card border border-success/20 rounded-lg p-4 md:p-6 shadow-elevation-1">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <Icon name="CheckCircle" size={32} color="var(--color-success)" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
            Thank You for Your Feedback!
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Your response helps us improve our support service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Star" size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              Employee Satisfaction Survey
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground caption">
              Help us improve by rating your experience
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <p className="text-sm md:text-base font-medium text-foreground mb-3 md:mb-4">
            How satisfied are you with the resolution?
          </p>
          <div className="flex justify-center gap-2 md:gap-3">
            {[1, 2, 3, 4, 5]?.map((star) => (
              <button
                key={star}
                type="button"
                className="p-2 transition-smooth hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Icon
                  name={star <= (hoveredRating || rating) ? 'Star' : 'Star'}
                  size={32}
                  color={
                    star <= (hoveredRating || rating)
                      ? 'var(--color-warning)'
                      : 'var(--color-border)'
                  }
                  strokeWidth={star <= (hoveredRating || rating) ? 0 : 2}
                  className={star <= (hoveredRating || rating) ? 'fill-current' : ''}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm md:text-base text-muted-foreground mt-2 caption">
              {rating === 1 && 'Very Dissatisfied'}
              {rating === 2 && 'Dissatisfied'}
              {rating === 3 && 'Neutral'}
              {rating === 4 && 'Satisfied'}
              {rating === 5 && 'Very Satisfied'}
            </p>
          )}
        </div>

        <div className="mb-4 md:mb-6">
          <label className="block text-sm md:text-base font-medium text-foreground mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e?.target?.value)}
            placeholder="Tell us more about your experience..."
            className="w-full min-h-[100px] p-3 md:p-4 bg-background border border-border rounded-lg text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="default"
          fullWidth
          iconName="Send"
          iconPosition="left"
          disabled={rating === 0}
        >
          Submit Feedback
        </Button>
      </form>
    </div>
  );
};

export default CustomerSatisfaction;