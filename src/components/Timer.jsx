import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Timer({
  mode,
  status,
  timeLeft,
  completedSessions,
  onStart,
  onPause,
  onReset,
  onModeChange,
}) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'from-red-500 to-orange-500';
      case 'break':
        return 'from-green-500 to-emerald-500';
      case 'longBreak':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-red-500 to-orange-500';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work':
        return 'Focus Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-background to-muted/20 border-2">
      <div className="flex flex-col items-center space-y-6">
        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('work')}
            className="min-w-[100px]"
          >
            Focus
          </Button>
          <Button
            variant={mode === 'break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('break')}
            className="min-w-[100px]"
          >
            Break
          </Button>
          <Button
            variant={mode === 'longBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('longBreak')}
            className="min-w-[100px]"
          >
            Long Break
          </Button>
        </div>

        {/* Timer Display */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${getModeColor()} opacity-20 blur-3xl rounded-full`} />
          <div className="relative">
            <div className="text-8xl font-bold tracking-tight tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-center mt-2 text-sm text-muted-foreground font-medium">
              {getModeLabel()}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {status === 'running' ? (
            <Button
              size="lg"
              onClick={onPause}
              className="min-w-[120px] h-12"
              variant="secondary"
            >
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onStart}
              className="min-w-[120px] h-12"
            >
              <Play className="mr-2 h-5 w-5" />
              {status === 'paused' ? 'Resume' : 'Start'}
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={onReset}
            className="h-12"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Session Counter */}
        <div className="text-center pt-4 border-t w-full">
          <div className="text-2xl font-semibold">{completedSessions}</div>
          <div className="text-xs text-muted-foreground">Sessions Completed</div>
        </div>
      </div>
    </Card>
  );
}
