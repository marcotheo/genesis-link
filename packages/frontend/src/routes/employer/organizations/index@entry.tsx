import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { TbFolderOff, TbPlus } from "@qwikest/icons/tablericons";
import { Pagination } from "~/components/pagination/pagination";
import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import { cn } from "~/common/utils";

const TableSkeleton = component$(() => {
  return (
    <>
      {[...Array(5)].map((_, idx) => (
        <div key={idx} class="p-10 bg-soft rounded animate-pulse" />
      ))}
    </>
  );
});

const Organizations = component$(() => {
  const page = useSignal(1);
  const limit = 5;

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

  if (state.loading)
    return (
      <div class="space-y-3">
        <TableSkeleton />
      </div>
    );

  if (state.result?.data.total)
    return (
      <>
        <div class={cn("max-h-96 overflow-y-auto", "space-y-2")}>
          {state.result.data.organizations.map((v) => (
            <Link
              key={v.orgId}
              href={"/employer/organizations/dashboard/" + v.orgId}
              class={cn(
                "bg-surface",
                "flex justify-between items-center",
                "w-full p-8 rounded-md",
                "cursor-pointer",
                "duration-200 ease-in",
                "dark:hover:brightness-110 hover:brightness-90",
                "animate-fade-in-slide",
              )}
            >
              <Heading size="sm">{v.company}</Heading>
              <p>{dayjs.unix(v.createdAt).format("MMM DD, YYYY")}</p>
            </Link>
          ))}
        </div>

        <div class="flex w-full justify-end">
          <Pagination
            totalPages={
              state.result?.data.total
                ? Math.ceil(state.result?.data.total / limit)
                : 0
            }
            currentPage={page}
          />
        </div>
      </>
    );

  return (
    <div
      class={cn(
        "h-96 w-full border-t border-input",
        "flex items-center justify-center",
      )}
    >
      <div class="flex flex-col items-center gap-3">
        <div class="text-6xl">
          <TbFolderOff />
        </div>
        <p class="text-gray-500">No company created</p>
        <Link href="/employer/organizations/create">
          <Button>Create Company</Button>
        </Link>
      </div>
    </div>
  );
});

export default component$(() => {
  return (
    <div class="overflow-hidden pb-6">
      <br />
      <div class="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div class="space-y-1">
          <Heading size="xl">Companies</Heading>
          <p class="text-gray-500 text-sm max-w-[22rem] lg:max-w-[30rem]">
            Please select the company you would like to manage from the
            dashboard to access its settings and details.
          </p>
        </div>

        <Link href="/employer/organizations/create">
          <Button variant="ghost">
            <div class="flex gap-3 items-center bg-transparent">
              <div class="bg-transparent">
                <TbPlus />{" "}
              </div>
              Create Company
            </div>
          </Button>
        </Link>
      </div>

      <br />

      <Organizations />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ark Point",
};
