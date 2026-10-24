import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { extractShortcode } from './reel-url';
import type { LibraryEntry, Recipe, RecipeSource } from './types';

const INCOMING_KEY = 'cookfood.incoming';
const COOKBOOK_KEY = 'cookfood.cookbook';

type SaveToCookbookInput = {
  recipe: Recipe;
  source: RecipeSource;
  originId?: string;
};

type CookbookLookup = {
  originId?: string;
  source: RecipeSource;
  recipe: Recipe;
};

type LibraryContextValue = {
  incoming: LibraryEntry[];
  cookbook: LibraryEntry[];
  hydrated: boolean;
  addIncoming: (recipe: Recipe, source: RecipeSource) => LibraryEntry;
  findIncomingByUrl: (url: string) => LibraryEntry | undefined;
  removeIncoming: (id: string) => void;
  saveToCookbook: (input: SaveToCookbookInput) => LibraryEntry;
  removeFromCookbook: (id: string) => void;
  cookbookEntryFor: (input: CookbookLookup) => LibraryEntry | undefined;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

function parseEntries(value: string | null) {
  if (!value) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as LibraryEntry[]) : [];
  } catch {
    return [];
  }
}

function createId() {
  return `${Date.now()}-${Math.random()}`;
}

function sourceKey(source: RecipeSource) {
  return source.url ? extractShortcode(source.url) : null;
}

function sameTitleAndKind(entry: LibraryEntry, recipe: Recipe, source: RecipeSource) {
  return (
    entry.source.kind === source.kind &&
    entry.recipe.title.trim().toLowerCase() === recipe.title.trim().toLowerCase()
  );
}

function findCookbookMatch(entries: LibraryEntry[], input: CookbookLookup) {
  const reelKey = sourceKey(input.source);
  return entries.find(
    (entry) =>
      (!!input.originId && (entry.originId === input.originId || entry.id === input.originId)) ||
      (!!reelKey && sourceKey(entry.source) === reelKey) ||
      sameTitleAndKind(entry, input.recipe, input.source),
  );
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [incoming, setIncoming] = useState<LibraryEntry[]>([]);
  const [cookbook, setCookbook] = useState<LibraryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([AsyncStorage.getItem(INCOMING_KEY), AsyncStorage.getItem(COOKBOOK_KEY)])
      .then(([storedIncoming, storedCookbook]) => {
        if (!mounted) {
          return;
        }
        setIncoming(parseEntries(storedIncoming));
        setCookbook(parseEntries(storedCookbook));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setHydrated(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      void AsyncStorage.setItem(INCOMING_KEY, JSON.stringify(incoming));
    }
  }, [hydrated, incoming]);

  useEffect(() => {
    if (hydrated) {
      void AsyncStorage.setItem(COOKBOOK_KEY, JSON.stringify(cookbook));
    }
  }, [cookbook, hydrated]);

  const addIncoming = useCallback(
    (recipe: Recipe, source: RecipeSource) => {
      const reelKey = sourceKey(source);
      const existing = reelKey
        ? incoming.find((entry) => sourceKey(entry.source) === reelKey)
        : undefined;
      const result = existing
        ? { ...existing, createdAt: Date.now() }
        : { id: createId(), recipe, source, createdAt: Date.now() };
      setIncoming((current) => {
        const currentMatch = reelKey
          ? current.find((entry) => sourceKey(entry.source) === reelKey)
          : undefined;
        const entry = currentMatch ? { ...currentMatch, createdAt: result.createdAt } : result;
        return [entry, ...current.filter((candidate) => candidate.id !== entry.id)];
      });
      return result;
    },
    [incoming],
  );

  const findIncomingByUrl = useCallback(
    (url: string) => {
      const reelKey = sourceKey({ kind: 'reel-link', url });
      return reelKey ? incoming.find((entry) => sourceKey(entry.source) === reelKey) : undefined;
    },
    [incoming],
  );

  const removeIncoming = useCallback((id: string) => {
    setIncoming((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const saveToCookbook = useCallback(
    (input: SaveToCookbookInput) => {
      const existing = findCookbookMatch(cookbook, input);
      if (existing) {
        return existing;
      }
      const entry = {
        id: createId(),
        recipe: input.recipe,
        source: input.source,
        createdAt: Date.now(),
        ...(input.originId ? { originId: input.originId } : {}),
      };
      setCookbook((current) => {
        const currentMatch = findCookbookMatch(current, input);
        return currentMatch ? current : [entry, ...current];
      });
      return entry;
    },
    [cookbook],
  );

  const removeFromCookbook = useCallback((id: string) => {
    setCookbook((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const cookbookEntryFor = useCallback(
    (input: CookbookLookup) => findCookbookMatch(cookbook, input),
    [cookbook],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      incoming,
      cookbook,
      hydrated,
      addIncoming,
      findIncomingByUrl,
      removeIncoming,
      saveToCookbook,
      removeFromCookbook,
      cookbookEntryFor,
    }),
    [
      addIncoming,
      cookbook,
      cookbookEntryFor,
      findIncomingByUrl,
      hydrated,
      incoming,
      removeFromCookbook,
      removeIncoming,
      saveToCookbook,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) {
    throw new Error('useLibrary must be used inside LibraryProvider.');
  }
  return value;
}
