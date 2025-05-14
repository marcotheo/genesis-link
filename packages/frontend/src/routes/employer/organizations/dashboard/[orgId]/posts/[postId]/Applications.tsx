import { $, component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import Heading from "~/components/heading/heading";
import { Table } from "~/components/table/table";

import { GetApplicationsByPostIdApi } from "~/types/application";
import { useQuery } from "~/hooks/use-query/useQuery";
import ApplicationMenu from "./ApplicationMenu";
import { usePathParams } from "../../../layout";

export default component$(() => {
  const pathParams = usePathParams();
  const page = useSignal(1);

  const { state } = useQuery(
    "GET /posts/{postId}/applications",
    {
      queryStrings: {
        page,
      },
      pathParams: {
        postId: pathParams.value.postId,
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

  const CreatedAtRow = $(
    (item: GetApplicationsByPostIdApi["response"]["data"]["applications"][0]) =>
      dayjs.unix(item.createdAt).format("MMM DD, YYYY"),
  );

  return (
    <div class="space-y-3">
      <Heading>Applications:</Heading>

      <div>
        <Table
          loading={state.loading}
          data={state.result?.data.applications ?? []}
          headers={["Name", "Email", "MobileNumber", "Status", "CreatedAt"]}
          rowKey={"applicationId"}
          rowDef={["name", "email", "mobileNumber", "status", CreatedAtRow]}
          renderMenu$={$((row: any) => (
            <ApplicationMenu item={row} />
          ))}
        />

        <div class="flex w-full justify-end">
          <Pagination
            totalPages={
              state.result?.data.total
                ? Math.ceil(state.result.data.total / 5)
                : 0
            }
            currentPage={page}
          />
        </div>
      </div>
    </div>
  );
});
