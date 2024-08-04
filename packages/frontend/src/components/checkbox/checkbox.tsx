import { component$, Slot, InputHTMLAttributes } from "@builder.io/qwik";
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
  errorMsg?: string;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  value?: boolean;
}

export default component$<CheckboxProps>(({ errorMsg, inputProps, value }) => {
  return (
    <div>
      <div class="flex gap-3 items-center group relative">
        <input
          {...inputProps}
          checked={value}
          type="checkbox"
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
            "peer-checked:animate-fade-in-scale peer-checked:block",
            "animate-fade-out-scale hidden",
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

        <label for={inputProps.name}>
          <Slot />
        </label>
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
});
