import { useState, useEffect } from "react"

type PomodoroSettings = {
  workTime: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
  alwaysAskForTask: boolean
  autoBreaks: boolean
  autoStart: boolean
  askOnContinue: boolean
  soundEnabled: boolean
  backgroundSound: "none" | "White-Noise" | "Rain" | "Ocean" | "Water" | "youtube"
  youtubeUrl?: string
}

type Preset = {
  name: string
  settings: PomodoroSettings
}

const STORAGE_KEY = "pomodoroPresets"

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setPresets(JSON.parse(stored))
    }
  }, [])

  const savePresets = (newPresets: Preset[]) => {
    setPresets(newPresets)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets))
  }

  const addPreset = (name: string, settings: PomodoroSettings) => {
    if (presets.length >= 3) return false
    const newPresets = [...presets, { name, settings }]
    savePresets(newPresets)
    return true
  }

  const deletePreset = (name: string) => {
    const newPresets = presets.filter(p => p.name !== name)
    savePresets(newPresets)
  }

  const loadPreset = (name: string) => {
    const preset = presets.find(p => p.name === name)
    return preset ? preset.settings : null
  }

  return { presets, addPreset, deletePreset, loadPreset }
}
