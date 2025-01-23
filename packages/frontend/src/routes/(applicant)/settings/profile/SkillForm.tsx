import {
  insert,
  remove,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { TbPlus, TbTrash } from "@qwikest/icons/tablericons";
import { $, component$ } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";
import * as v from "valibot";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import ThemedSelect from "~/components/themed-select/themed-select";
import * as TModal from "~/components/themed-modal/themed-modal";
import Button from "~/components/button/button";
import Input from "~/components/input/input";

import { useCache } from "~/hooks/use-cache/useCache";
import { cn } from "~/common/utils";

const schema = v.object({
  skills: v.array(
    v.object({
      skillName: v.pipe(v.string(), v.nonEmpty("Required")),
      skillLevel: v.string(),
      skillCategory: v.string(),
    }),
  ),
});

type SchemaType = v.InferInput<typeof schema>;

export default component$(() => {
  const toast = useToast();

  const { setCacheData } = useCache("GET /users/skills", {});
  const { mutate } = useMutate("POST /users/skills");

  const [form, { Form, Field, FieldArray }] = useForm<SchemaType>({
    loader: {
      value: {
        skills: [
          {
            skillName: "",
            skillLevel: "",
            skillCategory: "",
          },
        ],
      },
    },
    validate: valiForm$(schema),
    fieldArrays: ["skills"],
  });

  const handleSubmit = $<SubmitHandler<SchemaType>>(async (values) => {
    try {
      const response = await mutate({
        bodyParams: { skills: [...values.skills] },
      });

      if (response.error) throw response.error;

      if (response.result) {
        await setCacheData((cached) => {
          const newResult = cached ? cached : response.result;

          if (cached)
            newResult.data.skills = [
              ...(cached.data.skills ?? []),
              ...response.result.data.skills,
            ];

          return newResult;
        });

        toast.add({
          title: "Success",
          message: "Skills Added",
          type: "success",
        });

        reset(form, {
          initialValues: {
            skills: [
              {
                skillName: "",
                skillLevel: "",
                skillCategory: "",
              },
            ],
          },
        });

        return;
      }

      toast.add({
        title: "Saving failed",
        message: "Something Went Wrong",
        type: "destructive",
      });
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
    <Modal.Root>
      <TModal.Trigger>+ Add Skills</TModal.Trigger>
      <TModal.Content
        size="lg"
        modalTitle="Create Skills"
        modalDescription="use this form to add new skills and display them on your profile"
      >
        <LoadingOverlay open={form.submitting}>Saving</LoadingOverlay>

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <FieldArray name="skills">
            {(fieldArray) => (
              <div id={fieldArray.name}>
                <div
                  class={cn("space-y-5 py-3 px-1", "max-h-56 overflow-y-auto")}
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
                      <Field name={`${fieldArray.name}.${idx}.skillName`}>
                        {(field, props) => (
                          <Input
                            {...props}
                            label="skill name *"
                            errorMsg={field.error}
                            value={field.value}
                            required
                          />
                        )}
                      </Field>

                      <Field name={`${fieldArray.name}.${idx}.skillLevel`}>
                        {(field, props) => (
                          <ThemedSelect
                            {...props}
                            name={field.name}
                            label="skill level"
                            value={field.value}
                            errorMsg={field.error}
                            options={[
                              { label: "Beginner", value: "beginner" },
                              { label: "Intermediate", value: "intermediate" },
                              { label: "Advanced", value: "advanced" },
                            ]}
                          />
                        )}
                      </Field>

                      <Field name={`${fieldArray.name}.${idx}.skillCategory`}>
                        {(field, props) => (
                          <Input
                            {...props}
                            label="skill category"
                            errorMsg={field.error}
                            value={field.value}
                          />
                        )}
                      </Field>

                      <div class="h-[50px]">
                        <Button
                          type="button"
                          class={cn(
                            "h-full",
                            "bg-destructive hover:bg-destructive hover:brightness-125",
                          )}
                          onClick$={() =>
                            remove(form, "skills", {
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
                    insert(form, "skills", {
                      value: {
                        skillName: "",
                        skillLevel: "",
                        skillCategory: "",
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
            <TModal.Close>Cancel</TModal.Close>

            <Button type="submit" class="min-[360px]:px-10">
              Submit
            </Button>
          </div>
        </Form>
      </TModal.Content>
    </Modal.Root>
  );
});
