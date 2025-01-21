import { DocumentHead, Link, useLocation } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import { GoogleIcon } from "~/components/icons/icons";
import Heading from "~/components/heading/heading";
import CredentialsLogin from "./CredentialsLogin";
import Button from "~/components/button/button";
import { cn } from "~/common/utils";

const LoginHeader = component$(() => {
  const location = useLocation();
  const params = new URLSearchParams(location.url.search);
  const mode = params.get("mode");

  return (
    <div class="space-y-5">
      <div class="flex justify-between items-end">
        <Heading>Sign In</Heading>
        <div
          class={cn(
            "flex items-end",
            "rounded-lg overflow-hidden",
            "border border-primary",
          )}
        >
          <Link
            href="/sign-in?mode=applicant"
            class={cn(
              "w-1/2 py-1 px-4",
              "duration-300",
              mode === "applicant"
                ? "bg-primary text-white"
                : "dark:hover:brightness-125 hover:brightness-95",
            )}
          >
            Applicant
          </Link>
          <Link
            href="/sign-in?mode=employer"
            class={cn(
              "w-1/2 py-1 px-4",
              "duration-300",
              mode === "employer"
                ? "bg-primary text-white"
                : "dark:hover:brightness-125 hover:brightness-95",
            )}
          >
            Employer
          </Link>
        </div>
      </div>

      <div class="flex gap-1 text-sm">
        <p class="text-gray-500">New to Ark Point?</p>
        <Link href="/sign-up">
          <p class="underline text-info">Create an account</p>
        </Link>
        .
      </div>
    </div>
  );
});

export default component$(() => {
  return (
    <div class={cn("flex flex-col items-center", "h-full w-full")}>
      <div
        class={cn(
          "w-full md:w-[500px] md:mt-[100px]",
          "space-y-5",
          "md:bg-surface",
          "sm:p-8",
          "rounded-xl md:shadow-xl",
        )}
      >
        <LoginHeader />

        <CredentialsLogin />

        <div class="flex gap-3 items-center">
          <div class="border-gray-500 w-full h-[1px] bg-gray-500" />
          <p class="whitespace-nowrap text-sm">Or Sign in with</p>
          <div class="border-gray-500 w-full h-[1px] bg-gray-500" />
        </div>

        <Button
          variant="outline"
          class={cn(
            "w-full border-gray-300",
            "flex items-center justify-center gap-1",
          )}
        >
          <GoogleIcon class="bg-transparent text-gray-500 dark:text-gray-400" />
          <p class="bg-transparent">Google</p>
        </Button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Sign In - Ark Point",
  meta: [
    {
      name: "description",
      content: "Sign In here at Ark Point",
    },
  ],
};
