import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useSettings, useCurrentTask, addHistoryEntry } from "@/hooks/use-local-storage";
import { toast } from "sonner";

const Timer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task || "Tarefa não definida";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [settings] = useSettings();
  const [currentTask, setCurrentTask] = useCurrentTask();
  
  const [timeLeft, setTimeLeft] = useState(() => {
    // Try to restore time from currentTask if returning to timer
    if (currentTask && currentTask.task === task) {
      return currentTask.timeLeft;
    }
    return settings.workTime * 60;
  });
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  // Save current progress to localStorage
  useEffect(() => {
    if (currentTask && task !== "Tarefa não definida") {
      setCurrentTask({
        ...currentTask,
        timeLeft,
      });
    }
  }, [timeLeft, task, currentTask, setCurrentTask]);

  useEffect(() => {
    if (!location.state?.task) {
      navigate("/task");
      return;
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (soundEnabled) {
            // Play notification sound when timer ends
            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTWJ0fPTgjMGHm7A7+OZURE=");
            audio.play().catch(() => {});
          }
          // Add to history when completed
          const duration = Math.round(settings.workTime);
          addHistoryEntry(task, duration, false);
          setCurrentTask(null); // Clear current task
          toast.success("Pomodoro concluído! 🎉");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, soundEnabled, task, settings.workTime, setCurrentTask]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleStopAndRestart = () => {
    // Add to history as interrupted
    const timeSpent = Math.round((settings.workTime * 60 - timeLeft) / 60);
    if (timeSpent > 0) {
      addHistoryEntry(task, timeSpent, true);
    }
    setCurrentTask(null); // Clear current task
    navigate("/");
  };

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&loop=1&playlist=${match[2]}`;
    }
    return null;
  };

  const youtubeUrl = settings?.audioUrl ? getYouTubeEmbedUrl(settings.audioUrl) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      {/* YouTube Player (hidden but playing) */}
      {youtubeUrl && settings?.soundEnabled && (
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
      
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)]">
          <div className="text-center space-y-8">
            {/* Timer Display */}
            <div className="relative">
              <div className="text-7xl font-bold text-foreground tracking-tight">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${((settings.workTime * 60 - timeLeft) / (settings.workTime * 60)) * 100}%` }}
                />
              </div>
            </div>

            {/* Task Display */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Microtarefa atual:</p>
              <p className="text-base text-foreground">{task}</p>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span className="text-sm">Som ativado</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span className="text-sm">Som desativado</span>
                </>
              )}
            </button>

            {/* Stop Button */}
            <Button
              onClick={handleStopAndRestart}
              variant="destructive"
              className="w-full h-14 text-base font-semibold shadow-[0_2px_8px_-2px_hsl(var(--destructive)/0.3)]"
            >
              Parar e Reiniciar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
