import {
  $,
  component$,
  Signal,
  useContext,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
import { Modal } from "@qwik-ui/headless";
import dayjs from "dayjs";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useQuery } from "~/hooks/use-query/useQuery";
import { useToast } from "~/hooks/use-toast/useToast";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import * as TModal from "~/components/themed-modal/themed-modal";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Alert from "~/components/alert/alert";

import { FormDataCtx, FormStepCtx } from "./index";
import CreateAddress from "./CreateAddress";
import FormWrapper from "./FormWrapper";
import { cn } from "~/common/utils";

const AddressOptions = component$<{ selectedAddress: Signal<string> }>(
  ({ selectedAddress }) => {
    const { state } = useQuery("/address", {}, { runOnRender: true });

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

        <Modal.Root>
          <TModal.Trigger
            class={cn(
              "w-full px-5 py-10",
              "border-2 border-surface",
              "shadow-sm text-text",
              "flex justify-center items-center",
              "cursor-pointer",
              "dark:hover:brightness-125 brightness-95",
              "bg-transparent hover:bg-surface",
              "ease-in duration-200",
            )}
          >
            + Add New Address
          </TModal.Trigger>
          <TModal.Content
            size="lg"
            modalTitle="Create New Address"
            modalDescription="enter information for new address option"
          >
            <CreateAddress />
          </TModal.Content>
        </Modal.Root>
      </div>
    );
  },
);

export default component$(() => {
  const formDataCtx = useContext(FormDataCtx);
  const activeStep = useContext(FormStepCtx);
  const selectedAddress = useSignal(formDataCtx.form3 ?? "");

  const toast = useToast();

  const { mutate, state } = useMutate("/posts/create");

  const handleSubmit = $(async () => {
    try {
      if (!formDataCtx.form1 || !formDataCtx.form2) return;

      const res = await mutate(
        {
          ...formDataCtx.form1,
          wfh: formDataCtx.form1.wfh === "yes" ? 1 : 0,
          logoLink: formDataCtx.form2.logoS3key,
          posterLink: formDataCtx.form2.posterS3Key,
          additionalInfoLink: null,
          deadline: dayjs(formDataCtx.form1.deadline).format("YYYY-MM-DD"),
          addressId: selectedAddress.value,
        },
        {
          credentials: "include",
        },
      );

      formDataCtx.form3 = selectedAddress.value;

      if (res.error) throw res.error;

      if (res.result) {
        toast.add({
          title: "Post Initialized",
          message: "Post Record Saved",
          type: "success",
        });

        formDataCtx.postId = res.result.data.PostId;
      }

      activeStep.value = 4;
    } catch (err) {
      console.error("Error Initializing Post:", err);

      toast.add({
        title: "Post not created",
        message: typeof err === "string" ? err : "Something Went Wrong",
        type: "destructive",
      });
    }
  });

  useTask$(({ track }) => {
    const stepTracker = track(() => activeStep.value);

    if (isServer) return;

    if (stepTracker === 3) {
      // reset form values if not submitted
      selectedAddress.value = formDataCtx.form3 ?? "";
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
