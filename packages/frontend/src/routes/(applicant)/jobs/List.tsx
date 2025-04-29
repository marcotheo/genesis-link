import { component$, useContext } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { TbSearchOff } from "@qwikest/icons/tablericons";
import { useQuery } from "~/hooks/use-query/useQuery";

import { cn } from "~/common/utils";
import PostItem from "./PostItem";
import { SearchJobCtx } from ".";

export default component$(() => {
  const searchCtx = useContext(SearchJobCtx);

  const { state } = useQuery(
    "GET /posts/search/jobs",
    {
      queryStrings: {
        page: searchCtx.page,
        keyword: searchCtx.keyword,
      },
    },
    {
      cacheTime: 0,
      runOnRender: true,
    },
  );

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
