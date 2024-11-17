import {
  $,
  component$,
  createContextId,
  QRL,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import {
  TbCheck,
  TbExclamationCircle,
  TbInfoTriangle,
} from "@qwikest/icons/tablericons";
import { cn } from "~/common/utils";

type Position =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

type ToastData = {
  id: number;
  title: string;
  message: string;
  type?: "success" | "destructive" | "info";
};

interface ToasterState {
  addToast: QRL<
    (
      data: Omit<ToastData, "id">,
      options?: {
        position?: Position;
        timerMs?: number;
      },
    ) => void
  >;
}

interface ToastStore {
  "top-right": ToastData[];
  "top-left": ToastData[];
  "top-center": ToastData[];
  "bottom-right": ToastData[];
  "bottom-left": ToastData[];
  "bottom-center": ToastData[];
}

export const ToasterContext = createContextId<ToasterState>("toaster.context");

const Icon = component$<{ status: "success" | "destructive" | "info" }>(
  ({ status }) => {
    return (
      <span class={`text-${status}`}>
        {status === "success" && <TbCheck />}
        {status === "destructive" && <TbExclamationCircle />}
        {status === "info" && <TbInfoTriangle />}
      </span>
    );
  },
);

const ToastArea = component$<{
  toasts: ToastStore;
  removeToast: QRL<(id: number, position: Position) => void>;
  position: Position;
}>(({ toasts, removeToast, position }) => {
  const positionCss = {
    "top-right": "top-8 right-8",
    "top-left": "top-8 left-8",
    "top-center": "top-8 left-1/2 transform -translate-x-1/2",
    "bottom-right": "bottom-8 right-8",
    "bottom-left": "bottom-8 left-8",
    "bottom-center": "bottom-8 left-1/2 transform -translate-x-1/2",
  };

  return (
    <div
      class={cn("flex flex-col space-y-2 z-50", "fixed", positionCss[position])}
    >
      {toasts[position].map((toast) => (
        <div
          key={toast.id}
          class={[
            "min-w-64 min-[400px]:min-w-80 max-w-xs w-full p-4",
            "rounded-sm shadow-lg transition-opacity",
            "animate-fade-in-slide duration-300",
            "bg-surface border-l-4",
            toast.type === "success" ? "border-success" : "",
            toast.type === "destructive" ? "border-destructive" : "",
            toast.type === "info" ? "border-info" : "",
          ]}
        >
          <button
            onClick$={() => removeToast(toast.id, position)}
            class={cn(
              "fixed top-2 right-4 text-xl",
              "ml-2 text-white opacity-75 hover:opacity-100",
            )}
          >
            &times;
          </button>

          <div class="flex justify-between items-center">
            <div class="flex flex-col gap-1">
              <div class="flex gap-1 items-center">
                <Icon status={toast.type ?? "info"} />
                <p class="text-text font-semibold">{toast.title}</p>
              </div>
              <p class="text-text text-sm">{toast.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default component$(() => {
  const toasts = useStore<{
    "top-right": ToastData[];
    "top-left": ToastData[];
    "top-center": ToastData[];
    "bottom-right": ToastData[];
    "bottom-left": ToastData[];
    "bottom-center": ToastData[];
  }>({
    "top-right": [],
    "top-left": [],
    "top-center": [],
    "bottom-right": [],
    "bottom-left": [],
    "bottom-center": [],
  });

  const removeToast = $((id: number, position: Position) => {
    toasts[position] = toasts[position].filter((toast) => toast.id !== id);
  });

  const addToast = $(
    (
      data: Omit<ToastData, "id">,
      options?: {
        position?: Position;
        timerMs?: number;
      },
    ) => {
      const { position = "bottom-right", timerMs = 3000 } = options ?? {};

      const id = Date.now();

      toasts[position] = [
        ...toasts[position],
        {
          ...data,
          id,
          type: data.type ? data.type : "info",
        },
      ];

      setTimeout(() => removeToast(id, position), timerMs);
    },
  );

  useContextProvider(ToasterContext, {
    addToast,
  });

  return (
    <>
      <ToastArea
        toasts={toasts}
        removeToast={removeToast}
        position="top-right"
      />

      <ToastArea
        toasts={toasts}
        removeToast={removeToast}
        position="top-left"
      />

      <ToastArea
        toasts={toasts}
        removeToast={removeToast}
        position="top-center"
      />

      <ToastArea
        toasts={toasts}
        removeToast={removeToast}
        position="bottom-right"
      />

      <ToastArea
        toasts={toasts}
        removeToast={removeToast}
        position="bottom-left"
      />

      <ToastArea
        toasts={toasts}
        removeToast={removeToast}
        position="bottom-center"
      />

      <Slot />
    </>
  );
});
