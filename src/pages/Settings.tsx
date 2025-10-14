import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    visualFilter: false,
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoBreaks: false,
    autoStart: false,
    audioUrl: "",
    soundEnabled: true,
  });

  const handleSave = () => {
    // Save settings to localStorage or state management
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
    toast.success("Configurações salvas com sucesso!");
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)]">
          <button 
            onClick={handleCancel}
            className="mb-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-2xl font-bold text-foreground mb-6">
            Configurações
          </h1>

          <div className="space-y-6">
            {/* Visual Filter */}
            <div className="flex items-center justify-between">
              <Label htmlFor="visual-filter" className="text-base">Filtro Visual</Label>
              <Switch
                id="visual-filter"
                checked={settings.visualFilter}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, visualFilter: checked })
                }
              />
            </div>

            {/* Time Settings */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground">Tempo (minutos)</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="work-time" className="text-sm text-muted-foreground">
                    Pomodoro (trabalho)
                  </Label>
                  <Input
                    id="work-time"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workTime}
                    onChange={(e) => 
                      setSettings({ ...settings, workTime: parseInt(e.target.value) || 25 })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="short-break" className="text-sm text-muted-foreground">
                    Pausa curta
                  </Label>
                  <Input
                    id="short-break"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreak}
                    onChange={(e) => 
                      setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="long-break" className="text-sm text-muted-foreground">
                    Pausa longa
                  </Label>
                  <Input
                    id="long-break"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreak}
                    onChange={(e) => 
                      setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="interval" className="text-sm text-muted-foreground">
                    Intervalo para pausa longa
                  </Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) => 
                      setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Auto Settings */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-breaks" className="text-base">Pausas automáticas</Label>
                <Switch
                  id="auto-breaks"
                  checked={settings.autoBreaks}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, autoBreaks: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start" className="text-base">Inicialização automática</Label>
                <Switch
                  id="auto-start"
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, autoStart: checked })
                  }
                />
              </div>
            </div>

            {/* Audio Settings */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label htmlFor="audio-url" className="text-sm text-muted-foreground">
                  URL de áudio/vídeo
                </Label>
                <Input
                  id="audio-url"
                  type="url"
                  placeholder="https://exemplo.com/audio.mp3"
                  value={settings.audioUrl}
                  onChange={(e) => 
                    setSettings({ ...settings, audioUrl: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled" className="text-base">Habilitar som</Label>
                <Switch
                  id="sound-enabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, soundEnabled: checked })
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-12"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleSave}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 shadow-[var(--shadow-button)]"
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
