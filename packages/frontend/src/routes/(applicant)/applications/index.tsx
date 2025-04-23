import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import { Table } from "~/components/table/table";
import Button from "~/components/button/button";

import { GetApplicationsByUserIdApi } from "~/types/application";
import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";

export default component$(() => {
  const page = useSignal(1);

  const { state } = useQuery(
    "GET /applications",
    {
      queryStrings: {
        page,
      },
    },
    {
      defaultValues: {
        status: "",
        message: "",
        data: {
          total: 0,
          applications: [],
        },
      },
      runOnRender: true,
    },
  );

  const DeadlineRow = $(
    (item: GetApplicationsByUserIdApi["response"]["data"]["applications"][0]) =>
      dayjs.unix(item.createdAt).format("MMM DD, YYYY"),
  );

  return (
    <div class="overflow-hidden pb-6">
      <Heading>Applications</Heading>

      <br />

      <Table
        loading={state.loading}
        data={state?.result?.data.applications ?? []}
        headers={["Company", "Title", "Status", "CreatedAt"]}
        rowKey={"postId"}
        rowDef={["company", "title", "status", DeadlineRow]}
      />

      <div class="flex w-full justify-end">
        <Pagination
          totalPages={
            state.result?.data.total
              ? Math.ceil(state.result?.data.total / 5)
              : 0
          }
          currentPage={page}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "ArkPoint",
};
