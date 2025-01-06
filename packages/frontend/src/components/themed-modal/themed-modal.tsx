import { component$, Slot } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";

import { cn } from "~/common/utils";

interface Props {
  size?: "lg" | "md" | "sm";
  modalTitle?: string;
  modalDescription?: string;
}

const modalSizes = {
  lg: "md:min-w-[50rem]",
  md: "md:min-w-[30rem]",
  sm: "md:min-w-[25rem]",
};

export const Trigger = component$(() => {
  return (
    <Modal.Trigger
      class={cn("px-5 py-3 rounded-md", "bg-primary-soft hover:brightness-150")}
      type="button"
    >
      <Slot />
    </Modal.Trigger>
  );
});

export const Content = component$<Props>(
  ({ size = "sm", modalTitle, modalDescription }) => {
    return (
      <Modal.Panel
        class={cn(
          "p-5 backdrop:bg-[rgba(0,0,0,0.5)]",
          "w-[95%] md:w-fit",
          "bg-surface rounded-md shadow-lg",
          "data-[open]:animate-fade-in-scale",
          "data-[closing]:animate-fade-out-scale",
          modalSizes[size],
        )}
      >
        <Modal.Title>{modalTitle ?? ""}</Modal.Title>

        <Modal.Description class="text-gray-500 text-sm">
          {modalDescription ?? ""}
        </Modal.Description>

        <br />

        <Slot />
      </Modal.Panel>
    );
  },
);

export const Close = component$(() => {
  return (
    <Modal.Close
      class={cn(
        "px-10 rounded-md",
        "border border-input",
        "bg-transparent hover:bg-primary-soft",
        "text-input",
      )}
      type="button"
    >
      <Slot />
    </Modal.Close>
  );
});
