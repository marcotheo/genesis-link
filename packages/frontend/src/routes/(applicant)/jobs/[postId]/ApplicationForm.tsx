import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";

import * as TModal from "~/components/themed-modal/themed-modal";
import Button from "~/components/button/button";
import { cn } from "~/common/utils";

export default component$(() => {
  const open = useSignal(false);

  return (
    <Modal.Root bind:show={open}>
      <TModal.Trigger
        class={cn(
          "peer w-full font-primary",
          "rounded-md",
          "duration-150 ease-linear",
          "bg-primary hover:bg-primary-foreground text-white",
          "py-3 px-6",
          "hover:brightness-100",
        )}
      >
        Apply
      </TModal.Trigger>

      <TModal.Content
        size="lg"
        modalTitle="Application Form"
        modalDescription="use this form to fill in details for your application for this job"
      >
        Form here ...
        <div class="flex justify-end gap-3 mt-5">
          <TModal.Close class="min-[360px]:px-10">Cancel</TModal.Close>

          <Button type="submit" class="min-[360px]:px-10">
            Submit
          </Button>
        </div>
      </TModal.Content>
    </Modal.Root>
  );
});
