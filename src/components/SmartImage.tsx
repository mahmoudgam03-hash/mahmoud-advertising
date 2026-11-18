import { ImageWithFallback } from './ImageWithFallback';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSrc?: string;
}

export function SmartImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  fallbackSrc,
}: SmartImageProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      fallbackTitle={fallbackTitle}
      fallbackSrc={fallbackSrc}
      className={className}
      loading="lazy"
    />
  );
}
