import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import Menu, {
  DropDownMenuItem,
  DropDownMenuItemLink,
  DropDownMenuLabel,
} from "~/components/drop-down/drop-down";
import {
  HamburgerIcon,
  SignInIcon,
  SignUpIcon,
  UserIcon,
} from "~/components/icons/icons";
import Drawer, { DrawerLink } from "~/components/drawer/drawer";
import LogoImage from "~/components/logo-image/logo-image";
import DarkMode from "~/components/dark-mode/dark-mode";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import { useAuthCheck } from "./layout";
import { cn } from "~/common/utils";

const MobileMenu = component$(() => {
  return (
    <Drawer>
      <HamburgerIcon q:slot="trigger" />

      <div q:slot="header">
        <div class="flex gap-3">
          <div class="w-14 h-14">
            <LogoImage
              alt="Genesis Oppurtinities Logo"
              filename="logo"
              height={100}
              width={100}
            />
          </div>
          <div class="flex flex-col justify-center font-bold italic text-xl">
            <p>Genesis</p>
            <p>Oppurtunities</p>
          </div>
        </div>
      </div>

      <div>
        <div>
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
      </div>
    </Drawer>
  );
});

const HeaderItems = component$(() => {
  const isAuth = useAuthCheck();

  if (isAuth.value)
    return (
      <>
        <Link href="/posts">
          <Button variant="transparent">POSTS</Button>
        </Link>
        <Button variant="transparent">APPLICANTS</Button>
        <Button variant="transparent">APPLICATIONS</Button>

        <Menu>
          <UserIcon q:slot="trigger-circle-icon" />

          <div q:slot="label">
            <DropDownMenuLabel>My Account</DropDownMenuLabel>
          </div>
          <DropDownMenuItemLink link="/settings">Settings</DropDownMenuItemLink>
          <DropDownMenuItem>Logout</DropDownMenuItem>
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
    <div class={cn("flex justify-between items-center", "w-full py-5")}>
      <div class="flex items-center gap-3">
        <Link href="/">
          <div class="w-10 h-10 sm:w-14 sm:h-14">
            <LogoImage
              alt="Genesis Oppurtinities Logo"
              filename="logo"
              height={100}
              width={100}
            />
          </div>
        </Link>
        <div class="flex flex-col justify-center font-bold italic text-base sm:text-xl">
          <p>Genesis</p>
          <p>Oppurtunities</p>
        </div>
      </div>

      <MobileMenu />

      <div class="flex gap-5 items-center max-md:hidden">
        <HeaderItems />
        <DarkMode />
      </div>
    </div>
  );
});
