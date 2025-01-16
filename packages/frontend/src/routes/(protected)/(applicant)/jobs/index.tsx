import { TbSearch } from "@qwikest/icons/tablericons";
import { DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import Input from "~/components/input/input";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <div
      class={cn(
        "py-12 w-full",
        "flex justify-center items-center",
        "overflow-hidden",
      )}
    >
      <div class="p-1 flex gap-3 w-full">
        <div class="w-[60%] relative">
          <div
            class={cn(
              "bg-transparent",
              "absolute z-50",
              "top-1/2 right-3",
              "-translate-y-1/2",
              "h-fit text-2xl",
            )}
          >
            <TbSearch />
          </div>

          <Input label="Search Job" variant="filled" />
        </div>
        <div class="w-[20%]">
          <Input label="Province" variant="filled" />
        </div>
        <div class="w-[20%]">
          <Input label="City" variant="filled" />
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
  meta: [
    {
      name: "description",
      content: "list of available job post",
    },
  ],
};
