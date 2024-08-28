import { component$, QRL, Slot, JSXOutput } from "@builder.io/qwik";
import { cn } from "~/common/utils";

const Th = component$(() => {
  return (
    <th class="p-3 text-left whitespace-nowrap">
      <Slot />
    </th>
  );
});

const Td = component$(() => {
  return (
    <td class="px-3 py-4 whitespace-nowrap">
      <div class="animate-fade-in-slide duration-300 bg-transparent">
        <Slot />
      </div>
    </td>
  );
});

const RowSkeleton = component$(() => (
  <td class="px-3 py-4 animate-pulse">
    <div class="h-6 bg-soft rounded" />
  </td>
));

const TableSkeleton = component$(() => {
  return (
    <>
      {[...Array(10)].map((_, index) => (
        <tr key={index} class="border-b border-soft">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </tr>
      ))}
    </>
  );
});

// const TableBody = component$(() => {});

export type RowDefKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${RowDefKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

interface ITableProps<T extends object> {
  headers: string[];
  data: T[];
  rowDef: (RowDefKeyOf<T> | QRL<(item: T) => JSXOutput>)[];
  loading?: boolean | null;
}

export const Table = component$(
  <T extends object>({ headers, loading, data, rowDef }: ITableProps<T>) => {
    return (
      <div class="overflow-x-auto">
        <table
          class={cn(
            "w-full min-w-[800px] rounded-lg overflow-hidden",
            "table border-collapse",
          )}
        >
          <thead>
            <tr class="brightness-125 shadow-md">
              {headers.map((value) => (
                <Th key={value}>{value}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : (
              data.map((item, idx) => {
                return (
                  <tr
                    key={idx}
                    class="border-b border-soft cursor-pointer hover:bg-soft duration-200 ease-out"
                  >
                    {rowDef.map((property, idx) => {
                      let value: any = item;

                      if (typeof property === "string") {
                        const keys = property.split(".");
                        for (const key of keys) {
                          if (value && key in value) {
                            value = value[key];
                          } else {
                            value = undefined;
                            break;
                          }
                        }

                        return <Td key={idx}>{value}</Td>;
                      }

                      return <Td key={idx}>{property(item)}</Td>;
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  },
);
