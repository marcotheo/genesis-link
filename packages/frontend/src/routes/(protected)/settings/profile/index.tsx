import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";
import dayjs from "dayjs";

import { useAuthHeadersLoader } from "~/routes/layout";
import { cn, qwikFetch } from "~/common/utils";
import { GetUserAPI } from "~/common/types";
import Skills from "./Skills";
import Basic from "./Basic";

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

export default component$(() => {
  return (
    <div class="space-y-5">
      <div class="w-full bg-soft h-[0.1rem]" />

      <Basic />

      <div class="w-full bg-soft h-[0.1rem]" />

      <Skills />
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
