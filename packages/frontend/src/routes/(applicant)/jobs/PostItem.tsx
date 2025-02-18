import { TbBookmark, TbBookmarkFilled } from "@qwikest/icons/tablericons";
import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import { cn, formatNumberWithCommas, timeAgo } from "~/common/utils";
import Heading from "~/components/heading/heading";
import { SearchJobsApi } from "~/types/post";

interface Props {
  postData: SearchJobsApi["response"]["data"]["posts"][0];
}

export default component$<Props>(({ postData }) => {
  return (
    <Link href={"/jobs/" + postData.postId}>
      <div
        class={cn(
          "w-full p-5 space-y-5",
          "border-t border-soft",
          "animate-fade-in-slide",
          "duration-300",
          "dark:hover:brightness-150 hover:brightness-90",
        )}
      >
        <div class="flex flex-row justify-between items-start">
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

          <button
            class={cn("text-5xl", "duration-300", "hover:brightness-150")}
            // onClick$={toggleSavePost}
          >
            {postData.isSaved ? <TbBookmarkFilled /> : <TbBookmark />}
          </button>
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
  );
});
