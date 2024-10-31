import {
  component$,
  Slot,
  HTMLAttributes,
  useSignal,
  useOnDocument,
  $,
  Signal,
  QRL,
  createContextId,
  useContextProvider,
  useContext,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import Button from "../button/button";
import { cn } from "~/common/utils";

interface DropDownMenuProps extends HTMLAttributes<HTMLMenuElement> {
  triggerTitle?: string;
}

export const DropDownContext = createContextId<{
  isOpen: Signal<boolean | null>;
}>("dropdown.context");

export default component$<DropDownMenuProps>(({ triggerTitle, ...props }) => {
  const isOpen = useSignal<boolean | null>(null);
  const dropdownRef = useSignal<HTMLDivElement>();
  const dropDownContentRef = useSignal<HTMLDivElement>();

  const onTrigger = $(() => {
    if (isOpen.value === null) isOpen.value = true;
    else isOpen.value = !isOpen.value;
  });

  const onMenuToggle = $(() => {
    if (!dropDownContentRef.value || !dropdownRef.value) return;

    const wrapperRect = dropdownRef.value.getBoundingClientRect();
    const dropdownRect = dropDownContentRef.value.getBoundingClientRect();
    const overflowY = dropdownRect.bottom > window.innerHeight;
    const overflowR = dropdownRect.right > window.innerWidth;

    if (overflowR)
      dropDownContentRef.value.style.right = `${dropdownRect.right - window.innerWidth}px`;

    if (overflowY)
      dropDownContentRef.value.style.marginTop = `-${wrapperRect.height + dropdownRect.height}px`;
  });

  useContextProvider(DropDownContext, {
    isOpen,
  });

  useOnDocument(
    "click",
    $((event: any) => {
      if (
        isOpen.value &&
        dropdownRef.value &&
        !dropdownRef.value.contains(event.target as Node)
      ) {
        isOpen.value = false;
      }
    }),
  );

  return (
    <menu
      {...props}
      class={cn("font-secondary font-medium", "group", props.class)}
      ref={dropdownRef}
    >
      <DropDownMenuTrigger
        title={triggerTitle}
        isOpen={isOpen}
        onToggle={onMenuToggle}
      />

      <button
        class={cn(
          "bg-surface shadow-lg",
          "rounded-full h-14 w-14",
          "flex items-center justify-center",
          "text-text relative",
          "hover:brightness-90 dark:hover:brightness-125",
          "transition-all duration-200 ease-in",
        )}
        onClick$={[onTrigger, onMenuToggle]}
      >
        <Slot name="trigger-circle-icon" />
        <div
          class={cn(
            "flex items-center justify-center",
            "bg-surface h-5 w-5  rounded-full",
            "shadow-lg",
            "absolute bottom-0 right-0",
          )}
        >
          <ChevronDown isOpen={isOpen.value} />
        </div>
      </button>

      <div
        ref={dropDownContentRef}
        class={cn(
          "absolute bg-surface",
          "mt-1 py-1",
          "shadow-md rounded-md",
          "border-[0.5px] border-popup",
          isOpen.value === null
            ? "opacity-0 z-[-10]"
            : isOpen.value
              ? "animate-fade-in-slide z-50"
              : "animate-fade-out-slide z-[-10]",
        )}
      >
        <Slot name="label" />
        <div class="flex flex-col overflow-auto max-h-56">
          <Slot />
        </div>
      </div>
    </menu>
  );
});

const ChevronDown = component$<{ isOpen: boolean | null; class?: string }>(
  ({ isOpen, ...props }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class={cn(
          "size-4 bg-transparent",
          "duration-300 ease-out",
          isOpen ? "rotate-180" : "",
          props.class,
        )}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    );
  },
);

const DropDownMenuTrigger = component$<{
  title?: string;
  isOpen: Signal<boolean | null>;
  onToggle: QRL<() => void>;
}>(({ isOpen, title, onToggle }) => {
  const onTrigger = $(() => {
    if (isOpen.value === null) isOpen.value = true;
    else isOpen.value = !isOpen.value;
  });

  return (
    <>
      <Button
        class={cn("peer flex gap-3 items-center", !title && "hidden")}
        variant="outline"
        onClick$={[onTrigger, onToggle]}
      >
        {title} <ChevronDown isOpen={isOpen.value} />
      </Button>
    </>
  );
});

export const DropDownMenuLabel = component$(() => {
  return (
    <>
      <div class={cn("p-2 min-w-48")}>
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
    <>
      <div class="w-full px-1">
        <div
          class={cn(
            "min-w-48 p-2 rounded-md",
            "cursor-pointer hover:brightness-90 hover:dark:brightness-150",
            "duration-100 ease-out",
          )}
        >
          <p class="font-semibold text-xs">
            <Slot />
          </p>
        </div>
      </div>
    </>
  );
});

export const DropDownMenuItemLink = component$<{ link: string }>(({ link }) => {
  const dropDownData = useContext(DropDownContext);

  return (
    <>
      <Link href={link} onClick$={$(() => (dropDownData.isOpen.value = false))}>
        <div class="w-full px-1">
          <div
            class={cn(
              "min-w-48 p-2 rounded-md",
              "cursor-pointer hover:brightness-90 hover:dark:brightness-150",
              "duration-100 ease-out",
            )}
          >
            <p class="font-semibold text-xs">
              <Slot />
            </p>
          </div>
        </div>
      </Link>
    </>
  );
});

export const DropDownSeparator = component$(() => (
  <hr class="h-[0.5px] w-full border-popup z-50 my-1" />
));
