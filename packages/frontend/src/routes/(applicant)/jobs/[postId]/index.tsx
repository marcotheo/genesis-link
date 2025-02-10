import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import { timeAgo, cn, formatNumberWithCommas } from "~/common/utils";
import { useQuery } from "~/hooks/use-query/useQuery";

import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";

export const usePostId = routeLoader$(({ params }) => {
  const { postId } = params; // Extract the route parameter
  return {
    postId,
  };
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
      <div class={cn("h-full", "flex flex-col gap-10")}>
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

          <Button class="px-10">Apply</Button>
        </div>

        <div class={cn("flex flex-col gap-10", "overflow-y-auto grow")}>
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
        </div>
      </div>
    </div>
  );
});
