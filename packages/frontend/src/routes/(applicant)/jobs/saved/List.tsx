import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { TbBookmarkMinus } from "@qwikest/icons/tablericons";
import { component$, useContext } from "@builder.io/qwik";

import { useQuery } from "~/hooks/use-query/useQuery";
import { cn } from "~/common/utils";
import PostItem from "./PostItem";
import { SavedJobsCtx } from ".";

export default component$(() => {
  const savedJobCtx = useContext(SavedJobsCtx);

  const { state } = useQuery(
    "GET /users/saved-posts",
    {
      queryStrings: {
        page: savedJobCtx.page,
      },
    },
    {
      runOnRender: true,
    },
  );

  return (
    <>
      <LoadingOverlay open={state.loading}>Fetching Saved Posts</LoadingOverlay>

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
            <TbBookmarkMinus font-size="100px" />
            <p class={cn("text-gray-500 text-xl text-center")}>
              No Saved Posts
            </p>
          </div>
        )}
      </div>
    </>
  );
});
