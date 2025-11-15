import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Pause, Play, CheckCircle } from "lucide-react";
import { useSettings, useCurrentTask, addHistoryEntry, addUserXp, PomodoroPhase, BackgroundSound, isValidBackgroundSound } from "@/hooks/use-local-storage";
import { toast } from "sonner";

const Timer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completionAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());

  const [settings, setSettings] = useSettings();
  const [currentTask, setCurrentTask] = useCurrentTask();

  // Priorizar currentTask do localStorage sobre location.state
  const taskFromState = location.state?.task;
  const task = currentTask?.task || taskFromState || "Tarefa não definida";

  // Inicializar estados a partir do currentTask se existir
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>(() => {
    return currentTask?.currentPhase || 'focus';
  });
  const [pomodoroCount, setPomodoroCount] = useState(
    currentTask?.pomodoroCount || 0
  );
  const [isPaused, setIsPaused] = useState(false);
  const pausedTimeRef = useRef<number>(0);

  const getPhaseDuration = (phase: PomodoroPhase) => {
    switch (phase) {
      case 'preFocus':
        return 5 * 60; // 5 minutos de pré-foco
      case 'miniBreak':
        return 2 * 60; // 2 minutos de mini pausa (após pré-foco)
      case 'focus':
        return settings.workTime * 60;
      case 'shortBreak':
        return settings.shortBreak * 60;
      case 'longBreak':
        return settings.longBreak * 60;
      default:
        return settings.workTime * 60;
    }
  };

  const duration = currentTask?.durationSec ?? getPhaseDuration(currentPhase);
  const endTimeRef = useRef<number>(
    currentTask?.endAt ? new Date(currentTask.endAt).getTime() : Date.now() + duration * 1000
  );
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
  );

  const [isRunning, setIsRunning] = useState(!isPaused);
  const [isCompleted, setIsCompleted] = useState(false);

  // Criar áudio de conclusão uma única vez
  useEffect(() => {
    // Tentar usar arquivo de notificação customizado, senão usar som embutido
    const notificationPath = '/audio/notification.mp3';
    const audio = new Audio();

    // Tentar carregar arquivo customizado
    audio.src = notificationPath;
    audio.volume = 0.7; // Volume audível

    // Se falhar ao carregar, usar som base64 embutido como fallback
    audio.onerror = () => {
      audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTWJ0fPTgjMGHm7A7+OZURE=";
      audio.volume = 0.7;
    };

    completionAudioRef.current = audio;

    return () => {
      if (completionAudioRef.current) {
        completionAudioRef.current.pause();
        completionAudioRef.current = null;
      }
    };
  }, []);

  // Lógica de áudio
  useEffect(() => {
    // Áudio local (Ruído Branco, Chuva, etc.)
    if (audioRef.current) {
      if (isRunning && settings.soundEnabled && settings.backgroundSound !== 'none' && settings.backgroundSound !== 'youtube') {
        const soundPath = `/audio/${settings.backgroundSound}-60min.mp3`;
        if (!audioRef.current.src.endsWith(soundPath)) {
          audioRef.current.src = soundPath;
        }
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch((error) => {
          console.error('Erro ao reproduzir áudio de fundo:', error);
          toast.error('Não foi possível reproduzir o áudio de fundo.');
        });
      } else {
        audioRef.current.pause();
      }
    }

    // YouTube (controle apenas via postMessage, sem autoplay na URL)
    const player = iframeRef.current?.contentWindow;
    if (player && settings.backgroundSound === 'youtube' && settings.youtubeUrl) {
      if (isRunning && settings.soundEnabled) {
        player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        player.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    }
  }, [settings.soundEnabled, settings.backgroundSound, settings.youtubeUrl, isRunning]);

  // Salvar currentTask no localStorage (otimizado - a cada 10 segundos)
  useEffect(() => {
    if (task === "Tarefa não definida") return;

    const now = Date.now();
    const shouldSave = now - lastSaveTimeRef.current >= 10000; // 10 segundos

    if (shouldSave || timeLeft === 0) {
      lastSaveTimeRef.current = now;
      setCurrentTask({
        task,
        startedAt: currentTask?.startedAt || new Date().toISOString(),
        timeLeft,
        durationSec: duration,
        endAt: new Date(endTimeRef.current).toISOString(),
        currentPhase,
        pomodoroCount,
      });
    }
  }, [timeLeft, task, duration, currentPhase, pomodoroCount, currentTask?.startedAt, setCurrentTask]);

  // Redirecionar se não tiver tarefa válida
  useEffect(() => {
    if (!currentTask && !taskFromState) {
      navigate("/task");
      return;
    }
  }, [currentTask, taskFromState, navigate]);

  const handleStartPhase = (phase: PomodoroPhase) => {
    setCurrentPhase(phase);
    const newDurationSec = getPhaseDuration(phase);
    const newEndTime = Date.now() + newDurationSec * 1000;

    endTimeRef.current = newEndTime;
    setTimeLeft(newDurationSec);
    setIsCompleted(false);
    setIsRunning(true);
    setJustCompletedPreFocus(false); // Resetar flag ao iniciar nova fase

    setCurrentTask({
      task,
      startedAt: new Date().toISOString(),
      timeLeft: newDurationSec,
      durationSec: newDurationSec,
      endAt: new Date(newEndTime).toISOString(),
      currentPhase: phase,
      pomodoroCount,
    });
  };

  // Timer principal
  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        setIsRunning(false);

        let nextPhase: PomodoroPhase = 'focus';
        let shouldAutoStart = false;

        if (currentPhase === 'preFocus') {
          // Pré-foco concluído → Mini pausa de 2min
          nextPhase = 'miniBreak';
          toast.success("Pré-foco concluído! Parabéns! 🎉");

          // Recompensar com 5 XP
          const xpGained = 5;
          const { leveledUp, newLevel } = addUserXp(xpGained);
          toast.info(`Você ganhou ${xpGained} XP!`);
          if (leveledUp) {
            toast.success(`Você subiu para o nível ${newLevel}! 🏆`);
          }

          shouldAutoStart = false; // Mostrar botão para iniciar mini pausa
        } else if (currentPhase === 'miniBreak') {
          // Mini pausa concluída → Perguntar tarefa para Pomodoro principal
          toast.info("Mini pausa concluída! Hora do Pomodoro principal. 🚀");

          // Sempre pedir nova tarefa após mini pausa
          setCurrentTask(null);
          navigate('/task', { state: { afterMiniBreak: true, pomodoroCount } });
          return;
        } else if (currentPhase === 'focus') {
          // Foco principal concluído
          const newPomodoroCount = pomodoroCount + 1;
          setPomodoroCount(newPomodoroCount);
          const durationMin = Math.round(duration / 60);
          addHistoryEntry(task, durationMin, false);
          toast.success("Pomodoro concluído! 🎉");

          const xpGained = 10;
          const { leveledUp, newLevel } = addUserXp(xpGained);
          toast.info(`Você ganhou ${xpGained} XP!`);
          if (leveledUp) {
            toast.success(`Você subiu para o nível ${newLevel}! 🏆`);
          }

          if (newPomodoroCount % settings.longBreakInterval === 0) {
            nextPhase = 'longBreak';
          } else {
            nextPhase = 'shortBreak';
          }
          shouldAutoStart = settings.autoBreaks;
        } else {
          // Pausas (shortBreak ou longBreak) concluídas
          nextPhase = 'focus';
          toast.info("Pausa concluída! Hora de focar novamente. 🚀");

          // Após pausa: verificar se deve pedir nova tarefa
          if (settings.showTaskBeforeFocus && !settings.autoStart) {
            // Pedir nova tarefa para o próximo foco
            setCurrentTask(null);
            navigate('/task', { state: { afterBreak: true, pomodoroCount } });
            return;
          }

          shouldAutoStart = settings.autoStart;
        }

        if (settings.soundEnabled && completionAudioRef.current) {
          completionAudioRef.current.play().catch((error) => {
            console.error('Erro ao reproduzir som de conclusão:', error);
          });
        }

        if (shouldAutoStart) {
          handleStartPhase(nextPhase);
        } else {
          setCurrentPhase(nextPhase);
          setIsCompleted(true);
        }
      }
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, settings.soundEnabled, task, duration, currentPhase, pomodoroCount, settings.autoBreaks, settings.autoStart, settings.longBreakInterval]);

  // Atualizar timeLeft quando completar e mudar de fase
  useEffect(() => {
    if (!isRunning && isCompleted) {
      const newDurationSec = getPhaseDuration(currentPhase);
      setTimeLeft(newDurationSec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase, isCompleted, isRunning, settings.workTime, settings.shortBreak, settings.longBreak]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleStopAndRestart = () => {
    const timeSpent = Math.round((duration - timeLeft) / 60);
    if (currentPhase === 'focus') {
      if (timeSpent > 0) {
        addHistoryEntry(task, timeSpent, true);
        toast.info("Sessão interrompida e registrada no histórico.");
      } else {
        toast.info("Sessão muito curta, não registrada no histórico.");
      }
    }
    setCurrentTask(null);
    navigate("/");
  };

  const handleStartNextPhase = () => {
    handleStartPhase(currentPhase);
  };

  const handleContinueFocus = () => {
    if (settings.askOnContinue) {
      navigate('/task');
    } else {
      handleStartPhase('focus');
    }
  };

  const handleToggleSound = () => {
    setSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleSoundChange = (value: string) => {
    if (isValidBackgroundSound(value)) {
      setSettings({ ...settings, backgroundSound: value });
      if (value !== 'none' && !settings.soundEnabled) {
        setSettings({ ...settings, backgroundSound: value, soundEnabled: true });
      }

      // Feedback visual
      const soundNames: Record<BackgroundSound, string> = {
        'none': 'Nenhum',
        'youtube': 'YouTube',
        'White-Noise': 'Ruído Branco',
        'Rain': 'Chuva',
        'Ocean': 'Oceano',
        'Water': 'Água'
      };
      toast.info(`Som alterado para: ${soundNames[value]}`);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume: ajustar endTimeRef baseado no tempo pausado
      const now = Date.now();
      endTimeRef.current = now + (timeLeft * 1000);
      setIsPaused(false);
      setIsRunning(true);
      toast.info("Timer retomado");
    } else {
      // Pause: salvar tempo restante
      pausedTimeRef.current = timeLeft;
      setIsPaused(true);
      setIsRunning(false);
      toast.info("Timer pausado");
    }
  };

  const handleCompleteTask = () => {
    // Apenas permitir completar durante fase de foco
    if (currentPhase !== 'focus' && currentPhase !== 'preFocus') return;

    // Calcular tempo gasto
    const timeSpent = Math.round((duration - timeLeft) / 60);

    // Adicionar ao histórico como completo (não interrompido)
    addHistoryEntry(task, timeSpent > 0 ? timeSpent : 1, false);

    // Incrementar contador de pomodoros apenas se for foco principal
    if (currentPhase === 'focus') {
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);

      // Adicionar XP
      const xpGained = 10;
      const { leveledUp, newLevel } = addUserXp(xpGained);
      toast.success("Tarefa concluída! 🎉");
      toast.info(`Você ganhou ${xpGained} XP!`);
      if (leveledUp) {
        toast.success(`Você subiu para o nível ${newLevel}! 🏆`);
      }

      // Determinar próxima fase
      const nextPhase = newPomodoroCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';

      // Tocar som de conclusão
      if (settings.soundEnabled && completionAudioRef.current) {
        completionAudioRef.current.play().catch((error) => {
          console.error('Erro ao reproduzir som de conclusão:', error);
        });
      }

      // Parar timer e mostrar opções de próxima fase
      setIsRunning(false);
      setCurrentPhase(nextPhase);
      setIsCompleted(true);
      setTimeLeft(getPhaseDuration(nextPhase));
    } else if (currentPhase === 'preFocus') {
      // Pré-foco completado antecipadamente → Mini pausa
      const xpGained = 5;
      const { leveledUp, newLevel } = addUserXp(xpGained);
      toast.success("Pré-foco concluído! 🎉");
      toast.info(`Você ganhou ${xpGained} XP!`);
      if (leveledUp) {
        toast.success(`Você subiu para o nível ${newLevel}! 🏆`);
      }

      if (settings.soundEnabled && completionAudioRef.current) {
        completionAudioRef.current.play().catch((error) => {
          console.error('Erro ao reproduzir som de conclusão:', error);
        });
      }

      setIsRunning(false);
      setCurrentPhase('miniBreak');
      setIsCompleted(true);
      setTimeLeft(getPhaseDuration('miniBreak'));
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      // Remover autoplay da URL, controlar apenas via postMessage
      return `https://www.youtube.com/embed/${match[2]}?loop=1&playlist=${match[2]}&enablejsapi=1`;
    }
    return null;
  };

  const youtubeUrl = settings?.youtubeUrl ? getYouTubeEmbedUrl(settings.youtubeUrl) : null;

  const isBreakPhase = currentPhase === 'miniBreak' || currentPhase === 'shortBreak' || currentPhase === 'longBreak';

  // Determinar cor e texto da fase
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'preFocus':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'miniBreak':
        return 'bg-orange-500/20 text-orange-600 border-orange-500/40 animate-pulse'; // Destaque especial
      case 'focus':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'shortBreak':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'longBreak':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'preFocus':
        return '⚡ Pré-Foco';
      case 'miniBreak':
        return '🌊 Mini Pausa';
      case 'focus':
        return '🎯 Foco';
      case 'shortBreak':
        return '☕ Pausa Curta';
      case 'longBreak':
        return '🌟 Pausa Longa';
      default:
        return 'Sessão';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      {/* YouTube Player (sempre presente, visibilidade controlada por CSS) */}
      {youtubeUrl && (
        <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            width="0"
            height="0"
            src={youtubeUrl}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Background Music"
          />
        </div>
      )}
      <audio ref={audioRef} />

      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)]">
          <div className="text-center space-y-8">
            {/* Badge de Fase */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getPhaseColor()}`}>
                {getPhaseText()}
              </span>
            </div>

            <div className="relative">
              <div className="text-7xl font-bold text-foreground tracking-tight">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${((getPhaseDuration(currentPhase) - timeLeft) / getPhaseDuration(currentPhase)) * 100}%` }}/>
              </div>
            </div>

            {!isBreakPhase ? (
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {currentPhase === 'preFocus' ? 'Microtarefa de aquecimento:' : 'Pomodoro atual:'}
                </p>
                <p className="text-base text-foreground">{task}</p>
                {currentPhase === 'focus' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Pomodoros completados: {pomodoroCount}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-background rounded-xl p-4 border border-border text-center">
                <p className="text-base font-medium text-muted-foreground">
                  {currentPhase === 'miniBreak' && '☕ Descanse um pouco! Logo volta ao foco.'}
                  {currentPhase === 'shortBreak' && '🌿 Relaxe e recarregue as energias.'}
                  {currentPhase === 'longBreak' && '🌟 Pausa longa! Você merece esse descanso.'}
                </p>
              </div>
            )}

            {!isCompleted ? (
              <>
                {/* Seletor de som de fundo */}
                <div className="bg-background rounded-xl p-4 border border-border">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground block">
                      Som de fundo
                    </label>
                    <Select value={settings.backgroundSound} onValueChange={handleSoundChange}>
                      <SelectTrigger className="w-full" aria-label="Selecionar som de fundo">
                        <SelectValue placeholder="Escolha um som" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">🔇 Nenhum</SelectItem>
                        <SelectItem value="White-Noise">🌫️ Ruído Branco</SelectItem>
                        <SelectItem value="Rain">🌧️ Chuva</SelectItem>
                        <SelectItem value="Ocean">🌊 Oceano</SelectItem>
                        <SelectItem value="Water">💧 Água</SelectItem>
                        {settings.youtubeUrl && (
                          <SelectItem value="youtube">▶️ YouTube</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  {/* Botão de som - só mostra se houver som configurado */}
                  {settings.backgroundSound !== 'none' && (
                    <button
                      onClick={handleToggleSound}
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={settings.soundEnabled ? "Desativar som" : "Ativar som"}
                    >
                      {settings.soundEnabled ? (
                        <><Volume2 className="w-5 h-5" /><span className="text-sm">Som ativado</span></>
                      ) : (
                        <><VolumeX className="w-5 h-5" /><span className="text-sm">Som desativado</span></>
                      )}
                    </button>
                  )}
                  {/* Botão de Pause/Resume */}
                  <button
                    onClick={handlePauseResume}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={isPaused ? "Retomar timer" : "Pausar timer"}
                  >
                    {isPaused ? (
                      <><Play className="w-5 h-5" /><span className="text-sm">Retomar</span></>
                    ) : (
                      <><Pause className="w-5 h-5" /><span className="text-sm">Pausar</span></>
                    )}
                  </button>
                </div>
                {(currentPhase === 'focus' || currentPhase === 'preFocus') && (
                  <Button
                    onClick={handleCompleteTask}
                    className="w-full h-14 text-base font-semibold bg-green-600 hover:bg-green-700 shadow-[0_2px_8px_-2px_rgba(34,197,94,0.3)]"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Completar Tarefa
                  </Button>
                )}
                <Button onClick={handleStopAndRestart} variant="destructive" className="w-full h-14 text-base font-semibold shadow-[0_2px_8px_-2px_hsl(var(--destructive)/0.3)]">
                  Parar e Reiniciar
                </Button>
              </>
            ) : (
              <>
                <div className="text-center py-2">
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {currentPhase === 'miniBreak'
                      ? 'Pré-foco concluído! 🎉'
                      : currentPhase === 'shortBreak' || currentPhase === 'longBreak'
                        ? 'Foco concluído!'
                        : 'Pausa concluída!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentPhase === 'miniBreak' && `Mini pausa de 2 minutos! Respire fundo.`}
                    {currentPhase === 'shortBreak' && `Hora da pausa curta (${settings.shortBreak}min).`}
                    {currentPhase === 'longBreak' && `Hora da pausa longa (${settings.longBreak}min).`}
                    {currentPhase === 'focus' && 'Vamos para a próxima tarefa?'}
                  </p>
                </div>
                <div className="space-y-3">
                  {currentPhase === 'miniBreak' ? (
                    <Button onClick={handleStartNextPhase} className="w-full h-14 text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg animate-pulse">
                      Iniciar Mini Pausa (2min) ☕
                    </Button>
                  ) : (currentPhase === 'shortBreak' || currentPhase === 'longBreak') ? (
                    <div className="flex gap-3">
                      <Button onClick={handleStartNextPhase} variant="outline" className="flex-1 h-14 text-base font-semibold">
                        Iniciar Pausa
                      </Button>
                      <Button onClick={handleContinueFocus} className="flex-1 h-14 text-base font-semibold bg-secondary hover:bg-secondary/90">
                        {settings.askOnContinue ? 'Novo Foco' : 'Continuar Foco'}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleStartNextPhase} className="w-full h-14 text-base font-semibold bg-secondary hover:bg-secondary/90">
                      Iniciar Foco
                    </Button>
                  )}
                  <Button onClick={handleStopAndRestart} variant="ghost" className="w-full h-14 text-base font-semibold text-muted-foreground">
                    Encerrar Sessão
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
