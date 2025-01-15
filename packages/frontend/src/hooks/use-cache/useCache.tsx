import { $, Signal, useContext } from "@builder.io/qwik";

import { QueryContext } from "~/providers/query/query";
import { QueryType } from "~/types";

export interface FetchState<T> {
  result: T | null;
  loading: null | boolean;
  error: string | null;
  success: boolean;
}

export const useCache = <Path extends keyof QueryType>(
  apiKey: Path,
  params: {
    urlParams: QueryType[Path]["parameters"] extends null
      ? null
      : Record<string, Signal<NonNullable<QueryType[Path]["parameters"]>>>;
    queryStrings: QueryType[Path]["queryString"] extends null
      ? null
      : Record<string, Signal<NonNullable<QueryType[Path]["queryString"]>>>;
  },
  options?: {
    cacheTime?: number; // in milliseconds
  },
) => {
  const queryCtx = useContext(QueryContext);

  const cachedTime = options?.cacheTime || queryCtx.cachedTime; // ms 1min default

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

  const getCachedData = $(async () => {
    const apiUrl = await getApiUrl();
    const cached = queryCtx.cache[apiUrl];

    if (cached && Date.now() - cached.timestamp < cachedTime) {
      return cached.data as QueryType[Path]["response"];
    }

    return null;
  });

  const setCacheData = $(
    async (
      callback: (
        cached: QueryType[Path]["response"] | null,
      ) => QueryType[Path]["response"] | null,
    ) => {
      const apiUrl = await getApiUrl();

      // Retrieve existing data or default to null
      const newData = callback(queryCtx.cache[apiUrl]?.data ?? null);

      console.log("NEW CACHE", newData);

      queryCtx.cache[apiUrl] = {
        data: newData,
        timestamp: Date.now(),
      };
    },
  );

  return { getCachedData, setCacheData };
};
