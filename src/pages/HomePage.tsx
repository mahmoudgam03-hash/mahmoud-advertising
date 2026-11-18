import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Edit3,
  Eye,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Layers,
  Cpu,
  Sparkles,
  Compass,
  ZoomIn,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SignagePreview3D } from '../components/SignagePreview3D';
import { ProjectLightbox } from '../components/ProjectLightbox';
import {
  PortfolioManagerModal,
  PORTFOLIO_CATEGORIES,
  DEFAULT_BRAND_FACE_IMAGE,
} from '../components/PortfolioManagerModal';
import type { PortfolioProject } from '../shared/types';

export function HomePage() {
  const { lang, navigate, data, loading, getCategoryLabel } = useApp();
  const isAr = lang === 'ar';
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerTab, setManagerTab] = useState<'form' | 'list' | 'brand'>('form');
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  const content = data?.content;
  const brandFaceImage = content?.logoUrl || DEFAULT_BRAND_FACE_IMAGE;
  const services = data?.services || [];
  const allProjects = data?.projects || [];
  const featuredServices = services.filter((s) => s.featured).slice(0, 5);

  const homeCategories = useMemo(() => {
    const set = new Set<string>(PORTFOLIO_CATEGORIES);
    for (const p of allProjects) set.add(p.category);
    return Array.from(set);
  }, [allProjects]);

  const displayedProjects = useMemo(() => {
    if (categoryFilter === 'all') return allProjects.slice(0, 6);
    return allProjects.filter((p) => p.category === categoryFilter);
  }, [allProjects, categoryFilter]);

  const openManager = (tab: 'form' | 'list' | 'brand', projectToEdit?: PortfolioProject) => {
    setEditingProject(projectToEdit || null);
    setManagerTab(tab);
    setManagerOpen(true);
  };

  const customSections = (data?.sections || [])
    .filter((sec) => sec.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const heroTitle = isAr
    ? content?.heroTitleAr || 'نصنع لك حضوراً لا يُنسى'
    : content?.heroTitleEn || 'We Craft an Unforgettable Presence';

  const heroSubtitle = isAr
    ? content?.heroSubtitleAr || 'نحول أفكارك إلى واجهات إعلانية استثنائية'
    : content?.heroSubtitleEn || 'Transforming your ideas into extraordinary illuminated signage';

  const heroPrimaryText = isAr
    ? content?.heroPrimaryBtnTextAr || 'استكشف أعمالنا'
    : content?.heroPrimaryBtnTextEn || 'Explore Portfolio';
  const heroPrimaryUrl = content?.heroPrimaryBtnUrl || '/portfolio';

  const heroSecondaryText = isAr
    ? content?.heroSecondaryBtnTextAr || 'اطلب عرض سعر'
    : content?.heroSecondaryBtnTextEn || 'Request a Quote';
  const heroSecondaryUrl = content?.heroSecondaryBtnUrl || '/quote';

  const centerHeroImage =
    content?.heroBgImageUrl || '/src/assets/images/hero_luxury_signage_1794750813882.jpg';

  const heroShowcaseCards = [
    {
      titleAr: 'حروف أكريليك مضيئة ثلاثية الأبعاد',
      titleEn: '3D Illuminated Cast Acrylic Letters',
      specAr: 'سطوع متجانس · ألوان كهربائية',
      specEn: 'Zero-Hotspot LED · Vivid Depth',
      imageUrl: '/src/assets/images/service_acrylic_smart_1794750814442.jpg',
      slug: 'acrylic-smart',
    },
    {
      titleAr: 'واجهات كلادينج فاخرة وليد بروفايل',
      titleEn: 'Luxury ACP Cladding & LED Profile',
      specAr: 'فحمي مطفي · خطوط ضوئية زرقاء وذهبية',
      specEn: 'Matte Charcoal · Blue & Gold Lines',
      imageUrl: centerHeroImage,
      slug: 'cladding-facades',
    },
    {
      titleAr: 'حروف استانلس عاكسة 304',
      titleEn: 'Reflective 304 Stainless Steel Letters',
      specAr: 'قص ليزر · هالة إضاءة خلفية دافئة',
      specEn: 'Fiber-Laser Cut · Warm Halo Glow',
      imageUrl: '/src/assets/images/service_stainless_letters_1794750814371.jpg',
      slug: 'stainless-letters',
    },
  ];

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="h-[520px] rounded-xl bg-[#161920] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-56 rounded-xl bg-[#161920] animate-pulse" />
          <div className="h-56 rounded-xl bg-[#161920] animate-pulse" />
          <div className="h-56 rounded-xl bg-[#161920] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* LUXURY CREATIVE AGENCY HERO SECTION */}
      <section className="relative overflow-hidden bg-[var(--bg-primary)] border-b border-white/10">
        {/* Architectural Blue & Gold Light Lines Background */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />

          <div
            className="absolute top-16 inset-x-0 h-[1px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 5%, rgba(29,107,255,0.65) 35%, rgba(212,175,55,0.65) 65%, transparent 95%)',
              boxShadow: '0 0 18px rgba(29,107,255,0.35)',
            }}
          />
          <div
            className="hidden md:block absolute top-1/2 -translate-y-24 start-0 w-[32%] h-[1px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(29,107,255,0.75))',
              boxShadow: '0 0 14px rgba(29,107,255,0.45)',
            }}
          />
          <div
            className="hidden md:block absolute top-1/2 -translate-y-24 end-0 w-[32%] h-[1px]"
            style={{
              background: 'linear-gradient(270deg, transparent, rgba(212,175,55,0.75))',
              boxShadow: '0 0 14px rgba(212,175,55,0.45)',
            }}
          />

          <svg
            className="absolute inset-0 w-full h-full opacity-55"
            viewBox="0 0 1440 820"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="msa-blue-line" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D6BFF" stopOpacity="0" />
                <stop offset="48%" stopColor="#3B82F6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#1D6BFF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="msa-gold-line" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                <stop offset="50%" stopColor="#F0C95A" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="120" y1="0" x2="540" y2="820" stroke="url(#msa-blue-line)" strokeWidth="1" />
            <line x1="1320" y1="0" x2="900" y2="820" stroke="url(#msa-gold-line)" strokeWidth="1" />
            <line x1="0" y1="620" x2="1440" y2="340" stroke="url(#msa-blue-line)" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 lg:pt-16 lg:pb-18">
          {/* Centered Dominant Agency Headline Lockup */}
          <div className="max-w-4xl mx-auto text-center space-y-5">
            {/* Brand / Face of Website Portrait Lockup (placed inside div:nth-of-type(1) to preserve CSS sibling indices) */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3.5 px-4 py-2.5 rounded-2xl bg-[#111318]/90 border border-[#D4AF37]/40 shadow-[0_0_28px_rgba(29,107,255,0.22)]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#D4AF37]/75 shadow-[0_0_18px_rgba(29,107,255,0.45)] shrink-0 bg-[#0A0B0E]">
                <ImageWithFallback
                  src={brandFaceImage}
                  alt={isAr ? 'م. محمود شعبان — وجه الموقع والهوية الهندسية' : 'Eng. Mahmoud Shaaban Portrait'}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-start space-y-1">
                <div className="text-xs sm:text-sm font-extrabold text-white">
                  {isAr ? 'م. محمود شعبان — مهندس الدعاية والإعلان الذكية' : 'Eng. Mahmoud Shaaban — Smart Advertising'}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openManager('brand')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#F5D061] transition-colors cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{isAr ? 'تغيير صورة وجه الموقع' : 'Change Face Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#60A5FA] bg-[#161920] hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>{isAr ? 'تواصل مباشر' : 'Contact'}</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[var(--accent-gold)]">
              {isAr ? content?.heroKickerAr : content?.heroKickerEn}
            </p>

            <h1
              className="font-extrabold tracking-tight text-white leading-[1.15]"
              style={{
                fontSize: 'clamp(2.35rem, 5.2vw, 4.45rem)',
                textWrap: 'balance',
              }}
            >
              <span className="led-text-gold">{heroTitle}</span>
            </h1>

            <p className="text-lg sm:text-2xl font-medium text-[#D0D5E0] leading-relaxed max-w-2xl mx-auto">
              {heroSubtitle}
            </p>

            {/* Primary Dual Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                type="button"
                onClick={() => navigate(heroPrimaryUrl)}
                className="inline-flex items-center gap-2.5 px-7 py-4 text-sm sm:text-base font-bold text-[#0A0B0E] bg-[var(--accent-gold)] hover:brightness-110 rounded-lg transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer led-glow-gold"
              >
                <Compass className="w-4 h-4" />
                <span>{heroPrimaryText}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(heroSecondaryUrl)}
                className="inline-flex items-center gap-2.5 px-7 py-4 text-sm sm:text-base font-bold text-white bg-[#131722] hover:bg-[var(--accent-blue)] border border-[var(--accent-blue)]/50 hover:border-[#60A5FA] rounded-lg transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer led-glow-blue"
              >
                <span>{heroSecondaryText}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Materials & Architectural Cladding Visual Triptych */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {heroShowcaseCards.map((card, idx) => {
              const isCenter = idx === 1;
              return (
                <div
                  key={card.slug}
                  className={`group card-3d-luxury relative rounded-xl overflow-hidden border bg-[#111318] flex flex-col ${
                    isCenter
                      ? 'lg:col-span-6 border-[var(--accent-gold)]/45'
                      : 'lg:col-span-3 border-white/15'
                  }`}
                >
                  <div
                    className={`h-[2px] w-full ${
                      isCenter ? 'bg-[var(--accent-gold)]' : 'bg-[var(--accent-blue)]'
                    }`}
                  />
                  <div className="relative h-48 sm:h-56 w-full bg-[#0A0B0E] overflow-hidden">
                    <ImageWithFallback
                      src={card.imageUrl}
                      alt={isAr ? card.titleAr : card.titleEn}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      fallbackTitle={isAr ? card.titleAr : card.titleEn}
                    />
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 bg-[#111318]">
                    <div className="space-y-1">
                      <p
                        className={`text-xs font-semibold ${
                          isCenter ? 'text-[var(--accent-gold)]' : 'text-[#60A5FA]'
                        }`}
                      >
                        {isAr ? card.specAr : card.specEn}
                      </p>
                      <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {isAr ? card.titleAr : card.titleEn}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/quote?service=${encodeURIComponent(card.slug)}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0A0B0E] bg-[var(--accent-gold)] hover:brightness-110 rounded-lg transition-all cursor-pointer w-fit"
                    >
                      <span>{isAr ? 'اطلب مواصفات مماثلة' : 'Quote this spec'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive 3D Lighting Simulation Console */}
          <div className="mt-6">
            <SignagePreview3D />
          </div>

          {/* Glossy Black & Gold Studio Feature Launch Banner */}
          <div className="mt-6 glossy-black-card rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#F5D061]">
                <Sparkles className="w-4 h-4" />
                <span>
                  {isAr
                    ? 'جديد · أداة مجانية لوجه الله بإشراف م. محمود شعبان'
                    : 'NEW · Free Engineering Tool by Eng. Mahmoud Shaaban'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {isAr
                  ? 'برنامج حساب الألواح وترقيم ليد السوفت + فحص الصور بالذكاء الاصطناعي'
                  : 'Signage Material Calculator, LED Soft Programmer & AI Error Inspector'}
              </h2>
              <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed">
                {isAr
                  ? 'احسب عدد ألواح الكلادينج والأكريليك والاستانلس بدقة، رقم الليد وصدّر برامج السوفت (.ino / .csv)، وارفع صورة اللوحة لمعرفة عدد الليد وتعديل الأخطاء بالذكاء الاصطناعي.'
                  : 'Compute exact cladding/acrylic/stainless sheets, number LED pixels & export Arduino/CSV soft programs, and analyze sign photos with Gemini AI.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/studio')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-sm font-extrabold hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'افتح برنامج الليد والذكاء الآن' : 'Launch LED AI Studio'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fabrication Metrics Strip */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/10 pt-8">
            <div className="card-3d-luxury bg-[var(--bg-surface)] border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="text-xl sm:text-2xl font-extrabold text-[var(--accent-gold)] font-mono-tabular">
                {isAr
                  ? content?.yearsExperience || 'خبرة 6 سنوات'
                  : '6 Years Experience'}
              </div>
              <div className="text-xs sm:text-sm text-[#B5BAC7] mt-1">
                {isAr ? 'سجل الأعمال والتصنيع الهندسي' : 'Signage Fabrication Experience'}
              </div>
            </div>
            <div
              style={{ backgroundColor: '#252833' }}
              className="card-3d-luxury border border-white/10 rounded-xl p-4 sm:p-5"
            >
              <div
                style={{ color: '#38bfb6' }}
                className="text-xl sm:text-2xl font-extrabold font-mono-tabular"
              >
                {isAr
                  ? content?.completedProjectsCount || 'أعمالنا كثيرة'
                  : 'Extensive Works'}
              </div>
              <div className="text-xs sm:text-sm text-[#B5BAC7] mt-1">
                {isAr ? 'يفط وواجهات تجارية منفذة' : 'Completed Commercial Projects'}
              </div>
            </div>
            <div className="bg-[var(--bg-surface)] border border-white/10 hover:border-[var(--accent-gold)]/40 rounded-xl p-5 transition-colors">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F6] font-mono-tabular">
                {content?.warrantyYears || '5'} {isAr ? 'سنوات' : 'Yrs'}
              </div>
              <div className="text-sm text-[#B5BAC7] mt-1">
                {isAr ? 'ضمان فعلي على الإضاءة والخامات' : 'Warranty on LEDs & Finishes'}
              </div>
            </div>
            <div className="bg-[var(--bg-surface)] border border-white/10 hover:border-[var(--accent-blue)]/40 rounded-xl p-5 transition-colors">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F6] font-mono-tabular">
                IP67
              </div>
              <div className="text-sm text-[#B5BAC7] mt-1">
                {isAr ? 'مقاومة كاملة للأمطار والغبار' : 'Weather-Sealed LED Modules'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED SERVICES MARQUEE STRIP */}
      {services.length > 0 && (
        <section
          aria-label={isAr ? 'شريط خدمات الشركة المتحرك' : 'Animated Services Strip'}
          className="msa-marquee-wrap relative overflow-hidden bg-[#0E1016] border-b border-white/10 py-4"
        >
          <div className="msa-marquee-track items-center gap-8">
            {[...services, ...services].map((service, idx) => (
              <button
                key={`${service.id}-${idx}`}
                type="button"
                onClick={() => navigate(`/quote?service=${encodeURIComponent(service.slug)}`)}
                className="group inline-flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-bold text-[#D4D7E0] hover:text-[var(--accent-gold)] hover:bg-white/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[var(--accent-blue)] group-hover:text-[var(--accent-gold)] transition-colors shrink-0" />
                <span>{isAr ? service.titleAr : service.titleEn}</span>
                <span className="text-xs font-normal text-[#8C92A0]" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs font-normal text-[#8C92A0]">
                  {getCategoryLabel(service.category)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Services Bento Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-[var(--accent-blue)] mb-2">
              {isAr ? '01. قدرات التصنيع والتنفيذ' : '01. Fabrication Capabilities'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F6]">
              {isAr ? 'خدماتنا المتخصصة في الدعاية والواجهات' : 'Specialized Signage & Cladding Services'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-gold)] hover:brightness-110 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>
              {isAr ? `استعرض جميع الخدمات (${services.length})` : `View All ${services.length} Services`}
            </span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredServices.map((service, idx) => {
            const isWide = idx === 0 || idx === 3;
            return (
              <article
                key={service.id}
                className={`group card-3d-luxury bg-[var(--bg-surface)] border border-white/10 rounded-xl overflow-hidden flex flex-col ${
                  isWide ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                <div className="relative h-48 sm:h-52 overflow-hidden bg-[#0E1015] p-2">
                  <ImageWithFallback
                    src={service.imageUrl}
                    alt={isAr ? service.titleAr : service.titleEn}
                    className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] drop-shadow-[0_0_14px_rgba(29,107,255,0.55)] group-hover:drop-shadow-[0_0_22px_rgba(212,175,55,0.8)] transition-all duration-500"
                    fallbackTitle={isAr ? service.titleAr : service.titleEn}
                  />
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-[#A1A6B3] mb-1.5">
                      <span>{getCategoryLabel(service.category)}</span>
                      <span className="mx-2" aria-hidden="true">·</span>
                      <span className="text-[var(--accent-gold)]">
                        {isAr ? service.specsAr.split('·')[0] : service.specsEn.split('·')[0]}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#F4F4F6] mb-1.5 group-hover:text-white transition-colors">
                      {isAr ? service.titleAr : service.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed line-clamp-2">
                      {isAr ? service.descriptionAr : service.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/quote?service=${encodeURIComponent(service.slug)}`)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-[#0A0B0E] bg-[var(--accent-gold)] hover:brightness-110 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{isAr ? 'اطلب مواصفات الخدمة' : 'Request Specs & Quote'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/services')}
                      className="text-xs font-semibold text-[#60A5FA] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isAr ? 'المواصفات الفنية' : 'Specifications'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Selected Portfolio Showcase + Category Divisions & Phone Upload Manager */}
      <section className="bg-[#0E1015] border-y border-white/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-[var(--accent-gold)] mb-2">
                {isAr ? '02. معرض الأعمال والتصنيفات' : '02. Portfolio & Divisions'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F6]">
                {isAr ? 'معرض الأعمال الحقيقية بأعلى معايير الدقة' : 'Real Craftsmanship Across All Divisions'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => openManager('form')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#0A0B0E] bg-gradient-to-r from-[#D4AF37] to-[#F5D061] hover:brightness-110 rounded-xl shadow-[0_0_18px_rgba(212,175,55,0.28)] transition-all whitespace-nowrap cursor-pointer"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'إضافة صورة من الهاتف' : 'Add Photo from Phone'}</span>
              </button>
              <button
                type="button"
                onClick={() => openManager('list')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#12141A] hover:bg-[#1A202D] border border-[#1D6BFF]/50 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#60A5FA]" />
                <span>{isAr ? 'لوحة إدارة معرض الأعمال' : 'Manage Gallery'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/portfolio')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#60A5FA] hover:text-white whitespace-nowrap shrink-0 cursor-pointer px-2 py-2"
              >
                <span>{isAr ? `عرض الكل (${allProjects.length})` : `View All (${allProjects.length})`}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal-Scrollable Category Bar */}
          <div className="flex items-center sm:flex-wrap gap-1.5 p-1.5 bg-[#12141A] border border-white/10 rounded-xl mb-7 overflow-x-auto no-scrollbar">
            {homeCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#1D6BFF] text-white led-glow-blue'
                    : 'text-[#B5BAC7] hover:text-white hover:bg-white/5'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {displayedProjects.length === 0 ? (
            <div className="bg-[#12141A] border border-white/10 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm text-[#B5BAC7]">
                {isAr ? 'لا توجد أعمال مضافة في هذا التصنيف حالياً.' : 'No projects in this division yet.'}
              </p>
              <button
                type="button"
                onClick={() => openManager('form')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-[#0A0B0E] bg-[#D4AF37] rounded-lg cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{isAr ? 'إضافة صورة من الهاتف لهذا القسم' : 'Add Phone Photo to Division'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedProjects.map((project) => (
                <article
                  key={project.id}
                  className="group card-3d-luxury bg-[var(--bg-surface)] border border-white/12 hover:border-[#1D6BFF]/75 rounded-xl overflow-hidden flex flex-col"
                >
                  <div
                    onClick={() => setSelectedProject(project)}
                    className="relative h-48 sm:h-52 bg-[#0A0B0E] overflow-hidden cursor-pointer"
                  >
                    <ImageWithFallback
                      src={project.imageUrl}
                      alt={isAr ? project.titleAr : project.titleEn}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      fallbackTitle={isAr ? project.titleAr : project.titleEn}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      aria-label={isAr ? `معاينة وتكبير ${project.titleAr}` : `Inspect ${project.titleEn}`}
                      className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0A0B0E]/85 hover:bg-[#1D6BFF] border border-white/25 rounded-lg backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تكبير الصورة' : 'Zoom View'}</span>
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#A1A6B3] mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-[var(--accent-gold)] font-semibold">
                          {getCategoryLabel(project.category)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{isAr ? project.locationAr : project.locationEn}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{project.completionYear}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#F4F4F6] mb-1.5">
                        {isAr ? project.titleAr : project.titleEn}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#B5BAC7] line-clamp-2">
                        {isAr ? project.descriptionAr : project.descriptionEn}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-[#8C92A0] font-mono-tabular">
                        {project.dimensions}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openManager('form', project)}
                          aria-label={isAr ? `تعديل ${project.titleAr}` : `Edit ${project.titleEn}`}
                          className="p-1.5 text-xs text-[#A1A6B3] hover:text-[#60A5FA] bg-[#161920] rounded-lg border border-white/10 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/quote?service=${encodeURIComponent(project.serviceSlug || project.category)}`)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#F5D061] bg-[#1D6BFF]/15 hover:bg-[#1D6BFF] hover:text-white border border-[#1D6BFF]/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isAr ? 'اطلب مواصفات' : 'Specs'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          aria-label={isAr ? `تفاصيل ${project.titleAr}` : `Details ${project.titleEn}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1D6BFF] hover:brightness-110 rounded-lg transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isAr ? 'التفاصيل' : 'Inspect'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quality & Engineering Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--bg-surface)] border border-white/10 hover:border-[var(--accent-blue)]/40 rounded-xl p-6 space-y-3 transition-colors">
            <Cpu className="w-6 h-6 text-[var(--accent-blue)]" />
            <h3 className="text-lg font-bold text-[#F4F4F6]">
              {isAr ? 'قص ليزر وراوتر CNC دقيق' : 'Fiber Laser & CNC Precision'}
            </h3>
            <p className="text-sm text-[#B5BAC7] leading-relaxed">
              {isAr
                ? 'تشكيل الاستانلس ستيل والأكريليك والكلادينج بماكينات قطع رقمية تضمن تطابق الزوايا والانحناءات مع التصميم.'
                : 'Digital fiber-laser metal cutting and CNC routing ensure millimeter-accurate corners, returns, and cladding seams.'}
            </p>
          </div>
          <div className="bg-[var(--bg-surface)] border border-white/10 hover:border-[var(--accent-gold)]/40 rounded-xl p-6 space-y-3 transition-colors">
            <Layers className="w-6 h-6 text-[var(--accent-gold)]" />
            <h3 className="text-lg font-bold text-[#F4F4F6]">
              {isAr ? 'خامات أصلية مقاومة للعوامل الجوية' : 'Certified Weatherproof Materials'}
            </h3>
            <p className="text-sm text-[#B5BAC7] leading-relaxed">
              {isAr
                ? 'نستخدم استانلس 304 غير قابل للصدأ، أكريليك كاست مستورد، وألواح كلادينج بطلاء PVDF طويل الأمد.'
                : 'Built using 304 marine-grade stainless steel, UV-stabilized cast acrylic, and fire-rated PVDF aluminum cladding.'}
            </p>
          </div>
          <div className="bg-[var(--bg-surface)] border border-white/10 hover:border-[var(--accent-blue)]/40 rounded-xl p-6 space-y-3 transition-colors">
            <ShieldCheck className="w-6 h-6 text-[var(--accent-blue)]" />
            <h3 className="text-lg font-bold text-[#F4F4F6]">
              {isAr ? 'معاينة وتركيب وتسليم بضمان' : 'Turnkey Survey, Rigging & Warranty'}
            </h3>
            <p className="text-sm text-[#B5BAC7] leading-relaxed">
              {isAr ? content?.qualityPromiseAr : content?.qualityPromiseEn}
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic CMS Custom Home Sections */}
      {customSections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
          {customSections.map((sec) => {
            const secTitle = isAr ? sec.titleAr : sec.titleEn;
            const secSub = isAr ? sec.subtitleAr : sec.subtitleEn;
            const secBody = isAr ? sec.bodyAr : sec.bodyEn;
            const secBtn = isAr ? sec.buttonTextAr : sec.buttonTextEn;

            if (sec.layoutStyle === 'banner') {
              return (
                <section
                  key={sec.id}
                  className="bg-gradient-to-br from-[#121622] via-[var(--bg-surface)] to-[#18150E] border border-[var(--accent-blue)]/35 rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    {secSub && (
                      <p className="text-xs font-semibold text-[var(--accent-gold)]">{secSub}</p>
                    )}
                    <h2 className="text-2xl font-extrabold text-white">{secTitle}</h2>
                    <p className="text-sm text-[#B5BAC7] leading-relaxed whitespace-pre-line">
                      {secBody}
                    </p>
                  </div>
                  {secBtn && (
                    <button
                      type="button"
                      onClick={() => navigate(sec.buttonUrl || '/quote')}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#0A0B0E] bg-[var(--accent-gold)] hover:brightness-110 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{secBtn}</span>
                      <ArrowIcon className="w-4 h-4" />
                    </button>
                  )}
                </section>
              );
            }

            if (sec.layoutStyle === 'cards') {
              return (
                <section
                  key={sec.id}
                  className="bg-[var(--bg-surface)] border border-white/10 rounded-xl p-6 sm:p-8 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      {secSub && (
                        <p className="text-xs font-semibold text-[var(--accent-gold)] mb-1">{secSub}</p>
                      )}
                      <h2 className="text-2xl font-extrabold text-white">{secTitle}</h2>
                    </div>
                    {secBtn && (
                      <button
                        type="button"
                        onClick={() => navigate(sec.buttonUrl || '/quote')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#60A5FA] hover:text-white cursor-pointer"
                      >
                        <span>{secBtn}</span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {secBody
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-[#0A0B0E] border border-white/10 text-sm text-[#D4D7E0] leading-relaxed"
                        >
                          {line}
                        </div>
                      ))}
                  </div>
                </section>
              );
            }

            return (
              <section
                key={sec.id}
                className="bg-[var(--bg-surface)] border border-white/10 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center"
              >
                <div className="lg:col-span-7 p-7 sm:p-10 space-y-4">
                  {secSub && (
                    <p className="text-xs font-semibold text-[var(--accent-gold)]">{secSub}</p>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{secTitle}</h2>
                  <p className="text-sm sm:text-base text-[#B5BAC7] leading-relaxed whitespace-pre-line">
                    {secBody}
                  </p>
                  {secBtn && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => navigate(sec.buttonUrl || '/quote')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[var(--accent-blue)] hover:brightness-110 rounded-lg transition-all cursor-pointer"
                      >
                        <span>{secBtn}</span>
                        <ArrowIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {sec.imageUrl && (
                  <div className="lg:col-span-5 h-56 lg:h-full min-h-[220px] bg-[#0A0B0E]">
                    <ImageWithFallback
                      src={sec.imageUrl}
                      alt={secTitle}
                      className="w-full h-full object-cover"
                      fallbackTitle={secTitle}
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Conversion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-gradient-to-br from-[#141824] via-[#111318] to-[#16140F] border border-[var(--accent-gold)]/30 rounded-xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F6]">
              {isAr
                ? content?.ctaBannerTitleAr || 'هل لديك واجهة محل أو مقر شركة جاهز للتنفيذ؟'
                : content?.ctaBannerTitleEn || 'Ready to Fabricate Your Commercial Facade or Sign?'}
            </h2>
            <p className="text-sm sm:text-base text-[#B5BAC7]">
              {isAr
                ? content?.ctaBannerSubtitleAr ||
                  'أرسل المقاسات وصورة الموقع الآن للحصول على مقايسة فنية وعرض سعر مفصل خلال 24 ساعة.'
                : content?.ctaBannerSubtitleEn ||
                  'Send your dimensions and site photo today to receive a detailed fabrication quote within 24 hours.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(content?.ctaBannerBtnUrl || '/quote')}
              className="px-6 py-3.5 text-sm font-bold text-[#0A0B0E] bg-[var(--accent-gold)] hover:brightness-110 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr
                ? content?.ctaBannerBtnTextAr || 'اطلب عرض سعر الآن'
                : content?.ctaBannerBtnTextEn || 'Request a Quote Now'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="px-6 py-3.5 text-sm font-semibold text-[#F4F4F6] bg-[#161920] hover:bg-[#1E232E] border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr ? 'تواصل مع المهندسين' : 'Contact Engineering'}
            </button>
          </div>
        </div>
      </section>

      <ProjectLightbox project={selectedProject} onClose={() => setSelectedProject(null)} />

      <PortfolioManagerModal
        isOpen={managerOpen}
        initialTab={managerTab}
        projectToEdit={editingProject}
        onClose={() => {
          setManagerOpen(false);
          setEditingProject(null);
        }}
        onSavedWork={(cat) => setCategoryFilter(cat || 'all')}
      />
    </div>
  );
}
