import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useCurrentTask } from "@/hooks/use-local-storage";

const Task = () => {
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useCurrentTask();
  const [task, setTask] = useState("");

  // Load last incomplete task if exists
  useEffect(() => {
    if (currentTask && !task) {
      setTask(currentTask.task);
    }
  }, [currentTask, task]);

  const handleStart = () => {
    if (task.trim()) {
      // Save current task to localStorage
      setCurrentTask({
        task: task.trim(),
        startedAt: new Date().toISOString(),
        timeLeft: 5 * 60,
      });
      navigate("/timer", { state: { task: task.trim() } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)]">
          <button 
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Qual é a menor tarefa possível?
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Descreva uma microtarefa que você possa completar
          </p>

          <div className="space-y-4">
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Ex: Abrir documento e escrever título"
              className="text-base h-12 bg-background border-border focus-visible:ring-primary"
              autoFocus
            />

            <p className="text-sm text-muted-foreground">
              Exemplo: Abrir documento e escrever título
            </p>

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
                Começar (5min)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
