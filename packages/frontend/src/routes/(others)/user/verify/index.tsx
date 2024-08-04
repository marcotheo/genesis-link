import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import Heading from "~/components/heading/heading";
import { cn, qwikFetch } from "~/common/utils";

interface Response {
  status: string;
  message: string;
  data: {
    Confirmed: boolean;
  };
}

export const useVerifyUser = routeLoader$(async (requestEvent) => {
  const queryParams = new URLSearchParams(requestEvent.url.searchParams);
  const username = queryParams.get("username");
  const code = queryParams.get("code");

  if (!username || !code)
    return {
      verified: false,
      message: "Invalid Request",
    };

  try {
    await qwikFetch<Response>("/user/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        code: code,
      }),
    });

    return {
      verified: true,
      message: "User Verified",
    };
  } catch (err: any) {
    console.log("ERROR", err);

    return {
      verified: false,
      message: err.message ?? "User not Verified",
    };
  }
});

export default component$(() => {
  const signal = useVerifyUser();

  if (signal.value.verified)
    return (
      <div
        class={cn("w-full h-full", "flex justify-center items-center", "gap-3")}
      >
        <Heading>User Verified</Heading>
      </div>
    );

  return (
    <div
      class={cn("w-full h-full", "flex justify-center items-center", "gap-3")}
    >
      <Heading>{signal.value.message}</Heading>
    </div>
  );
});
