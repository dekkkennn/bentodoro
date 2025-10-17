import Timer from "./Timer";
import ActivityHeatmap from "./ActivityHeatmap";
import SessionStats from "./SessionStats";
import Settings from "./Settings";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useEffect } from "react";

export default function Home() {
  const {
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
  } = usePomodoro();

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pomodoro Timer
            </h1>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timer - Large central component */}
          <div className="lg:col-span-7">
            <Timer
              mode={mode}
              status={status}
              timeLeft={timeLeft}
              completedSessions={completedSessions}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onModeChange={switchMode}
            />
          </div>

          {/* Settings - Smaller side component */}
          <div className="lg:col-span-5">
            <Settings settings={settings} onUpdateSettings={updateSettings} />
          </div>

          {/* Activity Heatmap - Wide component */}
          <div className="lg:col-span-7">
            <ActivityHeatmap sessions={sessions} />
          </div>

          {/* Session Stats - Side component */}
          <div className="lg:col-span-5">
            <SessionStats sessions={sessions} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-6">
          <p>Your data is stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
