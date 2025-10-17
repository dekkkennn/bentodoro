import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

export const usePomodoro = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [mode, setMode] = useState('work');
  const [status, setStatus] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('pomodoroSessions');
    return saved ? JSON.parse(saved) : [];
  });

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }, [sessions]);

  const getDuration = useCallback((timerMode) => {
    switch (timerMode) {
      case 'work':
        return settings.workDuration * 60;
      case 'break':
        return settings.breakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  }, [settings.workDuration, settings.breakDuration, settings.longBreakDuration]);

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
    const duration = getDuration(mode);
    setTimeLeft(duration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, [mode, getDuration]);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setStatus('idle');
    const duration = getDuration(newMode);
    setTimeLeft(duration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [getDuration]);

  const completeSession = useCallback(() => {
    const duration = getDuration(mode);
    const session = {
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

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    setStatus('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Update timeLeft when settings change
  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(getDuration(mode));
    }
  }, [settings, mode, status, getDuration]);

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