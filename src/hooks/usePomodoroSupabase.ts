import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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

export const usePomodoroSupabase = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from Supabase
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('pomodoro_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        const loadedSettings = {
          workDuration: data.work_duration,
          breakDuration: data.break_duration,
          longBreakDuration: data.long_break_duration,
          sessionsUntilLongBreak: data.sessions_until_long_break,
        };
        setSettings(loadedSettings);
        setTimeLeft(loadedSettings.workDuration * 60);
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  // Load sessions from Supabase
  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (data && !error) {
        const loadedSessions = data.map(s => ({
          date: s.date,
          duration: s.duration,
          type: s.type as TimerMode,
        }));
        setSessions(loadedSessions);
        setCompletedSessions(data.filter(s => s.type === 'work').length);
      }
    };

    loadSessions();
  }, [user]);

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

  const completeSession = useCallback(async () => {
    if (!user) return;

    const duration = getDuration(mode);
    const session: PomodoroSession = {
      date: new Date().toISOString(),
      duration: duration / 60,
      type: mode,
    };

    // Save to Supabase
    await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      date: session.date,
      duration: session.duration,
      type: session.type,
    });

    setSessions(prev => [session, ...prev]);

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
  }, [mode, completedSessions, settings.sessionsUntilLongBreak, getDuration, switchMode, user]);

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

  const updateSettings = useCallback(async (newSettings: Partial<PomodoroSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Save to Supabase
    await supabase
      .from('pomodoro_settings')
      .update({
        work_duration: updatedSettings.workDuration,
        break_duration: updatedSettings.breakDuration,
        long_break_duration: updatedSettings.longBreakDuration,
        sessions_until_long_break: updatedSettings.sessionsUntilLongBreak,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    reset();
  }, [settings, user, reset]);

  return {
    mode,
    status,
    timeLeft,
    completedSessions,
    sessions,
    settings,
    loading,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
  };
};
