import { TbChevronDown, TbSearch } from "@qwikest/icons/tablericons";
import { component$ } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";

import ThemedSelect from "~/components/themed-select/themed-select";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <Modal.Root>
      <Modal.Trigger
        class={cn(
          "bg-primary rounded-md w-full",
          "text-white p-2 lg:p-3 duration-300",
          "hover:brightness-125",
        )}
      >
        Start Search
      </Modal.Trigger>

      <Modal.Panel
        class={cn(
          "h-96 w-full",
          "bottom-0 mb-0",
          "bg-surface",
          "data-[open]:animate-sheet-up",
          "data-[closed]:animate-sheet-down",
          "overflow-visible",

          "data-[open]:backdrop:bg-[rgba(0,0,0,0.5)]",
          "data-[open]:backdrop:backdrop-blur-sm",
        )}
      >
        <div class="p-5 dark:bg-background bg-gray-100 shadow-lg">
          Search Jobs
        </div>

        <div
          class={cn(
            "w-full p-3 md:p-10",
            "grid grid-cols-6 gap-5",
            "overflow-hidden",
            "duration-500 ease-in-out",
          )}
        >
          <div class="col-span-6 relative">
            <div
              class={cn(
                "bg-transparent",
                "absolute",
                "top-1/2 right-3",
                "-translate-y-1/2",
                "h-fit text-2xl",
              )}
            >
              <TbSearch />
            </div>

            <Input label="Search Job" variant="filled" />
          </div>

          <div class="col-span-6 md:col-span-2">
            <ThemedSelect
              variant="filled"
              label="Work Setup"
              options={[
                { label: "Remote", value: "remote" },
                { label: "Hybrid", value: "hybrid" },
                { label: "Site", value: "site" },
              ]}
            />
          </div>

          <div class="col-span-3 md:col-span-2">
            <Input label="Province" variant="filled" />
          </div>

          <div class="col-span-3 md:col-span-2">
            <Input label="City" variant="filled" />
          </div>

          <div class="col-span-2 md:col-span-1">
            <Button class="h-12 w-full">Search</Button>
          </div>
        </div>

        <Modal.Close
          class={cn(
            "absolute",
            "-top-3 left-1/2 -translate-x-1/2",
            "rounded-full p-2",
            "text-text",
            "bg-soft hover:brightness-90 dark:hover:brightness-125",
          )}
        >
          <TbChevronDown />
        </Modal.Close>
      </Modal.Panel>
    </Modal.Root>
  );
});
