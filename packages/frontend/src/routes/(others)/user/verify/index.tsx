import { Link, routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import Card, { CardContent, CardHeader } from "~/components/card/card";
import { CheckIcon, ErrorIcon } from "~/components/icons/icons";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
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
    await qwikFetch<Response>("/auth/confirm", {
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
        class={cn(
          "w-full h-full",
          "flex justify-center items-center",
          "gap-3",
          "animate-fade-in-scale",
        )}
      >
        <Card class="max-w-[50rem] min-w-[30rem]">
          <CardHeader>
            <CheckIcon class="size-60 text-success mx-auto" />
          </CardHeader>
          <CardContent>
            <div class="flex flex-col gap-3 pb-5">
              <Heading class="text-center" size="md">
                User Verified Successfuly
              </Heading>
              <Link href="/sign-in?mode=applicant">
                <Button class="w-full bg-success hover:bg-success hover:brightness-110">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div
      class={cn(
        "w-full h-full",
        "flex justify-center items-center",
        "gap-3",
        "animate-fade-in-scale",
      )}
    >
      <Card class="max-w-[50rem] min-w-[30rem]">
        <CardHeader>
          <ErrorIcon class="size-60 text-destructive mx-auto" />
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-3 pb-5">
            <Heading class="text-center" size="md">
              {signal.value.message}
            </Heading>
            <Link href="/">
              <Button class="w-full bg-destructive hover:bg-destructive hover:brightness-110">
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
