import { $, component$, Signal, useContext, useSignal } from "@builder.io/qwik";
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
import { cn } from "~/common/utils";

const AddressOptions = component$<{ selectedAddress: Signal<string> }>(
  ({ selectedAddress }) => {
    const formDataCtx = useContext(FormDataCtx);

    const { state } = useQuery(
      "GET /organizations/{orgId}/addresses",
      {
        pathParams: {
          orgId: formDataCtx.orgId ?? "",
        },
      },
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
              key={v.addressId}
              class={cn(
                "w-full p-5",
                "shadow-sm bg-surface rounded-md",
                "flex justify-between items-center",
                "cursor-pointer",
                "ease-in duration-200",
                selectedAddress.value === v.addressId
                  ? "dark:brightness-150 brightness-90"
                  : "dark:hover:brightness-125 hover:brightness-95",
              )}
              onClick$={() => (selectedAddress.value = v.addressId)}
            >
              <div class="text-left">
                {" "}
                <p>
                  {v.addressDetails}, {v.barangay},
                </p>
                <p>
                  {v.city}, {v.province}, {v.region},
                </p>
                <p>{v.country},</p>
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
  const toast = useToast();
  const activeStep = useContext(FormStepCtx);
  const selectedAddress = useSignal(formDataCtx.form2 ?? "");

  const { mutate, state } = useMutate("POST /organizations/{orgId}/posts");

  const handleSubmit = $(async () => {
    try {
      if (!formDataCtx.form1 || formDataCtx.postId) return;

      const res = await mutate(
        {
          bodyParams: {
            ...formDataCtx.form1,
            wfh: formDataCtx.form1.wfh === "yes" ? 1 : 0,
            deadline: dayjs(formDataCtx.form1.deadline).format("YYYY-MM-DD"),
            addressId: selectedAddress.value,
          },
          pathParams: {
            orgId: formDataCtx.orgId ?? "",
          },
        },
        {
          credentials: "include",
        },
      );

      formDataCtx.form2 = selectedAddress.value;

      if (res.error) throw res.error;

      if (res.result) {
        toast.add({
          title: "Post Initialized",
          message: "Post Record Saved",
          type: "success",
        });

        formDataCtx.postId = res.result.data.postId;
      }

      activeStep.value = 3;
    } catch (err) {
      console.error("Error Initializing Post:", err);

      toast.add({
        title: "Post not created",
        message: typeof err === "string" ? err : "Something Went Wrong",
        type: "destructive",
      });
    }
  });

  return (
    <div class={cn("flex h-full w-full justify-center")}>
      <LoadingOverlay open={state.loading}>Initializing Post</LoadingOverlay>

      <div class={cn("px-5 lg:px-12  md:py-12 w-full")}>
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
            onClick$={() => (activeStep.value = 1)}
          >
            {"<-"} Prev
          </Button>

          <Button type="submit" class="px-10" onClick$={() => handleSubmit()}>
            Next {"->"}
          </Button>
        </div>
      </div>
    </div>
  );
});
