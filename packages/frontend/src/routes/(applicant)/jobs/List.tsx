import {
  $,
  component$,
  isServer,
  useContext,
  useTask$,
} from "@builder.io/qwik";
import { TbSearchOff } from "@qwikest/icons/tablericons";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";
import { SearchJobCtx } from ".";

export default component$(() => {
  const searchCtx = useContext(SearchJobCtx);

  const { mutate, state } = useMutate("POST /posts/search/jobs");

  const fetchJobs = $(async () => {
    console.log("Fetching posts related to ", searchCtx.keyword);

    try {
      const res = await mutate({
        bodyParams: {
          page: 1,
          keyword: searchCtx.keyword,
        },
      });

      if (res.result?.data) console.log("result", res.result.data.posts);
    } catch (err) {
      console.log(
        `Error fetching related jobs for ${searchCtx.keyword} ::`,
        err,
      );
    }
  });

  useTask$(({ track }) => {
    track(() => searchCtx.keyword);

    if (isServer) return;

    fetchJobs();
  });

  return (
    <>
      <LoadingOverlay open={state.loading}>Searching for jobs</LoadingOverlay>

      <div class={cn("grow w-full relative py-5")}>
        {state.result?.data.posts && state.result.data.posts.length > 0 ? (
          <div class="space-y-5">
            {state.result.data.posts.map((v) => (
              <div key={v.postId}>
                <div
                  class={cn(
                    "w-full px-5 py-8",
                    "border-t border-soft",
                    "animate-fade-in-slide",
                  )}
                >
                  <Heading>{v.title}</Heading>
                  <p>{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            class={cn(
              "absolute",
              "top-1/2 left-1/2",
              "-translate-x-1/2 -translate-y-1/2",
              "flex flex-col items-center justify-center",
            )}
          >
            <TbSearchOff font-size="100px" />
            <p class={cn("text-gray-500 text-xl text-center")}>
              Apply filters to search for jobs
            </p>
          </div>
        )}
      </div>
    </>
  );
});
