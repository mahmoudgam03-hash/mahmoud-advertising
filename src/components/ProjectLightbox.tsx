import { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ArrowUpRight, ArrowUpLeft, Facebook, MessageCircle } from 'lucide-react';
import type { PortfolioProject } from '../shared/types';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from './ImageWithFallback';
import { buildSocialShareLinks, resolveShareUrl } from '../shared/social-share';

interface ProjectLightboxProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export function ProjectLightbox({ project, onClose }: ProjectLightboxProps) {
  const { lang, navigate, getCategoryLabel } = useApp();
  const isAr = lang === 'ar';
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? project.titleAr : project.titleEn}
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-[#111318] border border-white/15 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zoomable Media Viewport */}
        <div className="lg:col-span-7 bg-[#08090C] relative flex flex-col border-b lg:border-b-0 lg:border-e border-white/10 min-h-[260px] sm:min-h-[400px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0E1015]">
            <span className="text-xs font-mono-tabular text-[#A1A6B3]">
              {Math.round(zoom * 100)}%
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(2))))}
                aria-label={isAr ? 'تصغير الصورة' : 'Zoom out'}
                disabled={zoom <= 1}
                className="p-2 rounded-lg bg-[#161920] text-[#F4F4F6] hover:bg-[#1E222B] disabled:opacity-40 cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.5).toFixed(2))))}
                aria-label={isAr ? 'تكبير الصورة' : 'Zoom in'}
                disabled={zoom >= 2.5}
                className="p-2 rounded-lg bg-[#161920] text-[#F4F4F6] hover:bg-[#1E222B] disabled:opacity-40 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label={isAr ? 'إعادة ضبط التكبير' : 'Reset zoom'}
                className="p-2 rounded-lg bg-[#161920] text-[#F4F4F6] hover:bg-[#1E222B] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 grid place-items-center">
            <div
              className="transition-all duration-200 ease-out"
              style={{ width: `${Math.round(zoom * 100)}%`, maxWidth: 'none' }}
            >
              <ImageWithFallback
                src={project.imageUrl}
                alt={isAr ? project.titleAr : project.titleEn}
                className="w-full h-auto max-h-none object-contain rounded-lg mx-auto"
                fallbackTitle={isAr ? project.titleAr : project.titleEn}
              />
            </div>
          </div>
        </div>

        {/* Project Details Pane */}
        <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="text-xs text-[#A1A6B3] flex items-center gap-2">
                <span className="text-[#D4AF37] font-semibold">
                  {getCategoryLabel(project.category)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{project.completionYear}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={isAr ? 'إغلاق نافذة التفاصيل' : 'Close project details'}
                className="p-2 rounded-lg bg-[#161920] text-[#F4F4F6] hover:bg-[#232834] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F6] leading-snug mb-3">
              {isAr ? project.titleAr : project.titleEn}
            </h2>

            <p className="text-sm text-[#B5BAC7] leading-relaxed mb-6">
              {isAr ? project.descriptionAr : project.descriptionEn}
            </p>

            <dl className="space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#8C92A0]">{isAr ? 'العميل' : 'Client'}</dt>
                <dd className="text-[#F4F4F6] font-medium text-end">{project.clientName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8C92A0]">{isAr ? 'الموقع' : 'Location'}</dt>
                <dd className="text-[#F4F4F6] font-medium text-end">
                  {isAr ? project.locationAr : project.locationEn}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8C92A0]">{isAr ? 'المقاسات' : 'Dimensions'}</dt>
                <dd className="text-[#F4F4F6] font-mono-tabular text-end">{project.dimensions}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8C92A0]">{isAr ? 'نظام الإضاءة' : 'Lighting'}</dt>
                <dd className="text-[#F4F4F6] text-end">
                  {isAr ? project.lightingAr : project.lightingEn}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8C92A0]">{isAr ? 'الخامات' : 'Materials'}</dt>
                <dd className="text-[#F4F4F6] text-end">
                  {isAr ? project.materialsAr : project.materialsEn}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/quote?service=${encodeURIComponent(project.serviceSlug)}`);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{isAr ? 'اطلب مشروعاً مشابهاً' : 'Request Similar Project'}</span>
              {isAr ? <ArrowUpLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </button>

            {(() => {
              const shareUrl = resolveShareUrl(
                typeof window !== 'undefined' ? window.location.origin : '',
                undefined,
                '/portfolio'
              );
              const projectTitle = isAr ? project.titleAr : project.titleEn;
              const links = buildSocialShareLinks({
                url: shareUrl,
                title: projectTitle,
                text: `${projectTitle} — ${project.dimensions}`,
              });
              return (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#8C92A0]">
                    {isAr ? 'مشاركة العمل:' : 'Share project:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161920] hover:bg-[#1877F2]/25 border border-white/10 text-[#D4D7E0] hover:text-white"
                    >
                      <Facebook className="w-3.5 h-3.5 text-[#60A5FA]" />
                      <span>{isAr ? 'فيسبوك' : 'Facebook'}</span>
                    </a>
                    <a
                      href={links.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161920] hover:bg-emerald-500/20 border border-white/10 text-[#D4D7E0] hover:text-white"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
