import { $, component$, Signal, useContext, useSignal } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import Dialog, { DialogTrigger } from "~/components/dialog/dialog";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useQuery } from "~/hooks/use-query/useQuery";
import { ListAddressResponse } from "~/common/types";
import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import Alert from "~/components/alert/alert";
import CreateAddress from "./CreateAddress";
import FormWrapper from "./FormWrapper";
import { cn } from "~/common/utils";

const AddressOptions = component$<{ selectedAddress: Signal<string> }>(
  ({ selectedAddress }) => {
    const { state } = useQuery<ListAddressResponse>(
      "/address",
      {},
      { runOnRender: true },
    );

    return (
      <div class="space-y-5 max-h-[28rem] overflow-y-auto pr-3">
        {state.loading ? (
          <>
            <div class="w-full py-12 dark:bg-surface bg-gray-300 animate-pulse" />
            <div class="w-full py-12 dark:bg-surface bg-gray-300 animate-pulse" />
          </>
        ) : (
          state.result?.data.map((v) => (
            <button
              key={v.Addressid}
              class={cn(
                "w-full p-5",
                "shadow-sm bg-surface rounded-md",
                "flex justify-between items-center",
                "cursor-pointer",
                "ease-in duration-200",
                selectedAddress.value === v.Addressid
                  ? "dark:brightness-150 brightness-90"
                  : "dark:hover:brightness-125 hover:brightness-95",
              )}
              onClick$={() => (selectedAddress.value = v.Addressid)}
            >
              <div class="text-left">
                {" "}
                <p>
                  {v.Addressdetails}, {v.Barangay},
                </p>
                <p>
                  {v.City}, {v.Province}, {v.Region},
                </p>
                <p>{v.Country},</p>
              </div>
            </button>
          ))
        )}

        <Dialog>
          <DialogTrigger
            q:slot="trigger"
            class={cn(
              "w-full px-5 py-10",
              "border-2 border-surface",
              "shadow-sm rounded-md",
              "flex justify-center items-center",
              "cursor-pointer",
              "dark:hover:brightness-125 brightness-95",
              "bg-transparent hover:bg-surface",
              "ease-in duration-200",
            )}
          >
            <div class="flex items-center gap-2 bg-transparent">
              <p class="text-3xl text-input mb-1">+</p>
              <p class="text-input">Add New Address</p>
            </div>
          </DialogTrigger>

          <div>
            <Heading size="md">New Address</Heading>

            <CreateAddress />
          </div>
        </Dialog>
      </div>
    );
  },
);

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);
  const selectedAddress = useSignal(formDataCtx.form3 ?? "");

  const { mutate, state } = useMutate("/posts/create");

  const handleSubmit = $(async () => {
    try {
      if (formDataCtx.form1) {
        await mutate(
          {
            ...formDataCtx.form1,
            posterLink: "https://example.com/frontend-poster.jpg",
            logoLink: "https://example.com/frontend-logo.png",
            additionalInfoLink: "https://example.com/frontend-job-details",
            addressId: selectedAddress.value,
          },
          {
            credentials: "include",
          },
        );
      }

      formDataCtx.form3 = selectedAddress.value;
      activeStep.value = 3;
    } catch (err) {
      console.error("Error Initializing Post:", err);
    }
  });

  return (
    <FormWrapper formStep={3} activeStep={activeStep.value}>
      <LoadingOverlay open={state.loading}>Initializing Post</LoadingOverlay>

      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Address Information</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">Set address for the job post.</p>

        <br class="max-md:hidden" />

        <Alert
          open={!!state.error}
          variant="error"
          title="Error"
          message={state.error ?? ""}
        />

        <AddressOptions selectedAddress={selectedAddress} />

        <div class="flex justify-end gap-3 mt-5">
          <Button
            type="button"
            class="px-10 border-input text-input"
            variant="outline"
            onClick$={() => (activeStep.value = 2)}
          >
            {"<-"} Prev
          </Button>

          <Button type="submit" class="px-10" onClick$={() => handleSubmit()}>
            Next {"->"}
          </Button>
        </div>
      </div>
    </FormWrapper>
  );
});
