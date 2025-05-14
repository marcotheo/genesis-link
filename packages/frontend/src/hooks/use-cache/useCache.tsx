import { $, useContext } from "@builder.io/qwik";

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
  params: Omit<QueryType[Path], "response">, // must contain optiona properties of { pathParams and queryStrings } refer to /types folder index.ts
  options?: {
    cacheTime?: number; // in milliseconds
  },
) => {
  const queryCtx = useContext(QueryContext);

  const cachedTime = options?.cacheTime || queryCtx.cachedTime; // ms 1min default

  const getApiUrl = $((): string => {
    const apiParams = params as any;

    // build Query String
    const searchParams = new URLSearchParams();
    if (!!apiParams.queryStrings)
      for (const key in apiParams.queryStrings) {
        searchParams.append(key, apiParams.queryStrings[key].value);
      }

    // build api path
    let [, apiPath] = apiKey.split(" ");

    // update parameters inside the api path
    if (apiPath.includes("{") && apiPath.includes("}"))
      apiPath = apiPath.replace(
        /\{(\w+)\}/g,
        (_, key) => apiParams.pathParams[key] || `{${key}}`,
      );

    return (
      apiPath + (searchParams.size > 0 ? `?${searchParams.toString()}` : "")
    );
  });

  const getCachedData = $(async () => {
    const apiUrl = await getApiUrl();
    const cached = queryCtx.cache[apiUrl];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      const newData = callback(queryCtx.cache[apiUrl].data ?? null);

      console.log("NEW CACHE", newData);

      queryCtx.cache[apiUrl] = {
        data: newData,
        timestamp: Date.now(),
      };
    },
  );

  return { getCachedData, setCacheData };
};
