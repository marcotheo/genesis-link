import { Link, useLocation } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";

const Item = component$<{ link: string; title: string }>(({ link, title }) => {
  const location = useLocation();
  const toPathname = link ?? "";
  const locationPathname = location.url.pathname;

  const startSlashPosition =
    toPathname !== "/" && toPathname.startsWith("/")
      ? toPathname.length - 1
      : toPathname.length;
  const endSlashPosition =
    toPathname !== "/" && toPathname.endsWith("/")
      ? toPathname.length - 1
      : toPathname.length;
  const isActive =
    locationPathname === toPathname ||
    (locationPathname.endsWith(toPathname) &&
      (locationPathname.charAt(endSlashPosition) === "/" ||
        locationPathname.charAt(startSlashPosition) === "/"));

  return (
    <li
      class={cn(
        "dark:hover:text-white hover:text-gray-800",
        "duration-300",
        isActive
          ? "dark:text-white text-gray-800"
          : "dark:text-text text-gray-500",
      )}
    >
      <Link href={link}>{title}</Link>
    </li>
  );
});

export default component$(() => {
  return (
    <div class="h-full flex gap-3">
      <div
        class={cn(
          "h-[95%] w-80",
          "p-5",
          "flex justify-end",
          "border-r border-soft",
        )}
      >
        <ul class="list-none space-y-5">
          <Item title="My Details" link="/settings/details" />
          <Item title="Password" link="/settings/details" />
          <Item title="Addressess" link="/settings/addressess" />
          <Item title="Plan" link="/settings/details" />
        </ul>
      </div>
      <Slot />
    </div>
  );
});
