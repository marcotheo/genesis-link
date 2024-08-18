import type { DocumentHead } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import Button from "~/components/button/button";

const Th = component$(() => {
  return (
    <th class="py-3 border border-slate-700 ">
      <Slot />
    </th>
  );
});

const Td = component$(() => {
  return (
    <td class="py-3 border border-slate-700 ">
      <Slot />
    </td>
  );
});

export default component$(() => {
  return (
    <div class="overflow-hidden">
      <br />
      <div class="flex justify-end">
        <Button class="text-3xl" size="sm" variant="outline">
          +
        </Button>
      </div>

      <br />

      <div>
        <table class="w-full table border border-collapse">
          <thead>
            <tr>
              <Th>Column 1</Th>
              <Th>Column 2</Th>
              <Th>Column 3</Th>
              <Th>Column 4</Th>
              <Th>Column 5</Th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-zinc-800">
              <Td>Row 1, Cell 1</Td>
              <Td>Row 1, Cell 2</Td>
              <Td>Row 1, Cell 3</Td>
              <Td>Row 1, Cell 4</Td>
              <Td>Row 1, Cell 5</Td>
            </tr>
            <tr>
              <Td>Row 2, Cell 1</Td>
              <Td>Row 2, Cell 2</Td>
              <Td>Row 2, Cell 3</Td>
              <Td>Row 2, Cell 4</Td>
              <Td>Row 2, Cell 5</Td>
            </tr>
          </tbody>
        </table>
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
