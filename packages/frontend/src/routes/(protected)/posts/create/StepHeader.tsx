import { component$, useContext } from "@builder.io/qwik";
import Heading from "~/components/heading/heading";
import { FormStepCtx } from ".";

export default component$(() => {
  const activeStep = useContext(FormStepCtx);

  return (
    <div class="w-full">
      <Heading>
        {activeStep.value === 1 && "Step 1"}
        {activeStep.value === 2 && "Step 2"}
        {activeStep.value === 3 && "Step 3"}
        {activeStep.value === 4 && "Step 4"}
        {activeStep.value === 5 && "Step 5"}
        {activeStep.value === 6 && "Step 6"}
      </Heading>
      <p>
        {activeStep.value === 1 && "Enter post information"}
        {activeStep.value === 2 && "Upload Branding Assets"}
        {activeStep.value === 3 && "Enter address information"}
        {activeStep.value === 4 && "Enter job details"}
        {activeStep.value === 5 && "Enter job requirements"}
        {activeStep.value === 6 && "Enter Additional Information"}
      </p>
    </div>
  );
});
