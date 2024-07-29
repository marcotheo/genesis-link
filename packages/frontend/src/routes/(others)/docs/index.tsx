import type { DocumentHead } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import Menu, {
  DropDownMenuItem,
  DropDownMenuLabel,
  DropDownSeparator,
} from "~/components/dropdownmenu/dropdownmenu";
import Card, {
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/card/card";
import Dialog, { DialogTrigger } from "~/components/dialog/dialog";
import Heading from "~/components/heading/heading";
import Button from "~/components/button/button";
import Input from "~/components/input/input";

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
              <div class="flex flex-col items-end w-full md:w-[50rem] md:flex-row md:gap-5">
                <Input label="Outlined" />
                <Input label="Underline" variant="underline" />
                <Input label="Filled" variant="filled" />
              </div>
            </div>

            <div>
              <div class="flex gap-2 items-center pb-3">
                <Heading>Menus</Heading>
                <div class="w-full h-[1px] bg-gray-500" />
              </div>

              <div class="flex justify-between gap-5">
                <Menu title="Menu">
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

                <Menu title="Menu">
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
                <Dialog size="lg">
                  <DialogTrigger q:slot="trigger">LG</DialogTrigger>
                  <div>asdasdasd</div>
                  <div>asdasdasd</div>
                  <div>asdasdasd</div>
                  <div>asdasdasd</div>
                  <div>asdasdasd</div>
                  <div>asdasdasd</div>
                </Dialog>

                <Dialog size="md">
                  <DialogTrigger q:slot="trigger">MD</DialogTrigger>
                  <div>asdasdasd</div>
                </Dialog>

                <Dialog size="sm">
                  <DialogTrigger q:slot="trigger">SM</DialogTrigger>
                  <div>asdasdasd</div>
                </Dialog>
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
