import { SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, useSignal } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";
import * as v from "valibot";

import * as TModal from "~/components/themed-modal/themed-modal";
import LoadingOverlayV2 from "~/components/loading-overlay-v2";
import Button from "~/components/button/button";
import Editor from "~/components/editor/editor";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";
import { cn, qwikFetch } from "~/common/utils";

const schema = v.object({
  proposal: v.optional(v.string()),
});

type SchemaType = v.InferInput<typeof schema>;

export default component$<{ postId: string; userId: string }>(
  ({ postId, userId }) => {
    const toast = useToast();
    const open = useSignal(false);
    const loading = useSignal(false);

    const { mutate: sendApplication } = useMutate("POST /applications");

    const { mutate: uploadProposalLinkUrl } = useMutate(
      "POST /s3/generate/signed/url/put",
    );

    const [, { Form, Field }] = useForm<SchemaType>({
      loader: {
        value: {
          proposal: undefined,
        },
      },
      validate: valiForm$(schema),
    });

    const handleSubmit = $<SubmitHandler<SchemaType>>(async (values) => {
      try {
        loading.value = true;

        const s3Key = `applicant/${userId}/proposal/${postId}`;

        if (values.proposal) {
          const s3LinkResult = await uploadProposalLinkUrl(
            {
              bodyParams: { key: s3Key },
            },
            {
              credentials: "include",
            },
          );

          if (s3LinkResult.error) throw s3LinkResult.error;

          if (s3LinkResult.result)
            await qwikFetch<null>(s3LinkResult.result.data.URL, {
              method: s3LinkResult.result.data.Method,
              headers: {
                "Content-Type": "text/html",
              },
              body: new Blob([values.proposal], { type: "text/html" }),
            });
        }

        const result = await sendApplication({
          bodyParams: {
            postId: postId,
            proposalLink: s3Key ? s3Key : "",
          },
        });

        if (result.error) throw result.error;

        toast.add({
          title: "Success",
          message: "Application Sent",
          type: "success",
        });
      } catch (err) {
        console.log(err);

        toast.add({
          title: "Failed",
          message: typeof err === "string" ? err : "Error occured",
          type: "destructive",
        });
      } finally {
        open.value = false;
        loading.value = false;
      }
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
          <LoadingOverlayV2 open={loading}>
            Submitting Application
          </LoadingOverlayV2>

          <Form
            class="flex flex-col gap-5 max-w-[47rem]"
            onSubmit$={handleSubmit}
          >
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
  },
);
