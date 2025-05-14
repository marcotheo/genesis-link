import { $, component$, Slot, useSignal, useStore } from "@builder.io/qwik";
import { TbEdit, TbLoader, TbXboxX } from "@qwikest/icons/tablericons";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import dayjs from "dayjs";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useQuery } from "~/hooks/use-query/useQuery";
import { useToast } from "~/hooks/use-toast/useToast";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
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

const Email = component$<{ value?: string }>(({ value }) => {
  const store = useStore<{
    value: string | null;
    loading: boolean;
  }>({
    value: null,
    loading: false,
  });
  const toast = useToast();
  const { mutate: updateInfo } = useMutate("PUT /users/update/info");

  const update = $(async () => {
    if (!store.value) return;

    store.loading = true;

    try {
      await updateInfo(
        {
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
});

const MobileNumber = component$<{ value?: string }>(({ value }) => {
  const store = useStore<{
    value: string | null;
    loading: boolean;
  }>({
    value: null,
    loading: false,
  });
  const toast = useToast();
  const { mutate: updateInfo } = useMutate("PUT /users/update/info");

  const update = $(async () => {
    if (!store.value) return;

    store.loading = true;

    try {
      await updateInfo(
        {
          bodyParams: { mobileNumber: store.value },
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
});

const AccountDetails = component$(() => {
  const { state } = useQuery(
    "GET /users/account/details",
    {
      queryStrings: null,
      urlParams: null,
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
      </div>
    );

  return (
    <div class="space-y-3">
      <Email value={state.result?.data.email} />
      <MobileNumber value={state.result?.data.mobileNumber} />
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
            <Heading size="xl">Account Settings</Heading>
            <p class="text-gray-500 text-sm max-w-[22rem] lg:max-w-[30rem]">
              Review and update your account details
            </p>
          </div>
        </div>

        <br />

        <AccountDetails />

        <br />

        <Link href="/employer/organizations">
          <Button
            type="button"
            class="min-[360px]:px-10 border-input text-input"
            variant="outline"
          >
            {"<-"} Organizations
          </Button>
        </Link>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
};
