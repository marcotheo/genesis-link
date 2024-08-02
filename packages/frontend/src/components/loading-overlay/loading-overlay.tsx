import { component$, Slot } from "@builder.io/qwik";
import Heading from "../heading/heading";
import { cn } from "~/common/utils";

interface LoadingOverlayProps {
  open: boolean;
}

export default component$<LoadingOverlayProps>(({ open }) => {
  return (
    <>
      <div
        class={cn(
          "fixed inset-0 w-full top-0 left-0",
          open ? "bg-[rgba(0,0,0,0.5)] z-[100]" : "bg-transparent z-[-10]",
        )}
      ></div>

      <div
        class={cn(
          "fixed top-0 bottom-0 left-0 right-0 m-auto",
          "w-[90%] md:w-[360px] h-fit p-5",
          "bg-surface rounded-md shadow-lg",
          "text-text z-[100]",
          open === null
            ? "hidden"
            : open
              ? "animate-fade-in-scale"
              : "animate-fade-out-scale",
        )}
      >
        <div class="flex gap-3 items-center justify-center">
          <Heading size="md">
            <Slot />
          </Heading>
          <div class="flex flex-row pl-1 text-4xl">
            <div class="animate-[bounce_0.7s_ease-in-out_-0.3s_infinite] p-[2px] ">
              .
            </div>
            <div class="animate-[bounce_0.7s_ease-in-out_-0.2s_infinite] p-[2px] ">
              .
            </div>
            <div class="animate-[bounce_0.7s_ease-in-out_-0.1s_infinite] p-[2px] ">
              .
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
