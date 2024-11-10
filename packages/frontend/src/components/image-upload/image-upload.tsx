import { component$, useSignal } from "@builder.io/qwik";
import Button from "../button/button";
import { cn } from "~/common/utils";

export default component$<{ label?: string; buttonLabel?: string }>(
  ({ label, buttonLabel }) => {
    const fileUploadRef = useSignal<HTMLInputElement>();

    return (
      <>
        <input type="file" ref={fileUploadRef} class="hidden" />

        <div class="space-y-2">
          <label>{label}</label>

          <div
            class={cn(
              "flex justify-center items-center",
              "px-2 py-16",
              "border border-dashed rounded-md",
            )}
          >
            <Button
              onClick$={() => fileUploadRef.value?.click()}
              class={cn(
                "bg-soft text-text",
                "hover:bg-soft dark:hover:brightness-150 hover:brightness-90",
              )}
            >
              {buttonLabel ? buttonLabel : "upload"}
            </Button>
          </div>
        </div>
      </>
    );
  },
);
