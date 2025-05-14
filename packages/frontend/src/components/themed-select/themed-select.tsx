import { component$, QRL, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { TbChevronDown } from "@qwikest/icons/tablericons";
import { LuCheck } from "@qwikest/icons/lucide";
import { Select } from "@qwik-ui/headless";

import InputError from "../input-error/input-error";
import { cn } from "~/common/utils";

type IOption = {
  label: string;
  value: string;
};

interface SelectProps {
  variant?: "underline" | "filled" | "default";
  name?: string;
  options: IOption[];
  label: string;
  errorMsg?: string;
  class?: string;
  ref?: QRL<(element: HTMLSelectElement) => void>;
  value?: string | string[] | null | undefined;
  onInput$?: (event: Event, element: HTMLSelectElement) => void;
  onChange$?: (event: Event, element: HTMLSelectElement) => void;
  onBlur$?: (event: Event, element: HTMLSelectElement) => void;
  multiple?: boolean;
}

// NOTE
// peer-data-[open] or data-[open]
// are duplicate css just to retain css when hovering around popover

const inputVariants = {
  filled: cn(
    "h-12 px-[10px] pt-5 pb-1",
    "bg-ghost",
    "border-b-[2px] border-r-md border-input",
    "rounded-t-sm",
  ),
  underline: cn("h-12", "bg-transparent", "border-b-[2px] border-input"),
  default: cn(
    "h-12 px-[10px]",
    "bg-transparent rounded-md",
    "border-[1px] hover:border-primary",
    "focus:border-transparent data-[open]:border-transparent",
    "focus:ring-2 focus:ring-primary",
    "data-[open]:ring-2 data-[open]:ring-primary",
  ),
};

const displayValueVariants = {
  filled: cn("bottom-1 left-1"),
  underline: cn("bottom-1 left-2"),
  default: cn("top-1/2 left-2", "-translate-y-1/2"),
};

const middleVariant = {
  filled: cn("peer-focus/one:scale-100", "peer-data-[open]/one:scale-100"),
  underline: cn("peer-focus/one:scale-100", "peer-data-[open]/one:scale-100"),
  default: "hidden",
};

const labelVariants = {
  filled: cn(
    "bg-transparent",

    // state when focus, popover hover, has value
    "top-3 left-1",
    "peer-focus/one:top-3 peer-focus/one:left-1",
    "peer-data-[open]/one:top-3 peer-data-[open]/one:left-1",
  ),
  underline: cn(
    // state when focus, popover hover, has value
    "top-0 left-2",
    "peer-focus/one:top-0 peer-focus:left-2",
    "peer-data-[open]/one:top-0 peer-data-[open]/one:left-2",
  ),
  default: cn(
    // state when focus, popover hover, has value
    "top-0 left-2",
    "peer-focus/one:top-0 peer-focus:left-2",
    "peer-data-[open]/one:top-0 peer-data-[open]/one:left-2",
  ),
};

export default component$<SelectProps>(
  ({
    variant = "default",
    label,
    errorMsg,
    options,
    class: customClass,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value,

    ...props
  }) => {
    const triggerRef = useSignal<Element>();
    const popoverWidth = useSignal<string>("auto");

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      if (triggerRef.value) {
        const width = (triggerRef.value as HTMLElement).offsetWidth;
        popoverWidth.value = `${width}px`;
      }
    });

    return (
      <div class="w-full space-y-1">
        <Select.Root class="relative w-full">
          <Select.HiddenNativeSelect {...props} />
          <div class="relative w-full" ref={triggerRef}>
            <Select.Trigger
              type="button"
              aria-label={label}
              class={cn(
                "peer/one group",
                "z-[10] w-full",
                "flex items-end",
                "font-primary text-text",
                "outline-none duration-100 ease-out",
                inputVariants[variant],
                !!errorMsg ? "border-destructive" : "border-input",
                customClass,
              )}
            >
              <div
                class={cn(
                  "absolute",
                  "top-1/2 -translate-y-1/2 right-2",
                  "group-focus:text-primary group-focus:rotate-180",
                  "duration-150 ease-linear",
                )}
              >
                <TbChevronDown />
              </div>
            </Select.Trigger>

            <Select.DisplayValue
              placeholder=""
              class={cn(
                "peer/two",
                "absolute px-1",
                "bg-transparent",
                "text-text text-[1em]",
                "pointer-events-none",
                "duration-150 ease-out",
                displayValueVariants[variant],
              )}
            />

            <div
              class={cn(
                "absolute bottom-0",
                "w-full h-[2px]",
                "duration-300",
                !!errorMsg ? "scale-1 bg-destructive" : "scale-0 bg-primary",
                middleVariant[variant],
              )}
            />

            <p
              class={cn(
                "absolute px-1",
                "text-input",
                "pointer-events-none",
                "duration-150 ease-out",
                "-translate-y-1/2", // used for every position changed

                // default state
                "peer-empty/two:text-[1em]",
                "peer-empty/two:top-1/2 peer-empty/two:left-3",

                // state when focus, popover hover, has value
                "text-[0.8em]",
                "peer-focus/one:text-[0.8em]",
                "peer-data-[open]/one:text-[0.8em]",
                labelVariants[variant],
              )}
            >
              {label}
            </p>
          </div>

          {
            <Select.Popover
              class={cn(
                "bg-surface",
                "mt-1 p-1",
                "shadow-md rounded-md",
                "border-[0.5px] border-popup",
                "data-[open]:animate-fade-in-slide",
              )}
              style={{ width: popoverWidth.value }}
            >
              {options.map((row) => (
                <Select.Item
                  class={cn(
                    "w-full p-1",
                    "flex items-center justify-between",
                    "rounded-md cursor-pointer",
                    "data-[highlighted]:brightness-90 data-[highlighted]:dark:brightness-150",
                    "duration-200 ease-out",
                  )}
                  key={row.value}
                  value={row.value}
                >
                  <Select.ItemLabel>{row.label}</Select.ItemLabel>
                  <Select.ItemIndicator>
                    <LuCheck />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Popover>
          }
        </Select.Root>

        <InputError errorMsg={errorMsg} />
      </div>
    );
  },
);
