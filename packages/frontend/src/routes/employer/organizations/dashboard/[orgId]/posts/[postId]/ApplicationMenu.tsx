import { TbDotsVertical, TbLoader } from "@qwikest/icons/tablericons";
import { $, component$, useSignal } from "@builder.io/qwik";
import DOMPurify from "isomorphic-dompurify";
import { Modal } from "@qwik-ui/headless";

import Menu, {
  DropDownMenuItem,
  DropDownMenuItemLink,
  DropDownSeparator,
} from "~/components/drop-down/drop-down";
import * as TModal from "~/components/themed-modal/themed-modal";

import { GetApplicationsByPostIdApi } from "~/types/application";
import { cn, createDashboardPath } from "~/common/utils";
import { useQuery } from "~/hooks/use-query/useQuery";
import { useToast } from "~/hooks/use-toast/useToast";
import { usePathParams } from "../../../layout";

const Resume = component$<{ applicationId: string }>(({ applicationId }) => {
  const toast = useToast();
  const { state, refetch } = useQuery(
    "GET /applications/{applicationId}/resume-link",
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
          resumeLink: null,
        },
      },
    },
  );

  const fetchResume = $(async () => {
    try {
      const result = await refetch();

      if (result.error) throw result.error;

      if (result.result?.data.resumeLink) {
        window.open(result.result.data.resumeLink, "_blank");

        return;
      }

      toast.add({
        title: "Failed",
        message: "No resume uploaded yet.",
        type: "destructive",
      });
    } catch (err) {
      console.error("Error fetching resume URL:", err);
      toast.add({
        title: "Failed",
        message: "Failed to load resume. Please try again.",
        type: "destructive",
      });
    }
  });

  return (
    <button
      disabled={!!state.loading}
      onClick$={fetchResume}
      class="h-full w-full text-left text-text"
    >
      View CV
    </button>
  );
});

const ProposalContent = component$<{ applicationId: string }>(
  ({ applicationId }) => {
    const toast = useToast();
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

        if (result.error) throw result.error;

        if (result.result?.data.prosalLink) {
          const data = await fetch(result.result.data.prosalLink).then(
            (response) => response.text(),
          );

          const cleanHTML = DOMPurify.sanitize(data);

          htmlContent.value = cleanHTML;

          return;
        }

        toast.add({
          title: "Not Available",
          message: "No proposal submitted",
          type: "info",
        });
      } catch (err) {
        open.value = false;
        console.error("unable to set html content");
        toast.add({
          title: "Failed",
          message: "Failed to load proposal. Please try again.",
          type: "destructive",
        });
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

export default component$<{
  item: GetApplicationsByPostIdApi["response"]["data"]["applications"][0];
}>(({ item }) => {
  const pathParams = usePathParams();

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
          <Resume applicationId={item.applicationId} />
        </DropDownMenuItem>
        <DropDownSeparator />
        <DropDownMenuItem>
          <ProposalContent applicationId={item.applicationId} />
        </DropDownMenuItem>
      </Menu>
    </div>
  );
});
