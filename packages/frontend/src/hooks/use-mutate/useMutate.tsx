import { useStore, $ } from "@builder.io/qwik";
import { qwikFetch } from "~/common/utils";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useMutate = <T,>(url: string) => {
  const state = useStore<FetchState<T>>({
    result: null,
    loading: null,
    error: null,
    success: false,
  });

  const mutate = $(async (json: any, options?: RequestInit) => {
    state.loading = true;
    state.error = null;

    try {
      const additionalOptions = options ? options : {};

      const result = await qwikFetch<T>(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        ...additionalOptions,
        body: JSON.stringify(json),
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

  return { state, mutate };
};
