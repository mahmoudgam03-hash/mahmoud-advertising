import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPromotionalPost,
  buildSocialShareLinks,
  escapeHtmlAttr,
  injectSeoMetaTags,
  resolveShareUrl,
} from './social-share';

test('resolveShareUrl prefers real HTTPS origin and falls back cleanly for localhost', () => {
  assert.equal(
    resolveShareUrl('https://ais-pre-xyz.run.app/', 'mahmoudshaaban.com', '/'),
    'https://ais-pre-xyz.run.app'
  );
  assert.equal(
    resolveShareUrl('http://localhost:3000', 'mahmoudshaaban.com', '/portfolio'),
    'https://mahmoudshaaban.com/portfolio'
  );
  assert.equal(
    resolveShareUrl('https://mahmoudshaaban.com', '', '/quote'),
    'https://mahmoudshaaban.com/quote'
  );
});

test('buildSocialShareLinks encodes URL and promotional caption for all platforms', () => {
  const links = buildSocialShareLinks({
    url: 'https://example.com',
    title: 'محمود شعبان للدعاية والإعلان',
    text: 'واجهات كلادينج وحروف بارزة',
  });

  assert.ok(links.facebook.startsWith('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com'));
  assert.ok(links.whatsapp.startsWith('https://wa.me/?text='));
  assert.ok(decodeURIComponent(links.whatsapp).includes('https://example.com'));
  assert.ok(links.x.startsWith('https://twitter.com/intent/tweet?'));
  assert.ok(links.telegram.startsWith('https://t.me/share/url?'));
  assert.ok(links.linkedin.startsWith('https://www.linkedin.com/sharing/share-offsite/?url='));
});

test('buildPromotionalPost generates bilingual captions containing contact details and URL', () => {
  const arPost = buildPromotionalPost({
    lang: 'ar',
    companyName: 'محمود شعبان للدعاية والإعلان',
    tagline: 'نصنع لك حضوراً لا يُنسى',
    phone: '01155709023',
    address: 'المنيا - بني مزار',
    url: 'https://example.com',
  });
  assert.ok(arPost.includes('01155709023'));
  assert.ok(arPost.includes('https://example.com'));

  const enPost = buildPromotionalPost({
    lang: 'en',
    companyName: 'Mahmoud Shaaban Advertising',
    tagline: 'Unforgettable Presence',
    phone: '01155709023',
    address: 'Minya, Egypt',
    url: 'https://example.com',
  });
  assert.ok(enPost.includes('Mahmoud Shaaban Advertising'));
  assert.ok(enPost.includes('https://example.com'));
});

test('injectSeoMetaTags escapes special characters and injects og:image and og:url', () => {
  const rawHtml = `<!doctype html><html><head><title>Old</title><meta name="description" content="Old desc" /><meta property="og:title" content="Old" /></head><body></body></html>`;
  const result = injectSeoMetaTags(rawHtml, {
    title: 'شركة "محمود" & شركاه',
    description: 'وصف <اختبار>',
    siteName: 'Mahmoud Shaaban',
    url: 'https://example.com/portfolio',
    imageUrl: 'https://example.com/og-image.jpg',
  });

  assert.equal(escapeHtmlAttr('a"b&c<d>'), 'a&quot;b&amp;c&lt;d&gt;');
  assert.ok(result.includes('<title>شركة &quot;محمود&quot; &amp; شركاه</title>'));
  assert.ok(result.includes('<meta property="og:image" content="https://example.com/og-image.jpg" />'));
  assert.ok(result.includes('<meta property="og:url" content="https://example.com/portfolio" />'));
  assert.ok(result.includes('<meta name="twitter:image" content="https://example.com/og-image.jpg" />'));
});
