import { type DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import Skills from "./Skills";
import Basic from "./Basic";

export default component$(() => {
  return (
    <div class="space-y-5">
      <div class="w-full bg-soft h-[0.1rem]" />

      <Basic />

      <div class="w-full bg-soft h-[0.1rem]" />

      <Skills />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
};
