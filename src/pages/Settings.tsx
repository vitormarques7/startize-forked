import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-local-storage";

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useSettings();

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-xl">
        <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <button 
            onClick={handleCancel}
            className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-xl font-bold text-foreground mb-4">
            Configurações
          </h1>

          <div className="space-y-4">
            {/* Visual Filter */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="visual-filter" className="text-sm">Filtro Visual</Label>
              <Switch
                id="visual-filter"
                checked={settings.visualFilter}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, visualFilter: checked })
                }
              />
            </div>

            {/* Time Settings */}
            <div className="space-y-3 pt-3 border-t border-border">
              <h3 className="font-semibold text-sm text-foreground">Tempo (minutos)</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="work-time" className="text-xs text-muted-foreground">
                    Pomodoro
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
                  <Label htmlFor="short-break" className="text-xs text-muted-foreground">
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
                  <Label htmlFor="long-break" className="text-xs text-muted-foreground">
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
                  <Label htmlFor="interval" className="text-xs text-muted-foreground">
                    Intervalo pausa longa
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
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between py-1">
                <Label htmlFor="auto-breaks" className="text-sm">Pausas automáticas</Label>
                <Switch
                  id="auto-breaks"
                  checked={settings.autoBreaks}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, autoBreaks: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label htmlFor="auto-start" className="text-sm">Inicialização automática</Label>
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
            <div className="space-y-3 pt-3 border-t border-border">
              <div>
                <Label htmlFor="audio-url" className="text-xs text-muted-foreground">
                  URL do YouTube (para música de fundo)
                </Label>
                <Input
                  id="audio-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={settings.audioUrl}
                  onChange={(e) => 
                    setSettings({ ...settings, audioUrl: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label htmlFor="sound-enabled" className="text-sm">Habilitar som</Label>
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
            <div className="flex gap-3 pt-4">
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
