import {
  $,
  component$,
  noSerialize,
  NoSerialize,
  QRL,
  useStore,
  useTask$,
} from "@builder.io/qwik";

import { TbFile } from "@qwikest/icons/tablericons";
import InputError from "../input-error/input-error";
import { cn } from "~/common/utils";

interface ImageUploadProps {
  maxSize?: {
    size: number;
    unit: "KB" | "MB";
  };
  maxDimensions?: {
    width: number;
    height: number;
  };
  fileTypes?: string[];
  maxFiles?: number;
  ref?: QRL<(element: HTMLInputElement) => void>;
  name: string;
  value?: NoSerialize<Blob[]> | NoSerialize<File[]> | null | undefined;
  onInput$?: (event: Event, element: HTMLInputElement) => void;
  onChange$?: (event: Event, element: HTMLInputElement) => void;
  onBlur$?: (event: Event, element: HTMLInputElement) => void;
  onFileSelect?: QRL<(v: NoSerialize<File[]>) => NoSerialize<File[]>>;
  accept?: string;
  required?: boolean;
  multiple?: boolean;
  class?: string;
  label?: string;
  errorMsg?: string;
}

export default component$<ImageUploadProps>(
  ({
    name,
    value,
    label,
    errorMsg,
    maxFiles,
    fileTypes,
    maxSize,
    maxDimensions,
    onFileSelect,
    ...props
  }) => {
    const { multiple } = props;
    const fileState = useStore<{
      files: NoSerialize<File[]> | null;
      error: string | null;
      imgWidth: number;
      imgHeight: number;
    }>({
      files: null,
      error: null,
      imgWidth: 0,
      imgHeight: 0,
    });

    const getMaxSizeInBytes = $((size: number, unit: "KB" | "MB"): number => {
      if (unit === "KB") {
        return size * 1024;
      } else {
        return size * 1024 * 1024;
      }
    });

    const validateImageDimensions = $(
      (file: File, maxWidth: number, maxHeight: number): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            fileState.imgWidth = img.width;
            fileState.imgHeight = img.height;
            const isValid = img.width <= maxWidth && img.height <= maxHeight;
            URL.revokeObjectURL(img.src); // Clean up
            resolve(isValid);
          };
        });
      },
    );

    const handleFileChange = $(async (event: Event) => {
      const target = event.target as HTMLInputElement;

      if (!target.files) return;

      // Reset error
      fileState.error = null;

      const files = multiple && fileState.files ? [...fileState.files] : [];

      for (const file of target.files) {
        if (files.find((v) => v.name === file.name)) continue;

        if (!!maxFiles && files.length + 1 > maxFiles) {
          fileState.error = `Can only select ${maxFiles}`;
          return;
        }

        // Validate file type
        if (!!fileTypes && !fileTypes.includes(file.type)) {
          fileState.error = "Invalid File Type";
          return;
        }

        // Validate file size
        if (!!maxSize) {
          const maxSizeInBytes = await getMaxSizeInBytes(
            maxSize.size,
            maxSize.unit,
          ); // 3 KB

          if (file.size > maxSizeInBytes) {
            fileState.error = `File size must not exceed ${maxSize.size}${maxSize.unit} .`;
            return;
          }
        }

        // Validate image dimensions
        if (maxDimensions) {
          const isValidDimensions = await validateImageDimensions(
            file,
            maxDimensions.width,
            maxDimensions.height,
          );

          if (!isValidDimensions) {
            fileState.error = `Image dimensions must be ${maxDimensions.width}x${maxDimensions.height} pixels or smaller.`;
            return;
          }
        }

        files.push(file);
      }

      fileState.files = noSerialize(files);
      if (!!onFileSelect) onFileSelect(noSerialize(files));
    });

    useTask$(({ track }) => {
      const newValue = track(() => value as any);
      fileState.files = newValue;
    });

    return (
      <>
        <div class="space-y-2 w-full">
          <label>{label}</label>

          <label
            class={cn(
              "flex relative",
              "w-full",
              "border border-input rounded-md overflow-y-hidden",
              "hover:brightness-90 dark:hover:brightness-110 duration-300",
              !!fileState.error ? "border-destructive" : "",
            )}
          >
            <input
              {...props}
              type="file"
              id={name}
              onChange$={[handleFileChange, props.onChange$]}
              aria-invalid={!!errorMsg}
              aria-errormessage={`${name}-error`}
              class="absolute h-full w-full cursor-pointer opacity-0"
            />

            {fileState.files && fileState.files.length > 0 ? (
              <div
                class={cn(
                  "flex justify-center items-center gap-3",
                  "px-3 h-10",
                )}
              >
                {fileState.files.map((v) => (
                  <div
                    key={v.name}
                    class={cn(
                      "px-2 pt-1 h-7",
                      "bg-primary rounded-full",
                      "max-w-48",
                    )}
                  >
                    <p class={cn("text-white text-sm truncate")}>{v.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                class={cn(
                  "flex items-center gap-2",
                  "px-3 h-10 bg-transparent",
                )}
              >
                <TbFile />
                <p>Select File</p>
              </div>
            )}
          </label>
          <InputError errorMsg={errorMsg} />
          <InputError errorMsg={fileState.error ?? ""} />
        </div>
      </>
    );
  },
);
