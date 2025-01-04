import { useStore, $ } from "@builder.io/qwik";
import { qwikFetch } from "~/common/utils";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useFetch = <T,>(url: string) => {
  const state = useStore<FetchState<T>>({
    result: null,
    loading: null,
    error: null,
    success: false,
  });

  // Helper function to extract CSRF token from cookies
  const getCsrfToken = $((): string | undefined => {
    const match = document.cookie.match(
      new RegExp("(^|;)\\s*csrfToken\\s*=\\s*([^;]+)"),
    );
    return match ? decodeURIComponent(match[2]) : undefined;
  });

  const fetch = $(async (json: any | string, options?: RequestInit) => {
    state.loading = true;
    state.error = null;

    try {
      const csrfToken = await getCsrfToken();
      const additionalOptions = options ? options : {};

      const newUrl = typeof json === "string" ? url + "/" + json : url;

      const result = await qwikFetch<T>(newUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        ...additionalOptions,
        body: json ? JSON.stringify(json) : undefined,
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

  return { state, fetch };
};
