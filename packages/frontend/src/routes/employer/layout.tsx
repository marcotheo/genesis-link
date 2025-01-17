import { RequestHandler } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export const onRequest: RequestHandler = async ({ sharedMap, redirect }) => {
  const isLoggedIn = sharedMap.get("isLoggedIn");
  if (!isLoggedIn) throw redirect(302, "/sign-in");
};

export default component$(() => {
  return (
    <div class="h-screen flex flex-col">
      <div class={cn("min-[350px]:px-5 sm:px-12 2xl:px-52")}>
        Dashboard Header
      </div>

      <div class="grow overflow-auto">
        <div class="h-full min-[350px]:px-5 sm:px-12 2xl:px-52">
          <Slot />
        </div>
      </div>
    </div>
  );
});
