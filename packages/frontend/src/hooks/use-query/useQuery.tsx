import {
  useStore,
  $,
  useTask$,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";

import { QueryContext } from "~/providers/query/query";
import { qwikFetch } from "~/common/utils";
import { QueryType } from "~/types";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

type ExtractUrlParams<T> = T extends null ? null : NonNullable<T>;

export const useQuery = <Path extends keyof QueryType>(
  apiKey: Path,
  params: {
    urlParams: ExtractUrlParams<QueryType[Path]["parameters"]>;
    queryStrings: ExtractUrlParams<QueryType[Path]["queryStrings"]>;
  },
  options?: {
    defaultValues?: QueryType[Path]["response"] | null;
    cacheTime?: number; // in milliseconds
    runOnRender?: boolean;
  },
) => {
  const queryCtx = useContext(QueryContext);
  const cachedTime = options?.cacheTime || queryCtx.cachedTime; // ms 1min default

  const state = useStore<{
    result: QueryType[Path]["response"] | null;
    loading: boolean | null;
    error: null | string;
    success: boolean;
  }>({
    result: options?.defaultValues ?? null,
    loading: options?.runOnRender ? true : null,
    error: null,
    success: false,
  });

  const getApiUrl = $((): string => {
    // build Query String
    const searchParams = new URLSearchParams();
    if (!!params.queryStrings)
      for (const key in params.queryStrings) {
        searchParams.append(key, (params.queryStrings as any)[key].value);
      }

    // build api path
    let [_, apiPath] = apiKey.split(" ") ?? ["GET", ""];

    // update parameters inside the api path
    if (apiPath.includes("{") && apiPath.includes("}"))
      apiPath = apiPath.replace(
        /\{(\w+)\}/g,
        (_, key) => (params.urlParams as any)[key] || `{${key}}`,
      );

    return (
      apiPath + (searchParams.size > 0 ? `?${searchParams.toString()}` : "")
    );
  });

  const getCachedData = $((key: string) => {
    const cached = queryCtx.cache[key];
    if (cached && Date.now() - cached.timestamp < cachedTime) {
      return cached.data;
    }

    return null;
  });

  const setCacheData = $((key: string, data: QueryType[Path]["response"]) => {
    queryCtx.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  });

  const refetch = $(async () => {
    state.loading = true;
    state.error = null;

    const apiUrl = await getApiUrl();

    // Check the cache first
    const cachedResult = await getCachedData(apiUrl);
    if (cachedResult) {
      state.result = cachedResult;
      state.success = true;
      state.loading = false;
      return { result: cachedResult, error: null };
    }

    try {
      const result = await qwikFetch<QueryType[Path]["response"]>(apiUrl, {
        method: "GET",
        credentials: "include",
      });

      console.log("DATA", result);

      // Cache the result
      await setCacheData(apiUrl, result);

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

  useTask$(async ({ track }) => {
    if (params.urlParams !== null)
      for (const key in params.urlParams as any) {
        track(() => (params.urlParams as any)[key]);
      }

    if (params.queryStrings !== null)
      for (const key in params.queryStrings as any) {
        track(() => (params.queryStrings as any)[key]);
      }

    // Track cached result
    const apiUrl = await getApiUrl();
    track(() => queryCtx.cache[apiUrl]);

    if (isServer) return;

    // Execute the query when any of the signals change
    refetch();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Cache the default values as well, if provided
    if (!!options?.defaultValues) {
      const apiUrl = await getApiUrl();
      setCacheData(apiUrl, options.defaultValues);
    }

    if (options?.runOnRender) refetch();
  });

  return { state, refetch };
};
