import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { postJson } from './api';
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

  const enrichItems = useCallback((newItems: PantryItem[]) => {
    void postJson<{
      results: Array<{ name: string; macros: PantryItem['macros'] | null }>;
    }>('/api/nutrition', {
      names: newItems.map((item) => item.name),
    })
      .then(({ results }) => {
        const macrosByName = new Map(
          results.map((result) => [result.name.trim().toLowerCase(), result.macros]),
        );
        setItems((current) =>
          current.map((item) => {
            if (!newItems.some((newItem) => newItem.id === item.id)) {
              return item;
            }
            const macros = macrosByName.get(item.name.trim().toLowerCase());
            return macrosByName.has(item.name.trim().toLowerCase())
              ? { ...item, macros: macros ?? undefined }
              : item;
          }),
        );
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<PantryContextValue>(
    () => ({
      items,
      hydrated,
      addItem: (input) => {
        const item = { ...input, id: `${Date.now()}-${Math.random()}`, addedAt: Date.now() };
        setItems((current) => [...current, item]);
        enrichItems([item]);
      },
      updateItem: (id, input) => {
        const existing = items.find((item) => item.id === id);
        const renamed =
          !!existing && existing.name.trim().toLowerCase() !== input.name.trim().toLowerCase();
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...input, ...(renamed ? { macros: undefined } : {}) } : item,
          ),
        );
        if (existing && renamed) {
          enrichItems([{ ...existing, ...input }]);
        }
      },
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      addMany: (newItems) => {
        const createdItems = newItems.map((input, index) => ({
          ...input,
          id: `${Date.now()}-${index}-${Math.random()}`,
          addedAt: Date.now(),
        }));
        setItems((current) => [...current, ...createdItems]);
        enrichItems(createdItems);
      },
    }),
    [enrichItems, hydrated, items],
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
