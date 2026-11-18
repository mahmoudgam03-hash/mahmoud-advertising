import { ShieldCheck, Ruler, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function AboutPage() {
  const { lang, navigate, data } = useApp();
  const isAr = lang === 'ar';
  const content = data?.content;

  const stages = [
    {
      step: '01',
      titleAr: 'المعاينة الميدانية والرفع المساحي',
      titleEn: 'On-Site Survey & Structural Measurement',
      descAr: 'زيارة ميدانية للموقع لأخذ المقاسات الدقيقة بالليزر، فحص حالة الجدران ونقاط الكهرباء وتحديد زوايا الرؤية.',
      descEn: 'Laser site measurements, facade structural assessment, electrical feed inspection, and viewing angle analysis.',
    },
    {
      step: '02',
      titleAr: 'التصميم ثلاثي الأبعاد والمحاكاة الليلية',
      titleEn: '3D Architectural Modeling & Lighting Simulation',
      descAr: 'إعداد تصور 3D واقعي للواجهة بالإضاءة الليلية والنهارية واعتماد الألوان والخامات مع العميل قبل التصنيع.',
      descEn: 'Photorealistic 3D day/night facade renders showing exact material finishes and LED glow before fabrication.',
    },
    {
      step: '03',
      titleAr: 'التصنيع الدقيق بالليزر والـ CNC',
      titleEn: 'Fiber Laser & CNC Precision Fabrication',
      descAr: 'تقطيع الاستانلس والأكريليك وألواح الكلادينج بماكينات فايبر ليزر وراوتر CNC لضمان تشطيب نظيف وحواف متطابقة.',
      descEn: 'In-house fiber-laser metal cutting, seamless TIG/laser soldering, and CNC acrylic/ACP routing.',
    },
    {
      step: '04',
      titleAr: 'تجميع الإضاءة والاختبار الكهربائي',
      titleEn: 'IP67 LED Integration & Load Testing',
      descAr: 'تركيب شرائح LED المعزولة ومحولات الطاقة المعتمدة مع اختبار التشغيل المستمر للتأكد من تجانس الإضاءة.',
      descEn: 'Installation of waterproof Samsung LED modules and sealed 12V drivers tested for uniform luminance.',
    },
    {
      step: '05',
      titleAr: 'التركيب الميداني والتسليم بالضمان',
      titleEn: 'Certified Rigging, Commissioning & Warranty',
      descAr: 'تنفيذ التركيب بواسطة فنيين متخصصين مع الأوناش والسقالات، ثم تسليم المشروع مع شهادة ضمان شاملة.',
      descEn: 'Safe installation by experienced rigging teams followed by final handover with a written multi-year warranty.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Intro Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
          <p className="text-xs font-semibold text-[#D4AF37]">
            {isAr ? 'عن شركة محمود شعبان للدعاية والإعلان' : 'About Mahmoud Shaaban Advertising'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F6] leading-snug">
            {isAr
              ? content?.aboutTitleAr || 'خبرة 6 سنوات في تصنيع اليفط والواجهات الإعلانية بأعلى دقة'
              : content?.aboutTitleEn || '6 Years of Precision Signage & Architectural Facade Fabrication'}
          </h1>
          <p className="text-base text-[#B5BAC7] leading-relaxed">
            {isAr
              ? content?.aboutStoryAr ||
                'تأسست شركة محمود شعبان للدعاية والإعلان لتقديم حلول تصنيع متكاملة تجمع بين دقة الورش الهندسية الحديثة وجماليات التصميم التجاري الفاخر.'
              : content?.aboutStoryEn ||
                'Mahmoud Shaaban Advertising delivers end-to-end signage fabrication uniting modern CNC & laser workshops with luxury architectural aesthetics.'}
          </p>
          <p className="text-sm text-[#D4D7E0] bg-[#12141A] border border-white/10 rounded-xl p-4 leading-relaxed">
            {isAr
              ? content?.qualityPromiseAr ||
                'نلتزم بضمان فعلي على الإضاءة والخامات، مع تسليم هندسي دقيق ومطابق للمعايير الكهربائية والأمان الإنشائي.'
              : content?.qualityPromiseEn ||
                'Every project is backed by a written warranty covering structural mounting, metal finishes, and IP67-rated LED electrical systems.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/quote')}
              className="px-6 py-3 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr ? 'احجز معاينة لمشروعك' : 'Schedule a Site Survey'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/portfolio')}
              className="px-6 py-3 text-sm font-semibold text-[#F4F4F6] bg-[#161920] hover:bg-[#1E222B] border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr ? 'شاهد أعمالنا المنفذة' : 'View Completed Projects'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 card-3d-luxury rounded-xl overflow-hidden border border-white/10 min-h-[280px] sm:min-h-[320px] bg-[#12141A]">
          <ImageWithFallback
            src="/src/assets/images/service_cladding_facade_1794750815768.jpg"
            alt={isAr ? 'تنفيذ واجهات كلادينج وحروف مضيئة' : 'Architectural ACP facade cladding execution'}
            className="w-full h-full object-cover"
            fallbackTitle={isAr ? 'محمود شعبان للدعاية والإعلان' : 'Mahmoud Shaaban Advertising'}
          />
        </div>
      </section>

      {/* Quality Standards */}
      <section className="border-t border-white/10 pt-14">
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#1D6BFF] mb-2">
            {isAr ? 'معايير الخبرة والجودة' : 'Engineering & Material Standards'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F6]">
            {isAr ? 'لماذا يثق بنا أصحاب العلامات التجارية؟' : 'Why Commercial Brands Trust Our Workshop'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-3">
            <Ruler className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="font-bold text-[#F4F4F6]">
              {isAr ? 'دقة مقاسات هندسية' : 'Millimeter Precision'}
            </h3>
            <p className="text-sm text-[#B5BAC7]">
              {isAr
                ? 'نلتزم برسومات تنفيذية مطابقة للواقع دون تفاوت في التركيب أو التثبيت.'
                : 'CAD shop drawings ensure exact alignment across multi-story facades.'}
            </p>
          </div>
          <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-3">
            <Sparkles className="w-6 h-6 text-[#1D6BFF]" />
            <h3 className="font-bold text-[#F4F4F6]">
              {isAr ? 'إضاءة LED متجانسة' : 'Zero-Hotspot Lighting'}
            </h3>
            <p className="text-sm text-[#B5BAC7]">
              {isAr
                ? 'توزيع هندسي لعدسات الليد يضمن إضاءة ناعمة متساوية بدون نقاط معتمة.'
                : 'Wide-beam optical lenses eliminate dark shadows across letter faces.'}
            </p>
          </div>
          <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-3">
            <Wrench className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="font-bold text-[#F4F4F6]">
              {isAr ? 'تشطيب معدني فاخر' : 'Seamless Metal Craft'}
            </h3>
            <p className="text-sm text-[#B5BAC7]">
              {isAr
                ? 'لحام ليزر غير مرئي وتلميع احترافي لحواف الاستانلس الذهبي والفضي.'
                : 'Micro-laser welds and mirror-polishing for clean, rivet-free returns.'}
            </p>
          </div>
          <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#1D6BFF]" />
            <h3 className="font-bold text-[#F4F4F6]">
              {isAr ? 'التزام بالمواعيد والضمان' : 'On-Time Delivery & Warranty'}
            </h3>
            <p className="text-sm text-[#B5BAC7]">
              {isAr
                ? 'جدول زمني واضح للتصنيع والتركيب مع خدمة صيانة سريعة بعد التسليم.'
                : 'Strict production timelines backed by responsive after-sales support.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5-Stage Workflow */}
      <section className="border-t border-white/10 pt-14">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#D4AF37] mb-2">
            {isAr ? 'مراحل العمل والتنفيذ' : 'Execution Workflow'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F6]">
            {isAr ? 'من الفكرة والمعاينة حتى الإضاءة النهائية' : 'Five Stages From Survey to Illumination'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((s) => (
            <div
              key={s.step}
              className="bg-[#12141A] border border-white/10 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-extrabold font-mono-tabular text-[#D4AF37]">
                    {s.step}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#1D6BFF]" />
                </div>
                <h3 className="text-base font-bold text-[#F4F4F6] mb-2">
                  {isAr ? s.titleAr : s.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed">
                  {isAr ? s.descAr : s.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
