import { Link, type DocumentHead } from "@builder.io/qwik-city";
import Button from "~/components/button/button";
import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="overflow-hidden pb-6 w-full">
      <br />
      <div class="flex justify-end">
        <Link href="/settings/addressess/create">
          <Button class="text-3xl" size="sm" variant="outline">
            +
          </Button>
        </Link>
      </div>
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
