import { reset, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, Slot, useContext, useTask$ } from "@builder.io/qwik";

import { JobDetailsInfoStep, JobDetailsInfoSchema } from "./common";
import { FormDataCtx, FormStepCtx, useForm1Loader } from "./index";
import Heading from "~/components/heading/heading";
import Select from "~/components/select/select";
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

  const [jobDetailsInfoForm, { Form, Field }] = useForm<JobDetailsInfoStep>({
    loader: {
      value: {
        jobType: undefined,
        salaryType: undefined,
        salaryAmountMin: undefined,
        salaryAmountMax: undefined,
        salaryCurrency: undefined,
      },
    },
    validate: valiForm$(JobDetailsInfoSchema),
  });

  const handleSubmit = $<SubmitHandler<JobDetailsInfoStep>>(async (values) => {
    try {
      console.log(values);
      // formDataCtx.form1 = values;
      // activeStep.value = 2;
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  // reset form values if not submitted
  useTask$(({ track }) => {
    const stepTracker = track(() => activeStep.value);

    if (stepTracker === 4) {
      reset(jobDetailsInfoForm, {
        initialValues: formDataCtx.form4,
      });
    }
  });

  return (
    <FormWrapper formStep={4} activeStep={activeStep.value}>
      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Job Details</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">
          Provide the essential details about the job opportunity, including the
          working arrangement, and compensation information. This step ensures
          candidates understand the nature and requirements of the role.
        </p>

        <br class="max-md:hidden" />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <FlexWrapper>
            <Field name="jobType">
              {(field, props) => (
                <Select
                  {...props}
                  name={field.name}
                  label="Job Type"
                  value={field.value}
                  errorMsg={field.error}
                  variant="filled"
                  options={[
                    { label: "full-time", value: "full-time" },
                    { label: "part-time", value: "part-time" },
                    { label: "contract", value: "contract" },
                    { label: "internship", value: "internship" },
                  ]}
                />
              )}
            </Field>

            <Field name="salaryType">
              {(field, props) => (
                <Select
                  {...props}
                  name={field.name}
                  label="Salary Type"
                  value={field.value}
                  errorMsg={field.error}
                  variant="filled"
                  options={[
                    { label: "fixed", value: "fixed" },
                    { label: "hourly", value: "hourly" },
                    { label: "monthly", value: "monthly" },
                  ]}
                />
              )}
            </Field>
          </FlexWrapper>

          <FlexWrapper>
            <Field name="salaryAmountMin" type="number">
              {(field, props) => (
                <Input
                  {...props}
                  label="Minimum Salary"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                  type="number"
                />
              )}
            </Field>

            <Field name="salaryAmountMax" type="number">
              {(field, props) => (
                <Input
                  {...props}
                  label="Minimum Salary"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                  type="number"
                />
              )}
            </Field>

            <Field name="salaryCurrency">
              {(field, props) => (
                <Input
                  {...props}
                  label="Currency"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
          </FlexWrapper>

          <div class="flex justify-end gap-3 mt-5">
            <Button
              type="button"
              class="min-[360px]:px-10 border-input text-input"
              variant="outline"
              onClick$={() => (activeStep.value = 3)}
            >
              {"<-"} Prev
            </Button>

            <Button type="submit" class="min-[360px]:px-10">
              Next {"->"}
            </Button>
          </div>
        </Form>
      </div>
    </FormWrapper>
  );
});
