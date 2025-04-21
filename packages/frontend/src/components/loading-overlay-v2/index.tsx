import { component$, Signal, Slot } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";

import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";

interface LoadingOverlayProps {
  open: null | boolean;
  type?: "text" | "component";
}

export default component$<{
  open: Signal<boolean>;
  type?: "text" | "component";
}>(({ open, type = "text" }) => {
  return (
    <Modal.Root bind:show={open} closeOnBackdropClick={false}>
      <Modal.Panel
        class={cn(
          "p-5 backdrop:bg-[rgba(0,0,0,0.5)]",
          "sm:min-w-fit max-sm:max-w-[90%]",
          "bg-surface rounded-md shadow-lg",
          "data-[open]:animate-fade-in-scale",
          "data-[closing]:animate-fade-out-scale",
        )}
      >
        <div class="flex gap-3 items-center justify-center">
          {type === "text" ? (
            <>
              <Heading size="md">
                <Slot />
              </Heading>
              <div class="flex flex-row pl-1 text-4xl">
                <div class="animate-[bounce_0.7s_ease-in-out_-0.3s_infinite] p-[2px] ">
                  .
                </div>
                <div class="animate-[bounce_0.7s_ease-in-out_-0.2s_infinite] p-[2px] ">
                  .
                </div>
                <div class="animate-[bounce_0.7s_ease-in-out_-0.1s_infinite] p-[2px] ">
                  .
                </div>
              </div>
            </>
          ) : (
            <Slot />
          )}
        </div>
      </Modal.Panel>
    </Modal.Root>
  );
});
