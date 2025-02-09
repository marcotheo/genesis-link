import {
  $,
  component$,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { TbSearchOff } from "@qwikest/icons/tablericons";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useLocation } from "@builder.io/qwik-city";
import { cn } from "~/common/utils";
import PostItem from "./PostItem";
import { SearchJobCtx } from ".";

export default component$(() => {
  const location = useLocation();
  const searchCtx = useContext(SearchJobCtx);
  const hasMounted = useSignal(false);

  const { mutate, state } = useMutate("POST /posts/search/jobs");

  const fetchJobs = $(async () => {
    console.log("Fetching posts related to ", searchCtx.keyword);

    try {
      const res = await mutate({
        bodyParams: {
          page: searchCtx.page ?? 1,
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
    track(() => searchCtx.page);
    track(() => searchCtx.keyword);

    if (!hasMounted.value) {
      // Skip execution on initial mount and route changesasdasdasd
      hasMounted.value = true;
      return;
    }

    fetchJobs();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const queryParams = new URLSearchParams(location.url.search);
    const page = queryParams.get("page") || null;
    const keyword = queryParams.get("keyword") || null;

    if (page) searchCtx.page = parseInt(page, 10);
    if (keyword) searchCtx.keyword = keyword;
  });

  return (
    <>
      <LoadingOverlay open={state.loading}>Searching for jobs</LoadingOverlay>

      <div class={cn("grow overflow-auto w-full relative", "py-5 pr-5")}>
        {state.result?.data.posts && state.result.data.posts.length > 0 ? (
          <div>
            {state.result.data.posts.map((v) => (
              <PostItem key={v.postId} postData={v} />
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
