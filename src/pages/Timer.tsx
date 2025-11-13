import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useSettings, useCurrentTask, addHistoryEntry, addUserXp } from "@/hooks/use-local-storage";
import { toast } from "sonner";

const Timer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task || "Tarefa não definida";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [settings] = useSettings();
  const [currentTask, setCurrentTask] = useCurrentTask();

  const [currentPhase, setCurrentPhase] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const getPhaseDuration = (phase: typeof currentPhase) => {
    switch (phase) {
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

  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Lógica para áudio local (Ruído Branco, Chuva, etc.)
    if (audioRef.current) {
      if (isRunning && soundEnabled && settings.backgroundSound !== 'none' && settings.backgroundSound !== 'youtube') {
        const soundPath = `/audio/${settings.backgroundSound}-60min.mp3`;
        if (!audioRef.current.src.endsWith(soundPath)) { // Evita recarregar se a URL for a mesma
          audioRef.current.src = soundPath;
        }
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5; // Ajuste o volume se necessário
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }

    // Lógica para YouTube (apenas pausa/play via postMessage, o src já está setado)
    const player = iframeRef.current?.contentWindow;
    if (player && settings.backgroundSound === 'youtube') {
      if (isRunning && soundEnabled && settings.youtubeUrl) {
        player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        player.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    }
  }, [soundEnabled, settings.backgroundSound, settings.youtubeUrl, isRunning]);


  useEffect(() => {
    if (task !== "Tarefa não definida") {
      setCurrentTask((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          timeLeft,
          durationSec: duration,
          endAt: new Date(endTimeRef.current).toISOString(),
        } as typeof prev;
        const unchanged =
          prev.timeLeft === next.timeLeft &&
          prev.durationSec === next.durationSec &&
          prev.endAt === next.endAt;
        return unchanged ? prev : next;
      });
    }
  }, [timeLeft, task, setCurrentTask, duration]);

  useEffect(() => {
    if (!location.state?.task) {
      navigate("/task");
      return;
    }
  }, [location.state, navigate]);

  const handleStartPhase = (phase: 'focus' | 'shortBreak' | 'longBreak') => {
    setCurrentPhase(phase);
    const newDurationSec = getPhaseDuration(phase);
    const newEndTime = Date.now() + newDurationSec * 1000;
    
    endTimeRef.current = newEndTime;
    setTimeLeft(newDurationSec);
    setIsCompleted(false);
    setIsRunning(true);

    if (phase === 'focus') {
      setCurrentTask(prev => prev ? {
        ...prev,
        startedAt: new Date().toISOString(),
        timeLeft: newDurationSec,
        durationSec: newDurationSec,
        endAt: new Date(newEndTime).toISOString(),
      } : null);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        setIsRunning(false);

        let nextPhase: 'focus' | 'shortBreak' | 'longBreak' = 'focus';
        let shouldAutoStart = false;

        if (currentPhase === 'focus') {
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
          nextPhase = 'focus';
          toast.info("Pausa concluída! Hora de focar novamente. 🚀");
          shouldAutoStart = settings.autoStart;
        }

        if (soundEnabled) {
          const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTWJ0fPTgjMGHm7A7+OZURE=");
          audio.play().catch(() => {});
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
  }, [isRunning, soundEnabled, task, duration, setCurrentTask, currentPhase, pomodoroCount, settings]);

  useEffect(() => {
    if (!isRunning && isCompleted) {
      const newDurationSec = getPhaseDuration(currentPhase);
      setTimeLeft(newDurationSec);
    }
  }, [currentPhase, isCompleted, isRunning, settings.workTime, settings.shortBreak, settings.longBreak]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleStopAndRestart = () => {
    const timeSpent = Math.round((duration - timeLeft) / 60);
    if (timeSpent > 0 && currentPhase === 'focus') {
      addHistoryEntry(task, timeSpent, true);
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

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      // Adicionamos ?enablejsapi=1 para permitir controle via JavaScript, mas o autoplay é o principal.
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&loop=1&playlist=${match[2]}&enablejsapi=1`;
    }
    return null;
  };

  const youtubeUrl = settings?.youtubeUrl ? getYouTubeEmbedUrl(settings.youtubeUrl) : null;

  const wasFocusPhase = currentPhase === 'shortBreak' || currentPhase === 'longBreak';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      {/* YouTube Player (sempre presente, visibilidade controlada por CSS) */}
      {youtubeUrl && (
        <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            width="0"
            height="0"
            // A URL é sempre definida aqui. O autoplay é tratado por 'allow' e 'postMessage'.
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
            <div className="relative">
              <div className="text-7xl font-bold text-foreground tracking-tight">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${((getPhaseDuration(currentPhase) - timeLeft) / getPhaseDuration(currentPhase)) * 100}%` }}/>
              </div>
            </div>

            <div className="bg-background rounded-xl p-4 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {currentPhase === 'focus' ? 'Microtarefa atual:' : 'Em pausa...'}
              </p>
              <p className="text-base text-foreground">{task}</p>
            </div>

            {!isCompleted ? (
              <>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  {soundEnabled ? (
                    <><Volume2 className="w-5 h-5" /><span className="text-sm">Som ativado</span></>
                  ) : (
                    <><VolumeX className="w-5 h-5" /><span className="text-sm">Som desativado</span></>
                  )}
                </button>
                <Button onClick={handleStopAndRestart} variant="destructive" className="w-full h-14 text-base font-semibold shadow-[0_2px_8px_-2px_hsl(var(--destructive)/0.3)]">
                  Parar e Reiniciar
                </Button>
              </>
            ) : (
              <>
                <div className="text-center py-2">
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {wasFocusPhase ? 'Foco concluído!' : 'Pausa concluída!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {wasFocusPhase && currentPhase === 'shortBreak' && `Hora da pausa curta (${settings.shortBreak}min).`}
                    {wasFocusPhase && currentPhase === 'longBreak' && `Hora da pausa longa (${settings.longBreak}min).`}
                    {!wasFocusPhase && 'Vamos para a próxima tarefa?'}
                  </p>
                </div>
                <div className="space-y-3">
                  {wasFocusPhase ? (
                    <div className="flex gap-3">
                      <Button onClick={handleStartNextPhase} variant="outline" className="flex-1 h-14 text-base font-semibold">
                        Iniciar Pausa
                      </Button>
                      <Button onClick={handleContinueFocus} className="flex-1 h-14 text-base font-semibold bg-secondary hover:bg-secondary/90">
                        Continuar Foco
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