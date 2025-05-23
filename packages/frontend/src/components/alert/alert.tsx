import { CheckIcon, ErrorIcon } from "../icons/icons";
import { component$ } from "@builder.io/qwik";
import { cn } from "~/common/utils";

type Variant = "success" | "error";

export const Icon = component$<{ variant: Variant }>(({ variant }) => {
  if (variant === "success") return <CheckIcon class="size-10 text-success" />;

  return <ErrorIcon class="size-10 text-destructive" />;
});

interface Props {
  variant: Variant;
  title: string;
  message: string;
  open: boolean;
}

export default component$<Props>((props) => {
  const variantBorder = {
    success: "border-success",
    error: "border-destructive",
  };

  return (
    <>
      <div
        class={cn(
          "transition-[max-height] overflow-hidden duration-300",
          !!props.open ? "max-h-[500px] ease-in" : "max-h-0 ease-out",
        )}
      >
        <div
          class={cn(
            "flex items-center gap-3 p-3",
            "rounded-r-sm rounded-br-sm",
            "border-l-4 bg-surface shadow-md",
            "dark:brightness-110 brightness-95",
            variantBorder[props.variant],
          )}
        >
          <Icon variant={props.variant} />

          <div>
            <p class="text-lg font-medium">{props.title}</p>
            <p class="text-sm">{props.message}</p>
          </div>
        </div>
        <div class="w-full h-5" />
      </div>
    </>
  );
});
