import { TbBookmark, TbBookmarkFilled } from "@qwikest/icons/tablericons";
import { routeLoader$ } from "@builder.io/qwik-city";
import { $, component$ } from "@builder.io/qwik";

import { timeAgo, cn, formatNumberWithCommas } from "~/common/utils";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useQuery } from "~/hooks/use-query/useQuery";
import { useCache } from "~/hooks/use-cache/useCache";
import Heading from "~/components/heading/heading";
import ApplicationForm from "./ApplicationForm";
import AdditionalHtml from "./AdditionalHtml";

export const usePostId = routeLoader$(({ params }) => {
  const { postId } = params; // Extract the route parameter
  return {
    postId,
  };
});

const BookMark = component$<{ postId: string }>(({ postId }) => {
  const { state } = useQuery(
    "GET /posts/{postId}/save",
    {
      pathParams: {
        postId,
      },
    },
    {
      runOnRender: true,
    },
  );

  const { mutate: savePost } = useMutate("POST /posts/{postId}/save");
  const { mutate: deleteSavedPost } = useMutate("DELETE /posts/{postId}/save");

  const { setCacheData } = useCache("GET /posts/{postId}/save", {
    pathParams: {
      postId,
    },
  });

  const toggleSavePost = $(async () => {
    let savedPostId = "";

    if (!state.result?.data.savePostId) {
      const result = await savePost({
        pathParams: { postId },
      });

      savedPostId = result.result?.data.savePostId ?? "";
    } else {
      try {
        await deleteSavedPost({
          pathParams: { postId },
        });
      } catch (err) {
        savedPostId = state.result.data.savePostId;
        console.log("deleting saved post failed");
      }
    }

    await setCacheData((cached) => {
      return {
        status: "",
        message: "",
        data: {
          savePostId: savedPostId,
        },
      };
    });
  });

  if (state.loading) return <div class="h-11 w-8 bg-soft rounded" />;

  return (
    <button
      class={cn("text-5xl", "duration-300", "hover:brightness-150")}
      onClick$={toggleSavePost}
    >
      {state.result?.data.savePostId ? <TbBookmarkFilled /> : <TbBookmark />}
    </button>
  );
});

export default component$(() => {
  const result = usePostId();

  const { state } = useQuery(
    "GET /posts/{postId}",
    {
      pathParams: {
        postId: result.value.postId,
      },
    },
    {
      runOnRender: true,
    },
  );

  if (state.loading) return <div>loading ...</div>;

  return (
    <div class="h-full">
      <div class={cn("h-full", "flex flex-col gap-10", "pb-10")}>
        {/* post header */}
        <div
          class={cn(
            "flex flex-col min-[1100px]:flex-row",
            "min-[1100px]:justify-between items-start min-[1100px]:items-end",
            "gap-5 min-[1100px]:gap-0",
          )}
        >
          <div>
            <p class="text-sm text-input">
              {"Posted " + timeAgo(state.result?.data.postedAt ?? 0)}
            </p>

            <div
              class={cn("flex flex-col lg:flex-row", "lg:items-center gap-5")}
            >
              <Heading class="text-3xl md:text-5xl">
                {state.result?.data.title}
              </Heading>

              <div
                class={cn(
                  "flex flex-col justify-center",
                  "lg:pl-5 lg:border-l lg:border-l-text",
                )}
              >
                <div
                  class={cn(
                    "flex flex-col min-[500px]:flex-row",
                    "min-[500px]:items-center min-[500px]:gap-3",
                    "text-lg font-medium",
                  )}
                >
                  <p>{state.result?.data.company}</p>
                  <div class="w-2 h-2 rounded-full bg-text max-[500px]:hidden" />
                  <p>
                    {state.result?.data.jobType} -{" "}
                    {state.result?.data.workSetup}
                  </p>
                </div>
                <p class="text-sm text-input">
                  {state.result?.data.salaryCurrency}{" "}
                  {formatNumberWithCommas(
                    state.result?.data.salaryAmountMin ?? 0,
                  )}{" "}
                  -{" "}
                  {formatNumberWithCommas(
                    state.result?.data.salaryAmountMax ?? 0,
                  )}{" "}
                  | {state.result?.data.country}, {state.result?.data.city}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <BookMark postId={result.value.postId} />
            <ApplicationForm />
          </div>
        </div>

        <div class={cn("flex flex-col gap-10", "overflow-y-auto grow pr-1")}>
          {/* post tags */}
          <div class="flex flex-wrap gap-3 items-center">
            {state.result?.data.tags.map((v) => (
              <div key={v} class="rounded-full px-3 py-1 bg-soft text-sm">
                {v}
              </div>
            ))}
          </div>

          {/* post overview */}
          <div class="space-y-1">
            <Heading class="text-2xl md:text-4xl">Position Overview</Heading>
            <p class="leading-8">{state.result?.data.description}</p>
          </div>

          {/* post Responsibilities and Qualifications */}
          <div>
            <Heading class="text-xl md:text-3xl">Responsibilities:</Heading>
            <ul>
              {state.result?.data.requirements
                .filter((v) => v.requirementType === "responsibility")
                .map((v, idx) => (
                  <li key={idx} class="text-lg">
                    {v.requirement}
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <Heading class="text-xl md:text-3xl">Qualifications:</Heading>
            <ul>
              {state.result?.data.requirements
                .filter((v) => v.requirementType === "qualification")
                .map((v, idx) => (
                  <li key={idx} class="text-lg">
                    {v.requirement}
                  </li>
                ))}
            </ul>
          </div>

          {/* additional info html content */}
          {state.result?.data.additionalInfoLink && (
            <AdditionalHtml htmlLink={state.result.data.additionalInfoLink} />
          )}
        </div>
      </div>
    </div>
  );
});
