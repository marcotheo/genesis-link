import { component$, InputHTMLAttributes } from "@builder.io/qwik";
import dayjs from "dayjs";

import InputError from "../input-error/input-error";
import { cn } from "~/common/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "underline" | "filled" | "default";
  errorMsg?: string;
  label: string;
}

const inputVariants = {
  filled: cn(
    "h-12 px-[10px] pt-5 pb-1",
    "bg-ghost",
    "border-b-[2px] border-r-md border-input",
    "rounded-t-sm",
  ),
  underline: cn(
    "h-12 px-[10px]",
    "bg-transparent",
    "border-b-[2px] border-input",
  ),
  default: cn(
    "h-12 px-[10px]",
    "bg-transparent rounded-md",
    "border-[1px] hover:border-primary",
    "focus:border-primary focus-visible:border-transparent",
    "focus-visible:ring-2 focus-visible:ring-primary",
  ),
};

const middleVariant = {
  filled: "peer-focus:scale-100",
  underline: "peer-focus:scale-100",
  default: "hidden",
};

const labelVariants = {
  filled: cn(
    "bg-transparent",
    "peer-focus:top-3 peer-focus:left-1",
    "top-3 left-1",
  ),
  underline: cn("peer-focus:top-0 peer-focus:left-2", "top-0 left-2"),
  default: cn("peer-focus:top-0 peer-focus:left-2", "top-0 left-2"),
};

export default component$<InputProps>(
  ({ variant = "default", label, errorMsg, ...props }) => {
    return (
      <div class="w-full">
        <div class="relative w-full h-full">
          <input
            {...props}
            value={
              props.type === "date"
                ? !!props.value
                  ? dayjs(props.value as any).format("YYYY-MM-DD")
                  : props.value
                : props.value
            }
            placeholder=""
            aria-label={label}
            class={cn(
              "peer z-[10] w-full",
              "font-primary",
              "outline-none duration-100 ease-out",
              !!errorMsg ? "border-destructive" : "border-input",
              inputVariants[variant],
              props.class,
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
              "duration-100 ease-out",
              "-translate-y-1/2",

              // default state
              "peer-placeholder-shown:text-[1em]",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-3",

              // focus or with value state
              "text-[0.8em] peer-focus:text-[0.8em] peer-focus:z-[10]",
              labelVariants[variant],
            )}
          >
            {label}
          </p>
        </div>

        <InputError errorMsg={errorMsg} />
      </div>
    );
  },
);
