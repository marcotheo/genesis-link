import {
  component$,
  createContextId,
  Signal,
  Slot,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

import DashboardHeader from "./DashboardHeader";
import { cn } from "~/common/utils";
import SideNav from "./SideNav";

export const DashboardDrawerCtx = createContextId<Signal<boolean>>(
  "dashboard.drawer.context",
);

export const usePathParams = routeLoader$(({ params }) => {
  const { orgId, postId } = params; // Extract the route parameter

  return {
    orgId,
    postId: postId || "",
  };
});

export default component$(() => {
  const drawerOpen = useSignal(true);

  useContextProvider(DashboardDrawerCtx, drawerOpen);

  return (
    <div class={cn("h-screen w-full", "flex")}>
      <SideNav />

      <div
        class={cn(
          "h-full grow overflow-auto",
          "flex flex-col",
          "px-5 md:px-16",
          "space-y-10",
        )}
      >
        <DashboardHeader />

        <div class="grow overflow-auto">
          <Slot />
        </div>
      </div>
    </div>
  );
});
