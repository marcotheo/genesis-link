import type { DocumentHead } from "@builder.io/qwik-city";
import CdnImage from "~/components/cdn-image/cdn-image";
import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="overflow-hidden">
      <br />
      <div class="flex flex-col gap-3">Testing Unpic</div>
      <CdnImage filename="sample" width={600} height={600} alt="sample" />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
