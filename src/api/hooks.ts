import { useEffect, useState } from 'react';
import { api } from './client';
import type { ConferenceChecklistItem, ConferenceEvent, DocumentChecklistItem, MeResponse } from './types';

interface ConferencesData {
  events: ConferenceEvent[];
  checklist: ConferenceChecklistItem[];
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Tiny stale-while-revalidate cache shared across every mount of a hook.
 * Without this, switching tabs unmounts/remounts each screen (see App.tsx),
 * so every visit re-fetched from scratch and showed a full-screen loading
 * state even for data fetched seconds ago. Now a cached value renders
 * instantly while a fresh copy loads silently in the background.
 */
function createResource<T>(fetcher: () => Promise<T>) {
  let cache: T | null = null;
  const listeners = new Set<(state: AsyncState<T>) => void>();
  let state: AsyncState<T> = { data: null, loading: true, error: null };

  const notify = () => listeners.forEach((l) => l(state));

  const setState = (next: AsyncState<T>) => {
    state = next;
    notify();
  };

  const refetch = () => {
    setState({ ...state, loading: !cache, error: null });
    return fetcher()
      .then((data) => {
        cache = data;
        setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        setState({ data: cache, loading: false, error: error.message });
      });
  };

  return {
    getState: () => state,
    subscribe: (listener: (state: AsyncState<T>) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refetch,
    hasCache: () => cache !== null,
  };
}

function useResource<T>(resource: ReturnType<typeof createResource<T>>) {
  const [state, setState] = useState(resource.getState());

  useEffect(() => {
    const unsubscribe = resource.subscribe(setState);
    resource.refetch();
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, refetch: resource.refetch };
}

const meResource = createResource(api.me);
const documentsResource = createResource(() => api.documents().then((res) => res.documents));
const conferencesResource = createResource(() => api.getConferences());

export function useMe() {
  return useResource<MeResponse>(meResource);
}

export function useDocuments() {
  return useResource<DocumentChecklistItem[]>(documentsResource);
}

export function useConferences() {
  return useResource<ConferencesData>(conferencesResource);
}
