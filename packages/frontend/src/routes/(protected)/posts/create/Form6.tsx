import { reset, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, useContext, useTask$ } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { RichTextEditorStep, RichTextEditorSchema } from "./common";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { GenerateS3SignedUrlPut } from "~/common/types";
import { useToast } from "~/hooks/use-toast/useToast";
import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import Editor from "~/components/editor/editor";
import { cn, qwikFetch } from "~/common/utils";
import FormWrapper from "./FormWrapper";

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  const toast = useToast();

  const { mutate } = useMutate("/posts/update/additionalInfoLink");

  const { mutate: getUploadLink } = useMutate<GenerateS3SignedUrlPut>(
    "/s3/generate/url/put",
  );

  const [richTextEditorForm, { Form, Field }] = useForm<RichTextEditorStep>({
    loader: {
      value: {
        richTextContent: "",
      },
    },
    validate: valiForm$(RichTextEditorSchema),
  });

  const handleSubmit = $<SubmitHandler<RichTextEditorStep>>(async (values) => {
    try {
      if (!formDataCtx.postId || !formDataCtx.form5)
        throw "No post created yet";

      if (values.richTextContent) {
        formDataCtx.form6 = values;

        const s3Key = `post/additionalInfo_${formDataCtx.postId}.html`;

        const s3 = await getUploadLink(
          {
            Key: s3Key,
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
          postId: formDataCtx.postId,
          additionalInfoLink: s3Key,
        });

        if (res.error) throw res.error;

        toast.add({
          title: "Success",
          message: "Updates Saved",
          type: "success",
        });
      }

      // activeStep.value = 7;
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

    if (stepTracker === 6)
      reset(richTextEditorForm, {
        initialValues: {
          richTextContent: formDataCtx.form6?.richTextContent,
        },
      });
  });

  return (
    <FormWrapper formStep={6} activeStep={activeStep.value}>
      <LoadingOverlay open={richTextEditorForm.submitting}>
        Saving Updates
      </LoadingOverlay>

      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
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
              onClick$={() => (activeStep.value = 5)}
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
