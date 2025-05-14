import { Link, useLocation } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import { cn } from "~/common/utils";

const Item = component$<{ link: string; title: string }>(({ link, title }) => {
  const location = useLocation();
  const toPathname = link;
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

const Header = component$(() => {
  const location = useLocation();
  const locationPathname = location.url.pathname;
  let headerTitle = "";
  let subTitle = "";

  if (locationPathname === "/settings/profile") {
    headerTitle = "Profile";
    subTitle = "Manage profile settings and details";
  }

  return (
    <div>
      <h1 class="text-3xl font-semibold">{headerTitle}</h1>
      <p class="text-gray-500 max-md:hidden">{subTitle}</p>
    </div>
  );
});

export default component$(() => {
  return (
    <div class="h-full flex gap-3 relative">
      <div
        class={cn(
          "duration-500 transition-[height]",
          "h-[95%] p-5",
          "w-full md:w-36",
          "flex flex-row justify-end",
          "border-r border-soft",
          "max-md:hidden",
        )}
      >
        <ul class="list-none space-y-5">
          <Item title="Profile" link="/settings/profile" />
          <Item title="Password" link="/settings/profile" />
          <Item title="Plan" link="/settings/profile" />
        </ul>
      </div>

      <div class="overflow-hidden pb-6 w-full px-7">
        <Header />
        <br />
        <Slot />
      </div>
    </div>
  );
});
