import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import dayjs from "dayjs";

import { PHpeso, qwikFetch } from "~/common/utils";
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
  data: Post[];
}

// need access token here
export const usePostsLoader = routeLoader$(async ({ cookie, resolveValue }) => {
  const accessToken = cookie.get("accessToken");

  if (!accessToken?.value) return [];

  const isValid = await resolveValue(useAuthCheck);

  if (!isValid) return [];

  try {
    const headers = new Headers();
    headers.append("cookie", `accessToken=${accessToken.value}`);
    headers.append("Content-Type", "application/json");

    const params = new URLSearchParams();
    params.append("page", "1");

    const res = await qwikFetch<Response>(
      `/api/v1/posts/list?${params.toString()}`,
      {
        method: "GET",
        headers: headers,
      },
    );

    return res.data;
  } catch (err: any) {
    console.log("Error:", err);

    return [];
  }
});

const Th = component$(() => {
  return (
    <th class="p-3 text-left">
      <Slot />
    </th>
  );
});

const Td = component$(() => {
  return (
    <td class="px-3 py-5">
      <Slot />
    </td>
  );
});

export default component$(() => {
  const result = usePostsLoader();

  return (
    <div class="overflow-hidden">
      <br />
      <div class="flex justify-end">
        <Button class="text-3xl" size="sm" variant="outline">
          +
        </Button>
      </div>

      <br />

      <div>
        <table class="w-full table border-collapse">
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
            {result.value?.map((item) => (
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
            ))}
          </tbody>
        </table>
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
