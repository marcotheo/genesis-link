import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";

interface QueryState {
  cache: Record<
    string,
    {
      data: any;
      timestamp: number;
    }
  >;
  cachedTime: number;
}

export const QueryContext = createContextId<QueryState>("query.context");

interface Props {
  cacheTime?: number; // in milliseconds
}

export default component$<Props>(({ cacheTime }) => {
  const cache = useStore<Record<string, { data: any; timestamp: number }>>({});

  const finalGlobalCachedTime = cacheTime ?? 60000 * 3; // ms 1min default

  useContextProvider(QueryContext, {
    cache,
    cachedTime: finalGlobalCachedTime,
  });

  return (
    <>
      <Slot />
    </>
  );
});
