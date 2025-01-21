import {
  InitialValues,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { $, component$ } from "@builder.io/qwik";
import * as v from "valibot";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { cn, RegexValidations } from "~/common/utils";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import Checkbox from "~/components/checkbox/checkbox";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import Alert from "~/components/alert/alert";

const SignUpSchema = v.pipe(
  v.object({
    firstName: v.pipe(v.string(), v.nonEmpty("Please enter first name.")),
    lastName: v.pipe(v.string(), v.nonEmpty("Please enter last name.")),
    email: v.pipe(
      v.string(),
      v.nonEmpty("Please enter your email."),
      v.email("The email address is badly formatted."),
    ),
    password: v.pipe(
      v.string(),
      v.nonEmpty("Please enter your password."),
      v.minLength(8, "Your password must have 8 characters or more."),
      v.maxLength(64, "Your password must not have more than 64 characters"),
      v.regex(
        RegexValidations.hasSpecialChar,
        "Your password must have special character",
      ),
      v.regex(
        RegexValidations.hasLowerCase,
        "Your password must have lower case",
      ),
      v.regex(
        RegexValidations.hasUpperCase,
        "Your password must have upper case",
      ),
      v.regex(RegexValidations.hasNumber, "Your password must have a number"),
    ),
    confirmPassword: v.pipe(
      v.string(),
      v.nonEmpty("Please confirm your password."),
    ),
    consent: v.boolean(),
  }),
  v.forward(
    v.check(
      ({ password, confirmPassword }) => password === confirmPassword,
      "Password do not match",
    ),
    ["confirmPassword"],
  ),
  v.forward(
    v.check(
      ({ consent }) => !!consent,
      "Can't proceed withtout accepting terms",
    ),
    ["consent"],
  ),
);

type SignUpForm = v.InferInput<typeof SignUpSchema>;

export const useFormLoader = routeLoader$<InitialValues<SignUpForm>>(() => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  consent: false,
}));

export default component$(() => {
  const { mutate, state } = useMutate("POST /auth/register");

  const [signUpForm, { Form, Field }] = useForm<SignUpForm>({
    loader: useFormLoader(),
    validate: valiForm$(SignUpSchema),
  });

  const handleSubmit = $<SubmitHandler<SignUpForm>>(async (values) => {
    try {
      const response = await mutate({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });

      if (response.result) reset(signUpForm);

      if (response.error) console.log("Error form", response.error);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div class={cn("flex flex-col items-center", "h-full w-full")}>
      <LoadingOverlay open={state.loading}>
        Processing Registration
      </LoadingOverlay>

      <div
        class={cn(
          "w-full md:w-[500px] md:mt-[100px]",
          "md:bg-surface overflow-visible",
          "sm:p-8",
          "rounded-xl md:shadow-xl",
        )}
      >
        <Heading class="pb-4">Sign Up</Heading>

        <Alert
          open={!!state.success}
          variant="success"
          title="Success"
          message="email verification sent"
        />

        <Alert
          open={!!state.error}
          variant="error"
          title="Error"
          message={state.error ?? ""}
        />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <div class="flex gap-3">
            <Field name="firstName">
              {(field, props) => (
                <Input
                  {...props}
                  label="First Name"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
            <Field name="lastName">
              {(field, props) => (
                <Input
                  {...props}
                  label="Last Name"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
          </div>

          <Field name="email">
            {(field, props) => (
              <Input
                {...props}
                type="email"
                label="Email"
                variant="filled"
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>

          <Field name="password">
            {(field, props) => (
              <Input
                {...props}
                type="password"
                label="Password"
                variant="filled"
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>

          <Field name="confirmPassword">
            {(field, props) => (
              <Input
                {...props}
                type="password"
                label="Confirm Password"
                variant="filled"
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>

          <Field name="consent" type="boolean">
            {(field, props) => (
              <Checkbox
                inputProps={props}
                value={field.value}
                errorMsg={field.error}
              >
                <p class="max-sm:text-sm">
                  By registering, you agree to the processing of your personal
                  data by Ark Point as described in the{" "}
                  <span class="text-primary">Privacy Policy</span>.{" "}
                </p>
              </Checkbox>
            )}
          </Field>

          <Button type="submit">Sign up</Button>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Sign up - Ark Point",
  meta: [
    {
      name: "description",
      content: "Sign Up here at Ark Point",
    },
  ],
};
