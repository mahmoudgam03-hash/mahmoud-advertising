import type { Language } from './types';

export interface SocialShareLinks {
  facebook: string;
  whatsapp: string;
  x: string;
  telegram: string;
  linkedin: string;
}

export interface SeoMetaPayload {
  title: string;
  description: string;
  siteName: string;
  url: string;
  imageUrl: string;
}

/**
 * Resolves the active live shareable URL for social platforms.
 * Prefers a real HTTPS origin (or APP_URL) over placeholder domains or localhost.
 */
export function resolveShareUrl(
  currentOrigin: string,
  domainName?: string,
  path: string = '/'
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const cleanOrigin = (currentOrigin || '').trim().replace(/\/+$/, '');
  const isLocal =
    !cleanOrigin ||
    cleanOrigin.includes('localhost') ||
    cleanOrigin.includes('127.0.0.1') ||
    cleanOrigin.includes('0.0.0.0');

  if (!isLocal && (cleanOrigin.startsWith('https://') || cleanOrigin.startsWith('http://'))) {
    return `${cleanOrigin}${normalizedPath === '/' ? '' : normalizedPath}`;
  }

  const cleanDomain = (domainName || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  if (cleanDomain) {
    return `https://${cleanDomain}${normalizedPath === '/' ? '' : normalizedPath}`;
  }

  return cleanOrigin ? `${cleanOrigin}${normalizedPath === '/' ? '' : normalizedPath}` : '/';
}

/**
 * Builds official share intent URLs for major social media platforms.
 */
export function buildSocialShareLinks(params: {
  url: string;
  title: string;
  text: string;
}): SocialShareLinks {
  const safeUrl = (params.url || '').trim();
  const safeTitle = (params.title || '').trim();
  const safeText = (params.text || '').trim();
  const combinedText = safeText.includes(safeUrl) ? safeText : `${safeText}\n\n${safeUrl}`;

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(safeUrl)}&quote=${encodeURIComponent(safeText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(combinedText)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(safeUrl)}&text=${encodeURIComponent(safeText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(safeUrl)}&text=${encodeURIComponent(safeText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(safeUrl)}`,
  };
}

/**
 * Generates a ready-to-publish promotional post caption for Facebook, WhatsApp, Instagram, and X.
 */
export function buildPromotionalPost(params: {
  lang: Language;
  companyName: string;
  tagline: string;
  phone: string;
  address: string;
  url: string;
}): string {
  const { lang, companyName, tagline, phone, address, url } = params;
  if (lang === 'en') {
    return [
      `${companyName} — ${tagline}`,
      '',
      'Precision fabrication of 3D stainless & acrylic letters, ACP cladding facades, LED neon, and commercial signage.',
      `Location: ${address}`,
      `Call / WhatsApp: ${phone}`,
      `Explore our work & request a quote: ${url}`,
    ].join('\n');
  }

  return [
    `${companyName} — ${tagline}`,
    '',
    'نصمم وننفذ واجهات الكلادينج الفاخرة، الحروف البارزة الاستانلس والأكريليك والسمارت، النيون LED، وليد بروفايل بأعلى دقة وضمان.',
    `العنوان: ${address}`,
    `للتواصل والواتساب: ${phone}`,
    `تصفح أعمالنا واطلب عرض سعر فوري عبر موقعنا: ${url}`,
  ].join('\n');
}

export function escapeHtmlAttr(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Injects published CMS SEO and OpenGraph social card tags into HTML <head>
 * so social media crawlers (Facebook, WhatsApp, X, Telegram, LinkedIn) read rich cards.
 */
export function injectSeoMetaTags(html: string, meta: SeoMetaPayload): string {
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeSiteName = escapeHtmlAttr(meta.siteName);
  const safeUrl = escapeHtmlAttr(meta.url);
  const safeImage = escapeHtmlAttr(meta.imageUrl);

  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  const replaceOrInsertMeta = (attrName: 'name' | 'property', key: string, content: string) => {
    const pattern = new RegExp(
      `<meta\\s+[^>]*${attrName}=["']${key}["'][^>]*\\/?>`,
      'i'
    );
    const tag = `<meta ${attrName}="${key}" content="${content}" />`;
    if (pattern.test(out)) {
      out = out.replace(pattern, tag);
    } else {
      out = out.replace(/<\/head>/i, `    ${tag}\n  </head>`);
    }
  };

  replaceOrInsertMeta('name', 'description', safeDesc);
  replaceOrInsertMeta('property', 'og:site_name', safeSiteName);
  replaceOrInsertMeta('property', 'og:title', safeTitle);
  replaceOrInsertMeta('property', 'og:description', safeDesc);
  replaceOrInsertMeta('property', 'og:url', safeUrl);
  replaceOrInsertMeta('property', 'og:image', safeImage);
  replaceOrInsertMeta('name', 'twitter:title', safeTitle);
  replaceOrInsertMeta('name', 'twitter:description', safeDesc);
  replaceOrInsertMeta('name', 'twitter:image', safeImage);

  return out;
}
