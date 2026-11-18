import { useState } from 'react';
import { Menu, X, Globe, Eye, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from './ImageWithFallback';
import { DEFAULT_BRAND_FACE_IMAGE } from './PortfolioManagerModal';

export function Navbar() {
  const { lang, toggleLang, route, navigate, data, isPreview, exitPreview, refreshPublicData } = useApp();
  const isAr = lang === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const companyName = isAr
    ? data?.content?.companyNameAr || 'محمود شعبان للدعاية والإعلان'
    : data?.content?.companyNameEn || 'Mahmoud Shaaban';
  const logoUrl = data?.content?.logoUrl || DEFAULT_BRAND_FACE_IMAGE;

  const navItems = [
    { path: '/', labelAr: 'الرئيسية', labelEn: 'Home' },
    { path: '/services', labelAr: 'خدماتنا', labelEn: 'Services' },
    { path: '/portfolio', labelAr: 'معرض الأعمال', labelEn: 'Portfolio' },
    { path: '/studio', labelAr: 'استوديو الليد والذكاء', labelEn: 'LED AI Studio' },
    { path: '/contact', labelAr: 'اتصل بنا', labelEn: 'Contact' },
  ];

  const handleNav = (path: string) => {
    setMobileOpen(false);
    const target = isPreview && path !== '/admin' ? `${path}?preview=1` : path;
    navigate(target);
  };

  const handlePublishFromPreview = async () => {
    setPublishing(true);
    try {
      const token = window.localStorage.getItem('msa_admin_token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/admin/cms/publish', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        exitPreview();
        await refreshPublicData(false);
      }
    } finally {
      setPublishing(false);
    }
  };

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <header className="print:hidden sticky top-0 z-40 w-full bg-[#0A0B0E]/92 backdrop-blur-md border-b border-white/10">
      {isPreview && (
        <div className="bg-[#1D6BFF] text-white border-b border-white/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <Eye className="w-4 h-4 shrink-0" />
              <span>
                {isAr
                  ? 'وضع المعاينة قبل النشر — التعديلات المعروضة لم تُنشر للزوار بعد'
                  : 'Draft Preview Mode — Changes shown here are not yet live'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0A0B0E]/30 hover:bg-[#0A0B0E]/50 font-semibold transition-colors cursor-pointer"
              >
                <BackIcon className="w-3.5 h-3.5" />
                <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Admin'}</span>
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={() => void handlePublishFromPreview()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#D4AF37] hover:bg-[#E2BF4E] text-[#0A0B0E] font-bold transition-colors cursor-pointer disabled:opacity-60"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{publishing ? (isAr ? 'جاري النشر...' : 'Publishing...') : isAr ? 'نشر الآن' : 'Publish Live'}</span>
              </button>
              <button
                type="button"
                onClick={exitPreview}
                className="px-2.5 py-1.5 rounded-md bg-white/15 hover:bg-white/25 font-semibold transition-colors cursor-pointer"
              >
                {isAr ? 'إنهاء المعاينة' : 'Exit Preview'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand face/logo + wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="inline-flex items-center gap-2.5 text-sm sm:text-lg font-extrabold tracking-tight text-[#F4F4F6] hover:text-[#D4AF37] transition-colors whitespace-nowrap min-w-0"
        >
          <ImageWithFallback
            src={logoUrl}
            alt={companyName}
            loading="eager"
            className="h-9 w-9 rounded-lg object-cover border border-[#D4AF37]/60 shrink-0 bg-[#0A0B0E]"
          />
          <span className="truncate max-w-[170px] sm:max-w-none">{companyName}</span>
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav aria-label={isAr ? 'التنقل الرئيسي' : 'Main Navigation'} className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = route === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  active
                    ? 'text-[var(--accent-gold)] border-[var(--accent-gold)]'
                    : 'text-[#B5BAC7] border-transparent hover:text-white hover:border-white/20'
                }`}
              >
                {isAr ? item.labelAr : item.labelEn}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Language toggle + Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={isAr ? 'التحويل إلى الإنجليزية' : 'Switch to Arabic'}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#D4D7E0] bg-[#161920] hover:bg-[#1E222B] border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('/quote')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-[#0A0B0E] bg-[var(--accent-gold)] hover:brightness-110 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? 'اطلب عرض سعر' : 'Request Quote'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? (isAr ? 'إغلاق القائمة' : 'Close menu') : (isAr ? 'فتح القائمة' : 'Open menu')}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#161920] border border-white/10 text-[#F4F4F6] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0E1015] border-t border-white/10 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const active = route === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-[#1D6BFF]/15 text-[#60A5FA]' : 'text-[#D4D7E0] hover:bg-white/5'
                }`}
              >
                {isAr ? item.labelAr : item.labelEn}
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => handleNav('/quote')}
            className="w-full mt-2 px-4 py-3 text-sm font-bold text-[#0A0B0E] bg-[var(--accent-gold)] rounded-lg transition-all cursor-pointer"
          >
            {isAr ? 'اطلب عرض سعر الآن' : 'Request a Quote'}
          </button>
        </div>
      )}
    </header>
  );
}
