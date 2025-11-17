import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useCurrentTask, useSettings, useTheme } from "@/hooks/use-local-storage";

const Task = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings] = useSettings();
  useTheme(); // Apply theme
  const [currentTask, setCurrentTask] = useCurrentTask();
  const [task, setTask] = useState("");
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Contextos de onde vem
  const afterMiniBreak = location.state?.afterMiniBreak; // Acabou mini pausa (após pré-foco)
  const afterBreak = location.state?.afterBreak; // Acabou pausa curta/longa
  const continueFocus = location.state?.continueFocus; // Continuando foco após pausa
  const receivedPomodoroCount = location.state?.pomodoroCount || 0;

  useEffect(() => {
    // Só preenche automaticamente se o usuário não editou ainda
    if (currentTask && !task && !hasUserEdited) {
      setTask(currentTask.task);
    }
  }, [currentTask, task, hasUserEdited]);

  const handleStart = () => {
    if (task.trim()) {
      let initialPhase: 'preFocus' | 'focus';
      let durationSec: number;

      // Determinar fase e duração baseado no contexto
      if (afterMiniBreak || afterBreak || continueFocus) {
        // Se vem de mini pausa, pausa curta/longa ou continua foco, sempre iniciar foco normal
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && task.trim()) {
      handleStart();
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-3" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full">
        <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-5 shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-border/60">
          <button
            onClick={() => navigate("/")}
            className="mb-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            aria-label="Voltar para página inicial"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium">Voltar</span>
          </button>

          <div className="text-center mb-5">
            <h1 className="text-2xl font-black text-foreground mb-2 leading-tight">
              {afterMiniBreak
                ? 'Qual a tarefa para o Pomodoro principal?'
                : afterBreak || continueFocus
                  ? 'Qual a tarefa para o próximo Pomodoro?'
                  : settings.preFocusEnabled
                    ? 'Qual é a menor tarefa possível?'
                    : 'Em que você vai trabalhar?'}
            </h1>

            <p className="text-muted-foreground text-sm">
              {afterMiniBreak
                ? `Defina sua tarefa para a sessão de ${settings.workTime} minutos`
                : afterBreak || continueFocus
                  ? `Defina sua tarefa para a sessão de ${settings.workTime} minutos`
                  : settings.preFocusEnabled
                    ? `Comece com uma microtarefa de 5 minutos para aquecer`
                    : `Defina o que você vai fazer durante ${settings.workTime} minutos`
              }
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <Input
                value={task}
                onChange={(e) => {
                  setTask(e.target.value);
                  setHasUserEdited(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder={settings.preFocusEnabled ? "Ex: Abrir documento e ler introdução" : "Ex: Escrever relatório mensal"}
                className="text-sm h-11 bg-background/50 border-2 border-border/40 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 rounded-xl px-4 placeholder:text-muted-foreground/40 transition-all"
                autoFocus
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity"></div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="h-10 px-5 text-xs font-semibold rounded-xl border-2"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleStart}
                disabled={!task.trim()}
                className="flex-1 h-10 text-xs font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-xl shadow-[0_4px_16px_-2px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_-2px_rgba(var(--primary),0.4)]"
              >
                Começar {afterMiniBreak || afterBreak || continueFocus ? settings.workTime : (settings.preFocusEnabled ? '5' : settings.workTime)}min →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
