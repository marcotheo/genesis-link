import { type DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="overflow-hidden pb-6 w-full flex justify-center items-center">
      <br />
      Addressess
    </div>
  );
});

export const head: DocumentHead = {
  title: "Address settings",
  meta: [
    {
      name: "description",
      content: "manage addressess",
    },
  ],
};
