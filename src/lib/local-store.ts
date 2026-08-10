import { useCallback, useEffect, useState } from "react";

const SAVED_KEY = "bmwai.saved.v1";
const RECENT_KEY = "bmwai.recent.v1";

export interface SavedGuidance {
  id: string;
  question: string;
  mode: string;
  body: string;
  citationTitles: string[];
  savedAt: string;
}

export interface RecentSource {
  id: string;
  title: string;
  url: string;
  platform: string;
  viewedAt: string;
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(`storage:${key}`));
  } catch {
    /* ignore quota errors */
  }
}

function useLocalList<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    setItems(read<T>(key));
    const sync = () => setItems(read<T>(key));
    window.addEventListener(`storage:${key}`, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(`storage:${key}`, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  const add = useCallback(
    (item: T, limit = 50) => {
      const next = [item, ...read<T>(key).filter((i) => i.id !== item.id)].slice(0, limit);
      write(key, next);
      setItems(next);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const next = read<T>(key).filter((i) => i.id !== id);
      write(key, next);
      setItems(next);
    },
    [key],
  );

  const clear = useCallback(() => {
    write<T>(key, []);
    setItems([]);
  }, [key]);

  return { items, add, remove, clear };
}

export const useSavedGuidance = () => useLocalList<SavedGuidance>(SAVED_KEY);
export const useRecentSources = () => useLocalList<RecentSource>(RECENT_KEY);

export function trackSourceView(entry: Omit<RecentSource, "viewedAt">) {
  const item: RecentSource = { ...entry, viewedAt: new Date().toISOString() };
  const next = [item, ...read<RecentSource>(RECENT_KEY).filter((i) => i.id !== item.id)].slice(0, 20);
  write(RECENT_KEY, next);
}
