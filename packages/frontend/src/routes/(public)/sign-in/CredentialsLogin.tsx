import {
  InitialValues,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { Link, routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { $, component$, useContext } from "@builder.io/qwik";
import * as v from "valibot";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { AuthContext } from "~/providers/auth/auth";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { GoogleIcon } from "~/components/icons/icons";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import Alert from "~/components/alert/alert";
import { cn } from "~/common/utils";

const SignInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email("The email address is badly formatted."),
  ),
  password: v.pipe(v.string(), v.nonEmpty("Please enter your password.")),
});

type SignInForm = v.InferInput<typeof SignInSchema>;

export default component$(() => {
  const authCtx = useContext(AuthContext);

  const navigate = useNavigate();

  const { mutate, state } = useMutate("POST /auth/signin");

  const [signInForm, { Form, Field }] = useForm<SignInForm>({
    loader: {
      value: {
        email: "",
        password: "",
      },
    },
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

      if (response.result) {
        const unixTimestamp = Math.floor(Date.now() / 1000);
        authCtx.ExpiresIn = response.result.data.ExpiresIn + unixTimestamp;
        reset(signInForm);
        navigate("/");
      }

      if (response.error) console.log("Error form", response.error);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div>
      <LoadingOverlay open={state.loading}>Signing In</LoadingOverlay>

      <Alert
        open={!!state.error}
        variant="error"
        title="Error"
        message={state.error ?? ""}
      />

      <Form class="flex flex-col gap-4" onSubmit$={handleSubmit}>
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
    </div>
  );
});
