import { component$, isServer, useSignal, useTask$ } from "@builder.io/qwik";
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
    const stateTracked = track(state);

    if (isServer) return;

    if (
      stateTracked.result?.data.bannerLink?.SignedHeader &&
      Object.keys(stateTracked.result.data.bannerLink.SignedHeader).length > 0
    ) {
      const imageResponse = await fetch(
        stateTracked.result.data.bannerLink.URL,
        {
          method: stateTracked.result.data.bannerLink.Method,
          headers: stateTracked.result.data.bannerLink.SignedHeader,
        },
      );

      if (!imageResponse.ok) {
        throw new Error("Failed to fetch the image");
      }

      const imageBlob = await imageResponse.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);

      bannerImgUrl.value = imageObjectURL;
    } else {
      bannerImgUrl.value = stateTracked.result?.data.bannerLink?.URL ?? "";
    }

    if (
      stateTracked.result?.data.logoLink?.SignedHeader &&
      Object.keys(stateTracked.result.data.logoLink.SignedHeader).length > 0
    ) {
      const imageResponse = await fetch(stateTracked.result.data.logoLink.URL, {
        method: stateTracked.result.data.logoLink.Method,
        headers: stateTracked.result.data.logoLink.SignedHeader,
      });

      if (!imageResponse.ok) {
        throw new Error("Failed to fetch the image");
      }

      const imageBlob = await imageResponse.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);

      logoImgUrl.value = imageObjectURL;
    } else {
      logoImgUrl.value = stateTracked.result?.data.logoLink?.URL ?? "";
    }
  });

  return (
    <div>
      {state.loading ? (
        "Loading ..."
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
