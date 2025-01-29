import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal } from "@builder.io/qwik";
import { TbPlus } from "@qwikest/icons/tablericons";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import { Table } from "~/components/table/table";
import Button from "~/components/button/button";

import { createDashboardPath, qwikFetch } from "~/common/utils";
import { GetPostsByOrgApi } from "~/types/organizations";
import { useAuthHeadersLoader } from "~/routes/layout";
import { useQuery } from "~/hooks/use-query/useQuery";
import { useOrgId } from "../../layout";

export const usePostsLoader = routeLoader$(async ({ resolveValue, params }) => {
  try {
    const headers = await resolveValue(useAuthHeadersLoader);

    if (!headers) return null;

    const queryParams = new URLSearchParams();
    queryParams.append("page", "1");

    const res = await qwikFetch<GetPostsByOrgApi["response"]>(
      `/organizations/${params.orgId}/posts?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
      },
    );

    return { ...res.data };
  } catch (err: any) {
    console.log("Error:", err);

    return null;
  }
});

export default component$(() => {
  const result = usePostsLoader();
  const org = useOrgId();
  const page = useSignal(1);

  const { state } = useQuery(
    "GET /organizations/{orgId}/posts",
    {
      queryStrings: {
        page,
      },
      pathParams: {
        orgId: org.value.orgId,
      },
    },
    {
      defaultValues: {
        status: "",
        message: "",
        data: result.value ? result.value : { total: 0, posts: [] },
      },
    },
  );

  const DeadlineRow = $(
    (item: GetPostsByOrgApi["response"]["data"]["posts"][0]) =>
      dayjs.unix(item.deadline).format("MMM DD, YYYY"),
  );

  return (
    <div class="overflow-hidden pb-6">
      <br />
      <div class="flex justify-end">
        <Link href={createDashboardPath(org.value.orgId, "/posts/create")}>
          <Button variant="ghost">
            <div class="flex gap-3 items-center bg-transparent">
              <div class="bg-transparent">
                <TbPlus />
              </div>
              Create Post
            </div>
          </Button>
        </Link>
      </div>

      <br />

      <Table
        loading={state.loading}
        data={state?.result?.data.posts ?? []}
        headers={["Job Title", "Deadline"]}
        rowKey={"postId"}
        rowDef={["title", DeadlineRow]}
      />

      <div class="flex w-full justify-end">
        <Pagination
          totalPages={result.value ? Math.ceil(result.value.total / 10) : 0}
          currentPage={page}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "ArkPoint",
};
