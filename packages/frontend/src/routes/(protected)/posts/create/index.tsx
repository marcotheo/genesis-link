import {
  InitialValues,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$ } from "@builder.io/qwik";
import * as v from "valibot";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { Link, Form, routeLoader$ } from "@builder.io/qwik-city";
import TextArea from "~/components/text-area/text-area";
import { GoogleIcon } from "~/components/icons/icons";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Select from "~/components/select/select";
import Alert from "~/components/alert/alert";
import Input from "~/components/input/input";
import { cn } from "~/common/utils";

const CreatePostSchema = v.object({
  title: v.pipe(v.string("Required"), v.nonEmpty("Please enter title.")),
  description: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter description."),
  ),
  postType: v.pipe(
    v.union([v.literal("job"), v.literal("volunteer")], "Required"),
    v.nonEmpty("Please choose type."),
  ),
  jobType: v.pipe(
    v.union(
      [
        v.literal("full-time"),
        v.literal("part-time"),
        v.literal("contract"),
        v.literal("internship"),
      ],
      "Required",
    ),
    v.nonEmpty("Please choose job type."),
  ),
  company: v.pipe(v.string("Required"), v.nonEmpty("Please enter company.")),
  location: v.pipe(v.string("Required"), v.nonEmpty("Please enter location.")),
  salary: v.pipe(v.number(), v.toMinValue(1)),
  wfh: v.boolean(),
  email: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter your email."),
    v.email("Invalid email"),
  ),
  phone: v.pipe(v.string(), v.nonEmpty("Please enter phone.")),
  deadline: v.date(),
});

type CreatePostForm = v.InferInput<typeof CreatePostSchema>;

export const useFormLoader = routeLoader$<InitialValues<CreatePostForm>>(
  () => ({
    title: undefined,
    description: undefined,
    postType: undefined,
    jobType: undefined,
    company: undefined,
    location: undefined,
    salary: undefined,
    wfh: false,
    email: undefined,
    phone: undefined,
    deadline: undefined,
  }),
);

export default component$(() => {
  const [createPostForm, { Form, Field }] = useForm<CreatePostForm>({
    loader: useFormLoader(),
    validate: valiForm$(CreatePostSchema),
  });

  const handleSubmit = $<SubmitHandler<CreatePostForm>>(async (values) => {
    try {
      console.log("VALUES", values);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div class="flex h-full w-full justify-center">
      {/* <LoadingOverlay open={state.loading}>Signing In</LoadingOverlay> */}

      <div class={cn("w-[500px] md:mt-[70px]")}>
        <Heading>Create A Post</Heading>

        <br />

        {/* <Alert
          open={!!state.error}
          variant="error"
          title="Error"
          message={state.error ?? ""}
        /> */}

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <Field name="title">
            {(field, props) => (
              <Input
                {...props}
                label="Title"
                variant="filled"
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>{" "}
          <Field name="description">
            {(field, props) => (
              <TextArea
                {...props}
                label="Description"
                variant="filled"
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>
          <div class="flex gap-3">
            <Field name="postType">
              {(field, props) => (
                <Select
                  form={createPostForm}
                  variant="filled"
                  name={props.name}
                  label="Post Type"
                  errorMsg={field.error}
                  options={[
                    { value: "job", label: "job" },
                    { value: "volunteer", label: "volunteer" },
                  ]}
                />
              )}
            </Field>

            <Field name="jobType">
              {(field, props) => (
                <Select
                  form={createPostForm}
                  variant="filled"
                  name={props.name}
                  label="Job Type"
                  errorMsg={field.error}
                  options={[
                    { value: "full-time", label: "full-time" },
                    { value: "part-time", label: "part-time" },
                    { value: "contract", label: "contract" },
                    { value: "internship", label: "internship" },
                  ]}
                />
              )}
            </Field>
          </div>
          <Field name="company">
            {(field, props) => (
              <Input
                {...props}
                label="Company"
                variant="filled"
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>
          <Field name="location">
            {(field, props) => (
              <Input
                {...props}
                label="Location"
                variant="filled"
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>
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
          <Link href="/password/reset" class="w-fit">
            <p class="text-sm text-gray-500 hover:text-info duration-300  transition-all ease-out">
              Forgot Password?
            </p>
          </Link>
          <Button type="submit">Submit</Button>
        </Form>
      </div>
    </div>
  );
});
