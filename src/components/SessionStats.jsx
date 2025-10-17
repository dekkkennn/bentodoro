import { Card } from '@/components/ui/card';
import { BarChart3, Clock, TrendingUp } from 'lucide-react';

export default function SessionStats({ sessions = [] }) {
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getThisWeek = () => {
    const today = new Date();
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay());
    firstDay.setHours(0, 0, 0, 0);
    return firstDay;
  };

  const filterSessionsByDate = (startDate) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startDate;
    });
  };

  const todaySessions = filterSessionsByDate(getToday());
  const weekSessions = filterSessionsByDate(getThisWeek());

  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const avgDailyMinutes = Math.round(weekMinutes / 7);

  const todayWorkSessions = todaySessions.filter(s => s.type === 'work').length;
  const weekWorkSessions = weekSessions.filter(s => s.type === 'work').length;

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const dailyData = last7Days.map(day => {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= day && sessionDate < nextDay;
    });
    const minutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    return { day, minutes };
  });

  const maxMinutes = Math.max(...dailyData.map(d => d.minutes), 1);

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/10">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Session Statistics</h3>
          <p className="text-sm text-muted-foreground">Your productivity insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Today</span>
            </div>
            <div className="text-3xl font-bold">{Math.round(todayMinutes / 60)}h {todayMinutes % 60}m</div>
            <div className="text-xs text-muted-foreground">{todayWorkSessions} sessions</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">This Week</span>
            </div>
            <div className="text-3xl font-bold">{Math.round(weekMinutes / 60)}h</div>
            <div className="text-xs text-muted-foreground">{weekWorkSessions} sessions</div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Last 7 Days</span>
          </div>
          <div className="space-y-2">
            {dailyData.map((data, index) => {
              const heightPercent = maxMinutes > 0 ? (data.minutes / maxMinutes) * 100 : 0;
              const dayName = data.day.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 text-xs text-muted-foreground font-medium">{dayName}</div>
                  <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(heightPercent, data.minutes > 0 ? 10 : 0)}%` }}
                    >
                      {data.minutes > 0 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {data.minutes}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Average */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Daily Average</span>
            <span className="text-lg font-semibold">{avgDailyMinutes} min</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
