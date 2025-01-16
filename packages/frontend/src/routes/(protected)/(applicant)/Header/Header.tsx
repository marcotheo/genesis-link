import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import Image from "../../../../assets/images/logo.png?jsx";
import DarkMode from "~/components/dark-mode/dark-mode";
import DesktopHeaderCenter from "./DesktopHeaderCenter";
import DesktopHeaderRight from "./DesktopHeaderRight";
import MobileDrawer from "./MobileDrawer";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <div
      class={cn(
        "flex justify-between items-center",
        "w-full py-6",
        "bg-transparent",
      )}
    >
      <div class="flex gap-16">
        <div class="flex items-center gap-3">
          <Link href="/">
            <div
              class={cn(
                "relative",
                "flex items-center justify-center",
                "w-36 min-[400px]:w-44 md:w-48 lg:w-56",
              )}
            >
              <Image class="w-full h-auto block" />
            </div>
          </Link>
        </div>

        <DesktopHeaderCenter />
      </div>

      <div class="flex gap-3 items-center ">
        <div class="lg:hidden">
          <MobileDrawer />
        </div>
        <div class="hidden lg:flex">
          <DesktopHeaderRight />
        </div>
        <DarkMode />
      </div>
    </div>
  );
});
