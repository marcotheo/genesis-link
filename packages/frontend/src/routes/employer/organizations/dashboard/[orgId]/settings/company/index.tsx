import { $, component$, Slot, useSignal, useStore } from "@builder.io/qwik";
import { TbEdit, TbLoader, TbXboxX } from "@qwikest/icons/tablericons";
import { type DocumentHead } from "@builder.io/qwik-city";
import dayjs from "dayjs";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useQuery } from "~/hooks/use-query/useQuery";
import { useToast } from "~/hooks/use-toast/useToast";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import { usePathParams } from "../../../layout";
import Input from "~/components/input/input";
import { cn } from "~/common/utils";

const Item = component$<{ label: string; value: string; noEdit?: boolean }>(
  ({ label, value, noEdit }) => {
    const isEdit = useSignal(false);

    return (
      <div
        class={cn(
          "bg-soft relative rounded-md",
          "min-[1650px]:w-96 p-5",
          "animate-fade-in-slide",
        )}
      >
        <div
          class={cn(
            "absolute top-2 right-2",
            "cursor-pointer hover:text-primary duration-300",
            noEdit ? "hidden" : "",
          )}
          onClick$={$(() => (isEdit.value = !isEdit.value))}
        >
          {isEdit.value ? <TbXboxX /> : <TbEdit />}
        </div>

        {isEdit.value ? (
          <div class="flex pt-3">
            <Slot />
          </div>
        ) : (
          <p class="text-sm lg:text-base">
            <span class="font-semibold">{label}:</span> {value}
          </p>
        )}
      </div>
    );
  },
);

const Email = component$<{ orgId: string; value?: string }>(
  ({ orgId, value }) => {
    const store = useStore<{
      value: string | null;
      loading: boolean;
    }>({
      value: null,
      loading: false,
    });
    const toast = useToast();
    const { mutate: updateInfo } = useMutate(
      "PUT /organizations/{orgId}/update/details",
    );

    const update = $(async () => {
      if (!store.value) return;

      store.loading = true;

      try {
        await updateInfo(
          {
            pathParams: {
              orgId,
            },
            bodyParams: { email: store.value },
          },
          {
            credentials: "include",
          },
        );

        toast.add({
          title: "Update Succeessfuly",
          message: "email updated",
          type: "success",
        });
      } catch (err) {
        console.log(err);
      } finally {
        store.loading = false;
      }
    });

    return (
      <Item label="Email" value={!value ? "N/A" : value}>
        <div class="flex flex-col gap-2 w-full">
          <Input
            label="Email"
            name="email"
            onInput$={(_, c) => (store.value = c.value)}
          />

          <div>
            <Button size="sm" onClick$={update} disabled={store.loading}>
              {store.loading ? (
                <div class="flex items-center gap-3">
                  <p>Saving</p>
                  <div class="animate-spin ">
                    <TbLoader />
                  </div>
                </div>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </div>
      </Item>
    );
  },
);

const MobileNumber = component$<{ orgId: string; value?: string }>(
  ({ orgId, value }) => {
    const store = useStore<{
      value: string | null;
      loading: boolean;
    }>({
      value: null,
      loading: false,
    });
    const toast = useToast();
    const { mutate: updateInfo } = useMutate(
      "PUT /organizations/{orgId}/update/details",
    );

    const update = $(async () => {
      if (!store.value) return;

      store.loading = true;

      try {
        await updateInfo(
          {
            pathParams: {
              orgId,
            },
            bodyParams: { contactNumber: store.value },
          },
          {
            credentials: "include",
          },
        );

        toast.add({
          title: "Update Succeessfuly",
          message: "Mobile Number updated",
          type: "success",
        });
      } catch (err) {
        console.log(err);
      } finally {
        store.loading = false;
      }
    });

    return (
      <Item label="Mobile Number" value={!value ? "N/A" : value}>
        <div class="flex flex-col gap-2 w-full">
          <Input
            label="Mobile Number"
            name="mobileNumber"
            onInput$={(_, c) => (store.value = c.value)}
          />

          <div>
            <Button size="sm" onClick$={update} disabled={store.loading}>
              {store.loading ? (
                <div class="flex items-center gap-3">
                  <p>Saving</p>
                  <div class="animate-spin ">
                    <TbLoader />
                  </div>
                </div>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </div>
      </Item>
    );
  },
);

const AccountDetails = component$(() => {
  const org = usePathParams();

  const { state } = useQuery(
    "GET /organizations/{orgId}/details",
    {
      pathParams: {
        orgId: org.value.orgId,
      },
    },
    {
      runOnRender: true,
    },
  );

  if (state.loading)
    return (
      <div class="space-y-3">
        <div class="py-8 bg-soft rounded animate-pulse" />
        <div class="py-8 bg-soft rounded animate-pulse" />
        <div class="py-8 bg-soft rounded animate-pulse" />
        <div class="py-8 bg-soft rounded animate-pulse" />
      </div>
    );

  return (
    <div class="space-y-3">
      <Item
        label="Company"
        value={state.result?.data.company ?? "N/A"}
        noEdit
      />
      <Email orgId={org.value.orgId} value={state.result?.data.email} />
      <MobileNumber
        orgId={org.value.orgId}
        value={state.result?.data.contactNumber}
      />
      <Item
        label="Registered At"
        value={
          state.result?.data.createdAt
            ? dayjs.unix(state.result.data.createdAt).format("MMM DD, YYYY")
            : "N/A"
        }
        noEdit
      />
    </div>
  );
});

export default component$(() => {
  return (
    <div
      class={cn(
        "overflow-hidden pb-6 h-full",
        "flex justify-center items-center",
      )}
    >
      <div>
        <div class="flex flex-col md:flex-row justify-between md:items-end gap-5">
          <div class="space-y-1">
            <Heading size="xl">Company Settings</Heading>
            <p class="text-gray-500 text-sm max-w-[22rem] lg:max-w-[30rem]">
              Review and update your company details
            </p>
          </div>
        </div>

        <br />

        <AccountDetails />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
};
