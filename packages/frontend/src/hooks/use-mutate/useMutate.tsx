import { AuthContext } from "~/components/auth-provider/auth-provider";
import { useStore, $, useContext } from "@builder.io/qwik";
import { qwikFetch } from "~/common/utils";

export interface FetchState<T> {
  data: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useMutate = <T,>(url: string) => {
  const authCtx = useContext(AuthContext);

  const state = useStore<FetchState<T>>({
    data: null,
    loading: null,
    error: null,
    success: false,
  });

  const mutate = $(async (json: any, options?: RequestInit) => {
    state.loading = true;
    state.error = null;
    try {
      const additionalOptions = options ? options : {};

      const data = await qwikFetch<T>(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authCtx.AccessToken}`,
        },
        ...additionalOptions,
        body: JSON.stringify(json),
      });

      state.data = data;
      state.success = true;
      setTimeout(() => {
        state.success = false;
      }, 5000);
      return { data, error: null };
    } catch (error) {
      state.error = (error as Error).message;
      state.success = false;
      return { data: null, error: state.error };
    } finally {
      state.loading = false;
    }
  });

  return { state, mutate };
};
