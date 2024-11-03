import { component$, Slot } from "@builder.io/qwik";

import { Briefcase, NumberList, Planner } from "~/components/icons/icons";
import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";

const ItemStep = component$<{ title: string }>(({ title }) => {
  return (
    <li class="flex items-center justify-between relative w-full">
      <p>{title}</p>
      <Slot />
      <div class="absolute right-[-43px] rounded-full w-3 h-3 bg-soft" />
    </li>
  );
});

export default component$(() => {
  return (
    <div class="h-full flex flex-col md:flex-row gap-3relative">
      <div
        class={cn(
          "duration-500 transition-[height]",
          "md:h-[95%] px-5 py-12",
          "w-full md:w-96",
          "flex flex-col gap-16",
          "items-center",
          "md:border-r md:border-soft",
        )}
      >
        <div class="w-full">
          <Heading>Step 1:</Heading>
          <p>Enter the post information</p>
        </div>

        <ul class="list-none space-y-16 w-full max-md:hidden">
          <ItemStep title="Post Information">
            <Planner />
          </ItemStep>
          <ItemStep title="Job Details">
            <Briefcase />
          </ItemStep>
          <ItemStep title="Job Requirements">
            <NumberList />
          </ItemStep>
        </ul>
      </div>

      <div class={cn("h-[95%] p-5", "w-full")}>
        <Slot />
      </div>
    </div>
  );
});
