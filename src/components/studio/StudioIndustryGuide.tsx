import { BookOpen, Layers, Cpu, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LED_CATALOG } from '../../shared/studio-calc';

const MATERIAL_SPECS = [
  {
    name: 'واجهات الكلادينج (ACP)',
    standardSize: '122 × 244 سم (أو جامبو 125 × 320 سم)',
    thickness: '4 مم إجمالي · قشرة ألمنيوم 0.30 مم · طلاء PVDF',
    notes:
      'يُفرّغ بالراوتر V-Groove للزوايا مع شد شاسيه حديد علب 2×2 أو 3×3 سم وتقفيل الفواصل بالسيلكون المقاوم للشمس.',
  },
  {
    name: 'الأكريليك (الكاست الأصلي vs الصيني)',
    standardSize: '122 × 244 سم (أو 200 × 300 سم)',
    thickness: '2 مم · 3 مم · 5 مم مضيء (مستورد كاست)',
    notes:
      'الكاست المستورد يحافظ على ناصع لونه دون اصفرار أمام الشمس؛ يجب ألا يقل عمق البروز عن 6 سم لتجانس الإضاءة بدون نقط.',
  },
  {
    name: 'الاستانلس ستيل (304 vs 201)',
    standardSize: '100 × 200 سم أو 122 × 244 سم',
    thickness: '0.7 مم إلى 1.0 مم للوجه · 0.6 مم للرتيرن',
    notes:
      'استانلس 304 غير قابل للصدأ نهائياً في الرطوبة والأمطار (لا يجذب المغناطيس)، ويُلحم بالليزر لتفادي تشويه اللمعة الذهبية أو الفضية.',
  },
  {
    name: 'يفط الفلكس والبنر',
    standardSize: 'رولات عرض حتى 320 سم / 500 سم',
    thickness: '440 جم إلى 510 جم فلكس مضيء بالخلفية',
    notes:
      'يتطلب توزيع مواسير ليد أو نيون داخلي متساوي على بعد لا يقل عن 14 سم من الوجه لمنع خطوط الظل على الطباعة.',
  },
];

const ELECTRICAL_RULES = [
  {
    title: 'قاعدة الـ 80% للباور سبلاي (الترانس)',
    body: 'لا تُحمّل الترانس 100% من أمبيره النظري أبداً؛ احسب مجموع الوات ÷ الفولت واضرب الناتج × 1.25 لضمان عمر طويل وعدم سخونة في الصيف.',
  },
  {
    title: 'حقن التغذية (Power Injection)',
    body: 'في ليدات 5 فولت (مثل WS2811 و WS2812B)، لا بد من توصيل سلك كهرباء (+ و -) إضافي كل 50 حبة على الأكثر، وإلا يبهت اللون الأبيض ويصفرّ آخر الخط.',
  },
  {
    title: 'عزل المطر IP67 ووصلات اللحام',
    body: 'كل نقطة لحام مكشوفة في الواجهة يجب عزلها بشيكارتون حراري (Heat Shrink) أو سيليكون متعادل (Neutral Silicone بدون رائحة خل لأن الخل يأكل النحاس).',
  },
  {
    title: 'تخانات السلك الرئيسية',
    body: 'الخطوط المغذية من الترانس للوحة حتى 25 أمبير تحتاج سلك نحاس صافي 2.5 مم أو 4 مم لتفادي فقد الجهد (Voltage Drop) عبر المسافات الطويلة.',
  },
];

const FABRICATION_STEPS = [
  '1. المعاينة الهندسية ورفع المقاسات بالليزر مع تصوير الواجهة وفحص نقاط الكهرباء.',
  '2. التصميم الفني وتقسيم الألواح 122×244 سم لتقليل الهالك قبل القص.',
  '3. التقطيع الرقمي بالراوتر CNC للأكريليك والكلادينج، والفايبر ليزر للاستانلس.',
  '4. لف التخانة (الرتيرن) ولحام الفريم وتركيب الليد وفق التباعد الهندسي والترقيم.',
  '5. اختبار تشغيل متواصل داخل الورشة لمدة 24 ساعة للتأكد من ثبات الفولت وسطوع الإضاءة.',
  '6. التركيب الآمن في الموقع على الشاسيه الحديدي وتقفيل فواصل العزل وتسليم الضمان.',
];

export function StudioIndustryGuide() {
  return (
    <div className="space-y-6">
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="glossy-black-icon w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#F5D061]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              موسوعة مجال الدعاية والإعلان واليفط المضيئة بالتفصيل
            </h2>
            <p className="text-xs sm:text-sm text-[#B5BAC7]">
              دليل شامل مجاني لكل فني ومهندس وصاحب عمل عن الخامات، أجيال الليد، أسرار الكهرباء، ومراحل التصنيع
            </p>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-[#F5D061] flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>أولاً: خامات الدعاية والواجهات ومقاساتها القياسية</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MATERIAL_SPECS.map((mat) => (
              <div
                key={mat.name}
                className="bg-[#06070B] border border-white/10 hover:border-[#D4AF37]/45 rounded-xl p-4 space-y-2 transition-colors"
              >
                <div className="text-base font-extrabold text-white">{mat.name}</div>
                <div className="text-xs font-mono-tabular text-[#F5D061]">
                  المقاس: {mat.standardSize}
                </div>
                <div className="text-xs text-[#A1A6B3]">السُمك والمواصفة: {mat.thickness}</div>
                <p className="text-xs sm:text-sm text-[#D4D7E0] leading-relaxed pt-1">
                  {mat.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LED Evolution Table */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
        <h3 className="text-base font-extrabold text-[#F5D061] flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          <span>ثانياً: تطور أجيال الليد من الجيل الأول حتى أحدث جيل حديث</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-start border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[#D4AF37]">
                <th className="py-2.5 text-start font-bold">الجيل</th>
                <th className="py-2.5 text-start font-bold">اسم الليد</th>
                <th className="py-2.5 text-start font-bold">الفولت / الوات</th>
                <th className="py-2.5 text-start font-bold">البرمجة</th>
                <th className="py-2.5 text-start font-bold">الاستخدام المثالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-[#D4D7E0]">
              {LED_CATALOG.map((led) => (
                <tr key={led.id}>
                  <td className="py-2.5 font-bold text-[#F5D061] whitespace-nowrap">
                    {led.generationLabelAr}
                  </td>
                  <td className="py-2.5 font-semibold text-white">{led.nameAr}</td>
                  <td className="py-2.5 font-mono-tabular whitespace-nowrap">
                    {led.voltage}V · {led.wattsPerUnit}W
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    {led.isAddressable ? 'سوفت مبرمج (Pixel)' : 'إضاءة مباشرة'}
                  </td>
                  <td className="py-2.5 text-xs text-[#B5BAC7]">{led.idealForAr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Electrical Rules + Fabrication Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 glossy-black-card rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-extrabold text-[#F5D061] flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>ثالثاً: القواعد الذهبية في كهرباء اللوحات ومنع احتراق الليد</span>
          </h3>
          <div className="space-y-3">
            {ELECTRICAL_RULES.map((rule) => (
              <div
                key={rule.title}
                className="bg-[#06070B] border border-white/10 rounded-xl p-4 space-y-1"
              >
                <div className="text-sm font-bold text-white">{rule.title}</div>
                <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed">{rule.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 glossy-black-card rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-extrabold text-[#F5D061] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>رابعاً: خطوات تنفيذ اللوحة الاحترافية في الورشة</span>
          </h3>
          <ul className="space-y-3">
            {FABRICATION_STEPS.map((step) => (
              <li
                key={step}
                className="bg-[#06070B] border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-[#E2E6F0] flex items-start gap-2.5 leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F5D061] shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
