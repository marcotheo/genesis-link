import { TbBookmark, TbBookmarkFilled } from "@qwikest/icons/tablericons";
import { $, component$, useContext } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import { cn, formatNumberWithCommas, timeAgo } from "~/common/utils";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useCache } from "~/hooks/use-cache/useCache";
import Heading from "~/components/heading/heading";
import { SearchJobsApi } from "~/types/post";
import { SavedJobsCtx } from ".";

const BookMark = component$<{
  postId: string;
  isSaved: boolean;
}>(({ postId, isSaved }) => {
  const savedJobCtx = useContext(SavedJobsCtx);

  const { mutate: savePost } = useMutate("POST /posts/{postId}/save");
  const { mutate: deleteSavedPost } = useMutate("DELETE /posts/{postId}/save");

  const { setCacheData } = useCache("GET /users/saved-posts", {
    queryStrings: {
      page: savedJobCtx.page,
    },
  });

  const toggleSavePost = $(async () => {
    let newIsSaved = isSaved;

    if (!isSaved) {
      const result = await savePost({
        pathParams: { postId },
      });

      newIsSaved = !!result.result?.data.savePostId;
    } else {
      try {
        await deleteSavedPost({
          pathParams: { postId },
        });

        newIsSaved = false;
      } catch (err) {
        console.log("deleting saved post failed");
      }
    }

    await setCacheData((cached) => {
      const data = (cached?.data.posts ?? []).map((v) => {
        return {
          ...v,
          isSaved: v.postId === postId ? newIsSaved : v.isSaved,
        };
      });

      return {
        status: "",
        message: "",
        data: {
          posts: data,
        },
      };
    });
  });

  return (
    <button
      class={cn(
        "absolute z-50",
        "top-2 md:top-5 right-0 md:right-3",
        "text-5xl",
        "duration-300",
        "hover:brightness-150",
      )}
      onClick$={toggleSavePost}
    >
      {isSaved ? <TbBookmarkFilled /> : <TbBookmark />}
    </button>
  );
});

interface Props {
  postData: SearchJobsApi["response"]["data"]["posts"][0];
}

export default component$<Props>(({ postData }) => {
  return (
    <div class="relative">
      <BookMark postId={postData.postId} isSaved={postData.isSaved} />

      <Link href={"/jobs/" + postData.postId}>
        <div
          class={cn(
            "w-full p-5 space-y-5",
            "border-b border-soft",
            "animate-fade-in-slide",
            "duration-300",
            "dark:hover:brightness-150 hover:brightness-90",
          )}
        >
          <div class="flex flex-col">
            <p class="text-sm text-input">
              {"Posted " + timeAgo(postData.postedAt)}
            </p>

            <div
              class={cn("flex flex-col lg:flex-row", "lg:items-center gap-5")}
            >
              <Heading>{postData.title}</Heading>

              <div
                class={cn(
                  "flex flex-col justify-center",
                  "lg:pl-5 lg:border-l lg:border-l-text",
                )}
              >
                <div
                  class={cn(
                    "flex flex-col md:flex-row",
                    "md:items-center md:gap-3",
                    "text-lg font-medium",
                  )}
                >
                  <p>{postData.company}</p>
                  <div class="w-2 h-2 rounded-full bg-text max-md:hidden" />
                  <p>
                    {postData.jobType} - {postData.workSetup}
                  </p>
                </div>
                <p class="text-sm text-input">
                  {postData.salaryCurrency}{" "}
                  {formatNumberWithCommas(postData.salaryAmountMin)} -{" "}
                  {formatNumberWithCommas(postData.salaryAmountMax)} |{" "}
                  {postData.country}, {postData.city}
                </p>
              </div>
            </div>
          </div>

          <p>{postData.description}</p>

          <div class="flex flex-wrap gap-3 items-center">
            {postData.tags.map((v) => (
              <div key={v} class="rounded-full px-3 py-1 bg-soft text-sm">
                {v}
              </div>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
});
