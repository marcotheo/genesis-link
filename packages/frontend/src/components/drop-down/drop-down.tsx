import {
  component$,
  Slot,
  HTMLAttributes,
  $,
  createContextId,
  useContextProvider,
  useContext,
} from "@builder.io/qwik";
import { Popover, usePopover } from "@qwik-ui/headless";
import { Link } from "@builder.io/qwik-city";

import { cn, generateRandomId } from "~/common/utils";

interface DropDownMenuProps extends HTMLAttributes<HTMLMenuElement> {
  panelCss?: string;
  panelWidth?: string;
  position?:
    | boolean
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "right"
    | "right-start"
    | "right-end"
    | "left"
    | "left-start"
    | "left-end"
    | undefined;
}

export const DropDownContext = createContextId<{
  id: string;
}>("dropdown.context");

export default component$<DropDownMenuProps>(
  ({ panelCss, panelWidth, position }) => {
    const popoverId = generateRandomId();

    useContextProvider(DropDownContext, {
      id: popoverId,
    });

    return (
      <Popover.Root id={popoverId} floating={position}>
        <Popover.Trigger class="group w-full">
          <Slot name="trigger" />
        </Popover.Trigger>

        <Popover.Panel
          class={cn(
            "absolute bg-surface",
            "mt-1 py-1",
            "shadow-md rounded-md",
            "border-[0.5px] border-popup",
            "data-[open]:animate-fade-in-slide",
            panelCss,
            panelWidth ? panelWidth : "w-fit",
          )}
        >
          <Slot name="label" />
          <div class="flex flex-col overflow-auto max-h-56">
            <Slot />
          </div>
        </Popover.Panel>
      </Popover.Root>
    );
  },
);

export const DropDownMenuLabel = component$(() => {
  return (
    <>
      <div class={cn("p-2 overflow-auto")}>
        <p class="font-secondary font-semibold text-sm">
          <Slot />
        </p>
      </div>
      <DropDownSeparator />
      <div class="h-1 w-full" />
    </>
  );
});

export const DropDownMenuItem = component$(() => {
  return (
    <div class="w-full px-1">
      <div
        class={cn(
          "p-2 rounded-md",
          "cursor-pointer hover:brightness-90 hover:dark:brightness-150",
          "duration-100 ease-out",
        )}
      >
        <p class="font-semibold text-xs">
          <Slot />
        </p>
      </div>
    </div>
  );
});

export const DropDownMenuItemLink = component$<{ link: string }>(({ link }) => {
  const dropDownData = useContext(DropDownContext);
  const { togglePopover } = usePopover(dropDownData.id);

  return (
    <>
      <Link
        href={link}
        onClick$={$(() => {
          togglePopover();
        })}
      >
        <div class="w-full px-1">
          <div
            class={cn(
              "p-2 rounded-md",
              "cursor-pointer hover:brightness-90 hover:dark:brightness-150",
              "duration-100 ease-out",
            )}
          >
            <Slot />
          </div>
        </div>
      </Link>
    </>
  );
});

export const DropDownSeparator = component$(() => (
  <hr class="h-[0.5px] w-full border-popup z-50 my-1" />
));
