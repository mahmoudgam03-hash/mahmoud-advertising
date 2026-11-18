import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function ServicesPage() {
  const { lang, navigate, data, loading, getCategoryLabel } = useApp();
  const isAr = lang === 'ar';
  const [activeCategory, setActiveCategory] = useState('all');
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const services = data?.services || [];

  const categories = useMemo(() => {
    const set = new Set<string>(['all']);
    for (const s of services) set.add(s.category);
    return Array.from(set);
  }, [services]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-3xl mb-8">
        <p className="text-xs font-semibold text-[#D4AF37] mb-2">
          {isAr ? 'قسم الخدمات والتصنيع' : 'Fabrication & Design Catalog'}
        </p>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F4F4F6] mb-3">
          {isAr
            ? 'حلول الدعاية والإعلان وتصنيع الواجهات المتكاملة'
            : 'Complete Architectural Signage & Advertising Services'}
        </h1>
        <p className="text-sm sm:text-base text-[#B5BAC7] leading-relaxed">
          {isAr
            ? 'ننفذ جميع أنواع اليفط المضيئة والحروف البارزة وواجهات الكلادينج والمطبوعات التجارية في ورشنا المجهزة بأحدث تقنيات الليزر والـ CNC.'
            : 'All stainless letters, acrylic signage, ACP cladding, LED profile, neon, and identity systems fabricated in-house.'}
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#12141A] border border-white/10 rounded-xl mb-8 overflow-x-auto no-scrollbar max-w-full">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#1D6BFF] text-white led-glow-blue'
                : 'text-[#B5BAC7] hover:text-white hover:bg-white/5'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-[#161920] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#12141A] border border-white/10 rounded-xl p-10 text-center">
          <p className="text-[#B5BAC7]">
            {isAr ? 'لا توجد خدمات مطابقة لهذا التصنيف حالياً.' : 'No services match this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((service, index) => (
            <article
              key={service.id}
              className="group card-3d-luxury bg-[#12141A] border border-white/10 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="relative h-48 bg-[#0A0B0E] overflow-hidden">
                <ImageWithFallback
                  src={service.imageUrl}
                  alt={isAr ? service.titleAr : service.titleEn}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  fallbackTitle={isAr ? service.titleAr : service.titleEn}
                />
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#A1A6B3] flex items-center gap-2 mb-1.5">
                    <span className="font-mono-tabular text-[#D4AF37]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">/</span>
                    <span>{getCategoryLabel(service.category)}</span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-[#F4F4F6] mb-2">
                    {isAr ? service.titleAr : service.titleEn}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed mb-3 line-clamp-3">
                    {isAr ? service.descriptionAr : service.descriptionEn}
                  </p>

                  <div className="space-y-1.5 pt-2.5 border-t border-white/10">
                    {(isAr ? service.specsAr : service.specsEn)
                      .split('·')
                      .map((spec) => spec.trim())
                      .filter(Boolean)
                      .map((spec, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#D4D7E0]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-blue)] shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    {(isAr ? service.materialsAr : service.materialsEn) && (
                      <div className="pt-1.5 text-xs text-[#A1A6B3]">
                        <span className="font-semibold text-[var(--accent-gold)]">
                          {isAr ? 'الخامات: ' : 'Materials: '}
                        </span>
                        <span>{isAr ? service.materialsAr : service.materialsEn}</span>
                      </div>
                    )}
                    {service.showPrice && service.price.trim() && (
                      <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                        <span className="text-[#A1A6B3]">{isAr ? 'السعر الاسترشادي' : 'Starting Price'}</span>
                        <span className="font-bold font-mono-tabular text-[var(--accent-gold)]">
                          {service.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => navigate(`/quote?service=${encodeURIComponent(service.slug)}`)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0A0B0E] bg-[var(--accent-gold)] hover:brightness-110 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{isAr ? 'اطلب مواصفات وتسعير الخدمة' : 'Request Specs & Quote'}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
