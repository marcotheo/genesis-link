import type { DocumentHead } from "@builder.io/qwik-city";
import Button from "~/components/button/button";
import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="overflow-hidden">
      <br />
      <div class="flex justify-end">
        <Button class="text-3xl" size="sm" variant="outline">
          +
        </Button>
      </div>
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
