import { TbDotsVertical, TbLoader } from "@qwikest/icons/tablericons";
import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import DOMPurify from "isomorphic-dompurify";
import { Modal } from "@qwik-ui/headless";
import dayjs from "dayjs";

import Menu, {
  DropDownMenuItem,
  DropDownMenuItemLink,
  DropDownSeparator,
} from "~/components/drop-down/drop-down";
import * as TModal from "~/components/themed-modal/themed-modal";
import { Pagination } from "~/components/pagination/pagination";
import Heading from "~/components/heading/heading";
import { Table } from "~/components/table/table";

import { GetApplicationsByPostIdApi } from "~/types/application";
import { cn, createDashboardPath } from "~/common/utils";
import { useQuery } from "~/hooks/use-query/useQuery";
import { usePathParams } from "../../../layout";

const ProposalContent = component$<{ applicationId: string }>(
  ({ applicationId }) => {
    const htmlContent = useSignal("");
    const open = useSignal(false);

    const { state, refetch } = useQuery(
      "GET /applications/{applicationId}/proposal-link",
      {
        pathParams: {
          applicationId,
        },
      },
      {
        defaultValues: {
          status: "",
          message: "",
          data: {
            prosalLink: null,
          },
        },
      },
    );

    const setHtmlContent = $(async () => {
      try {
        const result = await refetch();

        if (result.result?.data.prosalLink) {
          const data = await fetch(result.result.data.prosalLink).then(
            (response) => response.text(),
          );

          const cleanHTML = DOMPurify.sanitize(data);

          htmlContent.value = cleanHTML;
        }
      } catch (err) {
        console.error("unable to set html content");
      }
    });

    return (
      <Modal.Root bind:show={open}>
        <button
          onClick$={[$(() => (open.value = true)), setHtmlContent]}
          class="h-full w-full text-left text-text"
        >
          View Proposal
        </button>

        <TModal.Content
          size="lg"
          modalTitle="Applicant Proposal"
          modalDescription="This proposal highlights the applicant's interest, experience, and fit for the role."
        >
          <div class="flex flex-col gap-5 max-w-[47rem]">
            <div class="space-y-1">
              {state.loading ? (
                <div class="w-full min-h-32 flex justify-center items-center">
                  <div class="animate-spin text-3xl w-fit">
                    <TbLoader />
                  </div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={htmlContent.value} />
              )}
            </div>

            <div class="flex justify-end gap-3 mt-5">
              <TModal.Close class="min-[360px]:px-10">Close</TModal.Close>
            </div>
          </div>
        </TModal.Content>
      </Modal.Root>
    );
  },
);

const RowMenu = component$<{
  item: GetApplicationsByPostIdApi["response"]["data"]["applications"][0];
}>(({ item }) => {
  const pathParams = usePathParams();
  const resumeURL = useSignal("");

  const fetchResume = $(async () => {
    if (item.resumeLink) {
      const imageResponse = await fetch(item.resumeLink.URL, {
        method: item.resumeLink.Method,
        headers: item.resumeLink.SignedHeader,
      });

      if (!imageResponse.ok) {
        return "Error";
      }

      const imageBlob = await imageResponse.blob();
      resumeURL.value = URL.createObjectURL(imageBlob);
    }
  });

  useTask$(({ track }) => {
    track(item);
    fetchResume();
  });

  return (
    <div>
      <Menu panelWidth="w-56">
        <div
          q:slot="trigger"
          class={cn(
            "bg-transparent hover:bg-soft",
            "rounded-md h-10 w-10",
            "flex items-center justify-center",
            "text-text text-xl relative",
            "hover:brightness-90 dark:hover:brightness-125",
            "transition-all duration-200 ease-in",
          )}
        >
          <TbDotsVertical />
        </div>

        <DropDownMenuItemLink
          link={createDashboardPath(pathParams.value.orgId, "")}
        >
          View Profile
        </DropDownMenuItemLink>
        <DropDownSeparator />
        <DropDownMenuItem>
          {resumeURL ? (
            <a
              href={resumeURL.value}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              Download CV
            </a>
          ) : (
            "No CV"
          )}
        </DropDownMenuItem>
        <DropDownSeparator />
        <DropDownMenuItem>
          <ProposalContent applicationId={item.applicationId} />
        </DropDownMenuItem>
      </Menu>
    </div>
  );
});

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
          data={state?.result?.data.applications ?? []}
          headers={["Name", "Email", "MobileNumber", "Status", "CreatedAt"]}
          rowKey={"applicationId"}
          rowDef={["name", "email", "mobileNumber", "status", CreatedAtRow]}
          renderMenu$={$((row: any) => (
            <RowMenu item={row} />
          ))}
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
