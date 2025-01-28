import {
  $,
  component$,
  noSerialize,
  NoSerialize,
  QRL,
  useStore,
  useTask$,
} from "@builder.io/qwik";

import { TbPhoto } from "@qwikest/icons/tablericons";
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
  ref: QRL<(element: HTMLInputElement) => void>;
  name: string;
  value: NoSerialize<Blob> | NoSerialize<File> | null | undefined;
  defaultImgUrl?: string;
  onInput$: (event: Event, element: HTMLInputElement) => void;
  onChange$: (event: Event, element: HTMLInputElement) => void;
  onBlur$: (event: Event, element: HTMLInputElement) => void;
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
    defaultImgUrl,
    label,
    errorMsg,
    maxSize,
    maxDimensions,
    ...props
  }) => {
    const fileState = useStore<{
      file: NoSerialize<File> | null;
      imageUrl: string | null;
      defaultImgUrl: string | null;
      error: string | null;
      imgWidth: number;
      imgHeight: number;
    }>({
      file: null,
      imageUrl: value ? URL.createObjectURL(value as Blob) : null,
      defaultImgUrl: defaultImgUrl ?? null,
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

      const file = target.files[0] as File | undefined;

      // Reset error and image URL
      fileState.error = null;
      fileState.imageUrl = null;

      if (file) {
        // Validate file type
        if (!["image/png", "image/jpeg"].includes(file.type)) {
          fileState.error = "File must be a PNG or JPEG image.";
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

        fileState.file = noSerialize(file);
        fileState.imageUrl = URL.createObjectURL(file); // Create a preview URL for the image
      }
    });

    useTask$(({ track }) => {
      const newValue = track(() => value as any);
      fileState.file = newValue;
      fileState.imageUrl = newValue ? URL.createObjectURL(newValue) : null;
    });

    return (
      <>
        <div class="space-y-2">
          <label>{label}</label>

          <label
            class={cn(
              "flex justify-center items-center relative",
              "px-2 py-16 w-full",
              "border border-input border-dashed rounded-md",
              "hover:bg-soft duration-300",
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

            {fileState.imageUrl ? (
              <div>
                <img
                  src={fileState.imageUrl}
                  alt="Selected"
                  width={fileState.imgWidth}
                  height={fileState.imgHeight}
                  style={{ maxWidth: "100%", maxHeight: "300px" }}
                />
              </div>
            ) : fileState.defaultImgUrl ? (
              <div>
                <img
                  src={fileState.defaultImgUrl}
                  alt="default alt image"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            ) : (
              <div class="bg-transparent flex flex-col justify-center items-center">
                <div class="text-[7vw]">
                  <TbPhoto />
                </div>
                <p>Choose an image</p>
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
