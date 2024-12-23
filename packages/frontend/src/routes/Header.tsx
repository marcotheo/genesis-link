import { Link, useNavigate } from "@builder.io/qwik-city";
import { $, component$ } from "@builder.io/qwik";

import Menu, {
  DropDownMenuItem,
  DropDownMenuItemLink,
  DropDownMenuLabel,
  DropDownSeparator,
} from "~/components/drop-down/drop-down";
import {
  Building,
  HamburgerIcon,
  Planner,
  SignInIcon,
  SignUpIcon,
  UserIcon,
} from "~/components/icons/icons";
import Drawer, { DrawerLink } from "~/components/drawer/drawer";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import DarkMode from "~/components/dark-mode/dark-mode";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import { useAuthCheck } from "./layout";
import { cn } from "~/common/utils";

import Image from "../assets/images/logo.png?jsx";

const MobileMenu = component$(() => {
  const isAuth = useAuthCheck();

  return (
    <Drawer>
      <HamburgerIcon q:slot="trigger" />

      <div q:slot="header">
        <div class="h-full w-full flex justify-center items-center">
          <div class={cn("relative w-44", "flex items-center justify-center")}>
            <Image class="w-full h-auto block" />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class={isAuth.value ? "hidden" : ""}>
          <Heading size="xs" class="text-zinc-600 text-md pl-2">
            AUTHENTICATION
          </Heading>
          <DrawerLink href="/sign-in">
            <SignInIcon />
            Sign In
          </DrawerLink>
          <DrawerLink href="/sign-up">
            <SignUpIcon />
            Sign Up
          </DrawerLink>
        </div>

        <div>
          <Heading size="xs" class="text-zinc-600 text-md pl-2">
            SETTINGS
          </Heading>
          <DrawerLink href="/sign-in">
            <UserIcon />
            My Details
          </DrawerLink>
          <DrawerLink href="/sign-up">
            <SignInIcon />
            Password
          </DrawerLink>
          <DrawerLink href="/sign-up">
            <Building />
            Addressess
          </DrawerLink>
          <DrawerLink href="/sign-up">
            <Planner />
            Plan
          </DrawerLink>
        </div>
      </div>
    </Drawer>
  );
});

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

const HeaderItems = component$(() => {
  const isAuth = useAuthCheck();

  if (isAuth.value)
    return (
      <>
        {/* <Link href="/posts">
          <Button variant="transparent">POSTS</Button>
        </Link>
        <Button variant="transparent">APPLICANTS</Button>
        <Button variant="transparent">APPLICATIONS</Button> */}

        <Menu>
          <UserIcon q:slot="trigger-circle-icon" />

          <div q:slot="label">
            <DropDownMenuLabel>My Account</DropDownMenuLabel>
          </div>

          <DropDownMenuItemLink link="/posts">Posts</DropDownMenuItemLink>
          <DropDownMenuItemLink link="/settings">
            Applicants
          </DropDownMenuItemLink>
          <DropDownMenuItemLink link="/settings">
            Applications
          </DropDownMenuItemLink>

          <DropDownSeparator />
          <DropDownMenuItemLink link="/settings">Settings</DropDownMenuItemLink>
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

export default component$(() => {
  return (
    <div
      class={cn(
        "flex justify-between items-center",
        "w-full py-6",
        "bg-transparent",
      )}
    >
      <div class="flex items-center gap-3">
        <Link href="/">
          <div
            class={cn(
              "relative",
              "flex items-center justify-center",
              "w-36 min-[400px]:w-44 sm:w-56",
            )}
          >
            <Image class="w-full h-auto block" />
          </div>
        </Link>
      </div>

      <MobileMenu />

      <div class="flex gap-5 items-center max-md:hidden">
        <HeaderItems />
        <DarkMode />
      </div>
    </div>
  );
});
