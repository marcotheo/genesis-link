import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";

import {
  TbBriefcase,
  TbDashboard,
  TbLocation,
  TbLogout,
  TbSettings,
} from "@qwikest/icons/tablericons";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { cn, createDashboardPath } from "~/common/utils";
import Image from "~/assets/images/logo.png?jsx";
import Button from "~/components/button/button";
import { useOrgId } from "./layout";

const Logout = component$(() => {
  const nav = useNavigate();
  const { mutate } = useMutate("POST /auth/session/revoke");

  return (
    <div class="py-3">
      <Button
        class={cn(
          "w-full",
          "text-text",
          "bg-surface hover:bg-surface",
          "dark:hover:brightness-125 hover:brightness-90",
        )}
        onClick$={async () => {
          await mutate({}, { method: "DELETE", credentials: "include" });
          nav("/sign-in?mode=employer");
        }}
      >
        <div class="flex gap-2 items-center justify-center bg-transparent">
          <div class="text-text text-xl bg-transparent">
            <TbLogout />
          </div>

          <p class="text-text">Log out</p>
        </div>
      </Button>
    </div>
  );
});

const NavItem = component$<{ to: string }>(({ to }) => {
  const loc = useLocation();

  return (
    <div>
      <Link
        href={to}
        class={cn(
          "flex gap-3 items-center",
          "w-full p-2",
          "cursor-pointer rounded-md",
          "whitespace-nowrap text-lg font-medium",
          "duration-300",
          loc.url.pathname === to
            ? "bg-primary text-white"
            : "bg-surface hover:bg-surface",
          loc.url.pathname === to
            ? ""
            : "dark:hover:brightness-125 hover:brightness-90",
        )}
      >
        <Slot />
      </Link>
    </div>
  );
});

const NavItems = component$(() => {
  const loc = useOrgId();

  return (
    <div class="px-5 mt-3 space-y-1">
      <NavItem to={createDashboardPath(loc.value.orgId, "")}>
        <TbDashboard /> Dashboard
      </NavItem>
      <NavItem to={createDashboardPath(loc.value.orgId, "/posts")}>
        <TbBriefcase /> Job Posts
      </NavItem>
      <NavItem to={createDashboardPath(loc.value.orgId, "/addresses")}>
        <TbLocation /> Addresses
      </NavItem>
      <NavItem to={createDashboardPath(loc.value.orgId, "/settings")}>
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
      <div class="w-[90%] mx-auto">
        <div class={cn("h-[1px]", "bg-surface brightness-150")} />
        <Logout />
      </div>
    </div>
  );
});
