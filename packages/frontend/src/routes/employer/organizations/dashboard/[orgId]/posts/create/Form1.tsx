import {
  insert,
  remove,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$, Slot, useContext, useTask$ } from "@builder.io/qwik";

import RadioButtonGroup from "~/components/radio-button-group/radio-button-group";
import { CreateBasicPostInfoSchema, BasicPostInfoStep } from "./common";
import { TbPlus, TbTrash } from "@qwikest/icons/tablericons";
import { capitalizeFirstLetter, cn } from "~/common/utils";
import TextArea from "~/components/text-area/text-area";
import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import FormWrapper from "./FormWrapper";

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

  const [basicPostInfoForm, { Form, Field, FieldArray }] =
    useForm<BasicPostInfoStep>({
      loader: {
        value: {
          title: undefined,
          description: undefined,
          wfh: undefined,
          deadline: undefined,
          tags: [],
        },
      },
      validate: valiForm$(CreateBasicPostInfoSchema),
      fieldArrays: ["tags"],
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
      <div class={cn("px-5 lg:px-24 w-full")}>
        <Heading class="max-md:hidden">Post Information</Heading>

        <p class="text-gray-500 max-md:hidden">
          Enter Post Information to initialize post.
        </p>

        <br class="max-md:hidden" />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <FlexWrapper>
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

          <FieldArray name="tags">
            {(fieldArray) => (
              <div
                id={fieldArray.name}
                class={cn("p-4 rounded-lg", "bg-surface shadow-lg")}
              >
                <Heading>
                  {capitalizeFirstLetter(fieldArray.name)} (
                  {fieldArray.items.length})
                </Heading>

                <div
                  class={cn("space-y-5 py-3 px-1", "max-h-40 overflow-y-auto")}
                >
                  {fieldArray.items.map((item, idx) => (
                    <div
                      key={item}
                      class={cn(
                        "flex flex-col min-[550px]:flex-row",
                        "gap-3 items-start",
                        "animate-fade-in-slide ",
                      )}
                    >
                      <Field name={`${fieldArray.name}.${idx}.tagName`}>
                        {(field, props) => (
                          <Input
                            {...props}
                            label="enter tag name"
                            variant="filled"
                            errorMsg={field.error}
                            value={field.value}
                            class="h-[50px]"
                          />
                        )}
                      </Field>

                      <Field name={`${fieldArray.name}.${idx}.tagCategory`}>
                        {(field, props) => (
                          <Input
                            {...props}
                            label="enter tag category"
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
                            remove(basicPostInfoForm, "tags", {
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
                    insert(basicPostInfoForm, "tags", {
                      value: {
                        tagName: "",
                        tagCategory: "",
                      },
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
            <Button type="submit" class="px-10">
              Next {"->"}
            </Button>
          </div>
        </Form>
      </div>
    </FormWrapper>
  );
});
