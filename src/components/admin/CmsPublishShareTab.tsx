import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Facebook,
  Globe,
  MessageCircle,
  RefreshCw,
  Rocket,
  Send,
  Share2,
} from 'lucide-react';
import type { CmsSnapshotPayload } from '../../shared/types';
import {
  buildPromotionalPost,
  buildSocialShareLinks,
  resolveShareUrl,
} from '../../shared/social-share';
import { SmartImage } from '../SmartImage';

interface CmsPublishShareTabProps {
  isAr: boolean;
  published: CmsSnapshotPayload;
  hasUnpublishedChanges: boolean;
  publishing: boolean;
  onPublish: () => Promise<void>;
  onDownloadBackup: () => Promise<void>;
}

export function CmsPublishShareTab({
  isAr,
  published,
  hasUnpublishedChanges,
  publishing,
  onPublish,
  onDownloadBackup,
}: CmsPublishShareTabProps) {
  const activeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const initialUrl = useMemo(
    () => resolveShareUrl(activeOrigin, published.seoLegal?.domainName, '/'),
    [activeOrigin, published.seoLegal?.domainName]
  );

  const [shareUrl, setShareUrl] = useState(initialUrl);
  const [captionLang, setCaptionLang] = useState<'ar' | 'en'>(isAr ? 'ar' : 'en');
  const [customCaption, setCustomCaption] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [nativeShareNote, setNativeShareNote] = useState<string | null>(null);

  const generatedCaption = useMemo(() => {
    const companyName =
      captionLang === 'ar'
        ? published.content.companyNameAr
        : published.content.companyNameEn;
    const tagline =
      captionLang === 'ar' ? published.content.heroTitleAr : published.content.heroTitleEn;
    const address =
      captionLang === 'ar' ? published.contact.addressAr : published.contact.addressEn;
    return buildPromotionalPost({
      lang: captionLang,
      companyName,
      tagline,
      phone: published.contact.whatsapp || published.contact.phone,
      address,
      url: shareUrl,
    });
  }, [captionLang, published, shareUrl]);

  useEffect(() => {
    setCustomCaption(generatedCaption);
  }, [generatedCaption]);

  const cardTitle = isAr
    ? published.seoLegal.metaTitleAr || published.content.companyNameAr
    : published.seoLegal.metaTitleEn || published.content.companyNameEn;
  const cardDesc = isAr
    ? published.seoLegal.metaDescriptionAr || published.content.heroSubtitleAr
    : published.seoLegal.metaDescriptionEn || published.content.heroSubtitleEn;
  const cardImage =
    published.content.heroBgImageUrl || '/src/assets/images/hero_luxury_signage_1794750813882.jpg';

  const shareLinks = useMemo(
    () =>
      buildSocialShareLinks({
        url: shareUrl,
        title: cardTitle,
        text: customCaption,
      }),
    [shareUrl, cardTitle, customCaption]
  );

  const copyText = async (value: string, type: 'url' | 'post') => {
    try {
      await navigator.clipboard.writeText(value);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      } else {
        setCopiedPost(true);
        setTimeout(() => setCopiedPost(false), 2500);
      }
    } catch {
      // Fallback handled cleanly
    }
  };

  const handleNativeShare = async () => {
    setNativeShareNote(null);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: cardTitle,
          text: customCaption,
          url: shareUrl,
        });
        setNativeShareNote(isAr ? 'تمت المشاركة عبر تطبيقات الجهاز' : 'Shared via device sheet');
        return;
      } catch {
        // User cancelled or blocked in iframe; fall back to clipboard copy
      }
    }
    await copyText(customCaption, 'post');
    setNativeShareNote(
      isAr
        ? 'تم نسخ المنشور والرابط تلقائياً — الصقه مباشرة في إنستغرام أو تيك توك أو فيسبوك'
        : 'Post caption & link copied — paste directly in Instagram, TikTok, or Facebook'
    );
  };

  const displayHost = useMemo(() => {
    try {
      return new URL(shareUrl).host;
    } catch {
      return shareUrl;
    }
  }, [shareUrl]);

  return (
    <div className="space-y-8">
      {/* 1. Save & Publish Site Section */}
      <div className="bg-[#12141A] border border-white/15 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {isAr ? 'حفظ الموقع ونشره للزوار' : 'Save Website & Publish Live'}
              </span>
            </h2>
            <p className="text-xs text-[#A1A6B3] mt-1">
              {hasUnpublishedChanges
                ? isAr
                  ? 'توجد تعديلات في المسودة بانتظار النشر على الموقع المباشر قبل مشاركتها على السوشيال ميديا.'
                  : 'You have unpublished draft edits waiting to go live before sharing.'
                : isAr
                  ? 'جميع تعديلات الموقع منشورة ومحفوظة في قاعدة البيانات وجاهزة للمشاركة الآن.'
                  : 'All website changes are saved in the database and published live.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={publishing}
              onClick={() => void onPublish()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] disabled:opacity-60 rounded-lg cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>
                {publishing
                  ? isAr
                    ? 'جاري الحفظ والنشر...'
                    : 'Publishing...'
                  : hasUnpublishedChanges
                    ? isAr
                      ? 'حفظ ونشر التعديلات الآن'
                      : 'Save & Publish Changes Now'
                    : isAr
                      ? 'تأكيد النشر المباشر'
                      : 'Re-publish Live'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void onDownloadBackup()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#161920] hover:bg-[#1E222B] border border-white/15 rounded-lg cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#60A5FA]" />
              <span>
                {isAr ? 'حفظ نسخة كاملة على جهازك (.json)' : 'Save Full Copy (.json)'}
              </span>
            </button>
          </div>
        </div>

        {/* Shareable URL Selector */}
        <div className="pt-4 border-t border-white/10 space-y-2.5">
          <label htmlFor="cms-share-url" className="block text-xs font-semibold text-[#D4D7E0]">
            {isAr ? 'رابط الموقع المعتمد للمشاركة على التواصل الاجتماعي' : 'Website URL to Share'}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-[#60A5FA] absolute top-3 start-3.5" />
              <input
                id="cms-share-url"
                type="url"
                dir="ltr"
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                className="w-full ps-10 pe-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-xs sm:text-sm text-white font-mono-tabular"
              />
            </div>
            <button
              type="button"
              onClick={() => void copyText(shareUrl, 'url')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#1D6BFF] hover:bg-[#3B82F6] rounded-lg cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUrl ? (isAr ? 'تم نسخ الرابط' : 'Link Copied') : isAr ? 'نسخ الرابط' : 'Copy URL'}</span>
            </button>
          </div>
          {published.seoLegal?.domainName && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8C92A0]">
              <span>{isAr ? 'تبديل سريع للرابط:' : 'Quick URL switch:'}</span>
              {activeOrigin && (
                <button
                  type="button"
                  onClick={() => setShareUrl(activeOrigin)}
                  className="px-2.5 py-1 rounded bg-[#0A0B0E] border border-white/10 hover:border-[#1D6BFF] text-[#B5BAC7] hover:text-white cursor-pointer"
                >
                  {isAr ? 'الرابط الحالي المباشر' : 'Current Live URL'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const clean = published.seoLegal.domainName.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
                  if (clean) setShareUrl(`https://${clean}`);
                }}
                className="px-2.5 py-1 rounded bg-[#0A0B0E] border border-white/10 hover:border-[#D4AF37] text-[#B5BAC7] hover:text-white cursor-pointer"
              >
                {isAr
                  ? `الدومين المخصص (${published.seoLegal.domainName})`
                  : `Custom Domain (${published.seoLegal.domainName})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Social Card Preview + Ready-to-Post Publisher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live OpenGraph Card Preview */}
        <div className="lg:col-span-5 bg-[#12141A] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'معاينة شكل الرابط عند نشره على فيسبوك وواتساب' : 'Social Link Card Preview'}
            </h3>
            <span className="text-[11px] text-[#D4AF37] font-semibold">OpenGraph</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/15 bg-[#0A0B0E]">
            <div className="aspect-[16/9] bg-[#161920] overflow-hidden">
              <SmartImage
                src={cardImage}
                alt={cardTitle}
                className="w-full h-full object-cover"
                fallbackTitle={cardTitle}
              />
            </div>
            <div className="p-4 space-y-1.5">
              <div dir="ltr" className="text-[11px] uppercase tracking-wider text-[#60A5FA] font-mono-tabular truncate">
                {displayHost}
              </div>
              <div className="text-sm font-bold text-white line-clamp-2">{cardTitle}</div>
              <p className="text-xs text-[#A1A6B3] line-clamp-2 leading-relaxed">{cardDesc}</p>
            </div>
          </div>

          <p className="text-[11px] text-[#8C92A0] leading-relaxed">
            {isAr
              ? 'يتم حقن صورة الواجهة الرئيسية وعنوان SEO ووصف الموقع تلقائياً في وسم OpenGraph (/og-image.jpg) لتظهر البطاقة بهذا الشكل عند مشاركة الرابط.'
              : 'Your published hero image, SEO title, and description are automatically embedded in OpenGraph tags for rich link previews.'}
          </p>
        </div>

        {/* Ready-to-Post Caption & Social Platform Buttons */}
        <div className="lg:col-span-7 bg-[#12141A] border border-white/10 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#1D6BFF]" />
              <h3 className="text-base font-bold text-white">
                {isAr ? 'نشر مباشر على مواقع التواصل الاجتماعي' : 'Publish to Social Media'}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0A0B0E] p-1 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setCaptionLang('ar')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  captionLang === 'ar' ? 'bg-[#1D6BFF] text-white' : 'text-[#A1A6B3]'
                }`}
              >
                منشور عربي
              </button>
              <button
                type="button"
                onClick={() => setCaptionLang('en')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  captionLang === 'en' ? 'bg-[#1D6BFF] text-white' : 'text-[#A1A6B3]'
                }`}
              >
                English Post
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A1A6B3]">
              <label htmlFor="social-post-caption">
                {isAr ? 'نص المنشور الترويجي (قابل للتعديل قبل النشر)' : 'Editable Social Post Caption'}
              </label>
              <button
                type="button"
                onClick={() => setCustomCaption(generatedCaption)}
                className="inline-flex items-center gap-1 text-[#60A5FA] hover:text-white cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isAr ? 'إعادة التوليد' : 'Reset Text'}</span>
              </button>
            </div>
            <textarea
              id="social-post-caption"
              rows={6}
              dir={captionLang === 'ar' ? 'rtl' : 'ltr'}
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-xs sm:text-sm text-white leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void copyText(customCaption, 'post')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
            >
              {copiedPost ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>
                {copiedPost
                  ? isAr
                    ? 'تم نسخ المنشور!'
                    : 'Post Copied!'
                  : isAr
                    ? 'نسخ نص المنشور والرابط'
                    : 'Copy Post & Link'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleNativeShare()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#161920] hover:bg-[#1E222B] border border-white/15 rounded-lg cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#60A5FA]" />
              <span>
                {isAr ? 'مشاركة على تطبيقات الهاتف (إنستغرام / تيك توك)' : 'Share via Device Apps'}
              </span>
            </button>
          </div>

          {nativeShareNote && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3.5 py-2.5">
              {nativeShareNote}
            </div>
          )}

          {/* Direct Social Network Intent Links */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="text-xs font-semibold text-[#A1A6B3]">
              {isAr ? 'اختر المنصة للنشر الفوري:' : 'Publish directly to:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-xs font-bold text-white transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-[#60A5FA]" />
                  <span>{isAr ? 'فيسبوك' : 'Facebook'}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-white transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-white" />
                  <span>{isAr ? 'منصة X' : 'X / Twitter'}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-bold text-white transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>{isAr ? 'تيليجرام' : 'Telegram'}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-white transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>{isAr ? 'لينكدإن' : 'LinkedIn'}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {published.contact.facebookUrl && (
                <a
                  href={published.contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-xs font-bold text-[#F3D878] transition-colors"
                >
                  <span className="truncate">
                    {isAr ? 'صفحة الشركة' : 'Our Page'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
