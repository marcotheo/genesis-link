import { DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="overflow-hidden pb-6 w-full flex justify-center items-center">
      <br />
      Under Construction
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
  meta: [
    {
      name: "description",
      content: "list of available job post",
    },
  ],
};
