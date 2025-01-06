import { reset, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, Slot, useContext } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import * as TModal from "~/components/themed-modal/themed-modal";
import Button from "~/components/button/button";
import Alert from "~/components/alert/alert";
import Input from "~/components/input/input";

import { CreateAddessSchema, CreateAddressForm } from "~/common/formSchema";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { Address, GetAPIMapping } from "~/common/types";
import { QueryContext } from "~/providers/query/query";
import { useCreateAddressFormLoader } from ".";
import { cn } from "~/common/utils";

const FlexWrapper = component$(() => {
  return (
    <div class="flex gap-5">
      <Slot />
    </div>
  );
});

export default component$(() => {
  const countryValue = "Philippines";
  const { setCacheData } = useContext(QueryContext);

  const { mutate, state } = useMutate("/address/create");

  const [createAddressForm, { Form, Field }] = useForm<CreateAddressForm>({
    loader: useCreateAddressFormLoader(),
    validate: valiForm$(CreateAddessSchema),
  });

  const handleSubmit = $<SubmitHandler<CreateAddressForm>>(async (values) => {
    try {
      const res = await mutate(
        {
          ...values,
          country: countryValue,
        },
        {
          credentials: "include",
        },
      );

      if (res.result)
        await setCacheData("/address", (currentData) => {
          const temp = currentData as unknown as
            | GetAPIMapping["/address"]
            | null;

          const newAddress = {
            Addressid: res.result.addressId,
            Country: countryValue,
            Region: values.region,
            Province: values.province,
            City: values.city,
            Barangay: values.barangay,
            Addressdetails: values.addressDetails,
          } as Address;

          if (temp)
            return {
              ...temp,
              data: [...temp.data, newAddress],
            };

          return temp;
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
