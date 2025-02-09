import {
  component$,
  createContextId,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";
import Filters from "./Filters";
import List from "./List";

type FilterState = {
  page?: number;
  keyword: string;
  province: string;
  city: string;
  workSetup: string;
};

export const SearchJobCtx = createContextId<FilterState>("search.job.context");

export default component$(() => {
  const filterState = useStore<FilterState>({
    page: undefined,
    keyword: "",
    province: "",
    city: "",
    workSetup: "",
  });

  useContextProvider(SearchJobCtx, filterState);

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
