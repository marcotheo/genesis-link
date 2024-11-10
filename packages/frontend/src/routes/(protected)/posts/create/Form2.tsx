import { $, component$, Signal, useContext, useSignal } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import ImageUpload from "~/components/image-upload/image-upload";
import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import Alert from "~/components/alert/alert";
import { cn } from "~/common/utils";

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  const handleSubmit = $(async () => {
    try {
      // formDataCtx.form2 = selectedAddress.value;
      activeStep.value = 3;
    } catch (err) {
      console.error("Error Initializing Post:", err);
    }
  });

  return (
    <div class="flex h-full w-full justify-center">
      {/* <LoadingOverlay open={state.loading}>Initializing Post</LoadingOverlay> */}

      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Visuals & Branding</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">
          Upload a poster and logo for your job post. (optional)
        </p>

        <br class="max-md:hidden" />

        <ImageUpload label="Logo Upload" maxSize={3} sizeUnit="KB" />

        {/* <Alert
          open={!!state.error}
          variant="error"
          title="Error"
          message={state.error ?? ""}
        /> */}

        <div class="flex justify-end gap-3 mt-5">
          <Button
            type="button"
            class="px-10 border-input text-input"
            variant="outline"
            onClick$={() => (activeStep.value = 1)}
          >
            {"<-"} Prev
          </Button>

          <Button type="submit" class="px-10" onClick$={() => handleSubmit()}>
            Next {"->"}
          </Button>
        </div>
      </div>
    </div>
  );
});
