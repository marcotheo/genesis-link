import {
  insert,
  remove,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$, Slot, useContext, useTask$ } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { JobRequirementsStep, JobRequirmentsSchema } from "./common";
import { TbPlus, TbTrash } from "@qwikest/icons/tablericons";
import { capitalizeFirstLetter, cn } from "~/common/utils";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";
import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import FormWrapper from "./FormWrapper";

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  const toast = useToast();

  const { mutate } = useMutate("posts/create/requirements");

  const [jobRequirementsForm, { Form, Field, FieldArray }] =
    useForm<JobRequirementsStep>({
      loader: {
        value: {
          qualifications: [],
          responsibilities: [],
        },
      },
      validate: valiForm$(JobRequirmentsSchema),
      fieldArrays: ["qualifications", "responsibilities"],
    });

  const handleSubmit = $<SubmitHandler<JobRequirementsStep>>(async (values) => {
    try {
      if (!formDataCtx.postId) throw "No post created yet";

      const res = await mutate({
        ...values,
        postId: formDataCtx.postId,
      });

      formDataCtx.form5 = values;

      if (res.error) throw res.error;

      toast.add({
        title: "Success",
        message: "Job requirements saved",
        type: "success",
      });

      activeStep.value = 5;
    } catch (error) {
      console.error("Error submitting form:", error);

      toast.add({
        title: "Saving failed",
        message: typeof error === "string" ? error : "Something Went Wrong",
        type: "destructive",
      });
    }
  });

  // reset form values if not submitted
  useTask$(({ track }) => {
    const stepTracker = track(() => activeStep.value);

    if (stepTracker === 5) {
      reset(jobRequirementsForm, {
        initialValues: formDataCtx.form5,
      });
    }
  });

  return (
    <FormWrapper formStep={5} activeStep={activeStep.value}>
      <LoadingOverlay open={jobRequirementsForm.submitting}>
        Saving Job Requirements
      </LoadingOverlay>

      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Job Requirements</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">
          Specify the key qualifications and responsibilities for the job to
          ensure candidates understand the skills and tasks required for the
          role.
        </p>

        <br class="max-md:hidden" />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <FieldArray name="qualifications">
            {(fieldArray) => (
              <div
                id={fieldArray.name}
                class={cn("p-4 rounded-lg", "bg-surface shadow-lg")}
              >
                <Heading>{capitalizeFirstLetter(fieldArray.name)}</Heading>

                <div class="pb-5">
                  {fieldArray.items.map((item, idx) => (
                    <div key={item} class="flex gap-3 items-end">
                      <Field name={`${fieldArray.name}.${idx}`}>
                        {(field, props) => (
                          <Input
                            {...props}
                            label="enter qualification"
                            variant="filled"
                            errorMsg={field.error}
                            value={field.value}
                            class="h-[50px]"
                          />
                        )}
                      </Field>

                      <div class="h-[50px]">
                        <Button
                          type="button"
                          class="bg-destructive h-full max-[400px]:px-3"
                          onClick$={() =>
                            remove(jobRequirementsForm, "qualifications", {
                              at: idx,
                            })
                          }
                        >
                          <TbTrash />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick$={() => {
                    insert(jobRequirementsForm, "qualifications", {
                      value: "",
                    });
                  }}
                  class="py-3 px-3"
                >
                  <TbPlus />
                </Button>
              </div>
            )}
          </FieldArray>

          <FieldArray name="responsibilities">
            {(fieldArray) => (
              <div
                id={fieldArray.name}
                class={cn("p-4 rounded-lg", "bg-surface shadow-lg")}
              >
                <Heading>{capitalizeFirstLetter(fieldArray.name)}</Heading>

                <div class="pb-5">
                  {fieldArray.items.map((item, idx) => (
                    <div key={item} class="flex gap-3 items-end">
                      <Field name={`${fieldArray.name}.${idx}`}>
                        {(field, props) => (
                          <Input
                            {...props}
                            label="enter responsibility"
                            variant="filled"
                            errorMsg={field.error}
                            value={field.value}
                            class="h-[50px]"
                          />
                        )}
                      </Field>

                      <div class="h-[50px]">
                        <Button
                          type="button"
                          class="bg-destructive h-full max-[400px]:px-3"
                          onClick$={() =>
                            remove(jobRequirementsForm, "responsibilities", {
                              at: idx,
                            })
                          }
                        >
                          <TbTrash />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick$={() => {
                    insert(jobRequirementsForm, "responsibilities", {
                      value: "",
                    });
                  }}
                  class="py-3 px-3"
                >
                  <TbPlus />
                </Button>
              </div>
            )}
          </FieldArray>

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
