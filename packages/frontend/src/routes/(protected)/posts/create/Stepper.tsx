import {
  Planner,
  LocationIcon,
  Briefcase,
  NumberList,
} from "~/components/icons/icons";
import { component$, Slot, useContext } from "@builder.io/qwik";

import { cn } from "~/common/utils";
import { FormStepCtx } from ".";

const ItemStep = component$<{ title: string; isActive: boolean }>(
  ({ title, isActive }) => {
    return (
      <li
        class={cn(
          "flex items-center justify-between",
          "relative w-full",
          isActive ? "text-primary" : "",
        )}
      >
        <p class={isActive ? "text-primary" : ""}>{title}</p>
        <Slot />
        <div
          class={cn(
            "absolute right-[-43px]",
            "rounded-full w-3 h-3",
            isActive ? "bg-primary" : "bg-soft",
          )}
        />
      </li>
    );
  },
);

export default component$(() => {
  const activeStep = useContext(FormStepCtx);

  return (
    <ul class="list-none space-y-16 w-full max-md:hidden">
      <ItemStep title="Post Information" isActive={activeStep.value === 1}>
        <Planner />
      </ItemStep>
      <ItemStep title="Visuals & Branding" isActive={activeStep.value === 2}>
        <LocationIcon />
      </ItemStep>
      <ItemStep title="Address Information" isActive={activeStep.value === 3}>
        <Briefcase />
      </ItemStep>
      <ItemStep title="Job Requirements" isActive={activeStep.value === 4}>
        <NumberList />
      </ItemStep>
    </ul>
  );
});
