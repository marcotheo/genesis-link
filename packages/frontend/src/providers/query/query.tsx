import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  $,
  QRL,
} from "@builder.io/qwik";

interface QueryState {
  cache: Record<string, any>;
  setCacheData: QRL<(key: string, data: any) => void>;
  getCachedData: QRL<(key: string, cacheTime: number) => any>;
}

export const QueryContext = createContextId<QueryState>("query.context");

export default component$(() => {
  const cache = {} as Record<string, any>;

  const setCacheData = $((key: string, data: any) => {
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
  });

  const getCachedData = $((key: string, cacheTime: number) => {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  });

  useContextProvider(QueryContext, {
    cache,
    setCacheData,
    getCachedData,
  });

  return (
    <>
      <Slot />
    </>
  );
});
