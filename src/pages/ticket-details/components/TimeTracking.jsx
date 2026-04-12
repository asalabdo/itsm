import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TimeTracking = ({ totalTime, sessions, onStartTimer, onStopTimer, isTracking = false, currentSessionTime = 0 }) => {
  const [localIsTracking, setLocalIsTracking] = useState(Boolean(isTracking));
  const [localSessionTime, setLocalSessionTime] = useState(Number(currentSessionTime) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocalIsTracking(Boolean(isTracking));
    setLocalSessionTime(Number(currentSessionTime) || 0);
  }, [isTracking, currentSessionTime]);

  useEffect(() => {
    let interval;
    if (localIsTracking) {
      interval = setInterval(() => {
        setLocalSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [localIsTracking]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleStartStop = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (localIsTracking) {
        await onStopTimer(localSessionTime);
        setLocalSessionTime(0);
        setLocalIsTracking(false);
      } else {
        await onStartTimer();
        setLocalIsTracking(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Time Tracking</h3>
      </div>
      <div className="p-4 md:p-6">
        <div className="text-center mb-4 md:mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon
              name={localIsTracking ? 'Pause' : 'Play'}
              size={32}
              color="var(--color-primary)"
            />
          </div>
          <div className="text-3xl md:text-4xl font-semibold text-foreground mb-2 data-text">
            {formatTime(localIsTracking ? localSessionTime : 0)}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground caption">
            {localIsTracking ? 'Current Session' : 'Ready to track'}
          </p>
        </div>

        <Button
          variant={localIsTracking ? 'destructive' : 'default'}
          fullWidth
          iconName={localIsTracking ? 'Square' : 'Play'}
          iconPosition="left"
          loading={isSubmitting}
          disabled={isSubmitting}
          type="button"
          onClick={handleStartStop}
        >
          {localIsTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Button>

        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-sm md:text-base font-medium text-foreground">Total Time</span>
            <span className="text-base md:text-lg font-semibold text-primary data-text">
              {formatTime(totalTime)}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Recent Sessions</p>
            {sessions?.slice(0, 3)?.map((session) => (
              <div
                key={session?.id}
                className="flex items-center justify-between p-2 md:p-3 bg-muted rounded"
              >
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
                  <span className="text-xs md:text-sm text-foreground">{session?.agent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-muted-foreground caption">
                    {session?.date}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-foreground data-text">
                    {formatTime(session?.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
