import { useState, useEffect } from 'react';

export interface PomodoroSettings {
  visualFilter: boolean;
  workTime: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoBreaks: boolean;
  autoStart: boolean;
  soundEnabled: boolean;
  askOnContinue: boolean;
  alwaysAskForTask: boolean; 
  backgroundSound: 'none' | 'youtube' | 'White-Noise' | 'Rain' | 'Ocean' | 'Water';
  youtubeUrl: string;
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

export interface UserStats {
  xp: number;
  level: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  visualFilter: false,
  workTime: 5,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoBreaks: false,
  autoStart: false,
  soundEnabled: true,
  askOnContinue: true,
  alwaysAskForTask: true, 
  backgroundSound: 'none',
  youtubeUrl: "",
};

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
};

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      //
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

export function useUserStats() {
  return useLocalStorage<UserStats>('userStats', DEFAULT_STATS);
}

export function addUserXp(amount: number): { leveledUp: boolean; newLevel: number } {
  try {
    const statsStr = localStorage.getItem('userStats');
    const stats: UserStats = statsStr ? JSON.parse(statsStr) : DEFAULT_STATS;
    
    stats.xp += amount;

    let leveledUp = false;
    let xpForNextLevel = (stats.level) * 100;

    while (stats.xp >= xpForNextLevel) {
      stats.level += 1;
      stats.xp -= xpForNextLevel;
      leveledUp = true;
      xpForNextLevel = (stats.level) * 100;
    }

    localStorage.setItem('userStats', JSON.stringify(stats));
    return { leveledUp, newLevel: stats.level };
  } catch (error) {
    return { leveledUp: false, newLevel: 1 };
  }
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
    const updatedHistory = history.slice(0, 100);
    localStorage.setItem('pomodoroHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    //
  }
}

export function clearHistory() {
  try {
    localStorage.setItem('pomodoroHistory', JSON.stringify([]));
  } catch (error) {
    //
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
    return {
      totalPomodoros: 0,
      totalInterrupted: 0,
      totalMinutes: 0,
      todayPomodoros: 0,
    };
  }
}