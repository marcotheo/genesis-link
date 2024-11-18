import {
  getValue,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$, useContext, useTask$ } from "@builder.io/qwik";
import { TbLoader } from "@qwikest/icons/tablericons";
import { useSignal } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { BrandingVisualsSchema, BrandingVisualsStep } from "./common";
import { FormDataCtx, FormStepCtx, useForm2Loader } from "./index";
import ImageInput from "~/components/image-input/image-input";
import { cn, qwikFetchWithProgress } from "~/common/utils";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { GenerateS3SignedUrlPut } from "~/common/types";
import { useToast } from "~/hooks/use-toast/useToast";
import Heading from "~/components/heading/heading";
import { isServer } from "@builder.io/qwik/build";
import Button from "~/components/button/button";
import FormWrapper from "./FormWrapper";

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);

  const logoUploadProgress = useSignal<number | null>(null);
  const posterUploadProgress = useSignal<number | null>(null);

  const toast = useToast();

  const { mutate: logoMutate } = useMutate<GenerateS3SignedUrlPut>(
    "/s3/generate/url/put",
  );
  const { mutate: posterMutate } = useMutate<GenerateS3SignedUrlPut>(
    "/s3/generate/url/put",
  );

  const [brandingVisualForm, { Form, Field }] = useForm<BrandingVisualsStep>({
    loader: useForm2Loader(),
    validate: valiForm$(BrandingVisualsSchema),
  });

  const handleSubmit = $<SubmitHandler<BrandingVisualsStep>>(async (values) => {
    try {
      let logoS3key = null;
      let posterS3Key = null;

      await Promise.all([
        (async () => {
          if (values.logoFile && !!formDataCtx.form1) {
            const file = values.logoFile as any as File;

            logoS3key = `post/logo_${formDataCtx.form1!.company}_${file.name}`;

            const s3 = await logoMutate(
              {
                Key: logoS3key,
              },
              {
                credentials: "include",
              },
            );

            if (s3.error) throw s3.error;

            if (s3.result)
              await qwikFetchWithProgress<null>(
                s3.result.data.URL,
                {
                  method: s3.result.data.Method,
                  headers: {
                    "Content-Type": values.logoFile.type,
                  },
                  body: values.logoFile,
                },
                logoUploadProgress,
              );
          }
        })(),
        (async () => {
          if (values.posterFile && !!formDataCtx.form1) {
            const file = values.posterFile as any as File;

            posterS3Key = `post/poster_${formDataCtx.form1!.company}_${file.name}`;

            const s3 = await posterMutate(
              {
                Key: posterS3Key,
              },
              {
                credentials: "include",
              },
            );

            if (s3.error) throw s3.error;

            if (s3.result)
              await qwikFetchWithProgress<null>(
                s3.result.data.URL,
                {
                  method: s3.result.data.Method,
                  headers: {
                    "Content-Type": values.posterFile.type,
                  },
                  body: values.posterFile,
                },
                logoUploadProgress,
              );
          }
        })(),
      ]);

      formDataCtx.form2 = {
        ...values,
        posterS3Key,
        logoS3key,
      };

      activeStep.value = 3;
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.add({
        title: "Error Saving Assets",
        message: typeof error === "string" ? error : "Something Went Wrong",
        type: "destructive",
      });
    }
  });

  useTask$(({ track }) => {
    const stepTracker = track(() => activeStep.value);

    if (isServer) return;

    if (stepTracker === 2) {
      // reset form values if not submitted
      reset(brandingVisualForm, {
        initialValues: formDataCtx.form2,
      });
    }
  });

  useTask$(({ track }) => {
    const logoValueTracker = track(() =>
      getValue(brandingVisualForm, "logoFile"),
    );
    const posterValueTracker = track(() =>
      getValue(brandingVisualForm, "posterFile"),
    );

    if (isServer) return;

    if (!!logoValueTracker) logoUploadProgress.value = 0;
    if (!!posterValueTracker) posterUploadProgress.value = 0;
  });

  return (
    <FormWrapper formStep={2} activeStep={activeStep.value}>
      <LoadingOverlay
        open={
          brandingVisualForm.submitting &&
          (logoUploadProgress.value !== null ||
            logoUploadProgress.value !== null)
        }
        type="component"
      >
        <div class="space-y-3">
          <div
            class={cn(
              "flex gap-3 items-center",
              logoUploadProgress.value === null ? "hidden" : "",
            )}
          >
            <div class="animate-spin text-2xl">
              <TbLoader />
            </div>
            <p>Saving Logo Image {`${logoUploadProgress.value}`}%</p>
          </div>

          <hr
            class={cn(
              "h-[0.5px] w-full border-popup z-50 my-1",
              logoUploadProgress.value !== null &&
                posterUploadProgress.value !== null,
            )}
          />

          <div
            class={cn(
              "flex gap-3 items-center",
              posterUploadProgress.value === null ? "hidden" : "",
            )}
          >
            <div class="animate-spin text-2xl">
              <TbLoader />
            </div>
            <p>Saving Poster Image {`${posterUploadProgress.value}`}%</p>
          </div>
        </div>
      </LoadingOverlay>

      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Visuals & Branding</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">
          Upload a poster and logo for your job post. (optional)
        </p>

        <br class="max-md:hidden" />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <Field name="logoFile" type="File">
            {(field, props) => (
              <ImageInput
                {...props}
                value={field.value}
                errorMsg={field.error}
                label="Logo Upload"
                maxSize={{
                  size: 100,
                  unit: "KB",
                }}
                maxDimensions={{
                  width: 300,
                  height: 300,
                }}
              />
            )}
          </Field>

          <Field name="posterFile" type="File">
            {(field, props) => (
              <ImageInput
                {...props}
                value={field.value}
                errorMsg={field.error}
                label="Poster Upload"
                maxSize={{
                  size: 500,
                  unit: "KB",
                }}
                maxDimensions={{
                  width: 360,
                  height: 360,
                }}
              />
            )}
          </Field>

          <div class="flex justify-end gap-3 mt-5">
            <Button
              type="button"
              class="min-[360px]:px-10 border-input text-input"
              variant="outline"
              onClick$={() => (activeStep.value = 1)}
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
