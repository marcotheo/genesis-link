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
        {activeStep.value === 1
          ? "Enter the post information"
          : activeStep.value === 2
            ? "Enter the Job Details"
            : "Enter the Job Requirements"}
      </p>
    </div>
  );
});
