import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { TbChevronDown, TbUser } from "@qwikest/icons/tablericons";
import { $, component$ } from "@builder.io/qwik";

import Menu, {
  DropDownMenuItem,
  DropDownMenuItemLink,
  DropDownMenuLabel,
  DropDownSeparator,
} from "~/components/drop-down/drop-down";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useAuthCheck } from "~/routes/layout";
import { cn } from "~/common/utils";

const Logout = component$(() => {
  const nav = useNavigate();
  const { mutate } = useMutate("POST /auth/session/revoke");

  return (
    <DropDownMenuItem>
      <button
        class="w-full h-full flex text-text"
        onClick$={$(async () => {
          await mutate(null, { method: "DELETE", credentials: "include" });
          nav("/sign-in?mode=applicant");
        })}
      >
        Logout
      </button>
    </DropDownMenuItem>
  );
});

const MenuItems = component$(() => {
  const location = useLocation();
  const locationPathname = location.url.pathname;

  if (locationPathname.includes("employer"))
    return (
      <>
        <DropDownMenuItemLink link="/employer/organizations">
          Organizations
        </DropDownMenuItemLink>
        <DropDownMenuItemLink link="/employer/settings">
          Settings
        </DropDownMenuItemLink>
      </>
    );

  return (
    <>
      <DropDownMenuItemLink link="/settings">Applications</DropDownMenuItemLink>
      <DropDownMenuItemLink link="/settings/profile">
        Settings
      </DropDownMenuItemLink>
    </>
  );
});

export default component$(() => {
  const isAuth = useAuthCheck();

  if (isAuth.value)
    return (
      <>
        <Menu panelWidth="w-56">
          <div
            q:slot="trigger"
            class={cn(
              "bg-surface shadow-lg",
              "rounded-full h-14 w-14",
              "flex items-center justify-center",
              "text-text relative",
              "hover:brightness-90 dark:hover:brightness-125",
              "transition-all duration-200 ease-in",
            )}
          >
            <div class="text-2xl">
              <TbUser />
            </div>

            <div
              class={cn(
                "h-5 w-5",
                "flex items-center justify-center",
                "bg-surface shadow-lg rounded-full",
                "absolute bottom-0 right-0",
                "group-focus:rotate-180 duration-150",
              )}
            >
              <TbChevronDown />
            </div>
          </div>

          <DropDownMenuLabel q:slot="label">My Account</DropDownMenuLabel>
          <MenuItems />
          <DropDownSeparator />
          <Logout />
        </Menu>
      </>
    );

  return (
    <div class="flex gap-3">
      <Link
        href="/sign-in?mode=applicant"
        class={cn(
          "p-3 w-24",
          "bg-ghost",
          "text-center",
          "rounded-lg",
          "duration-150 ease-in-out",
          "dark:hover:brightness-150 hover:brightness-90",
        )}
      >
        Login
      </Link>

      <Link
        href="/sign-up"
        class={cn(
          "p-3 w-24",
          "bg-primary",
          "rounded-lg",
          "text-center text-white",
          "duration-150 ease-in-out",
          "hover:brightness-125",
        )}
      >
        Register
      </Link>
    </div>
  );
});
