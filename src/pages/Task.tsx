import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useCurrentTask, useSettings } from "@/hooks/use-local-storage";

const Task = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings] = useSettings();
  const [currentTask, setCurrentTask] = useCurrentTask();
  const [task, setTask] = useState("");

  // Contextos de onde vem
  const afterMiniBreak = location.state?.afterMiniBreak; // Acabou mini pausa (após pré-foco)
  const afterBreak = location.state?.afterBreak; // Acabou pausa curta/longa
  const receivedPomodoroCount = location.state?.pomodoroCount || 0;

  useEffect(() => {
    if (currentTask && !task) {
      setTask(currentTask.task);
    }
  }, [currentTask, task]);

  const handleStart = () => {
    if (task.trim()) {
      let initialPhase: 'preFocus' | 'focus';
      let durationSec: number;

      // Determinar fase e duração baseado no contexto
      if (afterMiniBreak || afterBreak) {
        // Se vem de mini pausa ou pausa curta/longa, sempre iniciar foco normal
        initialPhase = 'focus';
        durationSec = settings.workTime * 60;
      } else {
        // Início da aplicação
        if (settings.preFocusEnabled) {
          initialPhase = 'preFocus';
          durationSec = 5 * 60; // 5 minutos de pré-foco
        } else {
          initialPhase = 'focus';
          durationSec = settings.workTime * 60;
        }
      }

      const endAt = new Date(Date.now() + durationSec * 1000).toISOString();

      setCurrentTask({
        task: task.trim(),
        startedAt: new Date().toISOString(),
        timeLeft: durationSec,
        durationSec,
        endAt,
        currentPhase: initialPhase,
        pomodoroCount: receivedPomodoroCount,
      });

      navigate("/timer", { state: { task: task.trim() } });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && task.trim()) {
      handleStart();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)]">
          <button
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Voltar para página inicial"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            {afterMiniBreak
              ? 'Qual a tarefa para o Pomodoro principal?'
              : afterBreak
                ? 'Qual a tarefa para o próximo Pomodoro?'
                : settings.preFocusEnabled
                  ? 'Qual é a menor tarefa possível?'
                  : 'Em que você vai trabalhar?'}
          </h1>

          <p className="text-muted-foreground mb-6">
            {afterMiniBreak
              ? `Defina sua tarefa para a sessão de ${settings.workTime} minutos`
              : afterBreak
                ? `Defina sua tarefa para a sessão de ${settings.workTime} minutos`
                : settings.preFocusEnabled
                  ? `Comece com uma microtarefa de 5 minutos para aquecer`
                  : `Defina o que você vai fazer durante ${settings.workTime} minutos`
            }
          </p>

          <div className="space-y-4">
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={settings.preFocusEnabled ? "Ex: Abrir documento e ler introdução" : "Ex: Escrever relatório mensal"}
              className="text-base h-12 bg-background border-border focus-visible:ring-primary"
              autoFocus
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 h-12"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleStart}
                disabled={!task.trim()}
                className="flex-1 h-12 bg-secondary hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Começar ({afterMiniBreak || afterBreak ? settings.workTime : (settings.preFocusEnabled ? '5' : settings.workTime)}min)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
