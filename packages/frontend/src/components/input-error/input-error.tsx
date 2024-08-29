import { component$ } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export default component$<{ errorMsg?: string }>(({ errorMsg }) => {
  return (
    <p
      class={cn(
        "text-destructive text-xs",
        !!errorMsg ? "animate-fade-in-slide" : "animate-fade-out-slide",
      )}
    >
      {errorMsg}
    </p>
  );
});
