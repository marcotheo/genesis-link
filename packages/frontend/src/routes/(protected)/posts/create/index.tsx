import { component$, Slot, useSignal } from "@builder.io/qwik";

import { Briefcase, NumberList, Planner } from "~/components/icons/icons";
import { routeLoader$ } from "@builder.io/qwik-city";
import { InitialValues } from "@modular-forms/qwik";
import Heading from "~/components/heading/heading";
import { CreatePostForm } from "./common";
import { cn } from "~/common/utils";
import Form1 from "./Form1";

const StepHeader = component$<{ activeStep: number }>(({ activeStep }) => {
  return (
    <div class="w-full">
      <Heading>
        {activeStep === 1 ? "Step 1" : activeStep === 2 ? "Step 2" : "Step 3"}
      </Heading>
      <p>
        {" "}
        {activeStep === 1
          ? "Enter the post information"
          : activeStep === 2
            ? "Enter the Job Details"
            : "Enter the Job Requirements"}
      </p>
    </div>
  );
});

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

const Stepper = component$<{ activeStep: number }>(({ activeStep }) => {
  return (
    <ul class="list-none space-y-16 w-full max-md:hidden">
      <ItemStep title="Post Information" isActive={activeStep === 1}>
        <Planner />
      </ItemStep>
      <ItemStep title="Job Details" isActive={activeStep === 2}>
        <Briefcase />
      </ItemStep>
      <ItemStep title="Job Requirements" isActive={activeStep === 3}>
        <NumberList />
      </ItemStep>
    </ul>
  );
});

export const useForm1Loader = routeLoader$<InitialValues<CreatePostForm>>(
  () => ({
    title: undefined,
    description: undefined,
    postType: undefined,
    jobType: undefined,
    company: undefined,
    location: undefined,
    salary: undefined,
    wfh: undefined,
    email: undefined,
    phone: undefined,
    deadline: undefined,
  }),
);

export default component$(() => {
  const activeStep = useSignal(1);

  return (
    <div class="h-full flex flex-col md:flex-row gap-3 relative">
      <div
        class={cn(
          "duration-500 transition-[height]",
          "md:h-[95%] px-5 md:py-12",
          "w-full md:w-96",
          "flex flex-col gap-16",
          "items-center",
          "md:border-r md:border-soft",
        )}
      >
        <StepHeader activeStep={activeStep.value} />
        <Stepper activeStep={activeStep.value} />
      </div>

      <div class={cn("h-[95%] overflow-auto", "w-full")}>
        {activeStep.value === 1 && <Form1 />}
      </div>
    </div>
  );
});
