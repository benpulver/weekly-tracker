import { useState, useCallback, useEffect, useRef } from 'react';
import type { AppState, Goal, WeekData } from '../types';
import type { User } from 'firebase/auth';
import { loadState, saveState, emptyWeek } from '../store';
import { onAuth, saveToCloud, loadFromCloud } from '../firebase';

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);
  const userRef = useRef<User | null>(null);
  const cloudTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return onAuth(async (u) => {
      setUser(u);
      userRef.current = u;
      if (u) {
        setSyncing(true);
        const cloud = await loadFromCloud(u.uid);
        if (cloud) {
          setState(cloud);
          saveState(cloud);
        } else {
          const local = loadState();
          await saveToCloud(u.uid, local);
        }
        setSyncing(false);
      }
    });
  }, []);

  const persist = useCallback((next: AppState) => {
    saveState(next);
    if (userRef.current) {
      clearTimeout(cloudTimer.current);
      cloudTimer.current = setTimeout(() => {
        if (userRef.current) saveToCloud(userRef.current.uid, next);
      }, 1000);
    }
  }, []);

  const updateWeek = useCallback((weekKey: string, updater: (w: WeekData) => WeekData) => {
    setState(s => {
      const next = {
        ...s,
        weeks: {
          ...s.weeks,
          [weekKey]: updater(s.weeks[weekKey] || emptyWeek(weekKey)),
        },
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const setGoals = useCallback((goals: Goal[]) => {
    setState(s => {
      const next = { ...s, goals };
      persist(next);
      return next;
    });
  }, [persist]);

  const updateSettings = useCallback((patch: Partial<AppState['settings']>) => {
    setState(s => {
      const next = { ...s, settings: { ...s.settings, ...patch } };
      persist(next);
      return next;
    });
  }, [persist]);

  const replaceState = useCallback((newState: AppState) => {
    persist(newState);
    setState(newState);
  }, [persist]);

  return { state, updateWeek, setGoals, updateSettings, replaceState, user, syncing };
}
