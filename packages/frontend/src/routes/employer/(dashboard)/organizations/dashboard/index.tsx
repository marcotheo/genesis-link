import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import { OrgPartialItem } from "~/types/organizations";
import { useQuery } from "~/hooks/use-query/useQuery";
import { Table } from "~/components/table/table";
import Button from "~/components/button/button";

export default component$(() => {
  const page = useSignal(1);

  const { state } = useQuery(
    "GET /organizations",
    {
      queryStrings: {
        page,
      },
      urlParams: null,
    },
    {
      defaultValues: {
        status: "",
        message: "",
        data: { total: 0, organizations: [] },
      },
      runOnRender: true,
    },
  );

  const createadAtRow = $((item: OrgPartialItem) =>
    dayjs.unix(item.createdAt).format("MMM DD, YYYY"),
  );

  return <div class="overflow-hidden pb-6">asdasdasdasd</div>;
});

export const head: DocumentHead = {
  title: "Accounts Posts List",
  meta: [
    {
      name: "description",
      content: "accounts list of job/volunteering posts created",
    },
  ],
};
