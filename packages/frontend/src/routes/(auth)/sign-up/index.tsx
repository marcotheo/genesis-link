import Checkbox from "~/components/checkbox/checkbox";
import { DocumentHead } from "@builder.io/qwik-city";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import { component$ } from "@builder.io/qwik";
import Input from "~/components/input/input";
import { cn } from "~/common/utils";

export default component$(() => {
  return (
    <div class="flex h-full w-full justify-center">
      <div class={cn("flex flex-col gap-5", "w-[500px] md:mt-[70px]")}>
        <Heading>Sign Up</Heading>
        <div class=" flex flex-col gap-5">
          <Input label="Email" variant="filled" />
          <Input type="password" label="Password" variant="filled" />
          <Input type="password" label="Confirm Password" variant="filled" />

          <Checkbox name="consent">
            <p class="max-sm:text-sm">
              By registering, you agree to the processing of your personal data
              by Genesis Oppurtunities as described in the{" "}
              <span class="text-primary">Privacy Policy</span>.{" "}
            </p>
          </Checkbox>

          <Button>Sign up</Button>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Sign up - Genesis Oppurtunities",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
