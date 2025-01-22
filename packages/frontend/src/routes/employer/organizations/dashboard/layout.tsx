import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";
import SideNav from "./SideNav";

export default component$(() => {
  return (
    <div class={cn("h-screen w-full", "flex")}>
      <SideNav />

      {/* content */}
      <div class={cn("h-full grow", "p-10")}>
        <Slot />
      </div>
    </div>
  );
});
