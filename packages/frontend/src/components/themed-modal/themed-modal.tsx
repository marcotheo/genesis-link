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

export default component$(() => {
  return <></>;
});

export const Trigger = component$<{ class?: string }>((props) => {
  return (
    <Modal.Trigger
      class={cn(
        "px-5 py-3 rounded-md",
        "bg-primary-soft hover:brightness-150",
        props.class,
      )}
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
        <Modal.Title class="text-2xl">{modalTitle ?? ""}</Modal.Title>

        <Modal.Description class="text-gray-500 text-sm">
          {modalDescription ?? ""}
        </Modal.Description>

        <br />

        <Slot />
      </Modal.Panel>
    );
  },
);

const sizes = {
  lg: "py-4 px-7",
  md: "py-3 px-6",
  sm: "py-1 px-4 text-md",
  default: "py-2 px-5",
};

interface CloseProps {
  size?: "lg" | "md" | "sm" | "default";
  class?: string;
}

export const Close = component$<CloseProps>((props) => {
  return (
    <Modal.Close
      class={cn(
        "rounded-md",
        "border border-input",
        "duration-150 ease-linear",
        "bg-transparent hover:bg-primary-soft",
        "text-input",
        sizes[props.size ?? "default"],
        props.class,
      )}
      type="button"
    >
      <Slot />
    </Modal.Close>
  );
});
