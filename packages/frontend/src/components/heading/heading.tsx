import { component$, Slot, HTMLAttributes } from "@builder.io/qwik";
import { cn } from "~/common/utils";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: "xxl" | "xl" | "lg" | "md" | "sm" | "xs";
}

export default component$<HeadingProps>(({ size = "md", ...props }) => {
  const sizes = {
    xxl: "text-6xl",
    xl: "text-5xl",
    lg: "text-4xl",
    md: "text-3xl",
    sm: "text-2xl",
    xs: "text-xl",
  };

  return (
    <h1
      {...props}
      class={cn("font-secondary font-medium", sizes[size], props.class)}
    >
      <Slot />
    </h1>
  );
});
