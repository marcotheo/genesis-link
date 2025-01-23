import { SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, Slot, useContext } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import ThemedSelect from "~/components/themed-select/themed-select";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Input from "~/components/input/input";

import { JobDetailsInfoStep, JobDetailsInfoSchema } from "./common";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";
import { FormDataCtx, FormStepCtx } from "./index";
import { cn } from "~/common/utils";

const FlexWrapper = component$(() => {
  return (
    <div class="flex gap-5">
      <Slot />
    </div>
  );
});

export default component$(() => {
  const toast = useToast();
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  const { mutate } = useMutate(
    "POST /organizations/{orgId}/posts/{postId}/job_details",
  );

  const [jobDetailsInfoForm, { Form, Field }] = useForm<JobDetailsInfoStep>({
    loader: {
      value: formDataCtx.form3 ?? {
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
      if (!formDataCtx.postId) throw "No post created yet";

      const res = await mutate({
        bodyParams: { ...values },
        pathParams: {
          orgId: formDataCtx.orgId ?? "",
          postId: formDataCtx.postId,
        },
      });

      formDataCtx.form3 = values;

      if (res.error) throw res.error;

      toast.add({
        title: "Success",
        message: "Job details saved",
        type: "success",
      });

      activeStep.value = 4;
    } catch (error) {
      console.error("Error submitting form:", error);

      toast.add({
        title: "Saving failed",
        message: typeof error === "string" ? error : "Something Went Wrong",
        type: "destructive",
      });
    }
  });

  return (
    <div class={cn("flex h-full w-full justify-center")}>
      <LoadingOverlay open={jobDetailsInfoForm.submitting}>
        Saving Job Details
      </LoadingOverlay>

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
                <ThemedSelect
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
                <ThemedSelect
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
            <Button type="submit" class="min-[360px]:px-10">
              Next {"->"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});
