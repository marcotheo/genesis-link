import type { RequestHandler } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import Header from "./Header";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <div class="h-screen flex flex-col">
      <div class="px-5 sm:px-12 2xl:px-72">
        <Header />
      </div>
      <div class="grow overflow-auto">
        <div class="h-full px-5 sm:px-12 2xl:px-72">
          <Slot />
        </div>
      </div>
    </div>
  );
});
