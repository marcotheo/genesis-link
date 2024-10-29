import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import { useAuthHeadersLoader } from "~/routes/layout";
import Button from "~/components/button/button";
import { qwikFetch } from "~/common/utils";

type Address = {
  Addressid: string;
  Country: string;
  Region: string;
  Province: string;
  City: string;
  Barangay: string;
  Addressdetails: string;
};

interface GetAddressesResponse {
  status: string;
  message: string;
  data: Address[];
}

export const useAddressesLoader = routeLoader$(async ({ resolveValue }) => {
  try {
    const headers = await resolveValue(useAuthHeadersLoader);

    if (!headers) return null;

    const res = await qwikFetch<GetAddressesResponse>(`/api/v1/address`, {
      method: "GET",
      headers: headers,
    });

    return { addresses: res.data };
  } catch (err: any) {
    console.log("Error:", err);

    return null;
  }
});

export default component$(() => {
  const result = useAddressesLoader();

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

      <div class="flex flex-col gap-5">
        {result.value?.addresses.map((v) => (
          <div key={v.Addressid} class="p-3 shadow-sm bg-surface">
            <p>
              {v.Addressdetails}, {v.Barangay},
            </p>
            <p>
              {v.City}, {v.Province}, {v.Region},
            </p>
            <p>{v.Country},</p>
          </div>
        ))}
      </div>
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
