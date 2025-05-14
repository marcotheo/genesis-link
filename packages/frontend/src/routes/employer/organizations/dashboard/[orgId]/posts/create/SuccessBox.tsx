import { component$, useContext } from "@builder.io/qwik";
import { LuCheckCircle } from "@qwikest/icons/lucide";

import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import { cn } from "~/common/utils";

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  return (
    <div class={cn("flex h-full w-full justify-center")}>
      <div
        class={cn(
          "p-5 w-[90%] max-w-[60rem]",
          "flex flex-col gap-16",
          "items-center",
        )}
      >
        <div class="text-success text-[15rem] min-[400px]:text-[20rem] pt-16">
          <LuCheckCircle />
        </div>

        <div>
          <Heading class="text-center text-gray-500">POST CREATED</Heading>
          <Heading class="text-center text-success">SUCCESSFULLY</Heading>
        </div>

        <Button
          class="bg-success hover:bg-success hover:brightness-125"
          size="md"
          onClick$={() => {
            formDataCtx.postId = undefined;
            formDataCtx.form1 = undefined;
            formDataCtx.form2 = undefined;
            formDataCtx.form3 = undefined;
            formDataCtx.form4 = undefined;
            formDataCtx.form5 = undefined;

            activeStep.value = 1;
          }}
        >
          DONE
        </Button>
      </div>
    </div>
  );
});
