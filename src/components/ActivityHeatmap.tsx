import { Card } from '@/components/ui/card';
import { PomodoroSession } from '@/hooks/usePomodoro';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityHeatmapProps {
  sessions: PomodoroSession[];
}

export default function ActivityHeatmap({ sessions = [] }: ActivityHeatmapProps) {
  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getLast90Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const getSessionsForDate = (date: Date) => {
    const dateKey = getDateKey(date);
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return getDateKey(sessionDate) === dateKey;
    });
  };

  const getTotalMinutes = (date: Date) => {
    const daySessions = getSessionsForDate(date);
    return daySessions.reduce((total, session) => total + session.duration, 0);
  };

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return 'bg-muted/30';
    if (minutes < 30) return 'bg-green-200 dark:bg-green-900/40';
    if (minutes < 60) return 'bg-green-300 dark:bg-green-800/60';
    if (minutes < 120) return 'bg-green-400 dark:bg-green-700/80';
    return 'bg-green-500 dark:bg-green-600';
  };

  const days = getLast90Days();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const currentStreak = calculateStreak();

  function calculateStreak() {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (getTotalMinutes(date) > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/10">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Activity Heatmap</h3>
          <p className="text-sm text-muted-foreground">Last 90 days of productivity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
          <div>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(totalMinutes / 60)}h</div>
            <div className="text-xs text-muted-foreground">Focus Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Heatmap */}
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    const minutes = getTotalMinutes(day);
                    const daySessions = getSessionsForDate(day);
                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm ${getIntensityClass(minutes)} transition-colors hover:ring-2 hover:ring-primary cursor-pointer`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-semibold">{day.toLocaleDateString()}</div>
                            <div>{daySessions.length} sessions</div>
                            <div>{minutes} minutes</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" />
            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/60" />
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/80" />
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}
