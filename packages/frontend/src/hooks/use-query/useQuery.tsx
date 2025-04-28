import {
  useStore,
  $,
  useTask$,
  useContext,
  useVisibleTask$,
  useSignal,
  isSignal,
} from "@builder.io/qwik";

import { QueryContext } from "~/providers/query/query";
import { qwikFetch } from "~/common/utils";
import { QueryType } from "~/types";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useQuery = <Path extends keyof QueryType>(
  apiKey: Path,
  params: Omit<QueryType[Path], "response">, // must contain optiona properties of { pathParams and queryStrings } refer to /types folder index.ts
  options?: {
    defaultValues?: QueryType[Path]["response"] | null;
    cacheTime?: number; // in milliseconds
    runOnRender?: boolean;
  },
) => {
  const hasMounted = useSignal(false);
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
    const apiParams = params as any;

    // build Query String
    const searchParams = new URLSearchParams();
    if (!!apiParams.queryStrings)
      for (const key in apiParams.queryStrings) {
        if (apiParams.queryStrings[key]?.value)
          searchParams.append(key, apiParams.queryStrings[key].value);
      }

    // build api path
    let [_, apiPath] = apiKey.split(" ") ?? ["GET", ""];

    // update parameters inside the api path
    if (apiPath.includes("{") && apiPath.includes("}"))
      apiPath = apiPath.replace(
        /\{(\w+)\}/g,
        (_, key) =>
          apiParams.pathParams[key].value ||
          apiParams.pathParams[key] ||
          `{${key}}`,
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

  const refetch = $(
    async ({ revalidate = false }: { revalidate?: boolean }) => {
      state.loading = true;
      state.error = null;

      const apiUrl = await getApiUrl();

      // Check the cache first
      if (!revalidate) {
        const cachedResult = await getCachedData(apiUrl);
        if (cachedResult) {
          state.result = cachedResult;
          state.success = true;
          state.loading = false;
          return {
            result: cachedResult as QueryType[Path]["response"],
            error: null,
          };
        }
      }

      try {
        const result = await qwikFetch<QueryType[Path]["response"]>(apiUrl, {
          method: "GET",
          credentials: "include",
        });

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
    },
  );

  useTask$(async ({ track }) => {
    const apiParams = params as any;

    if (apiParams.pathParams !== null)
      for (const key in apiParams.pathParams)
        if (isSignal(apiParams.pathParams[key]))
          track(apiParams.pathParams[key]);

    if (apiParams.queryStrings !== null)
      for (const key in apiParams.queryStrings)
        if (isSignal(apiParams.queryStrings[key]))
          track(apiParams.queryStrings[key]);

    // Track cached result
    const apiUrl = await getApiUrl();
    track(() => queryCtx.cache[apiUrl]);

    if (!hasMounted.value) {
      // Skip execution on initial mount and route changes
      hasMounted.value = true;
      return;
    }

    // Execute the query when any of the signals change
    refetch({});
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (options?.runOnRender) refetch({});
  });

  return { state, refetch };
};
