
import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskTimeTrackerProps {
  onTimerComplete: (hours: string) => void;
}

export const TaskTimeTracker: React.FC<TaskTimeTrackerProps> = ({ onTimerComplete }) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Format as HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      if (timerSeconds > 0) {
        const hours = (timerSeconds / 3600).toFixed(2);
        onTimerComplete(hours);
        setTimerSeconds(0); // Reset timer after completing
      }
    } else {
      setIsTimerRunning(true);
      setTimerSeconds(0); // Start fresh
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-gray-900">
            {formatTime(timerSeconds)}
          </p>
          <Button
            onClick={toggleTimer}
            className={`mt-2 w-full ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isTimerRunning ? (
              <>
                <Pause className="mr-2" size={16} />
                Stop Timer
              </>
            ) : (
              <>
                <Play className="mr-2" size={16} />
                Start Timer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
