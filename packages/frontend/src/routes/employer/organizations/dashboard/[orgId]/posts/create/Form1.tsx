import {
  insert,
  remove,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$, Slot, useContext } from "@builder.io/qwik";
import { TbPlus, TbTrash } from "@qwikest/icons/tablericons";

import ThemedSelect from "~/components/themed-select/themed-select";
import TextArea from "~/components/text-area/text-area";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Input from "~/components/input/input";

import { CreateBasicPostInfoSchema, BasicPostInfoStep } from "./common";
import { capitalizeFirstLetter, cn } from "~/common/utils";
import { FormDataCtx, FormStepCtx } from "./index";

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
  const defaultValue = {
    title: undefined,
    description: undefined,
    workSetup: undefined,
    deadline: undefined,
    tags: [],
  };

  const [basicPostInfoForm, { Form, Field, FieldArray }] =
    useForm<BasicPostInfoStep>({
      loader: {
        value: formDataCtx.form1 ?? { ...defaultValue },
      },
      validate: valiForm$(CreateBasicPostInfoSchema),
      fieldArrays: ["tags"],
    });

  const handleSubmit = $<SubmitHandler<BasicPostInfoStep>>(async (values) => {
    try {
      formDataCtx.form1 = values;

      console.log("DATA", formDataCtx.form1);
      activeStep.value = 2;
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div class={cn("flex h-full w-full justify-center")}>
      <div class={cn("min-[420px]:px-5 lg:px-12 w-full")}>
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
          <div class="flex flex-col min-[500px]:flex-row gap-5 items-center">
            <Field name="workSetup">
              {(field, props) => (
                <ThemedSelect
                  {...props}
                  name={field.name}
                  label="Job Type"
                  value={field.value}
                  errorMsg={field.error}
                  variant="filled"
                  options={[
                    { label: "on-site", value: "on-site" },
                    { label: "remote", value: "remote" },
                    { label: "hybrid", value: "hybrid" },
                  ]}
                />
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
          </div>
          <FieldArray name="tags">
            {(fieldArray) => (
              <div
                id={fieldArray.name}
                class={cn("p-4 rounded-lg", "bg-surface shadow-lg", "relative")}
              >
                <div class="flex justify-between">
                  <Heading>{capitalizeFirstLetter(fieldArray.name)}</Heading>
                  <Heading>({fieldArray.items.length})</Heading>
                </div>

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
                          onClick$={() => {
                            remove(basicPostInfoForm, "tags", {
                              at: idx,
                            });
                          }}
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
    </div>
  );
});
