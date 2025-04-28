import {
  component$,
  createContextId,
  Signal,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";

import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";
import TabLink from "../TabLink";
import List from "./List";

type FilterState = {
  page: Signal<number>;
};

export const SavedJobsCtx = createContextId<FilterState>("saved.job.context");

export default component$(() => {
  const page = useSignal(1);

  useContextProvider(SavedJobsCtx, {
    page,
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
          Saved <span class="text-primary">Posts</span>
        </Heading>
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
