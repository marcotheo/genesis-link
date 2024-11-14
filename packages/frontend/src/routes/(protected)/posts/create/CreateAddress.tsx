import { reset, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { $, component$, Slot } from "@builder.io/qwik";

import { CreateAddessSchema, CreateAddressForm } from "~/common/formSchema";
import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { DialogTrigger } from "~/components/dialog/dialog";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import Button from "~/components/button/button";
import { useCreateAddressFormLoader } from ".";
import Alert from "~/components/alert/alert";
import Input from "~/components/input/input";
import { cn } from "~/common/utils";

const FlexWrapper = component$(() => {
  return (
    <div class="flex gap-5">
      <Slot />
    </div>
  );
});

export default component$(() => {
  const { mutate, state } = useMutate<any>("/address/create");

  const [createAddressForm, { Form, Field }] = useForm<CreateAddressForm>({
    loader: useCreateAddressFormLoader(),
    validate: valiForm$(CreateAddessSchema),
  });

  const handleSubmit = $<SubmitHandler<CreateAddressForm>>(async (values) => {
    try {
      await mutate(
        {
          ...values,
          country: "Philippines",
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
    <div class="flex h-full w-full justify-center mt-5">
      <LoadingOverlay open={createAddressForm.submitting}>
        Saving Address
      </LoadingOverlay>

      <div class={cn("w-[40em]")}>
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
            <DialogTrigger
              class="px-10 border-input text-input"
              variant="outline"
              type="button"
            >
              Cancel
            </DialogTrigger>

            <Button class="px-10" type="submit" disabled={!!state.loading}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});
