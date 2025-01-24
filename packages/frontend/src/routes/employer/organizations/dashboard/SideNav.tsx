import {
  TbBriefcase,
  TbChevronLeft,
  TbDashboard,
  TbLocation,
  TbLogout,
  TbSettings,
} from "@qwikest/icons/tablericons";
import { component$, Signal, Slot, useContext } from "@builder.io/qwik";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { cn, createDashboardPath } from "~/common/utils";
import { DashboardDrawerCtx, useOrgId } from "./layout";
import Button from "~/components/button/button";

import LogoOnlyImage from "~/assets/images/logo_symbol.png?jsx";
import LogoWithTextImage from "~/assets/images/logo.png?jsx";

const Logout = component$<{ open: Signal<boolean> }>(({ open }) => {
  const nav = useNavigate();
  const { mutate } = useMutate("POST /auth/session/revoke");

  return (
    <div class={cn("py-2", open.value ? "" : "px-1")}>
      <Button
        class={cn(
          "w-full",
          "text-text whitespace-nowrap",
          "bg-surface hover:bg-surface",
          "dark:hover:brightness-125 hover:brightness-90",
          "py-4",
        )}
        onClick$={async () => {
          await mutate({}, { method: "DELETE", credentials: "include" });
          nav("/sign-in?mode=employer");
        }}
      >
        <div class="flex gap-2 items-center justify-center bg-transparent">
          <div class="text-text text-xl bg-transparent">
            <TbLogout font-size="25px" />
          </div>

          {open.value && <p class="text-text">Log out</p>}
        </div>
      </Button>
    </div>
  );
});

const NavItem = component$<{ to: string; open: Signal<boolean> }>(
  ({ to, open }) => {
    const loc = useLocation();

    return (
      <div>
        <Link
          href={to}
          class={cn(
            "flex gap-3 items-center",
            open.value ? "" : "justify-center",
            "w-full p-5",
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
  },
);

const NavItems = component$<{ open: Signal<boolean> }>(({ open }) => {
  const loc = useOrgId();

  return (
    <div class={cn("mt-3 space-y-3", open.value ? "px-5" : "px-3")}>
      <NavItem to={createDashboardPath(loc.value.orgId, "")} open={open}>
        <TbDashboard font-size="25px" />
        {open.value ? "Dashboard" : ""}
      </NavItem>
      <NavItem to={createDashboardPath(loc.value.orgId, "/posts")} open={open}>
        <TbBriefcase font-size="25px" />

        {open.value ? "Job Posts" : ""}
      </NavItem>
      <NavItem
        to={createDashboardPath(loc.value.orgId, "/addresses")}
        open={open}
      >
        <TbLocation font-size="25px" />
        {open.value ? "Addresses" : ""}
      </NavItem>
      <NavItem
        to={createDashboardPath(loc.value.orgId, "/settings")}
        open={open}
      >
        <TbSettings font-size="25px" />
        {open.value ? "Settings" : ""}
      </NavItem>
    </div>
  );
});

export default component$(() => {
  const open = useContext(DashboardDrawerCtx);

  return (
    <div
      class={cn(
        "h-full",
        "absolute lg:relative",
        "top-0 bottom-0 z-50",
        "bg-surface shadow-lg",
        "flex flex-col justify-between",
        "duration-500",
        open.value
          ? "w-80 max-lg:animate-sheet-open"
          : "max-lg:animate-sheet-close w-80 lg:w-24",
      )}
    >
      <button
        class={cn(
          "absolute",
          "top-1/2 -right-3",
          "-translate-y-1/2",
          "bg-primary",
          "p-2 rounded-full",
          "text-white",
          "duration-300",
          "hover:brightness-125",
          open.value ? "" : "rotate-180",
        )}
        onClick$={() => (open.value = !open.value)}
      >
        <TbChevronLeft />
      </button>

      <div>
        {/* side nav header */}
        <div class="h-24">
          <div class="h-full w-full flex justify-center items-center">
            {open.value ? (
              <div
                class={cn(
                  "relative w-56 min-w-56",
                  "flex items-center justify-center",
                )}
              >
                <LogoWithTextImage class="w-full h-auto block" />
              </div>
            ) : (
              <div
                class={cn(
                  "relative w-14 min-w-14",
                  "flex items-center justify-center",
                )}
              >
                <LogoOnlyImage class="w-full h-auto block" />
              </div>
            )}
          </div>
        </div>

        <div
          class={cn("h-[0.5px] w-[90%] mx-auto", "bg-surface brightness-150")}
        />

        {/* side nav content */}
        <NavItems open={open} />
      </div>

      {/* footer */}
      <div class="w-[90%] mx-auto">
        <div class={cn("h-[1px]", "bg-surface brightness-150")} />
        <Logout open={open} />
      </div>
    </div>
  );
});
