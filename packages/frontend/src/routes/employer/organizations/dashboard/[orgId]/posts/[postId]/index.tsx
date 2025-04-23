import { $, component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import dayjs from "dayjs";

import { GetApplicationsByPostIdApi } from "~/types/application";
import { Pagination } from "~/components/pagination/pagination";
import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";
import { Table } from "~/components/table/table";

export const usePostId = routeLoader$(({ params }) => {
  const { postId } = params; // Extract the route parameter

  return {
    postId,
  };
});

export default component$(() => {
  const pathParams = usePostId();
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
    <div>
      <Heading>Applications</Heading>

      <br />

      <div>
        <Table
          loading={state.loading}
          data={state?.result?.data.applications ?? []}
          headers={[
            "Name",
            "Resume",
            "Email",
            "MobileNumber",
            "Status",
            "CreatedAt",
          ]}
          rowKey={"applicationId"}
          rowDef={[
            "name",
            "resumeLink",
            "email",
            "mobileNumber",
            "status",
            CreatedAtRow,
          ]}
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
    </div>
  );
});
