import type { DocumentHead } from "@builder.io/qwik-city";
import CdnImage from "~/components/cdn-image/cdn-image";
import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="overflow-hidden">
      <br />
      <div class="flex flex-col gap-3 text-center">LANDING PAGE</div>
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
