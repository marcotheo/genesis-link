import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";
import dayjs from "dayjs";

import { useAuthHeadersLoader } from "~/routes/layout";
import { TbEdit } from "@qwikest/icons/tablericons";
import { cn, qwikFetch } from "~/common/utils";
import { GetUserAPI } from "~/common/types";

export const useAccountDetailsLoader = routeLoader$(
  async ({ resolveValue }) => {
    try {
      const headers = await resolveValue(useAuthHeadersLoader);

      if (!headers) return null;

      const res = await qwikFetch<GetUserAPI>("/users/account/details", {
        method: "GET",
        headers,
      });

      return { ...res.data };
    } catch (err: any) {
      console.log("Error:", err);

      return null;
    }
  },
);

const Item = component$<{ label: string; value: string }>(
  ({ label, value }) => {
    return (
      <div class="p-5 w-96 bg-soft relative rounded-md">
        <div
          class={cn(
            "absolute top-3 right-3",
            "cursor-pointer hover:text-primary duration-300",
          )}
        >
          <TbEdit />
        </div>

        <p>
          <span class="font-semibold">{label}:</span> {value}
        </p>
      </div>
    );
  },
);

export default component$(() => {
  const result = useAccountDetailsLoader();

  return (
    <div class="mt-5 space-y-5">
      <Item label="Email" value={result.value?.email ?? ""} />
      <Item
        label="Mobile Number"
        value={!result.value?.mobileNumber ? "N/A" : result.value?.mobileNumber}
      />
      <Item
        label="Resume"
        value={!result.value?.resumelink ? "N/A" : result.value.resumelink}
      />
      <Item
        label="Registered At"
        value={dayjs(result.value?.createdAt).format("MMM DD, YYYY")}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Profile",
  meta: [
    {
      name: "description",
      content: "manage profile settings",
    },
  ],
};
