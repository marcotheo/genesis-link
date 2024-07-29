import { component$ } from "@builder.io/qwik";

interface CdnImageProps {
  baseUrl?: string;
  filename: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  decoding?: "async" | "sync" | "auto";
  loading?: "eager" | "lazy";
}

export default component$<CdnImageProps>(
  ({
    baseUrl = process.env.CDN_URL,
    filename,
    alt,
    height,
    width,
    decoding = "async",
    loading = "lazy",
    className,
  }) => {
    const sizes = [320, 480, 640, 768, 1024, 1280, 1440, 1920, 2560];
    const dprs = [1, 2];

    const srcSet = sizes
      .flatMap((size) =>
        dprs.map(
          (dpr) =>
            `${baseUrl}/${filename}/${filename}-${size}w-${dpr}x.webp ${size * dpr}w`,
        ),
      )
      .join(", ");

    const sizesAttribute =
      sizes.map((size) => `(max-width: ${size}px) ${size}px`).join(", ") +
      ", 100vw";

    return (
      <img
        src={`${baseUrl}/${filename}/${filename}.webp`}
        srcset={srcSet}
        sizes={sizesAttribute}
        decoding={decoding}
        loading={loading}
        width={width}
        height={height}
        alt={alt}
        class={className}
      />
    );
  },
);
