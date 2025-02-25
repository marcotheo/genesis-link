import { SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, useContext } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { RichTextEditorStep, RichTextEditorSchema } from "./common";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";
import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import Editor from "~/components/editor/editor";
import { cn, qwikFetch } from "~/common/utils";

export default component$(() => {
  const toast = useToast();
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  const { mutate } = useMutate(
    "POST /organizations/{orgId}/posts/{postId}/update/additionalInfoLink",
  );

  const { mutate: getUploadLink } = useMutate(
    "POST /s3/generate/signed/url/put",
  );

  const [richTextEditorForm, { Form, Field }] = useForm<RichTextEditorStep>({
    loader: {
      value: {
        richTextContent: formDataCtx.form5?.richTextContent ?? "",
      },
    },
    validate: valiForm$(RichTextEditorSchema),
  });

  const handleSubmit = $<SubmitHandler<RichTextEditorStep>>(async (values) => {
    try {
      if (!formDataCtx.postId) throw "No post created yet";

      if (values.richTextContent) {
        formDataCtx.form5 = values;

        const s3Key = `post/additionalInfo_${formDataCtx.postId}.html`;

        const s3 = await getUploadLink(
          {
            bodyParams: {
              key: s3Key,
            },
          },
          {
            credentials: "include",
          },
        );

        if (s3.error) throw s3.error;

        if (s3.result)
          await qwikFetch<null>(s3.result.data.URL, {
            method: s3.result.data.Method,
            headers: {
              "Content-Type": "text/html", // Specify the content type
            },
            body: values.richTextContent,
          });

        const res = await mutate({
          bodyParams: { additionalInfoLink: s3Key },
          pathParams: {
            orgId: formDataCtx.orgId ?? "",
            postId: formDataCtx.postId,
          },
        });

        if (res.error) throw res.error;

        toast.add({
          title: "Success",
          message: "Updates Saved",
          type: "success",
        });
      }

      activeStep.value = 6;
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
      <LoadingOverlay open={richTextEditorForm.submitting}>
        Saving Updates
      </LoadingOverlay>

      <div class={cn("px-5 lg:px-12 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Additional Information</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">
          Add any extra details about the job post, such as company culture,
          team dynamics, or other important information that could help attract
          candidates.
        </p>

        <br class="max-md:hidden" />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <Field name="richTextContent">
            {(field, props) => (
              <Editor
                {...props}
                placeholder="Write more about the job here ..."
                errorMsg={field.error}
                value={field.value}
              />
            )}
          </Field>

          <div class="flex justify-end gap-3 mt-5">
            <Button
              type="button"
              class="min-[360px]:px-10 border-input text-input"
              variant="outline"
              onClick$={() => (activeStep.value = 4)}
            >
              {"<-"} Prev
            </Button>

            <Button type="submit" class="min-[360px]:px-10">
              Next {"->"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});
