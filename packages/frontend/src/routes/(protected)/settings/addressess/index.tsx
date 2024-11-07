import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useAuthHeadersLoader } from "~/routes/layout";
import { ListAddressResponse } from "~/common/types";
import { TrashBin } from "~/components/icons/icons";
import Button from "~/components/button/button";
import { cn, qwikFetch } from "~/common/utils";

export const useAddressesLoader = routeLoader$(async ({ resolveValue }) => {
  try {
    const headers = await resolveValue(useAuthHeadersLoader);

    if (!headers) return null;

    const res = await qwikFetch<ListAddressResponse>("/address", {
      method: "GET",
      headers: headers,
    });

    return res.data;
  } catch (err: any) {
    console.log("Error:", err);

    return null;
  }
});

const AddressList = component$(() => {
  const result = useAddressesLoader();
  const localData = useSignal(result.value);

  const { mutate, state } = useMutate("/address");

  const onDelete = $(async (addressId: string) => {
    try {
      await mutate(addressId, {
        method: "DELETE",
        credentials: "include",
      });

      if (localData.value)
        localData.value = localData.value.filter(
          (v) => v.Addressid !== addressId,
        );
    } catch (err) {
      console.log("Error:", err);
    }
  });

  return (
    <div class="flex flex-col gap-5">
      <LoadingOverlay open={state.loading}>Removing Address</LoadingOverlay>

      {localData.value?.map((v) => (
        <div
          key={v.Addressid}
          class={cn(
            "p-5 shadow-sm bg-surface rounded-md",
            "flex justify-between items-center",
          )}
        >
          <div>
            {" "}
            <p>
              {v.Addressdetails}, {v.Barangay},
            </p>
            <p>
              {v.City}, {v.Province}, {v.Region},
            </p>
            <p>{v.Country},</p>
          </div>

          <Button
            class="group cursor-pointer bg-transparent"
            variant="ghost"
            onClick$={() => onDelete(v.Addressid)}
          >
            <TrashBin class="text-destructive w-7 h-7" />
          </Button>
        </div>
      ))}
    </div>
  );
});

export default component$(() => {
  return (
    <div class="overflow-hidden pb-6 w-full px-7">
      <br />

      <div class="flex justify-end">
        <Link href="/settings/addressess/create">
          <Button class="text-3xl" size="sm" variant="outline">
            +
          </Button>
        </Link>
      </div>

      <br />

      <AddressList />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Address settings",
  meta: [
    {
      name: "description",
      content: "manage addressess",
    },
  ],
};
