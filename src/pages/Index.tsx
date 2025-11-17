import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, AlarmClock, Trophy, Sun, Moon } from "lucide-react";
import { useSettings, useCurrentTask, useUserStats, useTheme } from "@/hooks/use-local-storage";

const Index = () => {
  const navigate = useNavigate();
  const [settings] = useSettings();
  const { theme, toggleTheme } = useTheme(); // Apply theme and get toggle function
  const [, setCurrentTask] = useCurrentTask();
  const [userStats] = useUserStats();

  const handleStart = () => {
    if (settings.alwaysAskForTask) {
      navigate("/task");
    } else {
      // Se preFocus está habilitado, começar com microtarefa de 5min
      // Caso contrário, começar direto com o Pomodoro
      const initialPhase: 'preFocus' | 'focus' = settings.preFocusEnabled ? 'preFocus' : 'focus';
      const durationSec = settings.preFocusEnabled ? 5 * 60 : settings.workTime * 60;
      const defaultTask = {
        task: "Sessão de Foco",
        startedAt: new Date().toISOString(),
        timeLeft: durationSec,
        durationSec: durationSec,
        endAt: new Date(Date.now() + durationSec * 1000).toISOString(),
        currentPhase: initialPhase,
        pomodoroCount: 0,
      };
      setCurrentTask(defaultTask);
      navigate("/timer", { state: { task: defaultTask.task } });
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-3" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full">
        <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-5 shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-border/60 text-center">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary transition-all p-2 rounded-2xl hover:bg-primary/10 group relative"
              aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
              <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {theme === 'light' ? (
                <Sun className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="text-muted-foreground hover:text-primary transition-all p-2 rounded-2xl hover:bg-primary/10 group relative"
              aria-label="Configurações"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Settings className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="mb-3">
            <div className="relative w-16 h-16 mx-auto mb-3 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-xl">
                <AlarmClock className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-foreground mb-2 tracking-tight">
            Startize Pomodoro
          </h1>

          <p className="text-muted-foreground text-sm mb-4 font-medium">
            Foco em microetapas gerenciáveis
          </p>

          {/* Widget de XP/Level */}
          <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-xl p-3 border border-border/50 mb-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-bold text-foreground">Nível {userStats.level}</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{userStats.xp} / {userStats.level * 100} XP</span>
            </div>
            <div className="w-full h-2 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                style={{ width: `${(userStats.xp / (userStats.level * 100)) * 100}%` }}
              />
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full h-11 text-base font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-[0_6px_24px_-4px_rgba(var(--primary),0.5)] hover:shadow-[0_8px_30px_-4px_rgba(var(--primary),0.6)] transition-all rounded-xl"
          >
            Iniciar 🚀
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;