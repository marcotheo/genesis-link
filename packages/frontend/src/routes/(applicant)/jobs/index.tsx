import { TbSearch } from "@qwikest/icons/tablericons";
import { DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import ThemedSelect from "~/components/themed-select/themed-select";
import Heading from "~/components/heading/heading";
import Input from "~/components/input/input";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <div
      class={cn(
        "py-8 w-full",
        "flex flex-col gap-5",
        "justify-center items-start",
        "overflow-hidden",
      )}
    >
      <div class="space-y-5">
        <Heading size="xxl">Connecting Ambitions</Heading>
        <Heading size="xxl">
          Building <span class="text-primary">Careers</span>
        </Heading>
      </div>

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
        <div class="w-[20%]">
          <ThemedSelect
            variant="filled"
            label="skill level"
            options={[
              { label: "Remote", value: "remote" },
              { label: "Hybrid", value: "hybrid" },
              { label: "Site", value: "site" },
            ]}
          />
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point - Jobs",
  meta: [
    {
      name: "description",
      content: "ark point's list of available jobs",
    },
  ],
};
