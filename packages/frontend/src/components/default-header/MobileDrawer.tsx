import {
  TbBriefcase,
  TbBuilding,
  TbLocation,
  TbLock,
  TbUser,
  TbUserPlus,
} from "@qwikest/icons/tablericons";
import { component$ } from "@builder.io/qwik";

import Drawer, { DrawerLink } from "~/components/drawer/drawer";
import Heading from "~/components/heading/heading";

import Image from "../../assets/images/logo.png?jsx";
import { useAuthCheck } from "~/routes/layout";
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
          <DrawerLink href="/sign-in?mode=applicant">
            <TbLock />
            Sign In
          </DrawerLink>
          <DrawerLink href="/sign-up">
            <TbUserPlus />
            Sign Up
          </DrawerLink>
        </div>
        <div>
          <Heading size="xs" class="text-zinc-600 text-md pl-2">
            EXPLORE
          </Heading>
          <DrawerLink href="/jobs">
            <TbBriefcase />
            Jobs
          </DrawerLink>
          <DrawerLink href="/settings">
            <TbBuilding />
            Companies
          </DrawerLink>
        </div>

        <div>
          <Heading size="xs" class="text-zinc-600 text-md pl-2">
            SETTINGS
          </Heading>
          <DrawerLink href="/settings/profile">
            <TbUser />
            Profile
          </DrawerLink>
          <DrawerLink href="/sign-up">
            <TbLock />
            Password
          </DrawerLink>
          <DrawerLink href="/sign-up">
            <TbLocation />
            Addressess
          </DrawerLink>
        </div>
      </div>
    </Drawer>
  );
});
