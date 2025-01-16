import { reset, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, Slot, useContext, useTask$ } from "@builder.io/qwik";

import RadioButtonGroup from "~/components/radio-button-group/radio-button-group";
import { CreateBasicPostInfoSchema, BasicPostInfoStep } from "./common";
import { FormDataCtx, FormStepCtx, useForm1Loader } from "./index";
import TextArea from "~/components/text-area/text-area";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import FormWrapper from "./FormWrapper";
import { cn } from "~/common/utils";

const FlexWrapper = component$(() => {
  return (
    <div class="flex gap-5">
      <Slot />
    </div>
  );
});

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  const [basicPostInfoForm, { Form, Field }] = useForm<BasicPostInfoStep>({
    loader: useForm1Loader(),
    validate: valiForm$(CreateBasicPostInfoSchema),
  });

  const handleSubmit = $<SubmitHandler<BasicPostInfoStep>>(async (values) => {
    try {
      formDataCtx.form1 = values;
      activeStep.value = 2;
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  // reset form values if not submitted
  useTask$(({ track }) => {
    const stepTracker = track(() => activeStep.value);

    if (stepTracker === 1) {
      reset(basicPostInfoForm, {
        initialValues: formDataCtx.form1,
      });
    }
  });

  return (
    <FormWrapper formStep={1} activeStep={activeStep.value}>
      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Post Information</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">
          Enter Post Information to initialize post.
        </p>

        <br class="max-md:hidden" />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <FlexWrapper>
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
            </Field>
          </FlexWrapper>

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

          <FlexWrapper>
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
            <Field name="phone">
              {(field, props) => (
                <Input
                  {...props}
                  label="Phone"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
          </FlexWrapper>

          <Field name="wfh">
            {(field, props) => (
              <>
                <RadioButtonGroup
                  {...props}
                  label="Remote Work?"
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  errorMsg={field.error}
                  value={field.value}
                />
              </>
            )}
          </Field>

          <Field name="deadline" type="Date">
            {(field, props) => (
              <Input
                {...props}
                type="date"
                label="Deadline"
                variant="filled"
                errorMsg={field.error}
                value={field.value?.toString() ?? undefined}
              />
            )}
          </Field>

          <div class="flex justify-end gap-3 mt-5">
            <Button type="submit" class="px-10">
              Next {"->"}
            </Button>
          </div>
        </Form>
      </div>
    </FormWrapper>
  );
});
