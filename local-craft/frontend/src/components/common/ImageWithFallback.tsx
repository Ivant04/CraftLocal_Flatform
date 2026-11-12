import React, { useEffect, useState } from "react";
import { DEFAULT_CRAFT_IMAGE, resolveImageUrl } from "../../utils/normalizers";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = DEFAULT_CRAFT_IMAGE,
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(() => (src ? resolveImageUrl(src) : fallbackSrc));

  useEffect(() => {
    setImgSrc(src ? resolveImageUrl(src) : fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt || "Image"}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
      {...props}
    />
  );
};

export default ImageWithFallback;
