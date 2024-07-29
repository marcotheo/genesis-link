import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import {
  HamburgerIcon,
  SignInIcon,
  SignUpIcon,
} from "~/components/icons/icons";
import Drawer, { DrawerLink } from "~/components/drawer/drawer";
import LogoImage from "~/components/logo-image/logo-image";
import DarkMode from "~/components/dark-mode/dark-mode";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
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

export default component$(() => {
  return (
    <div class={cn("flex justify-between items-center", "w-full py-5")}>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-14 sm:h-14">
          <LogoImage
            alt="Genesis Oppurtinities Logo"
            filename="logo"
            height={100}
            width={100}
          />
        </div>
        <div class="flex flex-col justify-center font-bold italic text-base sm:text-xl">
          <p>Genesis</p>
          <p>Oppurtunities</p>
        </div>
      </div>

      <MobileMenu />

      <div class="flex gap-5 items-center max-md:hidden">
        <Link href="/sign-in">
          {" "}
          <Button variant="outline" size="md">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="md">Sign Up</Button>
        </Link>
        <DarkMode />
      </div>
    </div>
  );
});
