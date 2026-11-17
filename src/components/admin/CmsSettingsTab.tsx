import React from 'react';
import { Globe, Phone, Save, ShieldCheck } from 'lucide-react';
import type { ContactSettings, SeoAndLegalSettings } from '../../shared/types';

interface CmsSettingsTabProps {
  isAr: boolean;
  contactForm: ContactSettings;
  setContactForm: React.Dispatch<React.SetStateAction<ContactSettings | null>>;
  seoLegalForm: SeoAndLegalSettings;
  setSeoLegalForm: React.Dispatch<React.SetStateAction<SeoAndLegalSettings | null>>;
  onSaveContact: (e: React.FormEvent) => Promise<void>;
  onSaveSeoLegal: (e: React.FormEvent) => Promise<void>;
}

export function CmsSettingsTab({
  isAr,
  contactForm,
  setContactForm,
  seoLegalForm,
  setSeoLegalForm,
  onSaveContact,
  onSaveSeoLegal,
}: CmsSettingsTabProps) {
  return (
    <div className="space-y-8">
      {/* 1. Contact & Map Settings */}
      <form
        onSubmit={onSaveContact}
        className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#1D6BFF]" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'بيانات التواصل وواتساب والعنوان' : 'Contact, WhatsApp & Location'}
            </h2>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ بيانات التواصل' : 'Save Contact'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'رقم الواتساب' : 'WhatsApp Number'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contactForm.whatsapp}
              onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              dir="ltr"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'رابط فيسبوك' : 'Facebook URL'}
            </label>
            <input
              type="url"
              dir="ltr"
              value={contactForm.facebookUrl}
              onChange={(e) => setContactForm({ ...contactForm, facebookUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'العنوان بالعربية' : 'Address (Arabic)'}
            </label>
            <input
              type="text"
              value={contactForm.addressAr}
              onChange={(e) => setContactForm({ ...contactForm, addressAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'العنوان بالإنجليزية' : 'Address (English)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={contactForm.addressEn}
              onChange={(e) => setContactForm({ ...contactForm, addressEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'مواعيد العمل (عربي)' : 'Working Hours (Arabic)'}
            </label>
            <input
              type="text"
              value={contactForm.workingHoursAr}
              onChange={(e) => setContactForm({ ...contactForm, workingHoursAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'إحداثيات الخريطة (Lat / Lng)' : 'Map Coordinates (Lat / Lng)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                dir="ltr"
                value={contactForm.mapLat}
                onChange={(e) => setContactForm({ ...contactForm, mapLat: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
              />
              <input
                type="text"
                dir="ltr"
                value={contactForm.mapLng}
                onChange={(e) => setContactForm({ ...contactForm, mapLng: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. Domain, SEO Meta & Legal Policies */}
      <form
        onSubmit={onSaveSeoLegal}
        className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'إعدادات الدومين و SEO والصفحات القانونية' : 'Domain, SEO & Legal Policies'}
            </h2>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#1D6BFF] hover:bg-[#3B82F6] rounded-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ SEO والسياسات' : 'Save SEO & Policies'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'اسم النطاق المعتمد (Domain Name)' : 'Canonical Domain Name'}
            </label>
            <input
              type="text"
              dir="ltr"
              placeholder="mahmoudshaaban.com"
              value={seoLegalForm.domainName}
              onChange={(e) => setSeoLegalForm({ ...seoLegalForm, domainName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white font-mono-tabular"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'عنوان SEO للمتصفح (عربي)' : 'SEO Meta Title (Arabic)'}
            </label>
            <input
              type="text"
              value={seoLegalForm.metaTitleAr}
              onChange={(e) => setSeoLegalForm({ ...seoLegalForm, metaTitleAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'عنوان SEO للمتصفح (إنجليزي)' : 'SEO Meta Title (English)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={seoLegalForm.metaTitleEn}
              onChange={(e) => setSeoLegalForm({ ...seoLegalForm, metaTitleEn: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'وصف محركات البحث (عربي)' : 'SEO Description (Arabic)'}
            </label>
            <textarea
              rows={2}
              value={seoLegalForm.metaDescriptionAr}
              onChange={(e) => setSeoLegalForm({ ...seoLegalForm, metaDescriptionAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A1A6B3] mb-1.5">
              {isAr ? 'الكلمات المفتاحية (Keywords)' : 'SEO Keywords (Arabic)'}
            </label>
            <textarea
              rows={2}
              value={seoLegalForm.metaKeywordsAr}
              onChange={(e) => setSeoLegalForm({ ...seoLegalForm, metaKeywordsAr: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
            />
          </div>
        </div>

        {/* Privacy & Terms */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#D4AF37]">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isAr
                ? 'تعديل محتوى صفحة سياسة الخصوصية والشروط والأحكام (اترك سطراً فارغاً بين كل بند)'
                : 'Privacy Policy & Terms Content (Separate sections with a blank line)'}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A1A6B3] mb-1.5">
                {isAr ? 'سياسة الخصوصية (عربي)' : 'Privacy Policy (Arabic)'}
              </label>
              <textarea
                rows={7}
                value={seoLegalForm.privacyPolicyAr}
                onChange={(e) => setSeoLegalForm({ ...seoLegalForm, privacyPolicyAr: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A1A6B3] mb-1.5">
                {isAr ? 'الشروط والأحكام (عربي)' : 'Terms & Conditions (Arabic)'}
              </label>
              <textarea
                rows={7}
                value={seoLegalForm.termsConditionsAr}
                onChange={(e) => setSeoLegalForm({ ...seoLegalForm, termsConditionsAr: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white leading-relaxed"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
