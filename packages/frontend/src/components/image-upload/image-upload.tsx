import {
  $,
  component$,
  InputHTMLAttributes,
  useSignal,
  useStore,
} from "@builder.io/qwik";

import Button from "../button/button";
import { cn } from "~/common/utils";

interface ImageUploadProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  buttonLabel?: string;
  maxSize?: {
    size: number;
    unit: "KB" | "MB";
  };
  maxDimensions?: {
    width: number;
    height: number;
  };
}

export default component$<ImageUploadProps>(
  ({ label, buttonLabel, maxSize, maxDimensions, ...props }) => {
    const fileState = useStore<{
      imageUrl: string | null;
      error: string | null;
      imgWidth: number;
      imgHeight: number;
    }>({
      imageUrl: null,
      error: null,
      imgWidth: 0,
      imgHeight: 0,
    });

    const fileUploadRef = useSignal<HTMLInputElement>();

    const getMaxSizeInBytes = $((size: number, unit: "KB" | "MB"): number => {
      if (unit === "KB") {
        return size * 1024;
      } else if (unit === "MB") {
        return size * 1024 * 1024;
      }
      return size;
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

      if (!target || !target.files) return;

      const file = target.files[0];

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
        if (maxSize) {
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

        fileState.imageUrl = URL.createObjectURL(file); // Create a preview URL for the image
      }
    });

    return (
      <>
        <input
          {...props}
          type="file"
          class="hidden"
          ref={fileUploadRef}
          onChange$={handleFileChange}
        />

        <div class="space-y-2">
          <label>{label}</label>

          <div
            class={cn(
              "flex justify-center items-center",
              "px-2 py-16",
              "border border-dashed rounded-md",
              !!fileState.error ? "border-destructive" : "",
            )}
          >
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
            ) : (
              <Button
                onClick$={() => fileUploadRef.value?.click()}
                class={cn(
                  "bg-soft text-text",
                  "hover:bg-soft dark:hover:brightness-150 hover:brightness-90",
                )}
              >
                {buttonLabel ? buttonLabel : "upload"}
              </Button>
            )}
          </div>
          <p class="text-destructive">{fileState.error}</p>
        </div>
      </>
    );
  },
);
