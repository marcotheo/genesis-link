import { component$, Slot } from "@builder.io/qwik";

import DefaultHeader from "~/components/default-header/default-header.tsx";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <div class="h-screen flex flex-col">
      <div class={cn("min-[350px]:px-5 sm:px-12 2xl:px-52")}>
        <DefaultHeader />
      </div>

      <div class="flex flex-col grow overflow-auto">
        <div
          class={cn(
            "flex flex-col grow",
            "min-[350px]:px-5 sm:px-12 2xl:px-52",
          )}
        >
          <Slot />
        </div>
      </div>
    </div>
  );
});
