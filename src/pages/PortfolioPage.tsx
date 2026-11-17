import { useMemo, useState } from 'react';
import { ZoomIn, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartImage } from '../components/SmartImage';
import { ProjectLightbox } from '../components/ProjectLightbox';
import type { PortfolioProject } from '../shared/types';

const PORTFOLIO_CATEGORIES = [
  'all',
  'stainless-letters',
  'acrylic-letters',
  'smart-letters',
  'cladding-facades',
  'flex-signs',
  'mirror-signs',
  'led-lighting',
  'commercial-storefronts',
] as const;

export function PortfolioPage() {
  const { lang, data, loading, getCategoryLabel } = useApp();
  const isAr = lang === 'ar';
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const projects = data?.projects || [];

  const categories = useMemo(() => {
    const set = new Set<string>(PORTFOLIO_CATEGORIES);
    for (const p of projects) set.add(p.category);
    return Array.from(set);
  }, [projects]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return projects;
    return projects.filter((p) => p.category === categoryFilter);
  }, [projects, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mb-8">
        <p className="text-xs font-semibold text-[#D4AF37] mb-2">
          {isAr ? 'معرض الأعمال والتصنيفات الفنية' : 'Portfolio & Fabrication Showcase'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F6] mb-3">
          {isAr
            ? 'معرض الواجهات الإعلانية والحروف المضيئة'
            : 'Illuminated Signage & Architectural Cladding Portfolio'}
        </h1>
        <p className="text-base text-[#B5BAC7] leading-relaxed">
          {isAr
            ? 'تصفح التصنيفات الثمانية للأعمال واضغط على أي نموذج لعرض المواصفات الهندسية وتكبير الصورة بدقة.'
            : 'Filter across our 8 specialized signage categories and inspect any build in high-resolution zoom view.'}
        </p>

        <div className="mt-4 flex items-start gap-2.5 text-xs text-[#A1A6B3] bg-[#12141A] border border-white/10 rounded-lg px-4 py-3">
          <Info className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
          <span>
            {isAr
              ? 'النماذج المعروضة أدناه هي نماذج استرشادية مصنفة لتوضيح الخامات والإضاءة لكل قسم، ويمكن للإدارة رفع صور المشاريع الفعلية وتعديلها من لوحة التحكم.'
              : 'Items below labeled as category samples illustrate standard materials and lighting finishes per division; actual installations can be published directly via the Admin Dashboard.'}
          </span>
        </div>
      </div>

      {/* 8-Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#12141A] border border-white/10 rounded-xl mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#1D6BFF] text-white led-glow-blue'
                : 'text-[#B5BAC7] hover:text-white hover:bg-white/5'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-[#161920] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#12141A] border border-white/10 rounded-xl p-10 text-center">
          <p className="text-[#B5BAC7]">
            {isAr ? 'لا توجد أعمال مضافة في هذا التصنيف حالياً.' : 'No projects found in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, index) => (
            <article
              key={project.id}
              className={`group bg-[#12141A] border border-white/10 hover:border-[#1D6BFF]/60 hover:shadow-[0_0_26px_rgba(29,107,255,0.16)] rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
                index === 0 && categoryFilter === 'all' ? 'md:col-span-2' : ''
              }`}
            >
              <div className="relative h-64 sm:h-72 bg-[#0A0B0E] overflow-hidden">
                <SmartImage
                  src={project.imageUrl}
                  alt={isAr ? project.titleAr : project.titleEn}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  fallbackTitle={isAr ? project.titleAr : project.titleEn}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E]/85 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  aria-label={isAr ? `تكبير مشروع ${project.titleAr}` : `Zoom ${project.titleEn}`}
                  className="absolute bottom-4 end-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0A0B0E]/85 hover:bg-[#1D6BFF] border border-white/20 rounded-lg backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تكبير والتفاصيل' : 'Zoom & Details'}</span>
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#A1A6B3] flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[#D4AF37] font-semibold">
                      {getCategoryLabel(project.category)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{isAr ? project.locationAr : project.locationEn}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{project.completionYear}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F4F4F6] mb-2">
                    {isAr ? project.titleAr : project.titleEn}
                  </h2>
                  <p className="text-sm text-[#B5BAC7] leading-relaxed">
                    {isAr ? project.descriptionAr : project.descriptionEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8C92A0]">
                  <span>{project.clientName}</span>
                  <span className="font-mono-tabular">{project.dimensions}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ProjectLightbox project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
