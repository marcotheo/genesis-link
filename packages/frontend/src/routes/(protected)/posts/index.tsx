import { Link, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import { useQuery } from "~/hooks/use-query/useQuery";
import { PHpeso, qwikFetch } from "~/common/utils";
import { Table } from "~/components/table/table";
import Button from "~/components/button/button";
import { useAuthCheck } from "~/routes/layout";

type Post = {
  Postid: string;
  Title: string;
  Jobtype: {
    String: string;
    Valid: true;
  };
  Company: {
    String: string;
    Valid: true;
  };
  Location: {
    String: string;
    Valid: true;
  };
  Deadline: {
    Int64: number;
    Valid: true;
  };
  Salary: {
    Int64: number;
    Valid: true;
  };
};

interface ListPostsResponse {
  status: string;
  message: string;
  data: {
    Posts: Post[];
    Total: number;
  };
}

// need access token here
export const usePostsLoader = routeLoader$(async ({ cookie, resolveValue }) => {
  const accessToken = cookie.get("accessToken");

  if (!accessToken?.value) return null;

  const isValid = await resolveValue(useAuthCheck);

  if (!isValid) return null;

  try {
    const headers = new Headers();
    headers.append("cookie", `accessToken=${accessToken.value}`);

    const params = new URLSearchParams();
    params.append("page", "1");

    const res = await qwikFetch<ListPostsResponse>(
      `/api/v1/posts/list?${params.toString()}`,
      {
        method: "GET",
        headers: headers,
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
    "/api/v1/posts/list",
    { page },
    {
      defaultValues: {
        status: "",
        message: "",
        data: result.value ? result.value : { Total: 0, Posts: [] },
      },
    },
  );

  const SalaryRow = $((item: Post) => PHpeso.format(item.Salary.Int64));
  const DeadlineRow = $((item: Post) =>
    dayjs.unix(item.Deadline.Int64).format("MMM DD, YYYY"),
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
        headers={[
          "Job Title",
          "Type",
          "Company",
          "Location",
          "Salary",
          "Deadline",
        ]}
        rowKey={"Postid"}
        rowDef={[
          "Title",
          "Jobtype.String",
          "Company.String",
          "Location.String",
          SalaryRow,
          DeadlineRow,
        ]}
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
