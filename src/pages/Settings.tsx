import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Timer,
  Bot,
  Music,
  Info,
  Plus,
  Trash2,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSettings,
  isValidBackgroundSound,
  PomodoroSettings,
  useTheme,
} from "@/hooks/use-local-storage";
import { usePresets } from "@/hooks/usePresets";
import { useState, useEffect, useRef } from "react";

// Configurações padrão da aplicação
const DEFAULT_SETTINGS: PomodoroSettings = {
  workTime: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoBreaks: false,
  autoStart: false,
  soundEnabled: true,
  askOnContinue: false,
  alwaysAskForTask: true,
  preFocusEnabled: true,
  showTaskBeforeFocus: true,
  backgroundSound: "none",
  youtubeUrl: "",
  theme: "light",
};

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useSettings();
  useTheme(); // Initialize theme sync
  const { presets, addPreset, loadPreset, deletePreset } = usePresets();
  const [presetName, setPresetName] = useState("");
  const [activePresetName, setActivePresetName] = useState<string | null>(null);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(true);
  const [initialSettings] = useState(settings);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sincronização entre tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pomodoroSettings" && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(newSettings);
          toast.info("Configurações atualizadas em outra aba.");
        } catch (error) {
          console.error("Erro ao sincronizar settings entre tabs:", error);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setSettings]);

  const handleSave = () => {
    toast.success("Configurações aplicadas!");
    navigate("/");
  };

  const handleAddPreset = () => {
    if (!presetName.trim()) {
      toast.error("O nome da predefinição não pode ser vazio.");
      return;
    }

    // Verificar se já existe
    const existingPreset = presets.find((p) => p.name === presetName.trim());
    if (existingPreset) {
      toast.error(
        "Já existe uma predefinição com este nome. Escolha outro nome."
      );
      return;
    }

    const ok = addPreset(presetName.trim(), settings);
    if (!ok) {
      toast.error(
        "Limite de 3 predefinições atingido. Exclua uma para adicionar outra."
      );
    } else {
      toast.success("Predefinição salva!");
      setActivePresetName(presetName.trim());
    }
    setPresetName("");
  };

  const handleLoadPreset = (name: string) => {
    if (activePresetName === name) {
      setSettings(initialSettings);
      setActivePresetName(null);
      toast.info("Seleção de predefinição removida.");
      return;
    }

    const presetSettings = loadPreset(name);
    if (presetSettings) {
      setSettings(presetSettings);
      setActivePresetName(name);
      toast.success("Predefinição carregada!");
    }
  };

  const handleLoadDefaultSettings = () => {
    if (activePresetName === "_default") {
      setSettings(initialSettings);
      setActivePresetName(null);
      toast.info("Seleção de predefinição removida.");
      return;
    }

    setSettings(DEFAULT_SETTINGS);
    setActivePresetName("_default");
    toast.success("Configurações padrão restauradas!");
  };

  const handleDeletePreset = (name: string) => {
    deletePreset(name);
    if (activePresetName === name) {
      setActivePresetName(null);
    }
    toast.success("Predefinição excluída!");
    setPresetToDelete(null);
  };

  const handleTimeInputChange = (
    field: "workTime" | "shortBreak" | "longBreak" | "longBreakInterval",
    value: string
  ) => {
    // Permitir edição livre, atualizar imediatamente
    const numValue = parseInt(value);

    if (value === "" || isNaN(numValue)) {
      // Se vazio ou inválido, permitir temporariamente para edição
      setSettings({ ...settings, [field]: value as any });
    } else {
      setSettings({ ...settings, [field]: numValue });
    }
  };

  const handleTimeInputBlur = (
    field: "workTime" | "shortBreak" | "longBreak" | "longBreakInterval"
  ) => {
    const currentValue = settings[field];

    // Validação por campo ao sair do input
    let min = 1;
    let max = 60;

    switch (field) {
      case "workTime":
        min = 1;
        max = 60;
        break;
      case "shortBreak":
        min = 1;
        max = 30;
        break;
      case "longBreak":
        min = 1;
        max = 60;
        break;
      case "longBreakInterval":
        min = 1;
        max = 10;
        break;
    }

    const numValue =
      typeof currentValue === "string" ? parseInt(currentValue) : currentValue;

    if (isNaN(numValue) || numValue < min || numValue > max) {
      // Restaurar valor padrão se inválido
      const defaults = {
        workTime: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
      };
      setSettings({ ...settings, [field]: defaults[field] });
      toast.error(`Valor inválido. Deve estar entre ${min} e ${max}.`);
    }
  };

  const handleBackgroundSoundChange = (value: string) => {
    if (isValidBackgroundSound(value)) {
      setSettings({ ...settings, backgroundSound: value });

      // Tocar preview do som selecionado
      if (value !== "none" && value !== "youtube") {
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
        }

        const soundPath = `/audio/${value}-60min.mp3`;
        const audio = new Audio(soundPath);
        audio.volume = 0.3;
        audio.play().catch((error) => {
          console.error("Erro ao reproduzir preview:", error);
          toast.error("Não foi possível reproduzir o preview do áudio.");
        });

        // Parar após 5 segundos
        setTimeout(() => {
          audio.pause();
        }, 5000);

        previewAudioRef.current = audio;
      } else if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    }
  };

  // Cleanup do preview ao desmontar
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, []);

  return (
    <div
      // MUDANÇA AQUI: fixed inset-0 para centralizar corretamente na extensão
      className="fixed inset-0 w-screen h-screen flex items-center justify-center p-3"
      style={{
        background: "var(--gradient-soft)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Container interno com rolagem (overflow-y-auto) caso o conteúdo seja maior que a tela */}
      <div className="w-full max-w-lg bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] max-h-[90vh] overflow-y-auto">
        <header className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            aria-label="Voltar para página inicial"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </header>

        <Tabs defaultValue="timers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timers">
              <Timer className="w-4 h-4 mr-2" />
              Tempo
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Bot className="w-4 h-4 mr-2" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="sounds">
              <Music className="w-4 h-4 mr-2" />
              Sons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timers" className="py-6 min-h-[280px]">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Ajuste a duração das suas sessões de foco e pausas.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="work-time" className="text-sm">
                      Pomodoro
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duração de cada sessão de foco (1-60 minutos).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="work-time"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workTime}
                    onChange={(e) =>
                      handleTimeInputChange("workTime", e.target.value)
                    }
                    onBlur={() => handleTimeInputBlur("workTime")}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="short-break" className="text-sm">
                      Pausa Curta
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duração da pausa curta (1-30 minutos).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="short-break"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreak}
                    onChange={(e) =>
                      handleTimeInputChange("shortBreak", e.target.value)
                    }
                    onBlur={() => handleTimeInputBlur("shortBreak")}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="long-break" className="text-sm">
                      Pausa Longa
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duração da pausa longa (1-60 minutos).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="long-break"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreak}
                    onChange={(e) =>
                      handleTimeInputChange("longBreak", e.target.value)
                    }
                    onBlur={() => handleTimeInputBlur("longBreak")}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="interval" className="text-sm">
                      Intervalo
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Número de Pomodoros até a pausa longa (1-10).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) =>
                      handleTimeInputChange("longBreakInterval", e.target.value)
                    }
                    onBlur={() => handleTimeInputBlur("longBreakInterval")}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="py-6 min-h-[280px]">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure o comportamento automático do Pomodoro.
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="always-ask-task">
                    Sempre iniciar pela tela de tarefa
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ao abrir o app, pedir qual tarefa trabalhar.
                  </p>
                </div>
                <Switch
                  id="always-ask-task"
                  checked={settings.alwaysAskForTask}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, alwaysAskForTask: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-breaks">
                    Iniciar pausas automaticamente
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Após completar um foco, a pausa inicia sozinha.
                  </p>
                </div>
                <Switch
                  id="auto-breaks"
                  checked={settings.autoBreaks}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoBreaks: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-start">
                    Iniciar foco automaticamente
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Após completar uma pausa, o foco inicia sozinho.
                  </p>
                </div>
                <Switch
                  id="auto-start"
                  checked={settings.autoStart}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoStart: checked })
                  }
                />
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Opções Avançadas
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-task-before-focus">
                        Perguntar nova tarefa a cada ciclo
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Mostra tela de tarefa antes de cada foco.
                      </p>
                    </div>
                    <Switch
                      id="show-task-before-focus"
                      checked={settings.showTaskBeforeFocus}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          showTaskBeforeFocus: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ask-on-continue">
                        Permitir trocar de tarefa
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Ao clicar em "Novo Foco", pergunta qual tarefa.
                      </p>
                    </div>
                    <Switch
                      id="ask-on-continue"
                      checked={settings.askOnContinue}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, askOnContinue: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pre-focus">Pré-foco de 5 minutos</Label>
                      <p className="text-xs text-muted-foreground">
                        Iniciar com 5min de aquecimento antes do Pomodoro.
                      </p>
                    </div>
                    <Switch
                      id="pre-focus"
                      checked={settings.preFocusEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, preFocusEnabled: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sounds" className="py-6 min-h-[280px]">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Personalize o ambiente sonoro do seu foco.
              </p>

              {/* Sons de fundo - sempre visível */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Som de fundo durante foco
                  </Label>
                </div>
                <RadioGroup
                  value={settings.backgroundSound}
                  onValueChange={handleBackgroundSoundChange}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label
                        htmlFor="none"
                        className="font-normal cursor-pointer"
                      >
                        🔇 Nenhum
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="White-Noise" id="White-Noise" />
                      <Label
                        htmlFor="White-Noise"
                        className="font-normal cursor-pointer"
                      >
                        🌫️ Ruído Branco
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Rain" id="Rain" />
                      <Label
                        htmlFor="Rain"
                        className="font-normal cursor-pointer"
                      >
                        🌧️ Chuva
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Ocean" id="Ocean" />
                      <Label
                        htmlFor="Ocean"
                        className="font-normal cursor-pointer"
                      >
                        🌊 Oceano
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Water" id="Water" />
                      <Label
                        htmlFor="Water"
                        className="font-normal cursor-pointer"
                      >
                        💧 Água
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="youtube" id="youtube" />
                      <Label
                        htmlFor="youtube"
                        className="font-normal cursor-pointer"
                      >
                        ▶️ YouTube
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
                {settings.backgroundSound === "youtube" && (
                  <div className="pt-2 pl-1">
                    <Label
                      htmlFor="youtube-url"
                      className="text-xs text-muted-foreground"
                    >
                      URL do YouTube
                    </Label>
                    <Input
                      id="youtube-url"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={settings.youtubeUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, youtubeUrl: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>

              {/* Sons de notificação - separado */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="sound-enabled"
                      className="text-sm font-semibold"
                    >
                      Sons de notificação
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Toca ao completar foco/pausa
                    </p>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, soundEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Collapsible
          open={isPresetsExpanded}
          onOpenChange={setIsPresetsExpanded}
          className="border-t border-border pt-4 mt-6 space-y-3"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Predefinições</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Salve até 3 configurações personalizadas para reutilizar.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                isPresetsExpanded ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da predefinição"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPreset();
                }}
                disabled={presets.length >= 3}
              />
              <Button
                onClick={handleAddPreset}
                className="p-2 h-auto w-auto"
                disabled={presets.length >= 3}
                aria-label="Adicionar predefinição"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            {presets.length >= 3 && (
              <p className="text-xs text-muted-foreground">
                Limite de 3 predefinições atingido. Exclua uma para adicionar
                outra.
              </p>
            )}
            <div className="space-y-2">
              {/* Predefinição Padrão (sempre visível) */}
              <div
                className={`flex items-center justify-between p-3 rounded-md transition-all duration-200 cursor-pointer group
                  ${
                    activePresetName === "_default"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border-2 border-dashed border-muted-foreground/30"
                  }
                `}
                onClick={handleLoadDefaultSettings}
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span
                    className={`text-sm ${
                      activePresetName === "_default" ? "font-semibold" : ""
                    }`}
                  >
                    Padrão
                  </span>
                </div>
                <span className="text-xs opacity-70">
                  {activePresetName === "_default" ? "Ativa" : "Restaurar"}
                </span>
              </div>

              {/* Predefinições customizadas */}
              {presets.map((p) => (
                <div
                  key={p.name}
                  className={`flex items-center justify-between p-3 rounded-md transition-all duration-200 cursor-pointer group
                    ${
                      activePresetName === p.name
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                  onClick={() => handleLoadPreset(p.name)}
                >
                  <span
                    className={`text-sm ${
                      activePresetName === p.name ? "font-semibold" : ""
                    }`}
                  >
                    {p.name}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPresetToDelete(p.name);
                      }}
                      aria-label={`Excluir predefinição ${p.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="w-28">
            Concluído
          </Button>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!presetToDelete}
        onOpenChange={(open) => !open && setPresetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir predefinição?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a predefinição "{presetToDelete}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                presetToDelete && handleDeletePreset(presetToDelete)
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
