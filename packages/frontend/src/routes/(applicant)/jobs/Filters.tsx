import { $, component$, Signal, useContext, useSignal } from "@builder.io/qwik";
import { SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik";
import { TbChevronDown, TbSearch } from "@qwikest/icons/tablericons";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Modal } from "@qwik-ui/headless";
import * as v from "valibot";

import ThemedSelect from "~/components/themed-select/themed-select";
import Button from "~/components/button/button";
import Input from "~/components/input/input";
import { cn } from "~/common/utils";
import { SearchJobCtx } from ".";

const schema = v.object({
  keyword: v.pipe(v.string("Required"), v.nonEmpty("Please enter keyword")),
  workSetup: v.optional(v.string()),
  province: v.optional(v.string()),
  city: v.optional(v.string()),
});

type SchemaType = v.InferInput<typeof schema>;

const ModalForm = component$<{ open: Signal<boolean> }>(({ open }) => {
  const searchCtx = useContext(SearchJobCtx);
  const navigate = useNavigate();
  const location = useLocation();

  const [, { Form, Field }] = useForm<SchemaType>({
    loader: {
      value: {
        keyword: "",
        workSetup: undefined,
        province: undefined,
        city: undefined,
      },
    },
    validate: valiForm$(schema),
  });

  const handleSubmit = $<SubmitHandler<SchemaType>>(async (values) => {
    searchCtx.keyword.value = values.keyword;
    searchCtx.page.value = 1;

    const currentParams = new URLSearchParams(location.url.search);
    currentParams.set("page", "1");
    currentParams.set("keyword", values.keyword);

    navigate(`/jobs?${currentParams.toString()}`, { replaceState: true });
    open.value = false;
  });

  return (
    <div>
      <Form class="flex flex-col gap-5" onSubmit$={handleSubmit}>
        <div
          class={cn(
            "w-full p-3 md:p-10",
            "grid grid-cols-6 gap-5",
            "overflow-hidden",
            "duration-500 ease-in-out",
          )}
        >
          <div class="col-span-6 relative">
            <div
              class={cn(
                "bg-transparent",
                "absolute",
                "top-1/2 right-3",
                "-translate-y-1/2",
                "h-fit text-2xl",
              )}
            >
              <TbSearch />
            </div>

            <Field name="keyword">
              {(field, props) => (
                <Input
                  {...props}
                  label="Search Job"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                  required
                />
              )}
            </Field>
          </div>

          <div class="col-span-6 md:col-span-2">
            <Field name="workSetup">
              {(field, props) => (
                <ThemedSelect
                  {...props}
                  name={field.name}
                  variant="filled"
                  label="Work Setup"
                  value={field.value}
                  errorMsg={field.error}
                  options={[
                    { label: "Remote", value: "remote" },
                    { label: "Hybrid", value: "hybrid" },
                    { label: "Site", value: "site" },
                  ]}
                />
              )}
            </Field>
          </div>

          <div class="col-span-3 md:col-span-2">
            <Field name="province">
              {(field, props) => (
                <Input
                  {...props}
                  label="Province"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                  required
                />
              )}
            </Field>
          </div>

          <div class="col-span-3 md:col-span-2">
            <Field name="city">
              {(field, props) => (
                <Input
                  {...props}
                  label="city"
                  variant="filled"
                  errorMsg={field.error}
                  value={field.value}
                  required
                />
              )}
            </Field>
          </div>

          <div class="col-span-2 md:col-span-1">
            <Button class="h-12 w-full" type="submit">
              Search
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
});

export default component$(() => {
  const open = useSignal(false);

  return (
    <Modal.Root bind:show={open}>
      <Modal.Trigger
        class={cn(
          "bg-primary rounded-md w-full",
          "text-white p-2 lg:p-3 duration-300",
          "hover:brightness-125",
        )}
      >
        Start Search
      </Modal.Trigger>

      <Modal.Panel
        class={cn(
          "h-96 w-full",
          "bottom-0 mb-0",
          "bg-surface",
          "data-[open]:animate-sheet-up",
          "data-[closed]:animate-sheet-down",
          "overflow-visible",

          "data-[open]:backdrop:bg-[rgba(0,0,0,0.5)]",
          "data-[open]:backdrop:backdrop-blur-sm",
        )}
      >
        <div class="p-5 dark:bg-background bg-gray-100 shadow-lg">
          Search Jobs
        </div>

        <ModalForm open={open} />

        <Modal.Close
          class={cn(
            "absolute",
            "-top-3 left-1/2 -translate-x-1/2",
            "rounded-full p-2",
            "text-text",
            "bg-soft hover:brightness-90 dark:hover:brightness-125",
          )}
        >
          <TbChevronDown />
        </Modal.Close>
      </Modal.Panel>
    </Modal.Root>
  );
});
