import { component$, Slot, ButtonHTMLAttributes } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "lg" | "md" | "sm" | "default";
  variant?: "outline" | "ghost" | "transparent" | "default";
}

export default component$<ButtonProps>(
  ({ size = "default", variant = "default", ...props }) => {
    const sizes = {
      lg: "py-4 px-7",
      md: "py-3 px-6",
      sm: "py-1 px-4 text-md",
      default: "py-2 px-5",
    };

    const variants = {
      outline: "bg-transparent border border-primary hover:bg-primary-soft",
      ghost: "bg-primary-soft hover:brightness-150",
      transparent: "bg-transparent text-text rounded-none",
      default: "bg-primary hover:bg-primary-foreground text-white",
    };

    if (variant !== "transparent")
      return (
        <button
          {...props}
          class={cn(
            "peer font-primary",
            "rounded-md",
            "duration-150 ease-linear",
            sizes[size],
            variants[variant],
            props.class,
          )}
        >
          <Slot />
        </button>
      );

    return (
      <div class="relative w-full">
        <button
          {...props}
          class={cn(
            "peer w-full font-primary",
            "rounded-md",
            "duration-150 ease-linear",
            sizes[size],
            variants[variant],
            props.class,
          )}
        >
          <Slot />
        </button>

        <div
          class={cn(
            "absolute bottom-0",
            "w-full h-[2px]",
            "duration-300",
            "scale-0 bg-primary",
            "peer-hover:scale-100",
          )}
        />
      </div>
    );
  },
);
