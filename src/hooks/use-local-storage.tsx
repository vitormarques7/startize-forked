import { useState, useEffect } from 'react';

export interface PomodoroSettings {
  visualFilter: boolean;
  workTime: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoBreaks: boolean;
  autoStart: boolean;
  audioUrl: string;
  soundEnabled: boolean;
}

export interface PomodoroHistory {
  id: string;
  task: string;
  duration: number;
  completedAt: string;
  interrupted: boolean;
}

export interface CurrentTask {
  task: string;
  startedAt: string;
  timeLeft: number;
  durationSec?: number;
  endAt?: string;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  visualFilter: false,
  workTime: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoBreaks: false,
  autoStart: false,
  audioUrl: "",
  soundEnabled: true,
};

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useSettings() {
  return useLocalStorage<PomodoroSettings>('pomodoroSettings', DEFAULT_SETTINGS);
}

export function useHistory() {
  return useLocalStorage<PomodoroHistory[]>('pomodoroHistory', []);
}

export function useCurrentTask() {
  return useLocalStorage<CurrentTask | null>('currentTask', null);
}

export function addHistoryEntry(
  task: string,
  duration: number,
  interrupted: boolean = false
) {
  try {
    const history = JSON.parse(localStorage.getItem('pomodoroHistory') || '[]');
    const newEntry: PomodoroHistory = {
      id: Date.now().toString(),
      task,
      duration,
      completedAt: new Date().toISOString(),
      interrupted,
    };
    history.unshift(newEntry);
    // Keep only last 100 entries
    const updatedHistory = history.slice(0, 100);
    localStorage.setItem('pomodoroHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error adding history entry:', error);
  }
}

export function clearHistory() {
  try {
    localStorage.setItem('pomodoroHistory', JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export function getStats() {
  try {
    const history: PomodoroHistory[] = JSON.parse(
      localStorage.getItem('pomodoroHistory') || '[]'
    );
    
    const totalPomodoros = history.filter(h => !h.interrupted).length;
    const totalInterrupted = history.filter(h => h.interrupted).length;
    const totalMinutes = history.reduce((sum, h) => sum + h.duration, 0);
    
    // Get today's stats
    const today = new Date().toDateString();
    const todayPomodoros = history.filter(
      h => !h.interrupted && new Date(h.completedAt).toDateString() === today
    ).length;

    return {
      totalPomodoros,
      totalInterrupted,
      totalMinutes,
      todayPomodoros,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      totalPomodoros: 0,
      totalInterrupted: 0,
      totalMinutes: 0,
      todayPomodoros: 0,
    };
  }
}
