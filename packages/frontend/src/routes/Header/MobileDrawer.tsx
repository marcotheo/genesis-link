import { component$ } from "@builder.io/qwik";

import {
  Building,
  Planner,
  SignInIcon,
  SignUpIcon,
  UserIcon,
} from "~/components/icons/icons";
import Drawer, { DrawerLink } from "~/components/drawer/drawer";
import Heading from "~/components/heading/heading";

import Image from "../../assets/images/logo.png?jsx";
import { useAuthCheck } from "../layout";
import { cn } from "~/common/utils";

export default component$(() => {
  const isAuth = useAuthCheck();

  return (
    <Drawer>
      <div q:slot="header">
        <div class="h-full w-full flex justify-center items-center">
          <div
            class={cn(
              "relative w-44 min-w-44",
              "flex items-center justify-center",
            )}
          >
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
