import {
  InitialValues,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import {
  DocumentHead,
  Link,
  routeLoader$,
  useNavigate,
} from "@builder.io/qwik-city";
import { $, component$, useContext } from "@builder.io/qwik";
import * as v from "valibot";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { AuthContext } from "~/components/auth-provider/auth-provider";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { GoogleIcon } from "~/components/icons/icons";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import Alert from "~/components/alert/alert";
import { cn } from "~/common/utils";

interface Response {
  status: string;
  message: string;
  data: {
    AccessToken: string;
    IdToken: string;
    ExpiresIn: number;
  };
}

const SignInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email("The email address is badly formatted."),
  ),
  password: v.pipe(v.string(), v.nonEmpty("Please enter your password.")),
});

type SignInForm = v.InferInput<typeof SignInSchema>;

export const useFormLoader = routeLoader$<InitialValues<SignInForm>>(() => ({
  email: "",
  password: "",
}));

export default component$(() => {
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const { mutate, state } = useMutate<Response>("/user/signin");

  const [signInForm, { Form, Field }] = useForm<SignInForm>({
    loader: useFormLoader(),
    validate: valiForm$(SignInSchema),
  });

  const handleSubmit = $<SubmitHandler<SignInForm>>(async (values) => {
    try {
      const response = await mutate(
        {
          email: values.email,
          password: values.password,
        },
        {
          credentials: "include",
        },
      );

      if (response.data) {
        console.log("Form submitted successfully:", response.data.data);
        authCtx.accessToken = response.data.data.AccessToken;
        reset(signInForm);
        navigate("/");
      }

      if (response.error) console.log("Error form", response.error);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div class="flex h-full w-full justify-center">
      <LoadingOverlay open={state.loading}>Signing In</LoadingOverlay>

      <div class={cn("w-[500px] md:mt-[70px]")}>
        <Heading>Sign In</Heading>
        <div class="flex gap-1 text-sm">
          <p class="text-gray-500">New to Genesis Link?</p>
          <Link href="/sign-up">
            <p class="underline text-info">Sign up for an account</p>
          </Link>
          .
        </div>

        <br />

        <Alert
          open={!!state.error}
          variant="error"
          title="Error"
          message={state.error ?? ""}
        />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
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

          <Link href="/password/reset" class="w-fit">
            <p class="text-sm text-gray-500 hover:text-info duration-300  transition-all ease-out">
              Forgot Password?
            </p>
          </Link>

          <Button type="submit">Sign In</Button>
        </Form>

        <br />
        <div class="flex gap-3 items-center">
          <div class="border-gray-500 w-full h-[1px] bg-gray-500" />
          <p class="whitespace-nowrap text-sm">Or Sign in with</p>
          <div class="border-gray-500 w-full h-[1px] bg-gray-500" />
        </div>
        <br />

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
  title: "Sign In - Genesis Link",
  meta: [
    {
      name: "description",
      content: "Sign In here at Genesis Link",
    },
  ],
};
