import { useMemo, useState } from 'react';
import {
  Camera,
  Edit3,
  Info,
  Plus,
  Send,
  SlidersHorizontal,
  ZoomIn,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ProjectLightbox } from '../components/ProjectLightbox';
import {
  PortfolioManagerModal,
  PORTFOLIO_CATEGORIES,
} from '../components/PortfolioManagerModal';
import type { PortfolioProject } from '../shared/types';

export function PortfolioPage() {
  const { lang, data, loading, navigate, getCategoryLabel } = useApp();
  const isAr = lang === 'ar';
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerTab, setManagerTab] = useState<'form' | 'list' | 'brand'>('form');
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

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

  const openManagerModal = (initialTab: 'form' | 'list' | 'brand', projectToEdit?: PortfolioProject) => {
    setEditingProject(projectToEdit || null);
    setManagerTab(initialTab);
    setManagerOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header + Mobile Photo Upload & Portfolio Manager CTA */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#D4AF37] mb-2">
            {isAr ? 'معرض الأعمال والتصنيفات الفنية' : 'Portfolio & Fabrication Showcase'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F4F4F6] mb-3">
            {isAr
              ? 'معرض الواجهات الإعلانية والحروف المضيئة'
              : 'Illuminated Signage & Architectural Cladding Portfolio'}
          </h1>
          <p className="text-sm sm:text-base text-[#B5BAC7] leading-relaxed">
            {isAr
              ? 'تصفح أقسام الأعمال الحقيقية (استانلس، أكريليك، حروف مضيئة، كلادينج، فلكس، LED، واجهات محلات، قبل وبعد التنفيذ) واضغط على أي صورة للتكبير أو إدارة المعرض.'
              : 'Browse real installations across all divisions, inspect high-resolution photos, or manage and upload new works directly from your phone.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openManagerModal('form')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#0A0B0E] bg-gradient-to-r from-[#D4AF37] to-[#F5D061] hover:brightness-110 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>{isAr ? 'إضافة صورة من الهاتف' : 'Add Photo from Phone'}</span>
          </button>
          <button
            type="button"
            onClick={() => openManagerModal('list')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#12141A] hover:bg-[#1A202D] border border-[#1D6BFF]/50 rounded-xl transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#60A5FA]" />
            <span>{isAr ? 'لوحة إدارة معرض الأعمال' : 'Manage Gallery'}</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2.5 text-xs text-[#A1A6B3] bg-[#12141A] border border-white/10 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
        <span>
          {isAr
            ? 'جميع الصور والأعمال المحفوظة من زر "إضافة صورة من الهاتف" أو لوحة الإدارة تُخزّن فعلياً في قاعدة البيانات وتظل ظاهرة دائماً بعد إغلاق المتصفح وإعادة فتحه.'
            : 'Photos added via the mobile upload manager are stored permanently on the server and remain live across sessions.'}
        </span>
      </div>

      {/* Responsive Horizontal-Scrollable Category Bar (prevents mobile overflow) */}
      <div className="flex items-center sm:flex-wrap gap-1.5 p-1.5 bg-[#12141A] border border-white/10 rounded-xl mb-8 overflow-x-auto no-scrollbar">
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
            <div key={i} className="h-72 rounded-xl bg-[#161920] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#12141A] border border-white/10 rounded-xl p-10 text-center space-y-4">
          <p className="text-[#B5BAC7]">
            {isAr ? 'لا توجد أعمال مضافة في هذا التصنيف حالياً.' : 'No projects found in this category.'}
          </p>
          <button
            type="button"
            onClick={() => openManagerModal('form')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0A0B0E] bg-[#D4AF37] rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'أضف أول صورة لهذا القسم' : 'Add First Photo to Division'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((project, index) => (
            <article
              key={project.id}
              className={`group card-3d-luxury bg-[#12141A] border border-white/12 hover:border-[#1D6BFF]/75 rounded-xl overflow-hidden flex flex-col ${
                index === 0 && categoryFilter === 'all' ? 'md:col-span-2' : ''
              }`}
            >
              {/* Clear Full-Visibility Image Box (no dark scrim overlay) */}
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
                  aria-label={isAr ? `تكبير مشروع ${project.titleAr}` : `Zoom ${project.titleEn}`}
                  className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0A0B0E]/85 hover:bg-[#1D6BFF] border border-white/25 rounded-lg backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تكبير الصورة' : 'Zoom View'}</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs text-[#A1A6B3] flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[#D4AF37] font-semibold">
                      {getCategoryLabel(project.category)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{isAr ? project.locationAr : project.locationEn}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{project.completionYear}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#F4F4F6] mb-1.5">
                    {isAr ? project.titleAr : project.titleEn}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed line-clamp-2">
                    {isAr ? project.descriptionAr : project.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-[#8C92A0] font-mono-tabular">
                    {project.dimensions}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openManagerModal('form', project)}
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F5D061] bg-[#1D6BFF]/15 hover:bg-[#1D6BFF] hover:text-white border border-[#1D6BFF]/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isAr ? 'اطلب مواصفات مماثلة' : 'Request Specs'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ProjectLightbox project={selectedProject} onClose={() => setSelectedProject(null)} />

      <PortfolioManagerModal
        isOpen={managerOpen}
        initialTab={managerTab}
        projectToEdit={editingProject}
        onClose={() => {
          setManagerOpen(false);
          setEditingProject(null);
        }}
        onSavedWork={() => setCategoryFilter('all')}
      />
    </div>
  );
}


