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
  key: Path,
  options?: {
    cacheTime?: number; // in milliseconds
  },
) => {
  const queryCtx = useContext(QueryContext);

  const cachedTime = options?.cacheTime || queryCtx.cachedTime; // ms 1min default

  const getCachedData = $(() => {
    const cached = queryCtx.cache[key];

    if (cached && Date.now() - cached.timestamp < cachedTime) {
      return cached.data as QueryType[Path]["response"];
    }

    return null;
  });

  const setCacheData = $(
    (
      callback: (
        cached: QueryType[Path]["response"] | null,
      ) => QueryType[Path]["response"] | null,
    ) => {
      // Retrieve existing data or default to null
      const newData = callback(queryCtx.cache[key]?.data ?? null);

      queryCtx.cache[key] = {
        data: newData,
        timestamp: Date.now(),
      };
    },
  );

  return { getCachedData, setCacheData };
};
