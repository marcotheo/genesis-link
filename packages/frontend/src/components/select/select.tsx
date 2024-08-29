import {
  $,
  component$,
  useOnDocument,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import { FormStore, setValue } from "@modular-forms/qwik";
import { cn } from "~/common/utils";

type IOption = {
  label: string;
  value: string;
};

interface SelectProps {
  variant?: "underline" | "filled" | "default";
  name: string;
  options: IOption[];
  label: string;
  value?: string;
  errorMsg?: string;
  form?: FormStore<any>;
  class?: string;
}

const inputVariants = {
  filled: cn(
    "bg-ghost h-[50px] px-[10px] pb-1",
    "border-b-[2px] border-r-md border-input",
    "rounded-t-sm",
  ),
  underline: cn(
    "h-[42px] py-2",
    "bg-transparent",
    "border-b-[2px] border-input",
  ),
  default: cn(
    "h-[41.3px] px-[10px] py-2",
    "bg-transparent rounded-md",
    "border-[1px] hover:border-primary",
    "focus:border-primary focuss:border-transparent",
    "focus:ring-2 focus:ring-primary",
  ),
};

const middleVariant = {
  filled: "peer-focus:scale-100",
  underline: "peer-focus:scale-100",
  default: "hidden",
};

const labelVariants = {
  filled: {
    marginCss: "top-[12px] ml-[10px] bg-transparent",
    translate: "translate-x-[-3px] translate-y-[-12px]",
  },
  underline: {
    marginCss: "top-[8px]",
    translate: "translate-x-[-3px] translate-y-[-17px]",
  },
  default: {
    marginCss: "top-[8px] ml-[10px]",
    translate: "translate-x-[-3px] translate-y-[-17px]",
  },
};

export default component$<SelectProps>(
  ({ variant = "default", label, errorMsg, form, ...props }) => {
    const state = useStore({ selected: props.value || "", isOpen: false });
    const containerRef = useSignal<Element | undefined>();

    const toggleDropdown = $(() => {
      state.isOpen = !state.isOpen;
    });

    const handleSelect = $((value: string) => {
      state.selected = value;
      state.isOpen = false;

      if (form) setValue(form, props.name, state.selected);
    });

    useOnDocument(
      "click",
      $((event: any) => {
        if (
          state.isOpen &&
          containerRef.value &&
          !containerRef.value.contains(event.target as Node)
        ) {
          state.isOpen = false;
        }
      }),
    );

    return (
      <div class="pt-3 w-full" ref={containerRef}>
        <div class="relative w-full">
          <button
            type="button"
            aria-label={label}
            class={cn(
              "peer group",
              "z-[10] w-full",
              "flex items-end",
              "font-primary text-text",
              "outline-none duration-100 ease-out",
              inputVariants[variant],
              props.class,
              !!errorMsg ? "border-destructive" : "border-input",
            )}
            onClick$={toggleDropdown}
          >
            {state.selected.toString()}
            <span
              class={cn(
                "ml-2 absolute right-2",
                variant === "filled" ? "top-3" : "top-2",
                "group-focus:text-primary group-focus:rotate-180",
                "duration-300 ease-in",
              )}
            >
              &#x25BC;
            </span>
          </button>

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
              "text-input pointer-events-none",
              "duration-100 ease-out",

              labelVariants[variant].marginCss,

              !!state.selected || state.isOpen
                ? cn("text-[0.8em] z-[10]", labelVariants[variant].translate)
                : "translate-x-[0] translate-y-[0] text-[1em]",
            )}
          >
            {label}
          </p>

          <div
            class={cn(
              "absolute bg-surface",
              "w-full mt-1 py-1",
              "shadow-md rounded-md",
              "border-[0.5px] border-popup",
              state.isOpen
                ? "animate-fade-in-slide z-50"
                : "animate-fade-out-slide z-[-10]",
            )}
          >
            {props.options.map((option) => (
              <div class="w-full px-1">
                <div
                  key={option.value}
                  class={cn(
                    "w-full p-2 rounded-md cursor-pointer",
                    "hover:brightness-90 hover:dark:brightness-150",
                    "duration-200 ease-out",
                  )}
                  onClick$={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          class={cn(
            "text-destructive text-xs",
            !!errorMsg ? "animate-fade-in-slide" : "animate-fade-out-slide",
          )}
        >
          {errorMsg}
        </p>
      </div>
    );
  },
);
