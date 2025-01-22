import { useStore, $ } from "@builder.io/qwik";
import { qwikFetch } from "~/common/utils";
import { MutationsType } from "~/types";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useMutate = <Path extends keyof MutationsType>(url: Path) => {
  const state = useStore<FetchState<MutationsType[Path]["response"]>>({
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

  const mutate = $(
    async (
      params: Omit<MutationsType[Path], "response">,
      options?: RequestInit,
    ) => {
      const mutateParams = params as any;

      state.loading = true;
      state.error = null;

      try {
        const csrfToken = await getCsrfToken();
        const additionalOptions = options ? options : {};

        let [method, apiPath] = url.split(" ") ?? ["POST", ""];

        // update parameters inside the api path
        if (
          apiPath.includes("{") &&
          apiPath.includes("}") &&
          typeof mutateParams.pathParams === "object"
        ) {
          apiPath = apiPath.replace(
            /\{(\w+)\}/g,
            (_, key) => mutateParams.pathParams[key] || `{${key}}`,
          );
        }

        const result = await qwikFetch<MutationsType[Path]["response"]>(
          apiPath,
          {
            method,
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            },
            credentials: "include",
            ...additionalOptions,
            body: mutateParams.bodyParams
              ? JSON.stringify(mutateParams.bodyParams)
              : undefined,
          },
        );

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
    },
  );

  return { state, mutate };
};
