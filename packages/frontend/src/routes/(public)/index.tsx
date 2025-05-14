import type { DocumentHead } from "@builder.io/qwik-city";
import Button from "~/components/button/button";
import { component$ } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <div class="overflow-hidden h-full">
      <div class={cn("h-full relative ", "flex")}>
        <div
          class={cn(
            "w-full xl:w-[30%]",
            "relative bg-transparent",
            "flex flex-col max-xl:items-center",
            "gap-10 z-50",
          )}
        >
          <div
            class={cn("flex flex-col", "max-xl:items-center", "gap-6 mt-10")}
          >
            <h1
              class={cn(
                "font-secondary font-bold",
                "text-center xl:text-left",
                "text-4xl md:text-[3em]",
                "max-w-2xl xl:max-w-[30rem]",
                "leading-[3rem] sm:leading-[4rem]",
              )}
            >
              Connect with <span class="text-primary">Opportunities</span> That
              Make a Difference
            </h1>

            <p
              class={cn(
                "max-w-[30rem] leading-7 font-semibold",
                "text-center xl:text-left",
                "text-xs sm:text-sm",
              )}
            >
              Find your dream job or volunteer to create impact and discover
              meaningful opportunities tailored just for you.
            </p>
          </div>

          <div>
            {" "}
            <Button class="font-bold font-secondary rounded-md" size="lg">
              GET STARTED
            </Button>
          </div>
        </div>

        {/* 3D section */}
        {/* <div class="w-[70%] h-full relative max-xl:hidden">
          <div
            class={cn(
              "w-full h-full absolute",
              "-top-20 -right-10",
              "bg-transparent",
            )}
          >
            <script
              type="module"
              src="https://unpkg.com/@splinetool/viewer@1.9.48/build/spline-viewer.js"
            ></script>
            <spline-viewer
              loading-anim-type="spinner-small-dark"
              url="https://prod.spline.design/uiYl1sSX1ATk5azZ/scene.splinecode"
            ></spline-viewer>
          </div>
        </div> */}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
  meta: [
    {
      name: "description",
      content: "ark point landing page",
    },
  ],
};
