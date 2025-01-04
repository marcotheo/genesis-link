import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  $,
  useStore,
  QRL,
} from "@builder.io/qwik";

import { GetAPIMapping } from "~/common/types";

type SetCache = <Path extends keyof GetAPIMapping>(
  key: Path,
  callback: (
    currentData: GetAPIMapping[Path] | null,
  ) => GetAPIMapping[Path] | null,
) => void;

type GetCache = <Path extends keyof GetAPIMapping>(
  key: Path,
  cacheTime?: number,
) => GetAPIMapping[Path] | null;

interface QueryState {
  cache: Record<
    string,
    {
      data: any;
      timestamp: number;
    }
  >;
  cachedTime: number;
  setCacheData: QRL<SetCache>;
  getCachedData: QRL<GetCache>;
}

export const QueryContext = createContextId<QueryState>("query.context");

interface Props {
  cacheTime?: number; // in milliseconds
}

export default component$<Props>(({ cacheTime }) => {
  const cache = useStore<Record<string, { data: any; timestamp: number }>>({});

  const finalGlobalCachedTime = cacheTime ?? 60000 * 3; // ms 1min default

  const setCacheData = $<SetCache>(
    <Path extends keyof GetAPIMapping>(
      key: Path,
      callback: (
        currentData: GetAPIMapping[Path] | null,
      ) => GetAPIMapping[Path] | null,
    ) => {
      // Retrieve existing data or default to null
      const newData = callback(cache[key]?.data ?? null);

      // Update the cache with the new data and timestamp
      cache[key] = {
        data: newData,
        timestamp: Date.now(),
      };
    },
  );

  const getCachedData = $((key: string, expTime?: number) => {
    const cached = cache[key];

    const finalExpTime = expTime ?? finalGlobalCachedTime;

    if (cached && Date.now() - cached.timestamp < finalExpTime) {
      return cached.data;
    }
    return null;
  });

  useContextProvider(QueryContext, {
    cache,
    cachedTime: finalGlobalCachedTime,
    setCacheData,
    getCachedData,
  });

  return (
    <>
      <Slot />
    </>
  );
});
