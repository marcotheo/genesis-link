import {
  getValue,
  Maybe,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$, NoSerialize, useTask$ } from "@builder.io/qwik";
import { TbLoader } from "@qwikest/icons/tablericons";
import { isServer } from "@builder.io/qwik/build";
import { useSignal } from "@builder.io/qwik";
import { nanoid } from "nanoid";
import * as v from "valibot";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import ImageInput from "~/components/image-input/image-input";
import Button from "~/components/button/button";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";

import { cn, qwikFetchWithProgress } from "~/common/utils";
import { isBlob } from "~/common/formSchema";
import { useOrgId } from "../../../layout";

export const BrandingVisualsSchema = v.object({
  logoFile: v.custom<NoSerialize<Maybe<Blob>>>((input: unknown) => {
    if (input === undefined) return true;

    return isBlob(input);
  }),
  bannerFile: v.custom<NoSerialize<Maybe<Blob>>>((input: unknown) => {
    if (input === undefined) return true;

    return isBlob(input);
  }),
});

export type BrandingVisualsStep = v.InferInput<typeof BrandingVisualsSchema>;

export default component$(() => {
  const toast = useToast();
  const org = useOrgId();
  const logoUploadProgress = useSignal<number | null>(null);
  const posterUploadProgress = useSignal<number | null>(null);

  const { mutate: logoMutate } = useMutate("POST /s3/url/put");
  const { mutate: posterMutate } = useMutate("POST /s3/url/put");

  const [brandingVisualForm, { Form, Field }] = useForm<BrandingVisualsStep>({
    loader: {
      value: {
        logoFile: undefined,
        bannerFile: undefined,
      },
    },
    validate: valiForm$(BrandingVisualsSchema),
  });

  const handleSubmit = $<SubmitHandler<BrandingVisualsStep>>(async (values) => {
    try {
      let logoS3key = null;
      let posterS3Key = null;

      await Promise.all([
        (async () => {
          if (values.logoFile) {
            const id = nanoid();

            logoS3key = `company/logo_${org.value.orgId}_${id}`;

            const s3 = await logoMutate(
              {
                bodyParams: {
                  key: logoS3key,
                },
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
          if (values.bannerFile) {
            const id = nanoid();

            posterS3Key = `company/banner_${org.value.orgId}_${id}`;

            const s3 = await posterMutate(
              {
                bodyParams: { key: posterS3Key },
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
                    "Content-Type": values.bannerFile.type,
                  },
                  body: values.bannerFile,
                },
                logoUploadProgress,
              );
          }
        })(),
      ]);
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
    const logoValueTracker = track(() =>
      getValue(brandingVisualForm, "logoFile"),
    );
    const posterValueTracker = track(() =>
      getValue(brandingVisualForm, "bannerFile"),
    );

    if (isServer) return;

    if (!!logoValueTracker) logoUploadProgress.value = 0;
    if (!!posterValueTracker) posterUploadProgress.value = 0;
  });

  return (
    <>
      <LoadingOverlay
        open={
          brandingVisualForm.submitting && logoUploadProgress.value !== null
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

      <div class={cn("md:py-12 w-full")}>
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

          <Field name="bannerFile" type="File">
            {(field, props) => (
              <ImageInput
                {...props}
                value={field.value}
                errorMsg={field.error}
                label="Banner Upload"
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
            <Button type="submit" class="min-[360px]:px-10">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
});
