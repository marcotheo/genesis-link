import { component$, useContext } from "@builder.io/qwik";

import { FormDataCtx, FormStepCtx } from "./index";
import FormWrapper from "./FormWrapper";

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  return (
    <FormWrapper formStep={4} activeStep={activeStep.value}>
      <div>incoming</div>
    </FormWrapper>
  );
});
