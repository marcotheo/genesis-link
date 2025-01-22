import { Link, useLocation } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";

import {
  TbBriefcase,
  TbDashboard,
  TbLocation,
  TbLogout,
  TbSettings,
} from "@qwikest/icons/tablericons";
import Image from "~/assets/images/logo.png?jsx";
import Button from "~/components/button/button";

const NavItem = component$<{ to: string }>(({ to }) => {
  return (
    <div>
      {" "}
      <Link href={to}>
        <div
          class={cn(
            "flex gap-3 items-center",
            "w-full p-2",
            "duration-300",
            "cursor-pointer hover:bg-zinc-700 rounded-md",
            "whitespace-nowrap text-lg font-medium",
          )}
        >
          <Slot />
        </div>
      </Link>
    </div>
  );
});

const NavItems = component$(() => {
  const loc = useLocation();

  return (
    <div class="px-5 mt-3 space-y-1">
      <NavItem to={`/employer/organizations/dashboard/${loc.params.orgId}`}>
        <TbDashboard /> Dashboard
      </NavItem>
      <NavItem
        to={`/employer/organizations/dashboard/${loc.params.orgId}/posts`}
      >
        <TbBriefcase /> Job Posts
      </NavItem>
      <NavItem
        to={`/employer/organizations/dashboard/${loc.params.orgId}/addresses`}
      >
        <TbLocation /> Addresses
      </NavItem>
      <NavItem
        to={`/employer/organizations/dashboard/${loc.params.orgId}/settings`}
      >
        <TbSettings /> Settings
      </NavItem>
    </div>
  );
});

export default component$(() => {
  return (
    <div
      class={cn(
        "h-full w-80",
        "bg-surface shadow-lg",
        "flex flex-col justify-between",
      )}
    >
      <div>
        {/* side nav header */}
        <div class="h-24">
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
        <NavItems />
      </div>

      {/* footer */}
      <div class="p-5 w-full">
        <Button class="w-full">
          <div class="flex gap-2 items-center justify-center bg-transparent">
            <div class="text-white text-xl bg-transparent">
              <TbLogout />
            </div>
            <p class="text-white">Log out</p>
          </div>
        </Button>
      </div>
    </div>
  );
});
