import { component$, Slot } from "@builder.io/qwik";

import { routeLoader$ } from "@builder.io/qwik-city";
import DashboardHeader from "./DashboardHeader";
import { cn } from "~/common/utils";
import SideNav from "./SideNav";

export const useOrgId = routeLoader$(({ params }) => {
  const { orgId } = params; // Extract the route parameter
  return {
    orgId,
  };
});

export default component$(() => {
  return (
    <div class={cn("h-screen w-full", "flex")}>
      <SideNav />

      {/* content */}
      <div class={cn("h-full grow", "flex flex-col", "px-16", "space-y-10")}>
        <DashboardHeader />

        <div class="grow">
          <Slot />
        </div>
      </div>
    </div>
  );
});
