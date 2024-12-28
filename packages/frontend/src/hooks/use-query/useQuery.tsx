import {
  useStore,
  $,
  useTask$,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Signal } from "@builder.io/qwik";

import { QueryContext } from "~/providers/query/query";
import { isServer } from "@builder.io/qwik/build";
import { qwikFetch } from "~/common/utils";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useQuery = <T,>(
  url: string,
  signalObject: Record<string, Signal<any>>,
  options?: {
    defaultValues?: T | null;
    cacheTime?: number; // in milliseconds
    runOnRender?: boolean;
  },
) => {
  const queryCtx = useContext(QueryContext);

  const cachedTime = options?.cacheTime || 60000 * 3; // ms 1min default

  const state = useStore<FetchState<T>>({
    result: options?.defaultValues ?? null,
    loading: options?.runOnRender ? true : null,
    error: null,
    success: false,
  });

  const buildQueryString = $((params: Record<string, Signal<any>>): string => {
    const query = new URLSearchParams();
    for (const key in params) {
      query.append(key, params[key].value);
    }
    return query.toString();
  });

  const getCachedData = $((key: string) => {
    const cached = queryCtx.cache[key];
    if (cached && Date.now() - cached.timestamp < cachedTime) {
      return cached.data;
    }
    return null;
  });

  const setCacheData = $((key: string, data: T) => {
    queryCtx.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  });

  const refetch = $(async () => {
    state.loading = true;
    state.error = null;

    const queryString = await buildQueryString(signalObject);

    const urlFetch = `${url}?${queryString}`;

    // Check the cache first
    const cachedResult = await getCachedData(url);
    if (cachedResult) {
      state.result = cachedResult;
      state.success = true;
      state.loading = false;
      return { result: cachedResult, error: null };
    }

    try {
      const result = await qwikFetch<T>(urlFetch, {
        method: "GET", // Adjust method if needed
        credentials: "include",
      });

      // Cache the result
      await setCacheData(url, result);

      state.result = result;
      state.success = true;
      setTimeout(() => {
        state.success = false;
      }, 5000);
      return { result, error: null };
    } catch (error) {
      state.error = (error as Error).message;
      state.success = false;
      return { result: null, error: state.error };
    } finally {
      state.loading = false;
    }
  });

  useTask$(({ track }) => {
    // Track all signals within the signalObject
    for (const key in signalObject) {
      track(() => signalObject[key].value);
    }

    // Execute the query when any of the signals change
    if (isServer) return;

    refetch();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Cache the default values as well, if provided
    if (!!options?.defaultValues) {
      const queryString = await buildQueryString(signalObject);
      const cacheUrl = `${url}?${queryString}`;
      setCacheData(cacheUrl, options.defaultValues);
    }

    if (options?.runOnRender) refetch();
  });

  return { state, refetch };
};
