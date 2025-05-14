import {
  $,
  component$,
  createContextId,
  Signal,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { TbChevronLeft, TbMenu2 } from "@qwikest/icons/tablericons";
import { Link } from "@builder.io/qwik-city";
import { Modal } from "@qwik-ui/headless";

import { cn } from "~/common/utils";

interface DrawerProps {
  defaultValue?: boolean;
}

export const DrawerContext = createContextId<Signal<boolean | null>>(
  "drawer.open-context",
);

export default component$<DrawerProps>(({ defaultValue = false }) => {
  const open = useSignal(defaultValue);

  useContextProvider(DrawerContext, open);

  return (
    <Modal.Root bind:show={open}>
      <Modal.Trigger
        class={cn(
          "bg-ghost rounded-md",
          "p-2",
          "text-lg min-[440px]:text-2xl",
          "hover:brightness-125",
        )}
      >
        <TbMenu2 />
      </Modal.Trigger>

      <Modal.Panel
        class={cn(
          "h-full w-72",
          "top-0 left-0 ml-0",
          "bg-surface",
          "data-[open]:animate-sheet-open",
          "data-[closed]:animate-sheet-close",
          "overflow-visible",

          "data-[open]:backdrop:bg-[rgba(0,0,0,0.5)]",
          "data-[open]:backdrop:backdrop-blur-sm",
        )}
      >
        <div class="p-5 bg-background">
          <Slot name="header" />
        </div>

        <div class="p-5">
          <Slot />
        </div>

        <Modal.Close
          class={cn(
            "absolute -right-4",
            "top-1/2 -translate-y-1/2",
            "bg-primary rounded-full p-2",
            "text-white",
            "hover:brightness-110",
          )}
        >
          <TbChevronLeft />
        </Modal.Close>
      </Modal.Panel>
    </Modal.Root>
  );
});

export const DrawerLink = component$<{ href: string }>(({ href }) => {
  const drawerCtx = useContext(DrawerContext);

  const onTrigger = $(() => {
    drawerCtx.value = !drawerCtx.value;
  });

  return (
    <div>
      <Link href={href} onClick$={onTrigger}>
        <div
          class={cn(
            "flex gap-3 items-center",
            "w-full p-2",
            "duration-300",
            "cursor-pointer hover:bg-zinc-700 rounded-md",
            "whitespace-nowrap text-lg",
          )}
        >
          <Slot />
        </div>
      </Link>
    </div>
  );
});
