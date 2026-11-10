import React, { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = "https://placehold.co/600x400?text=No+Image",
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt || "Image"}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
};

export default ImageWithFallback;
