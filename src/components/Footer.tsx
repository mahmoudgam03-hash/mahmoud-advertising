import { useState } from 'react';
import { Phone, Mail, MapPin, ShieldCheck, MessageCircle, Facebook, Share2, Check, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppDirectUrl } from '../shared/whatsapp';
import { buildSocialShareLinks, resolveShareUrl } from '../shared/social-share';

export function Footer() {
  const { lang, navigate, data } = useApp();
  const isAr = lang === 'ar';
  const contact = data?.contact;
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = resolveShareUrl(
    typeof window !== 'undefined' ? window.location.origin : '',
    data?.seoLegal?.domainName,
    '/'
  );
  const companyTitle = isAr
    ? data?.content?.companyNameAr || 'محمود شعبان للدعاية والإعلان'
    : data?.content?.companyNameEn || 'Mahmoud Shaaban Advertising';
  const shareCaption = isAr
    ? `${companyTitle} — ${data?.content?.heroTitleAr || 'نصنع لك حضوراً لا يُنسى'}`
    : `${companyTitle} — ${data?.content?.heroTitleEn || 'We Craft an Unforgettable Presence'}`;
  const shareLinks = buildSocialShareLinks({
    url: shareUrl,
    title: companyTitle,
    text: shareCaption,
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const links = [
    { path: '/', labelAr: 'الرئيسية', labelEn: 'Home' },
    { path: '/services', labelAr: 'خدماتنا', labelEn: 'Services' },
    { path: '/portfolio', labelAr: 'معرض الأعمال', labelEn: 'Portfolio' },
    { path: '/studio', labelAr: 'استوديو الليد والذكاء', labelEn: 'LED AI Studio' },
    { path: '/about', labelAr: 'من نحن', labelEn: 'About Us' },
    { path: '/quote', labelAr: 'طلب عرض سعر', labelEn: 'Request Quote' },
    { path: '/contact', labelAr: 'اتصل بنا', labelEn: 'Contact Us' },
    { path: '/privacy', labelAr: 'سياسة الخصوصية', labelEn: 'Privacy Policy' },
    { path: '/terms', labelAr: 'الشروط والأحكام', labelEn: 'Terms & Conditions' },
  ];

  return (
    <footer className="print:hidden bg-[#08090C] border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand & Social Share */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#F4F4F6]">{companyTitle}</h2>
            <p className="text-sm text-[#A1A6B3] leading-relaxed max-w-sm">
              {isAr
                ? 'تصنيع وتنفيذ اليفط المضيئة، حروف الاستانلس والأكريليك، واجهات الكلادينج، وأنظمة الليد بروفايل والنيون بأعلى معايير الدقة.'
                : 'Precision fabrication of 3D stainless & acrylic signage, ACP cladding facades, and architectural LED systems.'}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              {contact?.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isAr ? 'صفحة فيسبوك' : 'Facebook Page'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161920] hover:bg-[#1877F2]/25 border border-white/10 text-xs font-semibold text-[#D4D7E0] hover:text-white transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>{isAr ? 'فيسبوك' : 'Facebook'}</span>
                </a>
              )}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161920] hover:bg-[#1D6BFF]/25 border border-white/10 text-xs font-semibold text-[#D4D7E0] hover:text-white transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isAr ? 'نشر على فيسبوك' : 'Share'}</span>
              </a>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161920] hover:bg-emerald-500/20 border border-white/10 text-xs font-semibold text-[#D4D7E0] hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'مشاركة واتساب' : 'Share WhatsApp'}</span>
              </a>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161920] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#D4D7E0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A1A6B3]" />}
                <span>{copiedLink ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرابط' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Site Links */}
          <div>
            <h3 className="text-sm font-bold text-[#D4AF37] mb-4">
              {isAr ? 'روابط سريعة' : 'Navigation'}
            </h3>
            <ul className="grid grid-cols-2 gap-2.5">
              {links.map((l) => (
                <li key={l.path}>
                  <a
                    href={l.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(l.path);
                    }}
                    className="text-sm text-[#B5BAC7] hover:text-white transition-colors"
                  >
                    {isAr ? l.labelAr : l.labelEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#D4AF37] mb-4">
              {isAr ? 'بيانات التواصل' : 'Direct Contact'}
            </h3>
            {contact && (
              <div className="space-y-2.5 text-sm text-[#B5BAC7]">
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#1D6BFF] shrink-0" />
                  <span dir="ltr" className="font-mono-tabular">
                    {contact.phone}
                  </span>
                </a>
                <a
                  href={buildWhatsAppDirectUrl(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span dir="ltr" className="font-mono-tabular">
                    {isAr ? `واتساب: ${contact.whatsapp}` : `WhatsApp: ${contact.whatsapp}`}
                  </span>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#1D6BFF] shrink-0" />
                  <span>{contact.email}</span>
                </a>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>{isAr ? contact.addressAr : contact.addressEn}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C92A0]">
          <p>
            © {new Date().getFullYear()}{' '}
            {isAr
              ? 'شركة محمود شعبان للدعاية والإعلان. جميع الحقوق محفوظة.'
              : 'Mahmoud Shaaban Advertising. All rights reserved.'}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigate('/privacy');
              }}
              className="text-[#A1A6B3] hover:text-white transition-colors"
            >
              {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                navigate('/terms');
              }}
              className="text-[#A1A6B3] hover:text-white transition-colors"
            >
              {isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                navigate('/admin');
              }}
              className="inline-flex items-center gap-1.5 text-[#A1A6B3] hover:text-[#D4AF37] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
