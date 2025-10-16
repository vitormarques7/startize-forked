import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Timer, Bot, Music, Info, Plus, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-local-storage";
import { usePresets } from "@/hooks/usePresets";
import { useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useSettings();
  const { presets, addPreset, loadPreset, deletePreset } = usePresets();
  const [presetName, setPresetName] = useState("");
  const [activePresetName, setActivePresetName] = useState<string | null>(null);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(true);
  const [initialSettings] = useState(settings);

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
    navigate("/");
  };

  const handleAddPreset = () => {
    if (!presetName.trim()) {
      toast.error("O nome da predefinição não pode ser vazio.");
      return;
    }
    const ok = addPreset(presetName.trim(), settings);
    if (!ok) toast.error("Limite de 3 predefinições atingido");
    else {
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

  const handleDeletePreset = (name: string) => {
    deletePreset(name);
    if (activePresetName === name) {
      setActivePresetName(null);
    }
    toast.success("Predefinição excluída!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-lg bg-card rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <header className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Configurações
          </h1>
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
                    <Label htmlFor="work-time" className="text-sm">Pomodoro</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duração de cada sessão de foco (em minutos).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="work-time" type="number" min="1" max="60" value={settings.workTime} onChange={(e) => setSettings({ ...settings, workTime: parseInt(e.target.value) || 25 })}/>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="short-break" className="text-sm">Pausa Curta</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duração da pausa curta após cada Pomodoro.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="short-break" type="number" min="1" max="30" value={settings.shortBreak} onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })}/>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="long-break" className="text-sm">Pausa Longa</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duração da pausa longa após um ciclo de Pomodoros.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="long-break" type="number" min="1" max="60" value={settings.longBreak} onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })}/>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="interval" className="text-sm">Intervalo</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Número de Pomodoros até a pausa longa.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="interval" type="number" min="1" max="10" value={settings.longBreakInterval} onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })}/>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="automation" className="py-6 min-h-[280px]">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Deixe o aplicativo fluir sem a necessidade de cliques.
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="always-ask-task">Sempre pedir microtarefa</Label>
                  <p className="text-xs text-muted-foreground">Iniciar sempre pela tela de definição de tarefa.</p>
                </div>
                <Switch id="always-ask-task" checked={settings.alwaysAskForTask} onCheckedChange={(checked) => setSettings({ ...settings, alwaysAskForTask: checked })}/>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-breaks">Pausas automáticas</Label>
                  <p className="text-xs text-muted-foreground">Iniciar pausas automaticamente após o foco.</p>
                </div>
                <Switch id="auto-breaks" checked={settings.autoBreaks} onCheckedChange={(checked) => setSettings({ ...settings, autoBreaks: checked })}/>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-start">Foco automático</Label>
                  <p className="text-xs text-muted-foreground">Iniciar o foco automaticamente após a pausa.</p>
                </div>
                <Switch id="auto-start" checked={settings.autoStart} onCheckedChange={(checked) => setSettings({ ...settings, autoStart: checked })}/>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ask-on-continue">Perguntar nova tarefa</Label>
                  <p className="text-xs text-muted-foreground">Pedir tarefa ao "Continuar Foco".</p>
                </div>
                <Switch id="ask-on-continue" checked={settings.askOnContinue} onCheckedChange={(checked) => setSettings({ ...settings, askOnContinue: checked })}/>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sounds" className="py-6 min-h-[280px]">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Personalize o ambiente sonoro do seu foco.
              </p>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">Sons de notificação</Label>
                <Switch id="sound-enabled" checked={settings.soundEnabled} onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}/>
              </div>
              {settings.soundEnabled && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <Label>Som de fundo</Label>
                  <RadioGroup value={settings.backgroundSound} onValueChange={(value) => setSettings({ ...settings, backgroundSound: value as any })}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="none" /><Label htmlFor="none" className="font-normal">Nenhum</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="White-Noise" id="White-Noise" /><Label htmlFor="White-Noise" className="font-normal">Ruído Branco</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="Rain" id="Rain" /><Label htmlFor="Rain" className="font-normal">Chuva</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="Ocean" id="Ocean" /><Label htmlFor="Ocean" className="font-normal">Oceano</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="Water" id="Water" /><Label htmlFor="Water" className="font-normal">Água</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="youtube" id="youtube" /><Label htmlFor="youtube" className="font-normal">YouTube</Label></div>
                    </div>
                  </RadioGroup>
                  {settings.backgroundSound === 'youtube' && (
                    <div className="pt-2">
                      <Label htmlFor="youtube-url" className="text-xs text-muted-foreground">URL do YouTube</Label>
                      <Input id="youtube-url" type="url" placeholder="https://youtube.com/watch?v=..." value={settings.youtubeUrl} onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })} className="mt-1"/>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Collapsible open={isPresetsExpanded} onOpenChange={setIsPresetsExpanded} className="border-t border-border pt-4 mt-6 space-y-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="text-sm font-medium">Predefinições</h3>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isPresetsExpanded ? 'rotate-180' : ''}`}/>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da predefinição"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddPreset(); }}
              />
              <Button onClick={handleAddPreset} className="p-2 h-auto w-auto">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {presets.map((p) => (
                <div
                  key={p.name}
                  className={`flex items-center justify-between p-3 rounded-md transition-all duration-200 cursor-pointer group
                    ${activePresetName === p.name ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'}
                  `}
                  onClick={() => handleLoadPreset(p.name)}
                >
                  <span className={`text-sm ${activePresetName === p.name ? 'font-semibold' : ''}`}>{p.name}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeletePreset(p.name); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => navigate("/")}>Cancelar</Button>
          <Button onClick={handleSave} className="w-28">Salvar</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;