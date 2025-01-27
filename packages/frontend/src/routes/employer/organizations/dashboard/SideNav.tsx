import {
  TbBrand4Chan,
  TbBriefcase,
  TbBuilding,
  TbChevronDown,
  TbChevronLeft,
  TbDashboard,
  TbLocation,
  TbLogout,
  TbSettings,
} from "@qwikest/icons/tablericons";
import Menu, {
  DropDownMenuItemLink,
  DropDownMenuLabel,
} from "~/components/drop-down/drop-down";
import {
  component$,
  Signal,
  Slot,
  useContext,
  useSignal,
} from "@builder.io/qwik";
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
            "w-full p-3",
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

const SettingsItems = component$<{ open: Signal<boolean> }>(({ open }) => {
  const org = useOrgId();
  const parentOpen = useSignal(false);

  if (open.value)
    return (
      <>
        <button
          class={cn(
            "flex items-center justify-between",
            "w-full p-3",
            "rounded-md",
            "whitespace-nowrap text-lg font-medium",
            "duration-300 bg-surface hover:bg-surface",
            "dark:hover:brightness-125 hover:brightness-90",
            "group",
          )}
          onClick$={() => (parentOpen.value = !parentOpen.value)}
        >
          <div class="flex items-center gap-3">
            <TbSettings font-size="25px" />
            {open.value ? "Settings" : ""}
          </div>

          <div class={cn("duration-300", parentOpen.value ? "rotate-180" : "")}>
            <TbChevronDown />
          </div>
        </button>

        <div
          class={cn(
            "pl-10 m-0",
            "overflow-hidden",
            "flex flex-col gap-2",
            "duration-500 ease-in-out",
            parentOpen.value ? "h-fit max-h-56" : "max-h-0",
          )}
        >
          <NavItem
            to={createDashboardPath(org.value.orgId, "/settings/company")}
            open={open}
          >
            <TbBuilding font-size="25px" />
            {open.value ? "Company" : ""}
          </NavItem>
          <NavItem
            to={createDashboardPath(org.value.orgId, "/settings/branding")}
            open={open}
          >
            <TbBrand4Chan font-size="25px" />
            {open.value ? "Branding" : ""}
          </NavItem>
        </div>
      </>
    );

  return (
    <Menu panelWidth="w-56" position="bottom-end">
      <div
        q:slot="trigger"
        class={cn(
          "relative",
          "flex items-center justify-center",
          "w-full h-full p-3",
          "rounded-md",
          "whitespace-nowrap text-lg font-medium",
          "duration-300 bg-surface hover:bg-surface",
          "dark:hover:brightness-125 hover:brightness-90",
          "group",
        )}
      >
        <div class="text-2xl">
          <TbSettings font-size="25px" />
        </div>

        <div
          class={cn(
            "h-5 w-5",
            "flex items-center justify-center",
            "shadow-lg rounded-full",
            "absolute bottom-0 right-0",
            "group-focus:rotate-180 duration-150",
          )}
        >
          <TbChevronDown />
        </div>
      </div>
      <DropDownMenuLabel q:slot="label">
        Organization Settings
      </DropDownMenuLabel>
      <>
        <DropDownMenuItemLink
          link={createDashboardPath(org.value.orgId, "/settings/company")}
        >
          <div class="flex gap-2 items-center">
            <TbBuilding font-size="25px" /> Company
          </div>
        </DropDownMenuItemLink>
        <DropDownMenuItemLink
          link={createDashboardPath(org.value.orgId, "/settings/branding")}
        >
          <div class="flex gap-2 items-center">
            <TbBrand4Chan font-size="25px" /> Branding
          </div>
        </DropDownMenuItemLink>
      </>
    </Menu>
  );
});

const NavItems = component$<{ open: Signal<boolean> }>(({ open }) => {
  const org = useOrgId();

  return (
    <div class={cn("mt-3 space-y-3", open.value ? "px-5" : "px-3")}>
      <NavItem to={createDashboardPath(org.value.orgId, "")} open={open}>
        <TbDashboard font-size="25px" />
        {open.value ? "Dashboard" : ""}
      </NavItem>
      <NavItem to={createDashboardPath(org.value.orgId, "/posts")} open={open}>
        <TbBriefcase font-size="25px" />

        {open.value ? "Job Posts" : ""}
      </NavItem>
      <NavItem
        to={createDashboardPath(org.value.orgId, "/addresses")}
        open={open}
      >
        <TbLocation font-size="25px" />
        {open.value ? "Addresses" : ""}
      </NavItem>
      <SettingsItems open={open} />
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
          "top-1/2 -right-4",
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
