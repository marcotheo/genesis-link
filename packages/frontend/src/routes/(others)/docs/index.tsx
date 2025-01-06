import type { DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";

import Menu, {
  DropDownMenuItem,
  DropDownMenuLabel,
  DropDownSeparator,
} from "~/components/drop-down/drop-down";
import Card, {
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/card/card";
import ThemedSelect from "~/components/themed-select/themed-select";
import * as TModal from "~/components/themed-modal/themed-modal";
import CdnImage from "~/components/cdn-image/cdn-image";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Input from "~/components/input/input";

const sampleOptions = [
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
];

export default component$(() => {
  return (
    <div>
      <br />
      <div class="flex flex-col gap-3">
        <div class="w-full mx-auto min-h-[10rem] p-3">
          <div class="flex flex-col gap-5">
            <div>
              <div class="flex gap-2 items-center pb-3">
                <Heading>Headings</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>
              <div class="flex flex-wrap gap-5 items-end">
                <Heading size="xxl">XXL</Heading>
                <Heading size="xl">XL</Heading>
                <Heading size="lg">Large</Heading>
                <Heading size="md">Medium</Heading>
                <Heading size="sm">Small</Heading>
                <Heading size="xs">XS</Heading>
              </div>
            </div>

            <div>
              <div class="flex gap-2 items-center pb-3">
                <Heading>Buttons</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>
              <div class="flex flex-col md:flex-row gap-5">
                <Button>Default</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            <div class="w-full">
              <div class="flex gap-2 items-center pb-3">
                <Heading>Inputs</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>
              <div class="space-y-5">
                <div class="flex flex-col items-start w-full md:w-[50rem] md:flex-row md:gap-5">
                  <Input label="Outlined" />
                  <Input label="Underline" variant="underline" />
                  <Input label="Filled" variant="filled" />
                </div>
                <div class="flex flex-col items-start w-full md:w-[50rem] md:flex-row md:gap-5">
                  <Input label="Outlined" errorMsg="error message" />
                  <Input
                    label="Underline"
                    variant="underline"
                    errorMsg="error message"
                  />
                  <Input
                    label="Filled"
                    variant="filled"
                    errorMsg="error message"
                  />
                </div>
              </div>
            </div>

            <div class="w-full">
              <div class="flex gap-2 items-center pb-3">
                <Heading>Select</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>
              <div class="space-y-5">
                <div class="flex flex-col items-start w-full md:w-[50rem] md:flex-row md:gap-5">
                  <ThemedSelect label="Outlined" options={sampleOptions} />
                  <ThemedSelect
                    label="Underline"
                    variant="underline"
                    options={sampleOptions}
                  />
                  <ThemedSelect
                    label="Filled"
                    variant="filled"
                    options={sampleOptions}
                  />
                </div>
                <div class="flex flex-col items-start w-full md:w-[50rem] md:flex-row md:gap-5">
                  <ThemedSelect
                    label="Outlined"
                    options={sampleOptions}
                    errorMsg="error message"
                  />
                  <ThemedSelect
                    label="Underline"
                    variant="underline"
                    options={sampleOptions}
                    errorMsg="error message"
                  />
                  <ThemedSelect
                    label="Filled"
                    variant="filled"
                    options={sampleOptions}
                    errorMsg="error message"
                  />
                </div>
              </div>
            </div>

            <div>
              <div class="flex gap-2 items-center pb-3">
                <Heading>Menus</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>

              <div class="flex justify-between gap-5">
                <Menu triggerTitle="Menu">
                  <div q:slot="label">
                    <DropDownMenuLabel>Sample Menu</DropDownMenuLabel>
                  </div>
                  <DropDownMenuItem>Item 1</DropDownMenuItem>
                  <DropDownMenuItem>Item 2</DropDownMenuItem>
                  <DropDownMenuItem>Item 3</DropDownMenuItem>
                  <DropDownSeparator />
                  <DropDownMenuItem>Item 1</DropDownMenuItem>
                  <DropDownMenuItem>Item 2</DropDownMenuItem>
                  <DropDownMenuItem>Item 3</DropDownMenuItem>
                </Menu>

                <Menu triggerTitle="Menu">
                  <DropDownMenuLabel q:slot="label">
                    Sample Menu
                  </DropDownMenuLabel>
                  <DropDownMenuItem>Item 1</DropDownMenuItem>
                  <DropDownMenuItem>Item 2</DropDownMenuItem>
                  <DropDownMenuItem>Item 3</DropDownMenuItem>
                  <DropDownSeparator />
                  <DropDownMenuItem>Item 1</DropDownMenuItem>
                  <DropDownMenuItem>Item 2</DropDownMenuItem>
                  <DropDownMenuItem>Item 3</DropDownMenuItem>
                </Menu>
              </div>
            </div>

            <div>
              <div class="flex gap-2 items-center pb-3">
                <Heading>Dialog</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>

              <div class="flex gap-5">
                <Modal.Root>
                  <TModal.Trigger>Large</TModal.Trigger>
                  <TModal.Content
                    size="lg"
                    modalTitle="Create New Address"
                    modalDescription="enter information for new address option"
                  >
                    <div class="flex gap-3">
                      <Input label="Outlined" />
                      <Input label="Outlined" />
                    </div>

                    <br />

                    <div class="w-full flex justify-end">
                      <TModal.Close>Submit</TModal.Close>
                    </div>
                  </TModal.Content>
                </Modal.Root>

                <Modal.Root>
                  <TModal.Trigger>Medium</TModal.Trigger>
                  <TModal.Content
                    size="md"
                    modalTitle="Create New Address"
                    modalDescription="enter information for new address option"
                  >
                    <div class="flex gap-3">
                      <Input label="Outlined" />
                      <Input label="Outlined" />
                    </div>

                    <br />

                    <div class="w-full flex justify-end">
                      <TModal.Close>Submit</TModal.Close>
                    </div>
                  </TModal.Content>
                </Modal.Root>

                <Modal.Root>
                  <TModal.Trigger>Small</TModal.Trigger>
                  <TModal.Content
                    size="sm"
                    modalTitle="Create New Address"
                    modalDescription="enter information for new address option"
                  >
                    <div class="flex gap-3">
                      <Input label="Outlined" />
                      <Input label="Outlined" />
                    </div>

                    <br />

                    <div class="w-full flex justify-end">
                      <TModal.Close>Submit</TModal.Close>
                    </div>
                  </TModal.Content>
                </Modal.Root>
              </div>
            </div>

            <div>
              <div class="flex gap-2 items-center pb-3">
                <Heading>Cards</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>

              <div class="flex flex-wrap gap-5">
                <Card>
                  <CardHeader>Left Header Text</CardHeader>
                  <CardContent>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Phasellus feugiat, massa a interdum sagittis, odio nulla
                    tincidunt nisl, at interdum justo elit ut orci. Vivamus
                    euismod, sapien id vestibulum bibendum, sapien felis
                    condimentum nunc, id luctus eros neque ut erat.
                  </CardContent>
                  <CardFooter>
                    <Button>Submit</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader textPosition="center">
                    Center Header Text
                  </CardHeader>
                  <CardContent class="text-center">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Phasellus feugiat, massa a interdum sagittis, odio nulla
                    tincidunt nisl, at interdum justo elit ut orci. Vivamus
                    euismod, sapien id vestibulum bibendum, sapien felis
                    condimentum nunc, id luctus eros neque ut erat.
                  </CardContent>
                  <CardFooter class="justify-center">
                    <Button>Submit</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader textPosition="right">
                    Right Header Text
                  </CardHeader>
                  <CardContent class="text-right">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Phasellus feugiat, massa a interdum sagittis, odio nulla
                    tincidunt nisl, at interdum justo elit ut orci. Vivamus
                    euismod, sapien id vestibulum bibendum, sapien felis
                    condimentum nunc, id luctus eros neque ut erat.
                  </CardContent>
                  <CardFooter class="justify-end">
                    <Button>Submit</Button>
                  </CardFooter>
                </Card>
              </div>

              <Heading>CDN</Heading>
              <CdnImage
                filename="sample"
                width={600}
                height={600}
                alt="sample"
              />
              <br />
              <br />
            </div>
          </div>

          <br />
          <br />
          <br />
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "UI Docs",
  meta: [
    {
      name: "description",
      content: "Qwik UI docs",
    },
  ],
};
