import { component$, isServer, useSignal, useTask$ } from "@builder.io/qwik";
import { TbLoader } from "@qwikest/icons/tablericons";
import { DocumentHead } from "@builder.io/qwik-city";

import { useQuery } from "~/hooks/use-query/useQuery";
import Heading from "~/components/heading/heading";
import { useOrgId } from "../../../layout";
import AssetsForm from "./AssetsForm";
import { cn } from "~/common/utils";

const Content = component$(() => {
  const org = useOrgId();
  const bannerImgUrl = useSignal("");
  const logoImgUrl = useSignal("");

  const { state } = useQuery(
    "GET /organizations/{orgId}/assets",
    {
      pathParams: {
        orgId: org.value.orgId,
      },
    },
    {
      runOnRender: true,
    },
  );

  useTask$(async ({ track }) => {
    const stateTracked = track(() => state.result);

    if (isServer) return;

    if (
      stateTracked?.data.bannerLink?.SignedHeader &&
      Object.keys(stateTracked.data.bannerLink.SignedHeader).length > 0
    ) {
      const imageResponse = await fetch(stateTracked.data.bannerLink.URL, {
        method: stateTracked.data.bannerLink.Method,
        headers: stateTracked.data.bannerLink.SignedHeader,
      });

      if (!imageResponse.ok) {
        throw new Error("Failed to fetch the image");
      }

      const imageBlob = await imageResponse.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);

      bannerImgUrl.value = imageObjectURL;
    } else {
      bannerImgUrl.value = stateTracked?.data.bannerLink?.URL ?? "";
    }

    if (
      stateTracked?.data.logoLink?.SignedHeader &&
      Object.keys(stateTracked.data.logoLink.SignedHeader).length > 0
    ) {
      const imageResponse = await fetch(stateTracked.data.logoLink.URL, {
        method: stateTracked.data.logoLink.Method,
        headers: stateTracked.data.logoLink.SignedHeader,
      });

      if (!imageResponse.ok) {
        throw new Error("Failed to fetch the image");
      }

      const imageBlob = await imageResponse.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);

      logoImgUrl.value = imageObjectURL;
    } else {
      logoImgUrl.value = stateTracked?.data.logoLink?.URL ?? "";
    }
  });

  return (
    <div>
      {state.loading ? (
        <div class={cn("w-full h-[35rem]", "flex justify-center items-center")}>
          <div class="animate-spin text-5xl">
            <TbLoader />
          </div>
        </div>
      ) : (
        <AssetsForm
          orgId={org.value.orgId}
          bannerImgUrl={bannerImgUrl.value}
          logoImgUrl={logoImgUrl.value}
        />
      )}
    </div>
  );
});

export default component$(() => {
  return (
    <>
      <div
        class={cn(
          "flex flex-col min-[1100px]:flex-row",
          "min-[1100px]:items-center justify-between",
          "max-[1100px]:gap-3",
          "py-3",
        )}
      >
        <div>
          <Heading class="max-md:hidden">Visuals & Branding</Heading>
          <p class="text-gray-500 text-sm">
            View and update your company's logo and banner for posts to maintain
            a professional look.
          </p>
        </div>
      </div>

      <Content />
    </>
  );
});

export const head: DocumentHead = {
  title: "ArkPoint",
};
