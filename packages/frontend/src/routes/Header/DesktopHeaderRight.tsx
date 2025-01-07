import { TbChevronDown, TbUser } from "@qwikest/icons/tablericons";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { $, component$ } from "@builder.io/qwik";

import Menu, {
  DropDownMenuItem,
  DropDownMenuItemLink,
  DropDownMenuLabel,
  DropDownSeparator,
} from "~/components/drop-down/drop-down";
import Button from "~/components/button/button";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useAuthCheck } from "../layout";
import { cn } from "~/common/utils";

const Logout = component$(() => {
  const nav = useNavigate();
  const { mutate } = useMutate("/auth/session/revoke");

  return (
    <DropDownMenuItem>
      <button
        class="w-full h-full flex text-text"
        onClick$={$(async () => {
          await mutate({}, { method: "DELETE", credentials: "include" });
          nav("/sign-in");
        })}
      >
        Logout
      </button>
    </DropDownMenuItem>
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
          <DropDownMenuItemLink link="/posts">Posts</DropDownMenuItemLink>
          <DropDownMenuItemLink link="/settings">
            Applications
          </DropDownMenuItemLink>

          <DropDownSeparator />

          <DropDownMenuItemLink link="/settings/profile">
            Settings
          </DropDownMenuItemLink>
          <Logout />
        </Menu>
      </>
    );

  return (
    <>
      <Link href="/sign-in">
        {" "}
        <Button variant="outline" size="md">
          Sign In
        </Button>
      </Link>
      <Link href="/sign-up">
        <Button size="md">Sign Up</Button>
      </Link>
    </>
  );
});
