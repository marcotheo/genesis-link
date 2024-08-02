import { useStore, $ } from "@builder.io/qwik";
import { qwikFetch } from "~/common/utils";

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useMutate = <T,>(url: string, options?: RequestInit) => {
  const state = useStore<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = $(async (json: any) => {
    state.loading = true;
    state.error = null;
    try {
      const additionalOptions = options ? options : {};

      const data = await qwikFetch<T>(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        ...additionalOptions,
        body: JSON.stringify(json),
      });

      state.data = data;
      return { data, error: null };
    } catch (error) {
      state.error = (error as Error).message;
      return { data: null, error: state.error };
    } finally {
      state.loading = false;
    }
  });

  return { ...state, mutate };
};
