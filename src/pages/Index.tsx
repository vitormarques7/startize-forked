import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, AlarmClock } from "lucide-react";
import { useSettings, useCurrentTask } from "@/hooks/use-local-storage";

const Index = () => {
  const navigate = useNavigate();
  const [settings] = useSettings();
  const [, setCurrentTask] = useCurrentTask();

  const handleStart = () => {
    if (settings.alwaysAskForTask) {
      navigate("/task");
    } else {
      const durationSec = settings.workTime * 60;
      const defaultTask = {
        task: "Sessão de Foco",
        startedAt: new Date().toISOString(),
        timeLeft: durationSec,
        durationSec: durationSec,
        endAt: new Date(Date.now() + durationSec * 1000).toISOString(),
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
          
          <p className="text-muted-foreground mb-12">
            Foco em microetapas gerenciáveis
          </p>

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