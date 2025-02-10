import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import { timeAgo, cn, formatNumberWithCommas } from "~/common/utils";
import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";

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
    <div>
      <div class="flex flex-col gap-10">
        <div>
          <p class="text-sm text-input">
            {"Posted " + timeAgo(state.result?.data.postedAt ?? 0)}
          </p>

          <div class={cn("flex flex-col lg:flex-row", "lg:items-center gap-5")}>
            <Heading size="xl">{state.result?.data.title}</Heading>

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
                  {state.result?.data.jobType} - {state.result?.data.workSetup}
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

        <div class="flex flex-wrap gap-3 items-center">
          {state.result?.data.tags.map((v) => (
            <div key={v} class="rounded-full px-3 py-1 bg-soft text-sm">
              {v}
            </div>
          ))}
        </div>

        <div class="space-y-1">
          <Heading size="lg">Position Overview</Heading>
          <p class="leading-8">{state.result?.data.description}</p>
        </div>

        <div>
          <Heading size="md">Responsibilities:</Heading>
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
          <Heading size="md">Qualifications:</Heading>
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
  );
});
