import { useCallback, useEffect, useState } from 'react';
import { api } from './client';
import type { DocumentChecklistItem, MeResponse } from './types';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useMe() {
  const [state, setState] = useState<AsyncState<MeResponse>>({ data: null, loading: true, error: null });

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .me()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: Error) => setState({ data: null, loading: false, error: error.message }));
  }, []);

  useEffect(refetch, [refetch]);

  return { ...state, refetch };
}

export function useDocuments() {
  const [state, setState] = useState<AsyncState<DocumentChecklistItem[]>>({ data: null, loading: true, error: null });

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .documents()
      .then((res) => setState({ data: res.documents, loading: false, error: null }))
      .catch((error: Error) => setState({ data: null, loading: false, error: error.message }));
  }, []);

  useEffect(refetch, [refetch]);

  return { ...state, refetch };
}
