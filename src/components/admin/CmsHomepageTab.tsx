import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  Layout,
  Palette,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import type { HomeCustomSection, SiteContent, ThemeSettings } from '../../shared/types';
import { SmartImage } from '../SmartImage';

interface CmsHomepageTabProps {
  isAr: boolean;
  contentForm: SiteContent;
  setContentForm: React.Dispatch<React.SetStateAction<SiteContent | null>>;
  themeForm: ThemeSettings;
  setThemeForm: React.Dispatch<React.SetStateAction<ThemeSettings | null>>;
  sections: HomeCustomSection[];
  onSaveContent: (e: React.FormEvent) => Promise<void>;
  onSaveTheme: (e: React.FormEvent) => Promise<void>;
  onUploadImage: (file: File) => Promise<string | null>;
  onSaveSection: (section: Partial<HomeCustomSection>, editingId: number | null) => Promise<boolean>;
  onDeleteSection: (id: number) => Promise<void>;
  onReorderSections: (orderedIds: number[]) => Promise<void>;
  onToggleSectionVisibility: (sec: HomeCustomSection) => Promise<void>;
}

const EMPTY_SECTION = {
  titleAr: '',
  titleEn: '',
  subtitleAr: '',
  subtitleEn: '',
  bodyAr: '',
  bodyEn: '',
  imageUrl: '',
  buttonTextAr: 'اطلب عرض سعر',
  buttonTextEn: 'Request Quote',
  buttonUrl: '/quote',
  layoutStyle: 'split' as 'split' | 'banner' | 'cards',
  visible: true,
};

export function CmsHomepageTab({
  isAr,
  contentForm,
  setContentForm,
  themeForm,
  setThemeForm,
  sections,
  onSaveContent,
  onSaveTheme,
  onUploadImage,
  onSaveSection,
  onDeleteSection,
  onReorderSections,
  onToggleSectionVisibility,
}: CmsHomepageTabProps) {
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState(EMPTY_SECTION);
  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState<number | null>(null);

  const handleLogoUpload = async (file: File) => {
    const url = await onUploadImage(file);
    if (url) setContentForm((prev) => (prev ? { ...prev, logoUrl: url } : prev));
  };

  const handleHeroBgUpload = async (file: File) => {
    const url = await onUploadImage(file);
    if (url) setContentForm((prev) => (prev ? { ...prev, heroBgImageUrl: url } : prev));
  };

  const handleSectionImgUpload = async (file: File) => {
    const url = await onUploadImage(file);
    if (url) setSectionForm((prev) => ({ ...prev, imageUrl: url }));
  };

  const submitSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSaveSection(sectionForm, editingSectionId);
    if (ok) {
      setEditingSectionId(null);
      setSectionForm(EMPTY_SECTION);
    }
  };

  const startEditSection = (sec: HomeCustomSection) => {
    setEditingSectionId(sec.id);
    setSectionForm({
      titleAr: sec.titleAr,
      titleEn: sec.titleEn,
      subtitleAr: sec.subtitleAr,
      subtitleEn: sec.subtitleEn,
      bodyAr: sec.bodyAr,
      bodyEn: sec.bodyEn,
      imageUrl: sec.imageUrl,
      buttonTextAr: sec.buttonTextAr,
      buttonTextEn: sec.buttonTextEn,
      buttonUrl: sec.buttonUrl,
      layoutStyle: sec.layoutStyle,
      visible: sec.visible,
    });
  };

  const moveSection = async (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= sections.length) return;
    const copy = [...sections];
    const [item] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, item);
    await onReorderSections(copy.map((s) => s.id));
  };

  return (
    <div className="space-y-8">
      {/* 1. Brand, Hero & Homepage Texts */}
      <form
        onSubmit={onSaveContent}
        className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'الهوية والعناوين والأزرار وصور الصفحة الرئيسية' : 'Brand, Hero & Homepage Content'}
            </h2>
            <p className="text-xs text-[#A1A6B3] mt-0.5">
              {isAr
                ? 'تُحفظ التعديلات في المسودة ويمكنك معاينتها قبل النشر للزوار.'
                : 'Changes save to Draft and can be previewed before publishing live.'}
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ التغييرات' : 'Save Draft'}</span>
          </button>
        </div>

        {/* Company Name & Logo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}
            </label>
            <input
              type="text"
              value={contentForm.companyNameAr || ''}
              onChange={(e) => setContentForm({ ...contentForm, companyNameAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contentForm.companyNameEn || ''}
              onChange={(e) => setContentForm({ ...contentForm, companyNameEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'شعار الشركة (Logo URL أو رفع صورة)' : 'Company Logo (URL or Upload)'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                placeholder="/uploads/logo.png"
                value={contentForm.logoUrl || ''}
                onChange={(e) => setContentForm({ ...contentForm, logoUrl: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161920] hover:bg-[#1E222B] border border-white/15 text-xs text-white cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'رفع شعار' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleLogoUpload(f);
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'صورة الخلفية والعرض الرئيسي (Hero Image)' : 'Hero Showcase Image'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={contentForm.heroBgImageUrl || ''}
                onChange={(e) => setContentForm({ ...contentForm, heroBgImageUrl: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161920] hover:bg-[#1E222B] border border-white/15 text-xs text-white cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'رفع صورة' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleHeroBgUpload(f);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Hero Texts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'العنوان الرئيسي (عربي)' : 'Hero Title (Arabic)'}
            </label>
            <input
              type="text"
              value={contentForm.heroTitleAr}
              onChange={(e) => setContentForm({ ...contentForm, heroTitleAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'العنوان الرئيسي (إنجليزي)' : 'Hero Title (English)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contentForm.heroTitleEn}
              onChange={(e) => setContentForm({ ...contentForm, heroTitleEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'الوصف التعريفي (عربي)' : 'Hero Subtitle (Arabic)'}
            </label>
            <textarea
              rows={2}
              value={contentForm.heroSubtitleAr}
              onChange={(e) => setContentForm({ ...contentForm, heroSubtitleAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'الوصف التعريفي (إنجليزي)' : 'Hero Subtitle (English)'}
            </label>
            <textarea
              rows={2}
              dir="ltr"
              value={contentForm.heroSubtitleEn}
              onChange={(e) => setContentForm({ ...contentForm, heroSubtitleEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
        </div>

        {/* Hero Buttons & Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'نص الزر الأول (عربي)' : 'Primary Button (Arabic)'}
            </label>
            <input
              type="text"
              value={contentForm.heroPrimaryBtnTextAr || ''}
              onChange={(e) => setContentForm({ ...contentForm, heroPrimaryBtnTextAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'نص الزر الأول (إنجليزي)' : 'Primary Button (English)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contentForm.heroPrimaryBtnTextEn || ''}
              onChange={(e) => setContentForm({ ...contentForm, heroPrimaryBtnTextEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'رابط الزر الأول' : 'Primary Button Link'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contentForm.heroPrimaryBtnUrl || '/portfolio'}
              onChange={(e) => setContentForm({ ...contentForm, heroPrimaryBtnUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'نص الزر الثاني (عربي)' : 'Secondary Button (Arabic)'}
            </label>
            <input
              type="text"
              value={contentForm.heroSecondaryBtnTextAr || ''}
              onChange={(e) => setContentForm({ ...contentForm, heroSecondaryBtnTextAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'نص الزر الثاني (إنجليزي)' : 'Secondary Button (English)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contentForm.heroSecondaryBtnTextEn || ''}
              onChange={(e) => setContentForm({ ...contentForm, heroSecondaryBtnTextEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'رابط الزر الثاني' : 'Secondary Button Link'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contentForm.heroSecondaryBtnUrl || '/quote'}
              onChange={(e) => setContentForm({ ...contentForm, heroSecondaryBtnUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
            />
          </div>
        </div>

        {/* CTA Banner & About Story */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'عنوان بانر الطلب السفلي (عربي)' : 'Bottom CTA Banner Title (Arabic)'}
            </label>
            <input
              type="text"
              value={contentForm.ctaBannerTitleAr || ''}
              onChange={(e) => setContentForm({ ...contentForm, ctaBannerTitleAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'نص زر بانر الطلب (عربي)' : 'CTA Banner Button (Arabic)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={contentForm.ctaBannerBtnTextAr || ''}
                onChange={(e) => setContentForm({ ...contentForm, ctaBannerBtnTextAr: e.target.value })}
                className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
              />
              <input
                type="text"
                dir="ltr"
                value={contentForm.ctaBannerBtnUrl || '/quote'}
                onChange={(e) => setContentForm({ ...contentForm, ctaBannerBtnUrl: e.target.value })}
                className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'قصة الشركة / من نحن (عربي)' : 'About Story (Arabic)'}
            </label>
            <textarea
              rows={3}
              value={contentForm.aboutStoryAr}
              onChange={(e) => setContentForm({ ...contentForm, aboutStoryAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'قصة الشركة / من نحن (إنجليزي)' : 'About Story (English)'}
            </label>
            <textarea
              rows={3}
              dir="ltr"
              value={contentForm.aboutStoryEn}
              onChange={(e) => setContentForm({ ...contentForm, aboutStoryEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'سنوات الخبرة' : 'Years Experience'}
            </label>
            <input
              type="text"
              value={contentForm.yearsExperience}
              onChange={(e) => setContentForm({ ...contentForm, yearsExperience: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'المشاريع المنفذة' : 'Completed Projects'}
            </label>
            <input
              type="text"
              value={contentForm.completedProjectsCount}
              onChange={(e) => setContentForm({ ...contentForm, completedProjectsCount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'سنوات الضمان' : 'Warranty Years'}
            </label>
            <input
              type="text"
              value={contentForm.warrantyYears}
              onChange={(e) => setContentForm({ ...contentForm, warrantyYears: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white font-mono-tabular"
            />
          </div>
        </div>
      </form>

      {/* 2. Theme Colors & Fonts */}
      <form
        onSubmit={onSaveTheme}
        className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'الألوان والخطوط والهوية البصرية' : 'Colors & Typography'}
            </h2>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#1D6BFF] hover:bg-[#3B82F6] rounded-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ الألوان والخطوط' : 'Save Theme'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              ['primaryBg', isAr ? 'الخلفية الرئيسية' : 'Primary BG'],
              ['surfaceBg', isAr ? 'خلفية البطاقات' : 'Surface Card'],
              ['accentBlue', isAr ? 'الأزرق الكهربائي' : 'Electric Blue'],
              ['accentGold', isAr ? 'الذهبي المميز' : 'Accent Gold'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="bg-[#0A0B0E] border border-white/10 rounded-lg p-3 space-y-2">
              <label className="block text-xs text-[#A1A6B3]">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeForm[key]}
                  onChange={(e) => setThemeForm({ ...themeForm, [key]: e.target.value.toUpperCase() })}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  dir="ltr"
                  value={themeForm[key]}
                  onChange={(e) => setThemeForm({ ...themeForm, [key]: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-[#12141A] border border-white/15 text-xs text-white font-mono-tabular"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'الخط العربي الأساسي' : 'Primary Arabic Font'}
            </label>
            <select
              value={themeForm.fontFamilyAr}
              onChange={(e) => setThemeForm({ ...themeForm, fontFamilyAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            >
              <option value="Cairo">Cairo (الافتراضي العصري)</option>
              <option value="Tajawal">Tajawal (هندسي أنيق)</option>
              <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic (احترافي تقني)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'الخط الإنجليزي الأساسي' : 'Primary English Font'}
            </label>
            <select
              value={themeForm.fontFamilyEn}
              onChange={(e) => setThemeForm({ ...themeForm, fontFamilyEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Manrope">Manrope</option>
              <option value="Outfit">Outfit</option>
            </select>
          </div>
        </div>
      </form>

      {/* 3. Custom Home Sections Manager */}
      <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-[#1D6BFF]" />
          <h2 className="text-lg font-bold text-white">
            {isAr ? 'إضافة وترتيب أقسام جديدة في الصفحة الرئيسية' : 'Custom Homepage Sections'}
          </h2>
        </div>

        <form onSubmit={submitSection} className="bg-[#0A0B0E] border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>
              {editingSectionId
                ? isAr
                  ? 'تعديل القسم المحدد'
                  : 'Edit Section'
                : isAr
                  ? 'إضافة قسم جديد للصفحة الرئيسية'
                  : 'Add New Homepage Section'}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={isAr ? 'عنوان القسم بالعربية' : 'Section Title (Arabic)'}
              value={sectionForm.titleAr}
              onChange={(e) => setSectionForm({ ...sectionForm, titleAr: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-sm text-white"
            />
            <input
              type="text"
              dir="ltr"
              placeholder={isAr ? 'عنوان القسم بالإنجليزية' : 'Section Title (English)'}
              value={sectionForm.titleEn}
              onChange={(e) => setSectionForm({ ...sectionForm, titleEn: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-sm text-white"
            />
            <input
              type="text"
              placeholder={isAr ? 'عنوان فرعي (عربي - اختياري)' : 'Subtitle (Arabic)'}
              value={sectionForm.subtitleAr}
              onChange={(e) => setSectionForm({ ...sectionForm, subtitleAr: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-sm text-white"
            />
            <select
              value={sectionForm.layoutStyle}
              onChange={(e) =>
                setSectionForm({
                  ...sectionForm,
                  layoutStyle: e.target.value as 'split' | 'banner' | 'cards',
                })
              }
              className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-sm text-white"
            >
              <option value="split">{isAr ? 'تخطيط مقسم (نص + صورة)' : 'Split (Text + Image)'}</option>
              <option value="banner">{isAr ? 'بانر إعلاني عريض' : 'Full-Width Banner'}</option>
              <option value="cards">{isAr ? 'بطاقات نقاط (كل سطر بطاقة)' : 'Bullet Cards'}</option>
            </select>

            <textarea
              rows={3}
              placeholder={isAr ? 'محتوى القسم بالعربية' : 'Section Body (Arabic)'}
              value={sectionForm.bodyAr}
              onChange={(e) => setSectionForm({ ...sectionForm, bodyAr: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-sm text-white"
            />
            <textarea
              rows={3}
              dir="ltr"
              placeholder={isAr ? 'محتوى القسم بالإنجليزية' : 'Section Body (English)'}
              value={sectionForm.bodyEn}
              onChange={(e) => setSectionForm({ ...sectionForm, bodyEn: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-sm text-white"
            />

            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                placeholder={isAr ? 'رابط الصورة (اختياري)' : 'Image URL (optional)'}
                value={sectionForm.imageUrl}
                onChange={(e) => setSectionForm({ ...sectionForm, imageUrl: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-xs text-white font-mono-tabular"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161920] hover:bg-[#1E222B] border border-white/15 text-xs text-white cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'رفع' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleSectionImgUpload(f);
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={isAr ? 'نص الزر (عربي)' : 'Button Text (Arabic)'}
                value={sectionForm.buttonTextAr}
                onChange={(e) => setSectionForm({ ...sectionForm, buttonTextAr: e.target.value })}
                className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-sm text-white"
              />
              <input
                type="text"
                dir="ltr"
                placeholder="/quote"
                value={sectionForm.buttonUrl}
                onChange={(e) => setSectionForm({ ...sectionForm, buttonUrl: e.target.value })}
                className="px-3.5 py-2.5 rounded-lg bg-[#12141A] border border-white/15 text-xs text-white font-mono-tabular"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
            >
              {editingSectionId
                ? isAr
                  ? 'حفظ تعديل القسم'
                  : 'Update Section'
                : isAr
                  ? 'إضافة القسم'
                  : 'Add Section'}
            </button>
            {editingSectionId && (
              <button
                type="button"
                onClick={() => {
                  setEditingSectionId(null);
                  setSectionForm(EMPTY_SECTION);
                }}
                className="px-4 py-2.5 text-sm text-[#B5BAC7] bg-[#161920] rounded-lg cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            )}
          </div>
        </form>

        {/* Sections List with Up/Down Reorder */}
        {sections.length === 0 ? (
          <p className="text-xs text-[#8C92A0] text-center py-4">
            {isAr
              ? 'لا توجد أقسام إضافية حالياً. يمكنك إضافة قسم جديد من النموذج أعلاه.'
              : 'No custom sections added yet.'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-[#0A0B0E] border border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {sec.imageUrl && (
                    <SmartImage
                      src={sec.imageUrl}
                      alt={sec.titleAr}
                      className="w-11 h-11 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {isAr ? sec.titleAr : sec.titleEn}
                    </div>
                    <div className="text-xs text-[#8C92A0]">
                      {sec.layoutStyle} · {sec.visible ? (isAr ? 'ظاهر' : 'Visible') : isAr ? 'مخفي' : 'Hidden'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => void moveSection(idx, -1)}
                    aria-label={isAr ? 'تحريك لأعلى' : 'Move Up'}
                    className="p-2 text-[#B5BAC7] hover:text-white disabled:opacity-30 rounded-lg bg-[#161920] cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => void moveSection(idx, 1)}
                    aria-label={isAr ? 'تحريك لأسفل' : 'Move Down'}
                    className="p-2 text-[#B5BAC7] hover:text-white disabled:opacity-30 rounded-lg bg-[#161920] cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onToggleSectionVisibility(sec)}
                    aria-label={isAr ? 'إظهار/إخفاء القسم' : 'Toggle Visibility'}
                    className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/15 rounded-lg cursor-pointer"
                  >
                    {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditSection(sec)}
                    aria-label={isAr ? 'تعديل القسم' : 'Edit Section'}
                    className="p-2 text-[#60A5FA] hover:bg-[#1D6BFF]/15 rounded-lg cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {confirmDeleteSectionId === sec.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteSectionId(null);
                          void onDeleteSection(sec.id);
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold bg-red-600 text-white rounded cursor-pointer"
                      >
                        {isAr ? 'تأكيد الحذف' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteSectionId(null)}
                        className="px-2 py-1.5 text-xs bg-[#161920] text-[#B5BAC7] rounded cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteSectionId(sec.id)}
                      aria-label={isAr ? 'حذف القسم' : 'Delete Section'}
                      className="p-2 text-red-400 hover:bg-red-500/15 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
