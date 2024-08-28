import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { component$, Slot, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import { cn, PHpeso, qwikFetch } from "~/common/utils";
import { useQuery } from "~/hooks/use-query/useQuery";
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

interface Response {
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

    const res = await qwikFetch<Response>(
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

const Th = component$(() => {
  return (
    <th class="p-3 text-left whitespace-nowrap">
      <Slot />
    </th>
  );
});

const Td = component$(() => {
  return (
    <td class="px-3 py-4 whitespace-nowrap">
      <div class="animate-fade-in-slide duration-300 bg-transparent">
        <Slot />
      </div>
    </td>
  );
});

const RowSkeleton = component$(() => (
  <td class="px-3 py-4 animate-pulse">
    <div class="h-6 bg-soft rounded" />
  </td>
));

const TableSkeleton = component$(() => {
  return (
    <>
      {[...Array(10)].map((_, index) => (
        <tr key={index} class="border-b border-soft">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </tr>
      ))}
    </>
  );
});

export default component$(() => {
  const result = usePostsLoader();
  const page = useSignal(1);

  const { state } = useQuery<Response>(
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

  return (
    <div class="overflow-hidden pb-6">
      <br />
      <div class="flex justify-end">
        <Button class="text-3xl" size="sm" variant="outline">
          +
        </Button>
      </div>

      <br />

      <div class="overflow-x-auto lg:overflow-x-visible">
        <table
          class={cn(
            "w-full min-w-[800px] rounded-lg overflow-hidden",
            "table border-collapse",
          )}
        >
          <thead>
            <tr class="brightness-125 shadow-md">
              <Th>Job Title</Th>
              <Th>Type</Th>
              <Th>Company</Th>
              <Th>Location</Th>
              <Th>Salary</Th>
              <Th>Deadline</Th>
            </tr>
          </thead>
          <tbody>
            {state.loading ? (
              <TableSkeleton />
            ) : (
              state.result?.data.Posts.map((item) => (
                <tr
                  key={item.Postid}
                  class="border-b border-soft cursor-pointer hover:bg-soft duration-200 ease-out"
                >
                  <Td>{item.Title}</Td>
                  <Td>{item.Jobtype.String}</Td>
                  <Td>{item.Company.String}</Td>
                  <Td>{item.Location.String}</Td>
                  <Td>{PHpeso.format(item.Salary.Int64)}</Td>
                  <Td>
                    {dayjs.unix(item.Deadline.Int64).format("MMM DD, YYYY")}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
