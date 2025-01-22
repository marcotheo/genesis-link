import { Link, RequestHandler } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";

import Image from "~/assets/images/logo.png?jsx";

export const onRequest: RequestHandler = async ({ sharedMap, redirect }) => {
  const isLoggedIn = sharedMap.get("isLoggedIn");
  if (!isLoggedIn) throw redirect(302, "/sign-in?mode=applicant");
};

export default component$(() => {
  return (
    <div class={cn("h-screen w-full", "flex")}>
      {/* sidenav */}
      <div class={cn("h-full w-80", "bg-surface shadow-lg")}>
        {/* side nav header */}
        <div class="h-32">
          <div class="h-full w-full flex justify-center items-center">
            <div
              class={cn(
                "relative w-56 min-w-56",
                "flex items-center justify-center",
              )}
            >
              <Image class="w-full h-auto block" />
            </div>
          </div>
        </div>

        <div
          class={cn("h-[0.5px] w-[90%] mx-auto", "bg-surface brightness-150")}
        />

        {/* side nav content */}
        <div>
          <Link href={""}>
            <div
              class={cn(
                "flex gap-3 items-center",
                "w-full p-2",
                "duration-300",
                "cursor-pointer hover:bg-zinc-700 rounded-md",
                "whitespace-nowrap text-lg",
              )}
            >
              asdasd
            </div>
          </Link>
        </div>
      </div>

      {/* content */}
      <div class={cn("h-full grow", "p-10")}>content</div>
    </div>
  );
});
