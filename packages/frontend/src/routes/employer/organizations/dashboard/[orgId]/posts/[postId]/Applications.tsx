import { $, component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { GetApplicationsByPostIdApi } from "~/types/application";
import { Pagination } from "~/components/pagination/pagination";
import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";
import { Table } from "~/components/table/table";
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

  const Resume = $(
    async (
      item: GetApplicationsByPostIdApi["response"]["data"]["applications"][0],
    ) => {
      if (item.resumeLink) {
        const imageResponse = await fetch(item.resumeLink.URL, {
          method: item.resumeLink.Method,
          headers: item.resumeLink.SignedHeader,
        });

        if (!imageResponse.ok) {
          return "Error";
        }

        const imageBlob = await imageResponse.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);

        return (
          <a
            href={imageObjectURL}
            target="_blank"
            rel="noopener noreferrer"
            download
            class="text-blue-600 underline underline-offset-4"
          >
            Download CV
          </a>
        );
      }

      return "N/A";
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
            Resume,
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
