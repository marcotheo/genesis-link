import {
  component$,
  createContextId,
  Signal,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
} from "@builder.io/qwik";

import { Briefcase, NumberList, Planner } from "~/components/icons/icons";
import { CreatePostForm, CreatePostFormData } from "./common";
import { routeLoader$ } from "@builder.io/qwik-city";
import { InitialValues } from "@modular-forms/qwik";
import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";
import Form1 from "./Form1";

export const FormStepCtx = createContextId<Signal<number>>("form.step.context");

const StepHeader = component$(() => {
  const activeStep = useContext(FormStepCtx);

  return (
    <div class="w-full">
      <Heading>
        {activeStep.value === 1
          ? "Step 1"
          : activeStep.value === 2
            ? "Step 2"
            : "Step 3"}
      </Heading>
      <p>
        {" "}
        {activeStep.value === 1
          ? "Enter the post information"
          : activeStep.value === 2
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

const Stepper = component$(() => {
  const activeStep = useContext(FormStepCtx);

  return (
    <ul class="list-none space-y-16 w-full max-md:hidden">
      <ItemStep title="Post Information" isActive={activeStep.value === 1}>
        <Planner />
      </ItemStep>
      <ItemStep title="Job Details" isActive={activeStep.value === 2}>
        <Briefcase />
      </ItemStep>
      <ItemStep title="Job Requirements" isActive={activeStep.value === 3}>
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

export const FormDataCtx =
  createContextId<CreatePostFormData>("form.data.context");

const ActiveForm = component$(() => {
  const activeStep = useContext(FormStepCtx);
  const formDataState = useStore<CreatePostFormData>({ form1: undefined });

  useContextProvider(FormDataCtx, formDataState);
  useContextProvider(FormStepCtx, activeStep);

  return (
    <>
      {activeStep.value === 1 && <Form1 />}
      {activeStep.value === 2 && "N/A"}
    </>
  );
});

export default component$(() => {
  const activeStep = useSignal(1);

  useContextProvider(FormStepCtx, activeStep);

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
        <StepHeader />
        <Stepper />
      </div>

      <div class={cn("h-[95%] overflow-auto", "w-full")}>
        <ActiveForm />
      </div>
    </div>
  );
});
