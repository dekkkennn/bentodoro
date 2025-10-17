import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Settings({ settings, onUpdateSettings }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/10">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Settings</h3>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-xs text-muted-foreground">Toggle theme appearance</div>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </div>

        {/* Timer Settings Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Timer Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
              <DialogDescription>
                Adjust your pomodoro timer durations (in minutes)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="work">Work Duration</Label>
                <Input
                  id="work"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.workDuration}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, workDuration: parseInt(e.target.value) || 25 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="break">Break Duration</Label>
                <Input
                  id="break"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.breakDuration}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, breakDuration: parseInt(e.target.value) || 5 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longBreak">Long Break Duration</Label>
                <Input
                  id="longBreak"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.longBreakDuration}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, longBreakDuration: parseInt(e.target.value) || 15 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessions">Sessions Until Long Break</Label>
                <Input
                  id="sessions"
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.sessionsUntilLongBreak}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      sessionsUntilLongBreak: parseInt(e.target.value) || 4,
                    })
                  }
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Stats */}
        <div className="space-y-2 pt-4 border-t">
          <div className="text-sm font-medium mb-3">Current Settings</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-muted-foreground text-xs">Work</div>
              <div className="font-semibold">{settings.workDuration} min</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-muted-foreground text-xs">Break</div>
              <div className="font-semibold">{settings.breakDuration} min</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-muted-foreground text-xs">Long Break</div>
              <div className="font-semibold">{settings.longBreakDuration} min</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-muted-foreground text-xs">Sessions</div>
              <div className="font-semibold">{settings.sessionsUntilLongBreak}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}