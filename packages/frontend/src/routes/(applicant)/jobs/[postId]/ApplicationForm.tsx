import { $, component$, NoSerialize, useSignal } from "@builder.io/qwik";
import { SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { Modal } from "@qwik-ui/headless";
import * as v from "valibot";

import * as TModal from "~/components/themed-modal/themed-modal";
import { isBlobArray } from "~/common/formSchema";
import Button from "~/components/button/button";
import Editor from "~/components/editor/editor";
import FileInput from "~/components/file-input";
import { cn } from "~/common/utils";

const schema = v.object({
  proposal: v.optional(v.string()),
  resume: v.custom<NoSerialize<Blob>[]>((input: unknown) => {
    return isBlobArray(input);
  }),
});

type SchemaType = v.InferInput<typeof schema>;

export default component$(() => {
  const open = useSignal(false);

  const [form, { Form, Field }] = useForm<SchemaType>({
    loader: {
      value: {
        proposal: undefined,
        resume: [],
      },
    },
    validate: valiForm$(schema),
  });

  const handleSubmit = $<SubmitHandler<SchemaType>>(async (values) => {
    console.log("values", values);
  });

  return (
    <Modal.Root bind:show={open}>
      <TModal.Trigger
        class={cn(
          "peer w-full font-primary",
          "rounded-md",
          "duration-150 ease-linear",
          "bg-primary hover:bg-primary-foreground text-white",
          "py-3 px-6",
          "hover:brightness-100",
        )}
      >
        Apply
      </TModal.Trigger>

      <TModal.Content
        size="lg"
        modalTitle="Application Form"
        modalDescription="use this form to fill in details for your application for this job"
      >
        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <Field name="resume" type="File[]">
            {(field, props) => (
              <div class="space-y-1">
                <p>
                  {" "}
                  Resume: <span class="text-gray-500">(optional)</span>
                </p>
                <FileInput
                  {...props}
                  name={field.name}
                  value={field.value}
                  errorMsg={field.error}
                />
              </div>
            )}
          </Field>

          <Field name="proposal">
            {(field, props) => (
              <div class="space-y-1">
                <p>
                  {" "}
                  Proposal: <span class="text-gray-500">(optional)</span>
                </p>
                <Editor
                  {...props}
                  placeholder="Write your proposal here"
                  errorMsg={field.error}
                  value={field.value}
                />
              </div>
            )}
          </Field>

          <div class="flex justify-end gap-3 mt-5">
            <TModal.Close class="min-[360px]:px-10">Cancel</TModal.Close>

            <Button type="submit" class="min-[360px]:px-10">
              Submit
            </Button>
          </div>
        </Form>
      </TModal.Content>
    </Modal.Root>
  );
});
