import {
  component$,
  createContextId,
  Signal,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";
import Filters from "./Filters";
import List from "./List";

type FilterState = {
  keyword: Signal<string>;
  page: Signal<number>;
  workSetup?: Signal<string>;
  province?: Signal<string>;
  city?: Signal<string>;
};

export const SearchJobCtx = createContextId<FilterState>("search.job.context");

export default component$(() => {
  const page = useSignal(0);
  const keyword = useSignal("");
  const province = useSignal("");
  const city = useSignal("");
  const workSetup = useSignal("");

  useContextProvider(SearchJobCtx, {
    page,
    keyword,
    province,
    city,
    workSetup,
  });

  return (
    <div
      class={cn(
        "py-8 w-full h-full",
        "flex flex-col gap-5",
        "justify-center items-start",
        "overflow-hidden",
      )}
    >
      <div
        class={cn(
          "w-fit md:w-full mx-auto",
          "flex flex-col md:flex-row md:justify-between",
          "gap-5",
        )}
      >
        <Heading class="text-3xl md:text-5xl">
          Explore and <span class="text-primary">Apply</span>
        </Heading>

        <Filters />
      </div>

      <List />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point - Jobs",
  meta: [
    {
      name: "description",
      content: "ark point's list of available jobs",
    },
  ],
};
