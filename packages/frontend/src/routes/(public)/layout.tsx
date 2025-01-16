import { component$, Slot } from "@builder.io/qwik";

import DefaultHeader from "~/components/default-header/default-header.tsx";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <div class="h-screen flex flex-col">
      <div class={cn("min-[350px]:px-5 sm:px-12 2xl:px-52")}>
        <DefaultHeader />
      </div>

      <div class="grow overflow-auto">
        <div class="h-full min-[350px]:px-5 sm:px-12 2xl:px-52">
          <Slot />
        </div>
      </div>
    </div>
  );
});
