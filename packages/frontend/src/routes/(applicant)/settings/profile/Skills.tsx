import { TbLoader } from "@qwikest/icons/tablericons";
import { component$ } from "@builder.io/qwik";

import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";
import { cn } from "~/common/utils";
import SkillForm from "./SkillForm";

const SkillList = component$(() => {
  const { state } = useQuery(
    "GET /users/skills",
    {},
    {
      runOnRender: true,
    },
  );

  return (
    <div
      class={cn(
        "w-full rounded-md",
        "h-40 overflow-y-auto",
        "mt-3 p-5",
        "brightness-95 dark:brightness-110",
      )}
    >
      {state.loading ? (
        <div class="h-full w-full flex justify-center items-center">
          <div class="flex gap-3 items-center">
            <Heading>Loading Skills</Heading>

            <div class="animate-spin text-3xl w-fit h-fit">
              <TbLoader />
            </div>
          </div>
        </div>
      ) : state.result?.data.skills ? (
        <div class="flex flex-wrap gap-2">
          {state.result.data.skills.map((v) => (
            <div
              key={v.skillId}
              class={cn(
                "bg-soft rounded-lg",
                "px-3 sm:px-5 py-3",
                "animate-fade-in-slide",
              )}
            >
              <p class=" text-sm sm:text-base">{v.skillName}</p>
            </div>
          ))}
        </div>
      ) : (
        <div class="h-full w-full flex justify-center">
          <Heading class="text-gray-500 pt-5 md:pt-10">
            No skills defined
          </Heading>
        </div>
      )}
    </div>
  );
});

export default component$(() => {
  return (
    <div
      class={cn(
        "flex flex-col",
        "min-[1100px]:items-center justify-between",
        "max-[1100px]:gap-3",
        "py-3",
      )}
    >
      <div class="flex justify-between w-full">
        <div class="w-fit">
          <h1 class="text-xl font-semibold">Skills</h1>
          <p class="text-gray-500 text-xs sm:text-sm">
            Add and review your skills to showcase your expertise
          </p>
        </div>

        <SkillForm />
      </div>

      <SkillList />
    </div>
  );
});
