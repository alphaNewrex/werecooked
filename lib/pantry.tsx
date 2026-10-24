import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { PantryItem } from './types';

const STORAGE_KEY = 'cookfood.pantry';

type PantryContextValue = {
  items: PantryItem[];
  hydrated: boolean;
  addItem: (input: Omit<PantryItem, 'id' | 'addedAt'>) => void;
  updateItem: (id: string, input: Omit<PantryItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  addMany: (items: Array<Omit<PantryItem, 'id' | 'addedAt'>>) => void;
};

const PantryContext = createContext<PantryContextValue | null>(null);

export function PantryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setItems(JSON.parse(stored) as PantryItem[]);
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [hydrated, items]);

  const value = useMemo<PantryContextValue>(
    () => ({
      items,
      hydrated,
      addItem: (input) =>
        setItems((current) => [
          ...current,
          { ...input, id: `${Date.now()}-${Math.random()}`, addedAt: Date.now() },
        ]),
      updateItem: (id, input) =>
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, ...input } : item)),
        ),
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      addMany: (newItems) =>
        setItems((current) => [
          ...current,
          ...newItems.map((input, index) => ({
            ...input,
            id: `${Date.now()}-${index}-${Math.random()}`,
            addedAt: Date.now(),
          })),
        ]),
    }),
    [hydrated, items],
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const value = useContext(PantryContext);
  if (!value) {
    throw new Error('usePantry must be used inside PantryProvider.');
  }
  return value;
}
