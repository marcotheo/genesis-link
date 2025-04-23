import { $, component$, useSignal } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";

import * as TModal from "~/components/themed-modal/themed-modal";
import Button from "~/components/button/button";
import Editor from "~/components/editor/editor";

import { useToast } from "~/hooks/use-toast/useToast";
import { cn } from "~/common/utils";

export default component$(() => {
  const toast = useToast();
  const open = useSignal(false);

  const onSubmit = $(() => {
    toast.add({
      title: "Success",
      message: "Application Sent",
      type: "success",
    });

    open.value = false;
  });

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
        <div class="flex flex-col gap-5 max-w-[47rem]">
          <div class="space-y-1">
            <p>
              Proposal: <span class="text-gray-500">(optional)</span>
            </p>
            <Editor placeholder="Write your proposal here" />
          </div>

          <div class="flex justify-end gap-3 mt-5">
            <TModal.Close class="min-[360px]:px-10">Cancel</TModal.Close>

            <Button type="button" class="min-[360px]:px-10" onClick$={onSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </TModal.Content>
    </Modal.Root>
  );
});
