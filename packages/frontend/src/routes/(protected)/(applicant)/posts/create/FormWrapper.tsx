import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export default component$<{ formStep: number; activeStep: number }>(
  ({ formStep, activeStep }) => {
    return (
      <div
        class={cn(
          "flex h-full w-full justify-center",
          activeStep === formStep ? "" : "hidden",
        )}
      >
        <Slot />
      </div>
    );
  },
);
