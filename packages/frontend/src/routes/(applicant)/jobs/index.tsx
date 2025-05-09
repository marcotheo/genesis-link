import {
  component$,
  createContextId,
  Signal,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { DocumentHead, routeLoader$ } from "@builder.io/qwik-city";

import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";
import Filters from "./Filters";
import TabLink from "./TabLink";
import List from "./List";

type FilterState = {
  keyword: Signal<string>;
  page: Signal<number>;
  workSetup?: Signal<string>;
  province?: Signal<string>;
  city?: Signal<string>;
};

export const SearchJobCtx = createContextId<FilterState>("search.job.context");

export const useSearchJobsParams = routeLoader$(({ query }) => {
  const page = query.get("page") || 0;
  const keyword = query.get("keyword") || null;

  return {
    page: page ? parseInt(page, 10) : 0,
    keyword,
  };
});

export default component$(() => {
  const params = useSearchJobsParams();
  const page = useSignal(params.value.page);
  const keyword = useSignal(params.value.keyword ?? "");
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

      <div class="w-full border-b border-soft pb-[0.9rem]">
        <div class="flex gap-4 font-semibold font-primary">
          <TabLink title="Search Jobs" to="/jobs" />
          <TabLink title="Saved Jobs" to="/jobs/saved" />
        </div>
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
