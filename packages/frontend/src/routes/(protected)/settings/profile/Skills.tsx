import { component$ } from "@builder.io/qwik";

import { useQuery } from "~/hooks/use-query/useQuery";
import Button from "~/components/button/button";
import { GetUserSkills } from "~/common/types";
import { cn } from "~/common/utils";

const SkillList = component$(() => {
  const { state } = useQuery<GetUserSkills>(
    "/users/skills",
    {},
    { runOnRender: true },
  );

  return (
    <div>
      {state.result?.data.skills ? (
        "hello"
      ) : (
        <div
          class={cn(
            "w-full flex flex-col",
            "justify-center items-center min-[1100px]:items-end",
          )}
        >
          <div>
            <Button class="px-10" variant="ghost">
              + Add Skills
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export default component$(() => {
  return (
    <div
      class={cn(
        "flex flex-col min-[1100px]:flex-row",
        "min-[1100px]:items-center justify-between",
        "max-[1100px]:gap-3",
        "py-3",
      )}
    >
      <div>
        <h1 class="text-xl font-semibold">Skills</h1>
        <p class="text-gray-500 text-sm max-md:hidden">review or add skills</p>
      </div>

      <SkillList />
    </div>
  );
});
