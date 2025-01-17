import { Link, useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useSignal } from "@builder.io/qwik";
import dayjs from "dayjs";

import { Pagination } from "~/components/pagination/pagination";
import { OrgPartialItem } from "~/types/organizations";
import { useQuery } from "~/hooks/use-query/useQuery";
import { Table } from "~/components/table/table";
import Button from "~/components/button/button";

export default component$(() => {
  const loc = useLocation();
  return <div>Hello {loc.params.orgId}!</div>;
});

export const head: DocumentHead = {
  title: "Ark Point",
};
