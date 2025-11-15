import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, AlarmClock, Trophy } from "lucide-react";
import { useSettings, useCurrentTask, useUserStats } from "@/hooks/use-local-storage";

const Index = () => {
  const navigate = useNavigate();
  const [settings] = useSettings();
  const [, setCurrentTask] = useCurrentTask();
  const [userStats] = useUserStats();

  const handleStart = () => {
    if (settings.alwaysAskForTask) {
      navigate("/task");
    } else {
      // Se preFocus está habilitado, começar com microtarefa de 5min
      // Caso contrário, começar direto com o Pomodoro
      const initialPhase = settings.preFocusEnabled ? 'preFocus' : 'focus';
      const durationSec = settings.preFocusEnabled ? 5 * 60 : settings.workTime * 60;
      const defaultTask = {
        task: "Sessão de Foco",
        startedAt: new Date().toISOString(),
        timeLeft: durationSec,
        durationSec: durationSec,
        endAt: new Date(Date.now() + durationSec * 1000).toISOString(),
        currentPhase: initialPhase as const,
        pomodoroCount: 0,
      };
      setCurrentTask(defaultTask);
      navigate("/timer", { state: { task: defaultTask.task } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)] text-center">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => navigate("/settings")}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
              aria-label="Configurações"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <AlarmClock className="w-12 h-12 text-primary" aria-hidden="true" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Startize Pomodoro
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Foco em microetapas gerenciáveis
          </p>

          {/* Widget de XP/Level */}
          <div className="bg-background rounded-xl p-4 border border-border mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Nível {userStats.level}</span>
              </div>
              <span className="text-xs text-muted-foreground">{userStats.xp} / {userStats.level * 100} XP</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(userStats.xp / (userStats.level * 100)) * 100}%` }}
              />
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-[var(--shadow-button)] transition-all hover:shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.4)]"
          >
            Iniciar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;