import Image from "next/image";

type DocumentCoverImageProps = {
  src: string;
  alt?: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function isTayNinhLibraryUrl(url: string) {
  return url.includes("thuvien.tayninh.gov.vn");
}

export function DocumentCoverImage({ src, alt = "", fill, sizes, className, priority }: DocumentCoverImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={isTayNinhLibraryUrl(src)}
    />
  );
}
