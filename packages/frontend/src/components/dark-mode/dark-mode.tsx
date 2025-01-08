import { TbMoon, TbSun } from "@qwikest/icons/tablericons";
import { component$, useSignal } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export default component$(() => {
  const isDark = useSignal(true);

  return (
    <button
      aria-label="dark-mode-toggle"
      class={cn(
        "p-3 rounded-md cursor-pointer",
        "transition-[background-color] duration-150 ease-linear text-text",
        isDark.value ? "hover:bg-surface" : "hover:bg-gray-200",
      )}
      onClick$={() => {
        if (isDark.value) {
          document.documentElement.classList.remove("dark");
          isDark.value = false;
        } else {
          document.documentElement.classList.add("dark");
          isDark.value = true;
        }
      }}
    >
      {isDark.value ? (
        <div
          class={cn(
            "bg-transparent",
            "text-3xl min-[440px]:text-4xl lg:text-5xl",
            "animate-fade-in-slide duration-200",
          )}
        >
          <TbMoon />
        </div>
      ) : (
        <div
          class={cn(
            "bg-transparent",
            "text-3xl min-[440px]:text-4xl lg:text-5xl",
            "animate-fade-in-slide duration-200",
          )}
        >
          <TbSun />
        </div>
      )}
    </button>
  );
});
