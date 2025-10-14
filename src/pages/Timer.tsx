import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

const Timer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task || "Tarefa não definida";
  
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, soundEnabled]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleStopAndRestart = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
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
                  style={{ width: `${((5 * 60 - timeLeft) / (5 * 60)) * 100}%` }}
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
