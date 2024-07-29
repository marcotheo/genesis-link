import { component$, Slot, HTMLAttributes } from "@builder.io/qwik";
import { cn } from "~/common/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default component$<CardProps>(({ ...props }) => {
  return (
    <div
      {...props}
      class={cn(
        "flex flex-col gap-5",
        "bg-surface max-w-96 min-w-56 p-5",
        "shadow-lg rounded-md overflow-hidden",
        props.class,
      )}
    >
      <Slot />
    </div>
  );
});

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  textPosition?: "left" | "center" | "right";
}

export const CardHeader = component$<CardHeaderProps>(
  ({ textPosition = "left", ...props }) => {
    return (
      <div
        {...props}
        class={cn(
          `text-text text-${textPosition} text-xl`,
          "font-semibold font-primary",
          props.class,
        )}
      >
        <Slot />
      </div>
    );
  },
);

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = component$<CardContentProps>(({ ...props }) => {
  return (
    <div {...props} class={cn("text-text font-primary text-md", props.class)}>
      <Slot />
    </div>
  );
});

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = component$<CardFooterProps>(({ ...props }) => {
  return (
    <div {...props} class={cn("flex", "text-text font-primary", props.class)}>
      <Slot />
    </div>
  );
});
