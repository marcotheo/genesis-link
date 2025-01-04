import {
  insert,
  remove,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$, useContext } from "@builder.io/qwik";
import * as v from "valibot";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { TbLoader, TbPlus, TbTrash } from "@qwikest/icons/tablericons";
import Dialog, { DialogTrigger } from "~/components/dialog/dialog";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { QueryContext } from "~/providers/query/query";
import { useQuery } from "~/hooks/use-query/useQuery";
import { useToast } from "~/hooks/use-toast/useToast";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import { GetAPIMapping } from "~/common/types";
import Input from "~/components/input/input";
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

const SkillForm = component$(() => {
  const { setCacheData } = useContext(QueryContext);
  const toast = useToast();

  const { mutate } = useMutate("/users/create/skills");

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
        skills: [...values.skills],
      });

      if (response.error) throw response.error;

      if (response.result) {
        await setCacheData("/users/skills", (currentData) => {
          const temp = currentData as unknown as
            | GetAPIMapping["/users/skills"]
            | null;

          const newResult = temp ? temp : response.result;

          if (temp)
            newResult.data.skills = [
              ...temp.data.skills,
              ...response.result.data.skills,
            ];

          return newResult;
        });

        toast.add({
          title: "Success",
          message: "Skills Added",
          type: "success",
        });

        reset(form);

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
    <div
      class={cn(
        "flex flex-col",
        "justify-center items-center min-[1100px]:items-end",
      )}
    >
      <Dialog>
        <DialogTrigger
          q:slot="trigger"
          class={cn(
            "w-full px-5 py-3",
            "shadow-sm rounded-md",
            "flex justify-center items-center",
            "cursor-pointer",
            "ease-in duration-200",
          )}
          variant="ghost"
        >
          + Add Skills
        </DialogTrigger>

        <div>
          <LoadingOverlay open={form.submitting}>Saving Skills</LoadingOverlay>

          <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
            <FieldArray name="skills">
              {(fieldArray) => (
                <div
                  id={fieldArray.name}
                  class={cn("rounded-lg", "bg-surface")}
                >
                  <Heading>Add Skills</Heading>

                  <div class="py-5 space-y-3 max-h-[30rem] sm:max-h-80 overflow-y-auto">
                    {fieldArray.items.map((item, idx) => (
                      <div
                        key={item}
                        class={cn(
                          "flex flex-col min-[550px]:flex-row",
                          "gap-3 items-end",
                        )}
                      >
                        <Field name={`${fieldArray.name}.${idx}.skillName`}>
                          {(field, props) => (
                            <Input
                              {...props}
                              label="skill name *"
                              variant="filled"
                              errorMsg={field.error}
                              value={field.value}
                              class="h-[50px]"
                              required
                            />
                          )}
                        </Field>

                        <Field name={`${fieldArray.name}.${idx}.skillLevel`}>
                          {(field, props) => (
                            <Input
                              {...props}
                              label="skill level"
                              variant="filled"
                              errorMsg={field.error}
                              value={field.value}
                              class="h-[50px]"
                            />
                          )}
                        </Field>

                        <Field name={`${fieldArray.name}.${idx}.skillCategory`}>
                          {(field, props) => (
                            <Input
                              {...props}
                              label="skill category"
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
              <DialogTrigger
                class="px-10 border-input text-input"
                variant="outline"
                type="button"
              >
                Cancel
              </DialogTrigger>

              <Button type="submit" class="min-[360px]:px-10">
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Dialog>
    </div>
  );
});

const SkillList = component$(() => {
  const { state } = useQuery(
    "/users/skills",
    {},
    {
      runOnRender: true,
    },
  );

  return (
    <div
      class={cn(
        "w-full rounded-md",
        "h-40 overflow-y-auto",
        "mt-3 p-5",
        "brightness-95 dark:brightness-110",
      )}
    >
      {state.loading ? (
        <div class="h-full w-full flex justify-center items-center">
          <div class="flex gap-3 items-center">
            <Heading>Loading Skills</Heading>

            <div class="animate-spin text-3xl w-fit h-fit">
              <TbLoader />
            </div>
          </div>
        </div>
      ) : state.result?.data.skills ? (
        <div class="flex flex-wrap gap-2">
          {state.result.data.skills.map((v) => (
            <div
              key={v.skillId}
              class={cn(
                "bg-soft rounded-lg",
                "px-3 sm:px-5 py-3",
                "animate-fade-in-slide",
              )}
            >
              <p class=" text-sm sm:text-base">{v.skillName}</p>
            </div>
          ))}
        </div>
      ) : (
        <div class="h-full w-full flex justify-center">
          <Heading class="text-gray-500 pt-5 md:pt-10">
            No skills defined
          </Heading>
        </div>
      )}
    </div>
  );
});

export default component$(() => {
  return (
    <div
      class={cn(
        "flex flex-col",
        "min-[1100px]:items-center justify-between",
        "max-[1100px]:gap-3",
        "py-3",
      )}
    >
      <div class="flex justify-between w-full">
        <div class="w-fit">
          <h1 class="text-xl font-semibold">Skills</h1>
          <p class="text-gray-500 text-xs sm:text-sm">
            Add and review your skills to showcase your expertise
          </p>
        </div>

        <SkillForm />
      </div>

      <SkillList />
    </div>
  );
});
