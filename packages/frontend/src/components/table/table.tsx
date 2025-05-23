import { component$, QRL, Slot, JSXOutput, JSX } from "@builder.io/qwik";
import { cn } from "~/common/utils";

export type RowDefKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${RowDefKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

interface ITableProps<T extends object> {
  headers: string[];
  data: T[];
  rowKey: RowDefKeyOf<T>;
  rowDef: (
    | RowDefKeyOf<T>
    | QRL<(item: T) => JSXOutput>
    | QRL<(item: T) => Promise<JSXOutput>>
  )[];
  renderMenu$?: QRL<(row: T) => JSX.Element>;
  loading?: boolean | null;
  onRowClick?: QRL<(rowId: string) => void>;
}

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

const TableSkeleton = component$<{ total: number }>(({ total }) => {
  return (
    <>
      {[...Array(5)].map((_, idx) => (
        <tr key={idx} class="border-b border-soft">
          {[...Array(total)].map((_, idx) => (
            <td key={idx} class="px-3 py-4 animate-pulse">
              <div class="h-6 bg-soft rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
});

const TableHeaders = component$<{
  headers: string[];
  renderMenu$?: QRL<(row: any) => JSX.Element>;
}>(({ headers, renderMenu$ }) => {
  return (
    <>
      {headers.map((value) => (
        <Th key={value}>{value}</Th>
      ))}
      {renderMenu$ && <Th></Th>}
    </>
  );
});

const RenderMenu = component$(
  (props: { menuFn: QRL<(row: any) => JSX.Element>; row: any }) => {
    return <>{props.menuFn(props.row)}</>;
  },
);

const TableBody = component$(
  <T extends object>({
    headers,
    loading,
    data,
    rowKey,
    rowDef,
    onRowClick,
    renderMenu$,
  }: ITableProps<T>) => {
    const getValue = (item: Object, property: typeof rowKey) => {
      const keys = property.split(".");
      let value: any = item;

      for (const key of keys) {
        if (value && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }

      return value;
    };

    return (
      <>
        {loading ? (
          <TableSkeleton total={headers.length} />
        ) : (
          data.map((item) => {
            const rowId = getValue(item, rowKey);

            return (
              <tr
                key={rowId}
                class={cn(
                  "border-b border-soft",
                  "hover:bg-soft",
                  "duration-200 ease-out",
                  onRowClick && "cursor-pointer",
                )}
                onClick$={() => {
                  if (onRowClick) onRowClick(rowId);
                }}
              >
                {rowDef.map((property, idx) => {
                  if (typeof property === "string") {
                    const value = getValue(item, property);

                    return <Td key={idx}>{value}</Td>;
                  }

                  return <Td key={idx}>{property(item)}</Td>;
                })}
                {renderMenu$ && (
                  <Td>
                    <RenderMenu menuFn={renderMenu$} row={item} />
                  </Td>
                )}
              </tr>
            );
          })
        )}
      </>
    );
  },
);

export const Table = component$(<T extends object>(props: ITableProps<T>) => {
  return (
    <div class="overflow-x-auto w-full">
      <table
        class={cn(
          "w-full",
          "rounded-lg overflow-hidden",
          "table border-collapse",
        )}
      >
        <thead>
          <tr class="brightness-125 shadow-md">
            <TableHeaders
              headers={props.headers}
              renderMenu$={props.renderMenu$}
            />
          </tr>
        </thead>
        <tbody>
          <TableBody {...props} />
        </tbody>
      </table>
    </div>
  );
});
