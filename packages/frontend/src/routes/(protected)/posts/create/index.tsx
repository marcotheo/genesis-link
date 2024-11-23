import {
  component$,
  createContextId,
  Signal,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
} from "@builder.io/qwik";

import {
  BasicPostInfoStep,
  BrandingVisualsStep,
  CreateJobPostFormData,
} from "./common";
import { DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { CreateAddressForm } from "~/common/formSchema";
import { InitialValues } from "@modular-forms/qwik";
import StepHeader from "./StepHeader";
import SuccessBox from "./SuccessBox";
import { cn } from "~/common/utils";
import Stepper from "./Stepper";
import Form1 from "./Form1";
import Form2 from "./Form2";
import Form3 from "./Form3";
import Form4 from "./Form4";
import Form5 from "./Form5";

export const useForm1Loader = routeLoader$<InitialValues<BasicPostInfoStep>>(
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

export const useForm2Loader = routeLoader$<InitialValues<BrandingVisualsStep>>(
  () => ({
    logoFile: undefined,
    posterFile: undefined,
  }),
);

export const useCreateAddressFormLoader = routeLoader$<
  InitialValues<CreateAddressForm>
>(() => ({
  region: undefined,
  province: undefined,
  city: undefined,
  barangay: undefined,
  addressDetails: undefined,
}));

export const FormStepCtx = createContextId<Signal<number>>("form.step.context");

export const FormDataCtx =
  createContextId<CreateJobPostFormData>("form.data.context");

const ActiveForm = component$(() => {
  const activeStep = useContext(FormStepCtx);
  const formDataState = useStore<CreateJobPostFormData>({
    form1: undefined,
    form2: undefined,
  });

  useContextProvider(FormDataCtx, formDataState);
  useContextProvider(FormStepCtx, activeStep);

  return (
    <>
      <Form1 />
      <Form2 />
      <Form3 />
      <Form4 />
      <Form5 />
      <SuccessBox />
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

export const head: DocumentHead = {
  title: "Create Job Post",
  meta: [
    {
      name: "description",
      content: "create job post form",
    },
  ],
};
