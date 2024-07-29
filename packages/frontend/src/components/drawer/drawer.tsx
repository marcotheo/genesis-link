import {
  $,
  component$,
  createContextId,
  HTMLAttributes,
  Signal,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import Button from "../button/button";
import { cn } from "~/common/utils";

interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: boolean;
}

export const DrawerContext = createContextId<Signal<boolean | null>>(
  "drawer.open-context",
);

export default component$<DrawerProps>(({ defaultValue = false, ...props }) => {
  const open = useSignal(defaultValue);
  const menuRef = useSignal<HTMLDivElement>();

  useContextProvider(DrawerContext, open);

  const onToggle = $(() => {
    open.value = !open.value;
  });

  return (
    <>
      <Button
        class="md:hidden px-2"
        variant="ghost"
        onClick$={onToggle}
        aria-label="drawer-open"
      >
        <Slot name="trigger" />
      </Button>

      <div
        {...props}
        ref={menuRef}
        class={cn(
          "absolute z-[1111] bg-surface",
          "top-0 bottom-0 left-0",
          "md:hidden overflow-hidden",
          "duration-300 ease-out",
          open.value ? "w-72" : "w-0",
        )}
      >
        <Button
          onClick$={onToggle}
          variant="ghost"
          class={cn(
            "bg-transparent text-white hover:text-primary",
            "absolute top-0 right-0",
          )}
        >
          X
        </Button>

        <div class="p-5 bg-background">
          <Slot name="header" />
        </div>

        <div class="p-5">
          <Slot />
        </div>
      </div>

      <div
        onClick$={onToggle}
        class={cn(
          "fixed inset-0 w-full top-0 left-0",
          open.value ? "bg-[rgba(0,0,0,0.5)] z-50" : "bg-transparent z-[-10]",
        )}
      ></div>
    </>
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
