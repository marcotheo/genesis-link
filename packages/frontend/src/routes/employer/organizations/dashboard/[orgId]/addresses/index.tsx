import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { TbPlus, TbTrash } from "@qwikest/icons/tablericons";
import { $, component$, useStore } from "@builder.io/qwik";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { cn, createDashboardPath, qwikFetch } from "~/common/utils";
import { GetAddresssesByOrgIdApi } from "~/types/organizations";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useAuthHeadersLoader } from "~/routes/layout";
import { useToast } from "~/hooks/use-toast/useToast";
import Button from "~/components/button/button";
import { usePathParams } from "../../layout";

export const useAddressesLoader = routeLoader$(
  async ({ resolveValue, params }) => {
    try {
      const headers = await resolveValue(useAuthHeadersLoader);

      if (!headers) return null;

      const res = await qwikFetch<GetAddresssesByOrgIdApi["response"]>(
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
  const toast = useToast();
  const params = usePathParams();

  const state = useStore({
    addresses: result.value,
  });

  const { mutate, state: fetchState } = useMutate(
    "DELETE /organizations/{orgId}/addresses/{addressId}",
  );

  const onDelete = $(async (addressId: string) => {
    try {
      const { error } = await mutate({
        pathParams: {
          orgId: params.value.orgId,
          addressId,
        },
      });

      if (error) throw error;

      if (state.addresses)
        state.addresses = state.addresses.filter(
          (v) => v.addressId !== addressId,
        );
    } catch (err) {
      console.log("Error:", err);

      toast.add({
        title: "Failed Delete",
        message: err as string,
        type: "destructive",
      });
    }
  });

  return (
    <div class="flex flex-col gap-5">
      <LoadingOverlay open={fetchState.loading}>
        Removing Address
      </LoadingOverlay>

      {state.addresses?.map((v) => (
        <div
          key={v.addressId}
          class={cn(
            "p-5 shadow-sm bg-surface rounded-md",
            "flex justify-between items-center",
            "animate-fade-in-slide duration-500",
          )}
        >
          <div>
            {" "}
            <p>
              {v.addressDetails}, {v.barangay},
            </p>
            <p>
              {v.city}, {v.province}, {v.region},
            </p>
            <p>{v.country},</p>
          </div>

          <Button
            class="group cursor-pointer bg-transparent"
            variant="ghost"
            onClick$={() => onDelete(v.addressId)}
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

const CreateAddressLink = component$(() => {
  const result = usePathParams();

  return (
    <div class="flex justify-end">
      <Link href={createDashboardPath(result.value.orgId, "/addresses/create")}>
        <Button class="px-5 py-3" variant="ghost">
          <div class="flex gap-3 items-center bg-transparent">
            <div class="bg-transparent">
              <TbPlus />
            </div>
            Add Address
          </div>
        </Button>
      </Link>
    </div>
  );
});

export default component$(() => {
  return (
    <div>
      <br />

      <CreateAddressLink />

      <br />

      <AddressList />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
};
