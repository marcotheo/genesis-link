import { component$ } from "@builder.io/qwik";

import { timeAgo, cn, formatNumberWithCommas } from "~/common/utils";
import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";
import { useOrgId } from "../../../../layout";

export default component$(() => {
  const pathParams = useOrgId();

  const { state } = useQuery(
    "GET /posts/{postId}",
    {
      pathParams: {
        postId: pathParams.value.postId,
      },
    },
    {
      runOnRender: true,
    },
  );

  return (
    <div class={cn("h-full", "flex flex-col gap-10", "pb-10")}>
      <div>
        {state.loading ? (
          <div class="px-3 py-2 animate-pulse bg-soft w-40 h-2 rounded-md mb-1" />
        ) : (
          <p class="text-sm text-input">
            {"Posted " + timeAgo(state.result?.data.postedAt ?? 0)}
          </p>
        )}

        <div class={cn("flex flex-col lg:flex-row", "lg:items-center gap-5")}>
          {state.loading ? (
            <div class="px-3 py-4 animate-pulse bg-soft w-56 h-14 rounded-md" />
          ) : (
            <Heading class="text-3xl md:text-5xl">
              {state.result?.data.title}
            </Heading>
          )}

          <div
            class={cn(
              "flex flex-col justify-center",
              "lg:pl-5 lg:border-l lg:border-l-text",
            )}
          >
            {state.loading ? (
              <div class="px-3 py-4 animate-pulse bg-soft w-72 h-14 rounded-md" />
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <div class="space-y-1">
        <Heading class="text-2xl md:text-4xl">Position Overview</Heading>
        {state.loading ? (
          <div class="space-y-2">
            <div class="px-3 py-2 animate-pulse bg-soft w-full h-2 rounded-md" />
            <div class="px-3 py-2 animate-pulse bg-soft w-full h-2 rounded-md" />
            <div class="px-3 py-2 animate-pulse bg-soft w-full h-2 rounded-md" />
            <div class="px-3 py-2 animate-pulse bg-soft w-full h-2 rounded-md" />
          </div>
        ) : (
          <p class="leading-8">{state.result?.data.description}</p>
        )}
      </div>
    </div>
  );
});
