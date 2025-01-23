import { reset, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, Slot } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import * as TModal from "~/components/themed-modal/themed-modal";
import Button from "~/components/button/button";
import Alert from "~/components/alert/alert";
import Input from "~/components/input/input";

import { CreateAddessSchema, CreateAddressForm } from "~/common/formSchema";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useCache } from "~/hooks/use-cache/useCache";
import { cn, defaultCountry } from "~/common/utils";
import { useOrgId } from "../../../layout";

const FlexWrapper = component$(() => {
  return (
    <div class="flex gap-5">
      <Slot />
    </div>
  );
});

export default component$(() => {
  const org = useOrgId();
  const { setCacheData } = useCache("GET /organizations/{orgId}/addresses", {
    pathParams: { orgId: org.value.orgId },
  });

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
      const res = await mutate(
        {
          bodyParams: {
            ...values,
            country: defaultCountry,
          },
          pathParams: {
            orgId: org.value.orgId,
          },
        },
        {
          credentials: "include",
        },
      );

      if (res.result)
        await setCacheData((currentData) => {
          return {
            ...(currentData ?? { status: "", message: "" }),
            data: [
              ...(currentData?.data ?? []),
              {
                ...values,
                addressId: res.result.data.addressId,
                country: defaultCountry,
              },
            ],
          };
        });

      reset(createAddressForm);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div class="flex h-full w-full justify-center mt-5">
      <LoadingOverlay open={createAddressForm.submitting}>
        Saving Address
      </LoadingOverlay>

      <div class={cn("w-full")}>
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

          <div class="mt-5 flex justify-end gap-3">
            <TModal.Close>Cancel</TModal.Close>

            <Button class="px-10" type="submit" disabled={!!state.loading}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});
