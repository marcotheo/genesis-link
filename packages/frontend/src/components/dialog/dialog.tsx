import {
  component$,
  Slot,
  HTMLAttributes,
  createContextId,
  Signal,
  useSignal,
  useContextProvider,
  useContext,
  $,
  useOnDocument,
} from "@builder.io/qwik";
import Button, { ButtonProps } from "../button/button";
import { cn } from "~/common/utils";

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  size?: "lg" | "md" | "sm";
}

export const DialogContext = createContextId<Signal<boolean | null>>(
  "dialog.open-context",
);

export default component$<DialogProps>(({ size = "sm", ...props }) => {
  const open = useSignal<boolean | null>(null);
  const dialogRef = useSignal<HTMLDivElement>();

  useContextProvider(DialogContext, open);

  const sizes = {
    lg: "md:min-w-[40rem]",
    md: "md:min-w-[30rem]",
    sm: "md:min-w-[25rem]",
  };

  useOnDocument(
    "click",
    $((event: any) => {
      if (
        open.value &&
        dialogRef.value &&
        !dialogRef.value.contains(event.target as Node)
      ) {
        open.value = false;
      }
    }),
  );

  return (
    <>
      <Slot name="trigger" />

      <div
        class={cn(
          "fixed inset-0 w-full top-0 left-0",
          open.value ? "bg-[rgba(0,0,0,0.5)] z-50" : "bg-transparent z-[-10]",
        )}
      ></div>

      <div
        {...props}
        ref={dialogRef}
        class={cn(
          "fixed top-0 bottom-0 left-0 right-0 m-auto",
          "w-fit h-fit min-w-[90%] p-5",
          "bg-surface rounded-md shadow-lg",
          "text-text",
          sizes[size],
          open.value === null
            ? "hidden"
            : open.value
              ? "animate-fade-in-scale"
              : "animate-fade-out-scale",
          props.class,
        )}
      >
        <Slot />
      </div>
    </>
  );
});

export const DialogTrigger = component$<ButtonProps>(({ ...props }) => {
  const dialogCtx = useContext(DialogContext);

  const onTrigger = $(() => {
    if (dialogCtx.value === null) dialogCtx.value = true;
    else dialogCtx.value = !dialogCtx.value;
  });

  return (
    <Button {...props} onClick$={onTrigger}>
      <Slot />
    </Button>
  );
});
