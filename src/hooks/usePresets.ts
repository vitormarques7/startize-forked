
import { useState, useEffect } from "react";
import { PomodoroSettings } from "./use-local-storage"; 


type Preset = {
  name: string;
  settings: PomodoroSettings;
};

const STORAGE_KEY = "pomodoroPresets";

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPresets(JSON.parse(stored));
    }
  }, []);

  const savePresets = (newPresets: Preset[]) => {
    setPresets(newPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
  };

  const addPreset = (name: string, settings: PomodoroSettings) => {
    if (presets.some(p => p.name === name)) {
      const newPresets = presets.map(p => p.name === name ? { name, settings } : p);
      savePresets(newPresets);
      return true;
    }
    if (presets.length >= 3) return false;
    const newPresets = [...presets, { name, settings }];
    savePresets(newPresets);
    return true;
  };

  const deletePreset = (name: string) => {
    const newPresets = presets.filter(p => p.name !== name);
    savePresets(newPresets);
  };

  const loadPreset = (name: string) => {
    const preset = presets.find(p => p.name === name);
    return preset ? preset.settings : null;
  };

  return { presets, addPreset, deletePreset, loadPreset };
}