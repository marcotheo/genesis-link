import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";

const CheckIcon = component$<{
  class?: string;
}>((props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class={cn("size-4 text-white font-bold", props.class)}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  );
});

interface CheckboxProps {
  name: string;
}

export default component$<CheckboxProps>(({ name }) => {
  return (
    <div>
      <div class="flex gap-3 items-center group relative">
        <input
          type="checkbox"
          id={name}
          name={name}
          class={cn(
            "peer absolute z-[60] bg-transparent",
            "appearance-none focus:outline-none",
            "w-6 h-6 cursor-pointer",
            "border border-input rounded-md overflow-hidden",
            "hover:ring ring-gray-300 dark:ring-gray-700",
            "duration-300",
          )}
        />

        <div
          class={cn(
            "p-1 brightness-125 absolute",
            "peer-checked:bg-primary rounded-md",
            "peer-checked:animate-fade-in-scale",
            "animate-fade-out-scale",
          )}
        >
          <CheckIcon />
        </div>

        <div
          class={cn(
            "p-1 brightness-125",
            "peer-checked:bg-transparent rounded-md",
            "peer-checked:animate-fade-out-scale",
            "animate-fade-in-scale",
          )}
        >
          <CheckIcon class="opacity-0" />
        </div>

        <label for={name}>
          <Slot />
        </label>
      </div>
    </div>
  );
});
