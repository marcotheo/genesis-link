import { reset, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { DocumentHead, Link } from "@builder.io/qwik-city";
import { $, component$, Slot } from "@builder.io/qwik";

import { CreateAddessSchema, CreateAddressForm } from "~/common/formSchema";
import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { cn, createDashboardPath, defaultCountry } from "~/common/utils";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import { usePathParams } from "../../../layout";
import Alert from "~/components/alert/alert";
import Input from "~/components/input/input";

const FlexWrapper = component$(() => {
  return (
    <div class="flex gap-5">
      <Slot />
    </div>
  );
});

export default component$(() => {
  const result = usePathParams();

  const { mutate, state } = useMutate("POST /organizations/{orgId}/addresses");

  const [createAddressForm, { Form, Field }] = useForm<CreateAddressForm>({
    loader: {
      value: {
        region: undefined,
        province: undefined,
        city: undefined,
        barangay: undefined,
        addressDetails: undefined,
      },
    },
    validate: valiForm$(CreateAddessSchema),
  });

  const handleSubmit = $<SubmitHandler<CreateAddressForm>>(async (values) => {
    try {
      await mutate(
        {
          bodyParams: {
            ...values,
            country: defaultCountry,
          },
          pathParams: {
            orgId: result.value.orgId,
          },
        },
        {
          credentials: "include",
        },
      );

      reset(createAddressForm);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div class="flex h-full w-full justify-center">
      <LoadingOverlay open={createAddressForm.submitting}>
        Saving Address
      </LoadingOverlay>

      <div class={cn("w-[40em] md:mt-[70px]")}>
        <Heading>Create A Address</Heading>

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
          message={"address saved"}
        />

        <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
          <FlexWrapper>
            <Field name="region">
              {(field, props) => (
                <Input
                  {...props}
                  label="Region"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
            <Field name="province">
              {(field, props) => (
                <Input
                  {...props}
                  label="Province"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
          </FlexWrapper>

          <FlexWrapper>
            <Field name="city">
              {(field, props) => (
                <Input
                  {...props}
                  label="City"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>

            <Field name="barangay">
              {(field, props) => (
                <Input
                  {...props}
                  label="Barangay"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
          </FlexWrapper>

          <FlexWrapper>
            <Field name="addressDetails">
              {(field, props) => (
                <Input
                  {...props}
                  label="Address"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                />
              )}
            </Field>
          </FlexWrapper>
          <div class="flex gap-3 justify-end">
            <Link href={createDashboardPath(result.value.orgId, "/addresses")}>
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
};
