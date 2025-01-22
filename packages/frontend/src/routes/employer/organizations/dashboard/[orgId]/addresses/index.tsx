import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useStore } from "@builder.io/qwik";
import { TbTrash } from "@qwikest/icons/tablericons";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { GetAddresssesByOrgIdApi } from "~/types/organizations";
import { useAuthHeadersLoader } from "~/routes/layout";
import { useFetch } from "~/hooks/use-fetch/useFetch";
import Button from "~/components/button/button";
import { cn, qwikFetch } from "~/common/utils";

export const useAddressesLoader = routeLoader$(
  async ({ resolveValue, params }) => {
    try {
      const headers = await resolveValue(useAuthHeadersLoader);

      if (!headers) return null;

      const res = await qwikFetch<GetAddresssesByOrgIdApi>(
        `/organizations/${params.orgId}/addresses`,
        {
          method: "GET",
          headers: headers,
        },
      );

      return res.data;
    } catch (err: any) {
      console.log("Error:", err);

      return null;
    }
  },
);

const AddressList = component$(() => {
  const result = useAddressesLoader();
  const state = useStore({
    addresses: result.value,
  });

  const { fetch, state: fetchState } = useFetch("/address");

  const onDelete = $(async (addressId: string) => {
    try {
      await fetch(addressId, {
        method: "DELETE",
        credentials: "include",
      });

      if (state.addresses)
        state.addresses = state.addresses.filter(
          (v) => v.Addressid !== addressId,
        );
    } catch (err) {
      console.log("Error:", err);
    }
  });

  return (
    <div class="flex flex-col gap-5">
      <LoadingOverlay open={fetchState.loading}>
        Removing Address
      </LoadingOverlay>

      {state.addresses?.map((v) => (
        <div
          key={v.Addressid}
          class={cn(
            "p-5 shadow-sm bg-surface rounded-md",
            "flex justify-between items-center",
            "animate-fade-in-slide duration-500",
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
            <div class="text-destructive text-2xl w-fit">
              <TbTrash />
            </div>
          </Button>
        </div>
      ))}
    </div>
  );
});

export default component$(() => {
  return (
    <div>
      <br />

      <div class="flex justify-end">
        <Link href="/settings/addressess/create">
          <Button class="px-5 py-3" variant="ghost">
            + Add Address
          </Button>
        </Link>
      </div>

      <br />

      <AddressList />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
};
