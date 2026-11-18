import { useEffect, useState, type ImgHTMLAttributes } from 'react';

export interface ImageWithFallbackProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  fallbackTitle?: string;
}

const PRIMARY_SIGNAGE_FALLBACK = '/src/assets/images/hero_luxury_signage_1794750813882.jpg';
const VECTOR_STATIC_FALLBACK = '/fallback-signage.svg';

export function ImageWithFallback({
  src,
  alt = '',
  fallbackSrc = PRIMARY_SIGNAGE_FALLBACK,
  fallbackTitle,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  onError,
  ...rest
}: ImageWithFallbackProps) {
  const normalizedSrc = (src || '').trim();
  const [stage, setStage] = useState<'primary' | 'secondary' | 'vector'>(
    normalizedSrc ? 'primary' : 'secondary'
  );

  useEffect(() => {
    setStage(normalizedSrc ? 'primary' : 'secondary');
  }, [normalizedSrc]);

  const resolvedSrc =
    stage === 'primary' && normalizedSrc
      ? normalizedSrc
      : stage === 'secondary'
      ? fallbackSrc
      : VECTOR_STATIC_FALLBACK;

  return (
    <img
      {...rest}
      src={resolvedSrc}
      alt={alt || fallbackTitle || 'Mahmoud Shaaban Advertising'}
      loading={loading}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      onError={(e) => {
        onError?.(e);
        if (stage === 'primary') {
          setStage(normalizedSrc === fallbackSrc ? 'vector' : 'secondary');
        } else if (stage === 'secondary') {
          setStage('vector');
        }
      }}
      className={className}
    />
  );
}
