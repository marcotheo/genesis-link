import { TbSearchOff } from "@qwikest/icons/tablericons";
import { component$ } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <>
      <div class={cn("grow w-full relative")}>
        <div
          class={cn(
            "absolute",
            "top-1/2 left-1/2",
            "-translate-x-1/2 -translate-y-1/2",
            "flex flex-col items-center justify-center",
          )}
        >
          <TbSearchOff font-size="100px" />
          <p class={cn("text-gray-500 text-xl text-center")}>
            Apply filters to search for jobs
          </p>
        </div>
      </div>
    </>
  );
});
