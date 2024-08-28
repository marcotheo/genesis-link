import { useStore, $, useTask$ } from "@builder.io/qwik";
import { qwikFetch } from "~/common/utils";
import { Signal } from "@builder.io/qwik";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useQuery = <T,>(
  baseUrl: string,
  signalObject: Record<string, Signal<any>>,
  defaultValue?: T | null,
) => {
  const state = useStore<FetchState<T>>({
    result: defaultValue ?? null,
    loading: null,
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

  const refetch = $(async () => {
    state.loading = true;
    state.error = null;

    const queryString = await buildQueryString(signalObject);

    const url = `${baseUrl}?${queryString}`;

    try {
      const result = await qwikFetch<T>(url, {
        method: "GET", // Adjust method if needed
        credentials: "include",
      });

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
    refetch();
  });

  return { state, refetch };
};
