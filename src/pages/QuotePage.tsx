import React, { useEffect, useMemo, useState } from 'react';
import { Upload, CheckCircle2, MessageCircle, AlertCircle, X, FileImage, Ruler } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateQuoteInput } from '../shared/validation';
import { buildWhatsAppQuoteUrl } from '../shared/whatsapp';

const MATERIAL_OPTIONS = [
  { ar: 'استانلس ستيل 304 (ذهبي / فضي)', en: '304 Stainless Steel (Gold / Chrome)' },
  { ar: 'أكريليك كاست مستورد', en: 'Imported Cast Acrylic' },
  { ar: 'كلادينج ألومنيوم PVDF (4 مم)', en: 'Aluminum Composite Cladding PVDF (4mm)' },
  { ar: 'حروف سمارت ألومنيوم وأكريليك', en: 'Smart Aluminum & Acrylic Letters' },
  { ar: 'فلكس كوري 510 جم + هيكل معدني', en: '510gsm Korean Flex + Metal Frame' },
  { ar: 'أكريليك مرايا (ذهبي / فضي)', en: 'Mirror Acrylic (Gold / Silver)' },
  { ar: 'نيون LED سيليكون مرن', en: 'Flexible Silicone LED Neon' },
  { ar: 'خامة مركبة (كلادينج + حروف بارزة)', en: 'Hybrid (Cladding + 3D Letters)' },
];

const LIGHTING_OPTIONS = [
  { ar: 'إضاءة خلفية هالة LED (Halo)', en: 'Warm Halo LED Backlight' },
  { ar: 'إضاءة أمامية مضيئة بالكامل', en: 'Full Front-Lit LED' },
  { ar: 'إضاءة مزدوجة (أمامية + خلفية)', en: 'Dual Front & Halo LED' },
  { ar: 'ليد بروفايل معماري غاطس/بارز', en: 'Architectural LED Profile' },
  { ar: 'إضاءة نيون LED', en: 'Flexible LED Neon' },
  { ar: 'إضاءة كشافات خارجية (سبوت)', en: 'External Flood / Spot Lighting' },
  { ar: 'بدون إضاءة داخلية', en: 'Non-Illuminated' },
];

const COLOR_SUGGESTIONS_AR = ['ذهبي لامع', 'أزرق كهربائي', 'أسود فحمي', 'فضي مصقول', 'أبيض دافئ'];
const COLOR_SUGGESTIONS_EN = ['Mirror Gold', 'Electric Blue', 'Matte Charcoal', 'Brushed Silver', 'Warm White'];

export function QuotePage() {
  const { lang, data, queryParams } = useApp();
  const isAr = lang === 'ar';
  const services = data?.services || [];
  const whatsappNumber = data?.contact?.whatsapp || '01155709023';

  const preselectedSlug = queryParams.get('service') || '';

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [materialType, setMaterialType] = useState(MATERIAL_OPTIONS[0].ar);
  const [desiredColor, setDesiredColor] = useState('');
  const [lightingType, setLightingType] = useState(LIGHTING_OPTIONS[0].ar);
  const [details, setDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<{
    referenceCode: string;
    whatsappUrl: string;
    summary: {
      customerName: string;
      serviceType: string;
      dimensions: string;
      materialType: string;
      desiredColor: string;
      lightingType: string;
    };
  } | null>(null);

  useEffect(() => {
    if (services.length === 0) return;
    if (preselectedSlug) {
      const found = services.find((s) => s.slug === preselectedSlug);
      if (found) {
        setServiceType(isAr ? found.titleAr : found.titleEn);
        return;
      }
    }
    if (!serviceType) {
      setServiceType(isAr ? services[0].titleAr : services[0].titleEn);
    }
  }, [services, preselectedSlug, isAr, serviceType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
      setSubmitError(isAr ? 'يرجى اختيار صورة بصيغة JPG أو PNG أو WebP فقط.' : 'Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(isAr ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.' : 'Image size must not exceed 5MB.');
      return;
    }
    setSubmitError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const areaSqMeters = useMemo(() => {
    const w = Number(widthCm);
    const h = Number(heightCm);
    if (!w || !h || Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) return null;
    return ((w * h) / 10000).toFixed(2);
  }, [widthCm, heightCm]);

  const directWhatsAppUrl = useMemo(() => {
    return buildWhatsAppQuoteUrl({
      whatsappNumber,
      customerName: customerName || (isAr ? 'عميل جديد' : 'New Client'),
      phone: phone || '-',
      serviceType: serviceType || '-',
      widthCm: widthCm || '-',
      heightCm: heightCm || '-',
      materialType: materialType || '-',
      desiredColor: desiredColor || '-',
      lightingType: lightingType || '-',
      details: details || '',
      lang,
    });
  }, [
    whatsappNumber,
    customerName,
    phone,
    serviceType,
    widthCm,
    heightCm,
    materialType,
    desiredColor,
    lightingType,
    details,
    lang,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateQuoteInput(
      {
        customerName,
        phone,
        serviceType,
        widthCm,
        heightCm,
        materialType,
        desiredColor,
        lightingType,
        details,
      },
      lang
    );

    if (!validation.valid) {
      setFieldErrors(validation.errors as Record<string, string>);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const computedDimensions = isAr
        ? `${widthCm.trim()} × ${heightCm.trim()} سم`
        : `${widthCm.trim()} × ${heightCm.trim()} cm`;

      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('phone', phone.trim());
      formData.append('serviceType', serviceType.trim());
      formData.append('widthCm', widthCm.trim());
      formData.append('heightCm', heightCm.trim());
      formData.append('dimensions', computedDimensions);
      formData.append('materialType', materialType.trim());
      formData.append('desiredColor', desiredColor.trim());
      formData.append('lightingType', lightingType.trim());
      formData.append('details', details.trim());
      formData.append('lang', lang);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as {
        referenceCode?: string;
        error?: string;
        errors?: Record<string, string>;
      };

      if (!res.ok) {
        if (json.errors) setFieldErrors(json.errors);
        throw new Error(json.error || (isAr ? 'تعذر إرسال الطلب' : 'Failed to submit quote request'));
      }

      const refCode = json.referenceCode || 'MSA-2026';
      const whatsappUrl = buildWhatsAppQuoteUrl({
        whatsappNumber,
        customerName,
        phone,
        serviceType,
        widthCm,
        heightCm,
        materialType,
        desiredColor,
        lightingType,
        details,
        referenceCode: refCode,
        lang,
      });

      setSubmittedQuote({
        referenceCode: refCode,
        whatsappUrl,
        summary: {
          customerName: customerName.trim(),
          serviceType: serviceType.trim(),
          dimensions: computedDimensions,
          materialType: materialType.trim(),
          desiredColor: desiredColor.trim(),
          lightingType: lightingType.trim(),
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold text-[#D4AF37] mb-2">
          {isAr ? 'نظام طلبات عروض الأسعار' : 'Professional Fabrication Estimate'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F6] mb-3">
          {isAr ? 'اطلب عرض سعر لتصميم وتنفيذ واجهتك' : 'Request a Custom Fabrication Quote'}
        </h1>
        <p className="text-base text-[#B5BAC7] leading-relaxed">
          {isAr
            ? 'حدد المقاسات بالسنتيمتر والخامة واللون ونوع الإضاءة وأرفق صورة للمكان ليتم حفظ المقايسة وإرسالها مباشرة عبر واتساب.'
            : 'Specify your dimensions in cm, preferred material, color, and lighting type with an optional site photo to save your request and send via WhatsApp.'}
        </p>
      </div>

      {submittedQuote ? (
        <div className="bg-[#12141A] border border-emerald-500/40 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {isAr ? 'تم استلام وحفظ طلب عرض السعر بنجاح' : 'Quote Request Saved Successfully'}
              </h2>
              <p className="text-sm text-[#B5BAC7] mt-1">
                {isAr
                  ? 'تم تسجيل جميع مواصفات اليافطة في قاعدة البيانات ولوحة تحكم الإدارة، ويمكنك إرسال التفاصيل الآن لواتساب الشركة.'
                  : 'All sign specifications have been saved to our database and admin console. You can now send the full summary directly to WhatsApp.'}
              </p>
              <div className="mt-3 text-sm text-[#D4AF37] font-mono-tabular font-bold">
                {isAr ? 'رقم المرجع:' : 'Reference Code:'} {submittedQuote.referenceCode}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-[#0A0B0E] border border-white/10 text-xs">
            <div>
              <dt className="text-[#8C92A0]">{isAr ? 'العميل' : 'Client'}</dt>
              <dd className="text-white font-semibold mt-0.5">{submittedQuote.summary.customerName}</dd>
            </div>
            <div>
              <dt className="text-[#8C92A0]">{isAr ? 'نوع اليافطة / الخدمة' : 'Service Type'}</dt>
              <dd className="text-[#60A5FA] font-semibold mt-0.5">{submittedQuote.summary.serviceType}</dd>
            </div>
            <div>
              <dt className="text-[#8C92A0]">{isAr ? 'المقاس (عرض × ارتفاع)' : 'Dimensions'}</dt>
              <dd className="text-white font-mono-tabular mt-0.5">{submittedQuote.summary.dimensions}</dd>
            </div>
            <div>
              <dt className="text-[#8C92A0]">{isAr ? 'نوع الخامة' : 'Material'}</dt>
              <dd className="text-white mt-0.5">{submittedQuote.summary.materialType}</dd>
            </div>
            <div>
              <dt className="text-[#8C92A0]">{isAr ? 'اللون المطلوب' : 'Color'}</dt>
              <dd className="text-white mt-0.5">{submittedQuote.summary.desiredColor}</dd>
            </div>
            <div>
              <dt className="text-[#8C92A0]">{isAr ? 'نوع الإضاءة' : 'Lighting'}</dt>
              <dd className="text-[#D4AF37] mt-0.5">{submittedQuote.summary.lightingType}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            <a
              href={submittedQuote.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isAr ? 'إرسال تفاصيل الطلب إلى واتساب' : 'Send Quote Details to WhatsApp'}</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setSubmittedQuote(null);
                setCustomerName('');
                setPhone('');
                setWidthCm('');
                setHeightCm('');
                setDesiredColor('');
                setDetails('');
                clearFile();
              }}
              className="px-5 py-3.5 text-sm font-semibold text-[#D4D7E0] bg-[#161920] hover:bg-[#1E222B] border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              {isAr ? 'تقديم طلب جديد' : 'Submit Another Request'}
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-[#12141A] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6"
        >
          {submitError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Row 1: Name, Phone, Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="quote-name" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                {isAr ? 'الاسم بالكامل' : 'Full Name / Company'}
              </label>
              <input
                id="quote-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isAr ? 'مثال: محمود أحمد' : 'e.g., Horizon Retail Group'}
                className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              />
              {fieldErrors.customerName && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="quote-phone" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                {isAr ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp Number'}
              </label>
              <input
                id="quote-phone"
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01155709023"
                className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white font-mono-tabular"
              />
              {fieldErrors.phone && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="quote-service" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                {isAr ? 'نوع اليافطة أو الخدمة' : 'Sign or Service Type'}
              </label>
              <select
                id="quote-service"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              >
                {services.length === 0 ? (
                  <option value="حروف استانلس">{isAr ? 'حروف استانلس' : 'Stainless Steel Letters'}</option>
                ) : (
                  services.map((s) => {
                    const label = isAr ? s.titleAr : s.titleEn;
                    return (
                      <option key={s.id} value={label}>
                        {label}
                      </option>
                    );
                  })
                )}
              </select>
              {fieldErrors.serviceType && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.serviceType}</p>
              )}
            </div>
          </div>

          {/* Row 2: Width & Height in CM */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0A0B0E] border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#D4AF37]">
                <Ruler className="w-4 h-4" />
                <span>{isAr ? 'المقاسات بالسنتيمتر (سم)' : 'Dimensions in Centimeters (cm)'}</span>
              </div>
              {areaSqMeters && (
                <span className="text-xs font-mono-tabular text-[#60A5FA]">
                  {isAr
                    ? `المساحة التقريبية: ${areaSqMeters} م²`
                    : `Approx. Area: ${areaSqMeters} m²`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quote-width" className="block text-xs font-semibold text-[#D4D7E0] mb-1.5">
                  {isAr ? 'العرض (سم)' : 'Width (cm)'}
                </label>
                <input
                  id="quote-width"
                  type="number"
                  min="1"
                  step="any"
                  dir="ltr"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  placeholder="400"
                  className="w-full px-4 py-3 rounded-lg bg-[#12141A] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white font-mono-tabular"
                />
                {fieldErrors.widthCm && (
                  <p className="text-xs text-red-400 mt-1.5">{fieldErrors.widthCm}</p>
                )}
              </div>

              <div>
                <label htmlFor="quote-height" className="block text-xs font-semibold text-[#D4D7E0] mb-1.5">
                  {isAr ? 'الارتفاع (سم)' : 'Height (cm)'}
                </label>
                <input
                  id="quote-height"
                  type="number"
                  min="1"
                  step="any"
                  dir="ltr"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-3 rounded-lg bg-[#12141A] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white font-mono-tabular"
                />
                {fieldErrors.heightCm && (
                  <p className="text-xs text-red-400 mt-1.5">{fieldErrors.heightCm}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Material, Desired Color, Lighting Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="quote-material" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                {isAr ? 'نوع الخامة' : 'Material Type'}
              </label>
              <select
                id="quote-material"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              >
                {MATERIAL_OPTIONS.map((opt) => {
                  const val = isAr ? opt.ar : opt.en;
                  return (
                    <option key={opt.en} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
              {fieldErrors.materialType && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.materialType}</p>
              )}
            </div>

            <div>
              <label htmlFor="quote-color" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                {isAr ? 'اللون المطلوب' : 'Desired Color'}
              </label>
              <input
                id="quote-color"
                type="text"
                list="msa-color-suggestions"
                value={desiredColor}
                onChange={(e) => setDesiredColor(e.target.value)}
                placeholder={isAr ? 'مثال: ذهبي لامع مع فحمي' : 'e.g., Gold & Charcoal'}
                className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              />
              <datalist id="msa-color-suggestions">
                {(isAr ? COLOR_SUGGESTIONS_AR : COLOR_SUGGESTIONS_EN).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {fieldErrors.desiredColor && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.desiredColor}</p>
              )}
            </div>

            <div>
              <label htmlFor="quote-lighting" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                {isAr ? 'نوع الإضاءة' : 'Lighting Type'}
              </label>
              <select
                id="quote-lighting"
                value={lightingType}
                onChange={(e) => setLightingType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              >
                {LIGHTING_OPTIONS.map((opt) => {
                  const val = isAr ? opt.ar : opt.en;
                  return (
                    <option key={opt.en} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
              {fieldErrors.lightingType && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.lightingType}</p>
              )}
            </div>
          </div>

          {/* Row 4: Additional Details */}
          <div>
            <label htmlFor="quote-details" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
              {isAr ? 'تفاصيل إضافية وموقع التركيب' : 'Additional Details & Installation Site'}
            </label>
            <textarea
              id="quote-details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                isAr
                  ? 'اذكر عنوان الموقع، ارتفاع التركيب عن الأرض، أو أي ملاحظات تصميمية إضافية...'
                  : 'Mention site location, mounting height, or any custom design requirements...'
              }
              className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
            />
            {fieldErrors.details && (
              <p className="text-xs text-red-400 mt-1.5">{fieldErrors.details}</p>
            )}
          </div>

          {/* Row 5: Site Photo Upload */}
          <div>
            <label htmlFor="quote-image" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
              {isAr ? 'رفع صورة للمكان أو الواجهة (اختياري)' : 'Upload Site Photo or Sketch (Optional)'}
            </label>
            {!previewUrl ? (
              <label
                htmlFor="quote-image"
                className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/20 hover:border-[#D4AF37]/60 rounded-xl p-6 bg-[#0A0B0E] cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-sm text-[#D4D7E0] font-medium text-center">
                  {isAr
                    ? 'اضغط لاختيار صورة للمكان (JPG, PNG, WebP — حد أقصى 5MB)'
                    : 'Click to upload site image (JPG, PNG, WebP — Max 5MB)'}
                </span>
                <input
                  id="quote-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#0A0B0E] border border-white/15">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={previewUrl}
                    alt={isAr ? 'معاينة الصورة المرفقة' : 'Uploaded preview'}
                    className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-white truncate">
                      <FileImage className="w-4 h-4 text-[#1D6BFF] shrink-0" />
                      <span className="truncate">{imageFile?.name}</span>
                    </div>
                    <div className="text-xs text-[#8C92A0] font-mono-tabular mt-0.5">
                      {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ''}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label={isAr ? 'حذف الصورة المرفقة' : 'Remove uploaded image'}
                  className="p-2 rounded-lg bg-[#161920] text-[#F4F4F6] hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {submitting
                ? isAr
                  ? 'جاري حفظ الطلب...'
                  : 'Submitting...'
                : isAr
                  ? 'حفظ وإرسال طلب عرض السعر'
                  : 'Submit Quote Request'}
            </button>

            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isAr ? 'إرسال مباشر إلى واتساب' : 'Send Directly via WhatsApp'}</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
