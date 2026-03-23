import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TimeTracking = ({ totalTime, sessions, onStartTimer, onStopTimer }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isTracking) {
      onStopTimer(currentSessionTime);
      setCurrentSessionTime(0);
    } else {
      onStartTimer();
    }
    setIsTracking(!isTracking);
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
              name={isTracking ? 'Pause' : 'Play'}
              size={32}
              color="var(--color-primary)"
            />
          </div>
          <div className="text-3xl md:text-4xl font-semibold text-foreground mb-2 data-text">
            {formatTime(isTracking ? currentSessionTime : 0)}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground caption">
            {isTracking ? 'Current Session' : 'Ready to track'}
          </p>
        </div>

        <Button
          variant={isTracking ? 'destructive' : 'default'}
          fullWidth
          iconName={isTracking ? 'Square' : 'Play'}
          iconPosition="left"
          onClick={handleStartStop}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
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