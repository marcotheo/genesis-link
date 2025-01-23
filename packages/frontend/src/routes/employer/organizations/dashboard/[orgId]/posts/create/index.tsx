import {
  component$,
  createContextId,
  Signal,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
} from "@builder.io/qwik";

import { DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { CreateJobPostFormData } from "./common";
import { useOrgId } from "../../../layout";
import StepHeader from "./StepHeader";
import SuccessBox from "./SuccessBox";
import { cn } from "~/common/utils";
import Stepper from "./Stepper";
import Form1 from "./Form1";
import Form2 from "./Form2";
import Form3 from "./Form3";
import Form4 from "./Form4";
import Form5 from "./Form5";

export const FormStepCtx = createContextId<Signal<number>>("form.step.context");

export const FormDataCtx =
  createContextId<CreateJobPostFormData>("form.data.context");

const ActiveForm = component$(() => {
  const org = useOrgId();
  const activeStep = useContext(FormStepCtx);
  const formDataState = useStore<CreateJobPostFormData>({
    orgId: org.value.orgId,
    form1: undefined,
    form2: undefined,
    form3: undefined,
    form4: undefined,
    form5: undefined,
  });

  useContextProvider(FormDataCtx, formDataState);
  useContextProvider(FormStepCtx, activeStep);

  return (
    <>
      {activeStep.value === 1 && <Form1 />}
      {activeStep.value === 2 && <Form2 />}
      {activeStep.value === 3 && <Form3 />}
      {activeStep.value === 4 && <Form4 />}
      {activeStep.value === 5 && <Form5 />}
      {activeStep.value === 6 && <SuccessBox />}
    </>
  );
});

export default component$(() => {
  const activeStep = useSignal(1);

  useContextProvider(FormStepCtx, activeStep);

  return (
    <div class="h-full flex flex-col md:flex-row gap-3 relative">
      {/* <div
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
      </div> */}

      <div class={cn("h-[95%] overflow-auto", "w-full")}>
        <ActiveForm />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "ArkPoint",
};
