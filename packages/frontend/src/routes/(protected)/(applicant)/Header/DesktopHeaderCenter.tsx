import { Link, useLocation } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import { cn } from "~/common/utils";

const CenterHeaderItem = component$<{ title: string; to: string }>(
  ({ title, to }) => {
    const location = useLocation();
    const locationPathname = location.url.pathname;

    return (
      <Link
        href={to}
        class={cn(
          "relative group",
          "before:absolute before:block before:h-[2px] before:w-full before:-bottom-4",
          "before:scale-0 before:hover:scale-100",
          "before:hover:bg-primary before:duration-150",
          locationPathname === to
            ? "before:scale-100 before:bg-primary"
            : "before:dark:hover:brightness-50 before:hover:brightness-200",
        )}
      >
        <p
          class={cn(
            "text-lg dark:text-gray-500 text-gray-400",
            "font-medium",
            "duration-150",
            locationPathname === to ? "text-primary" : "",
          )}
        >
          {title}
        </p>
      </Link>
    );
  },
);

export default component$(() => {
  return (
    <div class={cn("flex items-center gap-12 max-lg:hidden")}>
      <CenterHeaderItem title="profile" to="/settings/profile" />
      <CenterHeaderItem title="jobs" to="/jobs" />
      <CenterHeaderItem title="companies" to="/settings" />
    </div>
  );
});
