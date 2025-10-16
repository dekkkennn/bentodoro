import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'work' | 'break' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export interface PomodoroSession {
  date: string;
  duration: number;
  type: TimerMode;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

export const usePomodoro = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessions, setSessions] = useState<PomodoroSession[]>(() => {
    const saved = localStorage.getItem('pomodoroSessions');
    return saved ? JSON.parse(saved) : [];
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }, [sessions]);

  const getDuration = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case 'work':
        return settings.workDuration * 60;
      case 'break':
        return settings.breakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  }, [settings]);

  const start = useCallback(() => {
    setStatus('running');
    startTimeRef.current = Date.now();
  }, []);

  const pause = useCallback(() => {
    setStatus('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setTimeLeft(getDuration(mode));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, [mode, getDuration]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setStatus('idle');
    setTimeLeft(getDuration(newMode));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [getDuration]);

  const completeSession = useCallback(() => {
    const duration = getDuration(mode);
    const session: PomodoroSession = {
      date: new Date().toISOString(),
      duration: duration / 60,
      type: mode,
    };
    
    setSessions(prev => [...prev, session]);
    
    if (mode === 'work') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      
      if (newCount % settings.sessionsUntilLongBreak === 0) {
        switchMode('longBreak');
      } else {
        switchMode('break');
      }
    } else {
      switchMode('work');
    }
  }, [mode, completedSessions, settings.sessionsUntilLongBreak, getDuration, switchMode]);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return getDuration(mode);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, mode, completeSession, getDuration]);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    reset();
  }, [reset]);

  return {
    mode,
    status,
    timeLeft,
    completedSessions,
    sessions,
    settings,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
  };
};
