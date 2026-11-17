import { FileCheck2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function TermsPage() {
  const { lang, navigate, data } = useApp();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const rawTerms = isAr ? data?.seoLegal?.termsConditionsAr : data?.seoLegal?.termsConditionsEn;

  const defaultSections = isAr
    ? [
        {
          title: '1. المقايسات وعروض الأسعار',
          body: 'تعتبر عروض الأسعار المقدمة عبر الموقع استرشادية بناءً على المقاسات والمواصفات المرسلة من العميل، ويتم تأكيد السعر النهائي ومواعيد التسليم بعد المعاينة الهندسية والمطابقة على أرض الواقع.',
        },
        {
          title: '2. اعتماد التصميم والخامات',
          body: 'لا يبدأ التصنيع داخل الورشة إلا بعد اعتماد التصميم النهائي وألوان الخامات (الاستانلس، الأكريليك، الكلادينج، أو الفلكس) ونوع الإضاءة كتابياً أو عبر قناة التواصل المعتمدة.',
        },
        {
          title: '3. مدة التنفيذ والتركيب الميداني',
          body: 'تلتزم شركة محمود شعبان للدعاية والإعلان بالجدول الزمني المتفق عليه في أمر التشغيل، مع توفير فرق تركيب متخصصة ومجهزة لأعمال التثبيت والتوصيلات الكهربائية الآمنة في الموقع.',
        },
        {
          title: '4. الضمان والصيانة',
          body: 'تخضع أعمال الحروف البارزة والكلادينج ووحدات الإضاءة LED لضمان الشركة المتفق عليه ضد عيوب التصنيع أو الإضاءة، ولا يشمل الضمان الأعطال الناتجة عن تذبذب التيار الكهربائي الخارجي أو الكسر المتعمد.',
        },
        {
          title: '5. التعديلات وتراخيص الواجهات',
          body: 'يتحمل العميل مسؤولية استخراج تصاريح الإعلان والحي المختصة لموقع التركيب، ما لم يُنص في الاتفاق على غير ذلك.',
        },
      ]
    : [
        {
          title: '1. Quotes & Site Measurements',
          body: 'Quotes generated from online submissions are preliminary estimates based on client-provided measurements. Final pricing and fabrication schedules are confirmed following an on-site engineering survey.',
        },
        {
          title: '2. Design & Material Approval',
          body: 'Workshop fabrication begins only after written confirmation of the final artwork, material gauges (304 stainless steel, cast acrylic, ACP cladding, or flex), colors, and LED lighting setup.',
        },
        {
          title: '3. Fabrication & On-Site Installation',
          body: 'Mahmoud Shaaban Advertising commits to the agreed production timeline and deploys equipped installation crews for structural mounting and weather-sealed electrical commissioning.',
        },
        {
          title: '4. Warranty Coverage',
          body: '3D lettering, ACP cladding assemblies, and IP67 LED modules carry the stated fabrication warranty against manufacturing defects. Warranty excludes damage from external power surges or physical impact.',
        },
        {
          title: '5. Municipal Permits',
          body: 'Obtaining local municipal signage permits for the storefront or building facade remains the client’s responsibility unless explicitly contracted otherwise.',
        },
      ];

  const sections = rawTerms?.trim()
    ? rawTerms
        .split(/\n\s*\n/)
        .map((block, idx) => {
          const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
          if (lines.length === 1) {
            return { title: `${idx + 1}.`, body: lines[0] };
          }
          return { title: lines[0], body: lines.slice(1).join('\n') };
        })
        .filter((s) => s.body)
    : defaultSections;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-3">
          <FileCheck2 className="w-4 h-4" />
          <span>{isAr ? 'ضوابط التنفيذ والضمان' : 'Fabrication & Service Terms'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F6] mb-3">
          {isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
        </h1>
        <p className="text-sm text-[#A1A6B3]">
          {isAr
            ? `${data?.content?.companyNameAr || 'شركة محمود شعبان للدعاية والإعلان'} · الضوابط المنظمة لأعمال التصنيع والتركيب`
            : `${data?.content?.companyNameEn || 'Mahmoud Shaaban Advertising'} · Terms governing fabrication, delivery, and installation`}
        </p>
      </div>

      <div className="space-y-5">
        {sections.map((sec, idx) => (
          <section
            key={`${sec.title}-${idx}`}
            className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-2.5"
          >
            <h2 className="text-lg font-bold text-[#F4F4F6]">{sec.title}</h2>
            <p className="text-sm text-[#B5BAC7] leading-relaxed whitespace-pre-line">{sec.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-[#12141A] border border-[#D4AF37]/30 rounded-xl p-6">
        <p className="text-sm text-[#B5BAC7]">
          {isAr
            ? 'جاهز لبدء مقايسة مشروعك وفق هذه المعايير؟'
            : 'Ready to start your signage estimate under these standards?'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/quote')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{isAr ? 'اطلب عرض سعر الآن' : 'Request Quote Now'}</span>
          <ArrowIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
