import { $, component$, useContext, useSignal } from "@builder.io/qwik";

import Dialog, { DialogTrigger } from "~/components/dialog/dialog";
import { useQuery } from "~/hooks/use-query/useQuery";
import { ListAddressResponse } from "~/common/types";
import Heading from "~/components/heading/heading";
import { FormDataCtx, FormStepCtx } from "./index";
import Button from "~/components/button/button";
import CreateAddress from "./CreateAddress";
import { cn } from "~/common/utils";

const AddressOptions = component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);
  const selectedAddress = useSignal(formDataCtx.form2 ?? "");

  const handleSubmit = $(() => {
    try {
      formDataCtx.form2 = selectedAddress.value;
      activeStep.value = 3;
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  const { state } = useQuery<ListAddressResponse>(
    "/address",
    {},
    { runOnRender: true },
  );

  return (
    <div class="space-y-5 max-h-[28rem] overflow-y-auto pr-3">
      {state.result?.data.map((v) => (
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
      ))}

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
});

export default component$(() => {
  return (
    <div class="flex h-full w-full justify-center">
      <div class={cn("px-5 lg:px-24 md:py-12 w-full")}>
        <Heading class="max-md:hidden">Address Information</Heading>

        <br class="max-md:hidden" />

        <p class="text-gray-500 max-md:hidden">Set address for the job post.</p>

        <br class="max-md:hidden" />

        <AddressOptions />

        <div class="flex justify-end mt-5">
          <Button type="submit" class="mt-3">
            Next {"->"}
          </Button>
        </div>
      </div>
    </div>
  );
});
