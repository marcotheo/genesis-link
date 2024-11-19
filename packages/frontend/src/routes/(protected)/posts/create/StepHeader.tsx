import { component$, useContext } from "@builder.io/qwik";
import Heading from "~/components/heading/heading";
import { FormStepCtx } from ".";

export default component$(() => {
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
        {activeStep.value === 1 && "Enter post information"}
        {activeStep.value === 2 && "Upload Branding Assets"}
        {activeStep.value === 3 && "Enter address information"}
        {activeStep.value === 4 && "Enter job details"}
        {activeStep.value === 5 && "Enter job requirements"}
      </p>
    </div>
  );
});
