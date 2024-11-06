import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import { ListPostsResponse, Post } from "~/common/types";
import { useAuthHeadersLoader } from "~/routes/layout";
import { useQuery } from "~/hooks/use-query/useQuery";
import { Table } from "~/components/table/table";
import Button from "~/components/button/button";
import { qwikFetch } from "~/common/utils";

// need access token here
export const usePostsLoader = routeLoader$(async ({ cookie, resolveValue }) => {
  try {
    const headers = await resolveValue(useAuthHeadersLoader);

    if (!headers) return null;

    const params = new URLSearchParams();
    params.append("page", "1");

    const res = await qwikFetch<ListPostsResponse>(
      `/posts/list?${params.toString()}`,
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
  const page = useSignal(1);

  const { state } = useQuery<ListPostsResponse>(
    "/posts/list",
    { page },
    {
      defaultValues: {
        status: "",
        message: "",
        data: result.value ? result.value : { Total: 0, Posts: [] },
      },
    },
  );

  const DeadlineRow = $((item: Post) =>
    dayjs.unix(item.Deadline).format("MMM DD, YYYY"),
  );

  return (
    <div class="overflow-hidden pb-6">
      <br />
      <div class="flex justify-end">
        <Link href="/posts/create">
          <Button class="text-3xl" size="sm" variant="outline">
            +
          </Button>
        </Link>
      </div>

      <br />

      <Table
        loading={state.loading}
        data={state.result!.data.Posts}
        headers={["Job Title", "Company", "Deadline"]}
        rowKey={"Postid"}
        rowDef={["Title", "Company", DeadlineRow]}
      />

      <div class="flex w-full justify-end">
        <Pagination
          totalPages={result.value ? Math.ceil(result.value.Total / 10) : 0}
          currentPage={page}
        />
      </div>
    </div>
  );
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
