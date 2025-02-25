import {
  Maybe,
  reset,
  SubmitHandler,
  useForm,
  valiForm$,
} from "@modular-forms/qwik";
import { $, component$, NoSerialize, Slot } from "@builder.io/qwik";
import { DocumentHead, Link } from "@builder.io/qwik-city";
import { nanoid } from "nanoid";
import * as v from "valibot";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import ImageInput from "~/components/image-input/image-input";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Alert from "~/components/alert/alert";
import Input from "~/components/input/input";

import { cn, qwikFetch } from "~/common/utils";
import { isBlob } from "~/common/formSchema";

const schema = v.object({
  company: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter company name."),
  ),
  email: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter company email."),
  ),
  contactNumber: v.optional(v.string()),
  logoFile: v.custom<NoSerialize<Maybe<Blob>>>((input: unknown) => {
    if (input === undefined) return true;

    return isBlob(input);
  }),
});

type SchemaType = v.InferInput<typeof schema>;

const FlexWrapper = component$(() => {
  return (
    <div class="flex gap-5">
      <Slot />
    </div>
  );
});

export default component$(() => {
  const toast = useToast();
  const { mutate, state } = useMutate("POST /organizations");
  const { mutate: logoUpload } = useMutate("POST /s3/generate/signed/url/put");

  const [createAddressForm, { Form, Field }] = useForm<SchemaType>({
    loader: {
      value: {
        company: "",
        email: "",
        contactNumber: undefined,
        logoFile: undefined,
      },
    },
    validate: valiForm$(schema),
  });

  const handleSubmit = $<SubmitHandler<SchemaType>>(async (values) => {
    try {
      const { logoFile, ...rest } = values;

      let logoS3key = undefined;

      if (logoFile) {
        const id = nanoid();

        logoS3key = `company/logo_${values.company}_${id}`;

        const s3 = await logoUpload(
          {
            bodyParams: { key: logoS3key },
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
              "Content-Type": logoFile.type,
            },
            body: logoFile,
          });
      }

      const res = await mutate(
        {
          bodyParams: { ...rest, logoLink: logoS3key },
        },
        {
          credentials: "include",
        },
      );

      if (res.error) throw res.error;

      if (res.result)
        toast.add({
          title: "Success",
          message: "Company Created",
          type: "success",
        });

      reset(createAddressForm);
    } catch (error) {
      console.error("Error submitting form:", error);

      toast.add({
        title: "Creation failed",
        message: typeof error === "string" ? error : "Something Went Wrong",
        type: "destructive",
      });
    }
  });

  return (
    <div class="flex h-full w-full justify-center">
      <LoadingOverlay open={createAddressForm.submitting}>
        Creating Company
      </LoadingOverlay>

      <div class={cn("w-[40em] md:mt-[70px]")}>
        <Heading>Create Company </Heading>

        <br />

        <Alert
          open={!!state.error}
          variant="error"
          title="Error"
          message={state.error ?? ""}
        />

        <Alert
          open={!!state.success}
          variant="success"
          title="Saved"
          message={"company saved"}
        />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <FlexWrapper>
            <Field name="company">
              {(field, props) => (
                <Input
                  {...props}
                  label="Company"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                  required
                />
              )}
            </Field>
            <Field name="email">
              {(field, props) => (
                <Input
                  {...props}
                  type="email"
                  label="Email"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                  required
                />
              )}
            </Field>
          </FlexWrapper>

          <FlexWrapper>
            <Field name="contactNumber">
              {(field, props) => (
                <Input
                  {...props}
                  label="Contact Number"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
          </FlexWrapper>

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
          <div class="flex gap-3">
            <Link href="/employer/organizations">
              <Button
                type="button"
                class="min-[360px]:px-10 border-input text-input"
                variant="outline"
              >
                {"<-"} Cancel
              </Button>
            </Link>
            <Button class="min-[360px]:px-10" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
  meta: [
    {
      name: "description",
    },
  ],
};
