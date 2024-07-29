import { component$, InputHTMLAttributes } from "@builder.io/qwik";
import { cn } from "~/common/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "underline" | "filled" | "default";
  errorMsg?: string;
  label: string;
}

export default component$<InputProps>(
  ({ variant = "default", label, errorMsg, ...props }) => {
    const inputVariants = {
      filled: cn(
        "bg-ghost px-[10px] pt-5 pb-1",
        "border-b-[2px] border-r-md border-input",
        "rounded-t-sm",
      ),
      underline: cn("bg-transparent py-2 border-b-[2px] border-input"),
      default: cn(
        "bg-transparent rounded-md px-[10px] py-2",
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
        "top-[12px] ml-[10px] bg-transparent",
        "translate-x-[-3px] translate-y-[-12px]",
        "peer-focus:translate-x-[-3px] peer-focus:translate-y-[-12px]",
      ),
      underline: cn(
        "top-[8px]",
        "translate-x-[-3px] translate-y-[-17px]",
        "peer-focus:translate-x-[-3px] peer-focus:translate-y-[-17px]",
      ),
      default: cn(
        "top-[8px] ml-[10px]",
        "translate-x-[-3px] translate-y-[-17px]",
        "peer-focus:translate-x-[-3px] peer-focus:translate-y-[-17px]",
      ),
    };

    return (
      <div class="pt-3 w-full">
        <div class="relative w-full">
          <input
            {...props}
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
              "text-input text-[0.8em] pointer-events-none",
              "duration-100 ease-out",
              "peer-placeholder-shown:text-[1em]", // default state
              "peer-placeholder-shown:translate-x-[0] peer-placeholder-shown:translate-y-[0]", // default state
              "peer-focus:z-[10] peer-focus:text-[0.8em]",
              labelVariants[variant],
            )}
          >
            {label}
          </p>
        </div>
        <p class="text-destructive text-xs">{errorMsg}</p>
      </div>
    );
  },
);
