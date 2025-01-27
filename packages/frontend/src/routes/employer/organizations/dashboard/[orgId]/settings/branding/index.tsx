import { DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import Heading from "~/components/heading/heading";
import AssetsForm from "./AssetsForm";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <>
      <div
        class={cn(
          "flex flex-col min-[1100px]:flex-row",
          "min-[1100px]:items-center justify-between",
          "max-[1100px]:gap-3",
          "py-3",
        )}
      >
        <div>
          <Heading class="max-md:hidden">Visuals & Branding</Heading>
          <p class="text-gray-500 text-sm">
            View and update your company's logo and banner for posts to maintain
            a professional look.
          </p>
        </div>
      </div>

      <AssetsForm />
    </>
  );
});

export const head: DocumentHead = {
  title: "ArkPoint",
};
