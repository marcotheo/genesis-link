import {
  $,
  component$,
  NoSerialize,
  Slot,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import dayjs from "dayjs";

import { TbEdit, TbLoader, TbXboxX } from "@qwikest/icons/tablericons";
import { GenerateS3SignedUrlPut, GetUserAPI } from "~/common/types";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useAuthHeadersLoader } from "~/routes/layout";
import { useToast } from "~/hooks/use-toast/useToast";
import Button from "~/components/button/button";
import FileInput from "~/components/file-input";
import { cn, qwikFetch } from "~/common/utils";
import Input from "~/components/input/input";

export const useAccountDetailsLoader = routeLoader$(
  async ({ resolveValue }) => {
    try {
      const headers = await resolveValue(useAuthHeadersLoader);

      if (!headers) return null;

      const res = await qwikFetch<GetUserAPI>("/users/account/details", {
        method: "GET",
        headers,
      });

      return { ...res.data };
    } catch (err: any) {
      console.log("Error:", err);

      return null;
    }
  },
);

const Item = component$<{ label: string; value: string; noEdit?: boolean }>(
  ({ label, value, noEdit }) => {
    const isEdit = useSignal(false);

    return (
      <div class="p-5 w-96 bg-soft relative rounded-md">
        <div
          class={cn(
            "absolute top-2 right-2",
            "cursor-pointer hover:text-primary duration-300",
            noEdit ? "hidden" : "",
          )}
          onClick$={$(() => (isEdit.value = !isEdit.value))}
        >
          {isEdit.value ? <TbXboxX /> : <TbEdit />}
        </div>

        {isEdit.value ? (
          <div class="flex pt-3">
            <Slot />
          </div>
        ) : (
          <p>
            <span class="font-semibold">{label}:</span> {value}
          </p>
        )}
      </div>
    );
  },
);

const Resume = component$(() => {
  const result = useAccountDetailsLoader();
  const store = useStore<{
    files: NoSerialize<File[]> | null;
    loading: boolean;
  }>({
    files: null,
    loading: false,
  });
  const toast = useToast();
  const { mutate: getSignedUrl } = useMutate<GenerateS3SignedUrlPut>(
    "/s3/generate/url/put",
  );

  const { mutate: updateResumeLink } = useMutate("/users/update/info");

  const uploadResume = $(async () => {
    if (!result.value) return;
    if ((store.files && store.files.length === 0) || !store.files) return;

    const file = store.files[0];

    const s3Key = `resume/${result.value.userId}/${file.name}`;

    store.loading = true;

    try {
      const s3 = await getSignedUrl(
        {
          Key: s3Key,
        },
        {
          credentials: "include",
        },
      );

      if (s3.error) throw s3.error;

      if (s3.result)
        await qwikFetch<null>(s3.result.data.URL, {
          method: s3.result.data.Method,
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

      await updateResumeLink(
        {
          resumeLink: s3Key,
        },
        {
          credentials: "include",
        },
      );

      toast.add({
        title: "Update Succeessfuly",
        message: "Resume updated",
        type: "success",
      });
    } catch (err) {
      console.log(err);
    } finally {
      store.loading = false;
    }
  });

  const handleFileSelect = $((v: NoSerialize<File[]>) => (store.files = v));

  return (
    <Item
      label="Resume"
      value={
        !result.value?.resumeLink
          ? "N/A"
          : result.value.resumeLink.split("/")[2]
      }
    >
      <div class="flex flex-col gap-2 w-full">
        <FileInput
          label="Resume"
          name="resume"
          onFileSelect={handleFileSelect}
        />

        <div>
          <Button size="sm" onClick$={uploadResume} disabled={store.loading}>
            {store.loading ? (
              <div class="flex items-center gap-3">
                <p>Saving</p>
                <div class="animate-spin ">
                  <TbLoader />
                </div>
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </div>
    </Item>
  );
});

const Email = component$(() => {
  const result = useAccountDetailsLoader();
  const store = useStore<{
    value: string | null;
    loading: boolean;
  }>({
    value: null,
    loading: false,
  });
  const toast = useToast();
  const { mutate: updateInfo } = useMutate("/users/update/info");

  const update = $(async () => {
    if (!result.value) return;
    if (!store.value) return;

    store.loading = true;

    try {
      await updateInfo(
        {
          email: store.value,
        },
        {
          credentials: "include",
        },
      );

      toast.add({
        title: "Update Succeessfuly",
        message: "email updated",
        type: "success",
      });
    } catch (err) {
      console.log(err);
    } finally {
      store.loading = false;
    }
  });

  return (
    <Item
      label="Email"
      value={!result.value?.email ? "N/A" : result.value.email}
    >
      <div class="flex flex-col gap-2 w-full">
        <Input
          label="Email"
          name="email"
          onInput$={(_, c) => (store.value = c.value)}
        />

        <div>
          <Button size="sm" onClick$={update} disabled={store.loading}>
            {store.loading ? (
              <div class="flex items-center gap-3">
                <p>Saving</p>
                <div class="animate-spin ">
                  <TbLoader />
                </div>
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </div>
    </Item>
  );
});

const MobileNumber = component$(() => {
  const result = useAccountDetailsLoader();
  const store = useStore<{
    value: string | null;
    loading: boolean;
  }>({
    value: null,
    loading: false,
  });
  const toast = useToast();
  const { mutate: updateInfo } = useMutate("/users/update/info");

  const update = $(async () => {
    if (!result.value) return;
    if (!store.value) return;

    store.loading = true;

    try {
      await updateInfo(
        {
          mobileNumber: store.value,
        },
        {
          credentials: "include",
        },
      );

      toast.add({
        title: "Update Succeessfuly",
        message: "Mobile Number updated",
        type: "success",
      });
    } catch (err) {
      console.log(err);
    } finally {
      store.loading = false;
    }
  });

  return (
    <Item
      label="Mobile Number"
      value={!result.value?.mobileNumber ? "N/A" : result.value.mobileNumber}
    >
      <div class="flex flex-col gap-2 w-full">
        <Input
          label="Mobile Number"
          name="mobileNumber"
          onInput$={(_, c) => (store.value = c.value)}
        />

        <div>
          <Button size="sm" onClick$={update} disabled={store.loading}>
            {store.loading ? (
              <div class="flex items-center gap-3">
                <p>Saving</p>
                <div class="animate-spin ">
                  <TbLoader />
                </div>
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </div>
    </Item>
  );
});

export default component$(() => {
  const result = useAccountDetailsLoader();

  return (
    <div class="mt-5 space-y-5">
      <Email />
      <MobileNumber />
      <Resume />
      <Item
        label="Registered At"
        value={dayjs(result.value?.createdAt).format("MMM DD, YYYY")}
        noEdit
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Profile",
  meta: [
    {
      name: "description",
      content: "manage profile settings",
    },
  ],
};
