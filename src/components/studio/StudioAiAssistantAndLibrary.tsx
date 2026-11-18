import { useState, type ChangeEvent } from 'react';
import {
  Bot,
  Send,
  Upload,
  Loader2,
  AlertOctagon,
  BookOpen,
  Wrench,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { ImageWithFallback } from '../ImageWithFallback';

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface StudioAiAssistantAndLibraryProps {
  contextSummary: string;
}

const EGYPTIAN_STARTERS = [
  'إزاي أحسب الترانس (الباور سبلاي) الصح للوحة 200 حبة ليد 12 فولت؟',
  'ليه آخر 30 ليد بيكسل 5 فولت بيصفرّوا أو يقطعوا لون في الآخر؟',
  'إيه الفرق بين الأكريليك الكاست والصيني في يافطة 4 متر؟',
  'أختار ليد 3 عدسة ولا 4 عدسة لما عمق الحرف يكون 6 سم؟',
];

const LESSONS = [
  {
    level: 'للمبتدئين',
    title: 'الدرس الأول: مقاسات الكلادينج والتفريغ V-Groove وحساب الهالك',
    body: 'اللوح القياسي 122×244 سم (حوالي 2.98 م²). عند تفتيح الزوايا على الراوتر نترك قشرة الألومنيوم الخارجية سليمة لثني اللوح بزاوية 90 درجة نظيفة، ونشد شاسيه حديد علب 2×2 سم خلف الوصلات.',
    image: '/src/assets/images/service_cladding_facade_1794750815768.jpg',
  },
  {
    level: 'للمحترفين',
    title: 'الدرس الثاني: توزيع الليد داخل الحروف البارزة ومنع النقط المظلمة',
    body: 'القاعدة الهندسية: المسافة بين حبة الليد واللّي جنبها لا تزيد عن 1.2 × عمق البروز. يعني لو تخانة الحرف 7 سم، رص الليد كل 8–9 سم بتوزيع متعرج عشان الوش الأكريليك ينوّر حتة واحدة.',
    image: '/src/assets/images/studio_engineer_workshop_1794875056154.jpg',
  },
  {
    level: 'كهرباء وبرمجة',
    title: 'الدرس الثالث: ترقيم البكسل LED 001 وحقن الكهرباء (Power Injection)',
    body: 'في السوفت المبرمج، الترقيم يبدأ من LED 001 في مسار واحد متصل للـ Data (أخضر/أبيض)، أما الكهرباء + و - فيجب تغذيتها من أقرب سلك 2.5 مم للترانس كل 50 بكسل (5V) أو 100 بكسل (12V).',
    image: '/src/assets/images/studio_led_controller_1794875056975.jpg',
  },
];

const TROUBLESHOOTING_FAULTS = [
  {
    fault: 'العطل 1: اصفرار أو ضعف الإضاءة في نهاية خط الليد',
    cause: 'فقد الجهد (Voltage Drop) بسبب طول السلك أو عدم عمل حقن باور (Power Injection).',
    fix: 'وصّل تغذية + و - مباشرة بسلك نحاس 1.5–2.5 مم لبداية ونهاية كل 50 بكسل (5 فولت) أو كل 100 حبة (12 فولت).',
  },
  {
    fault: 'العطل 2: ظهور بقع ضوئية (نقط منورة ونقط مطفية) على وش الأكريليك',
    cause: 'العمق أقل من 5 سم أو تباعد الليد واسع جداً مقارنة بنوع العدسة.',
    fix: 'استخدم ليد بزاوية انتشار 160°+ أو قرب التباعد لـ 6–7 سم أو ارفع ارتفاع الرتيرن (التخانة) لـ 7–8 سم.',
  },
  {
    fault: 'العطل 3: تآكل أسلاك النحاس وتلف الليد بعد أول مطرة',
    cause: 'استخدام سيليكون رخيص برائحة خل (Acetic Acid) أو ترك لحامات بدون عزل حراري.',
    fix: 'استخدم سيليكون متعادل (Neutral) فقط واكسي كل لحام بشيكارتون حراري (Heat Shrink).',
  },
  {
    fault: 'العطل 4: رعشة أو تهنيج في برامج الليد السوفت (WS2811 / WS2812B)',
    cause: 'عدم توحيد السالب (GND) بين الكنترولر والباور سبلاي أو طول سلك الداتا بدون مقاومة.',
    fix: 'اربط الأرضي (GND / COM) للكنترولر مع الأرضي لكل الترانسـات مع وضع مقاومة 330 أوم على خط الداتا.',
  },
];

export function StudioAiAssistantAndLibrary({
  contextSummary,
}: StudioAiAssistantAndLibraryProps) {
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      text: 'أهلاً بك يا هندسة / يا فندم في المساعد الذكي المجاني لمنصة المهندس محمود شعبان! اسألني بالمصري البسيط عن تصنيع الحروف، توزيع الليد، حساب الباور سبلاي، برامج السوفت، أو ارفع صورة أي مخطط أو يافطة ونفحصها سوا خطوة بخطوة.',
    },
  ]);

  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageName(file.name);
  };

  const askAssistant = async (overrideQuestion?: string) => {
    const q = (overrideQuestion ?? question).trim();
    if (!q) return;
    setErrorMsg('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    if (!overrideQuestion) setQuestion('');

    try {
      const fd = new FormData();
      fd.append('question', q);
      fd.append('contextSummary', contextSummary);
      if (imageFile) {
        fd.append('image', imageFile);
      }

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        body: fd,
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'تعذر الحصول على رد من المساعد الذكي.');
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || '' }]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء الاتصال بالمساعد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Conversational Egyptian Arabic AI Support Assistant */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="glossy-black-icon w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#F5D061]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                المساعد الذكي والدعم الفني للدعاية والليد (بالعامية المصرية البسيطة)
              </h2>
              <p className="text-xs sm:text-sm text-[#B5BAC7]">
                اسأل عن الحروف والكهرباء والسوفت والخامات — يكتشف الأخطاء الحسابية ويحلل الصور والمخططات
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#F5D061] bg-black/70 border border-[#D4AF37]/30 px-3 py-1 rounded-lg self-start sm:self-auto">
            متاح مجاناً 24/7
          </span>
        </div>

        {/* Starter Question Pills */}
        <div className="flex flex-wrap gap-2">
          {EGYPTIAN_STARTERS.map((starter) => (
            <button
              key={starter}
              type="button"
              disabled={loading}
              onClick={() => void askAssistant(starter)}
              className="text-start px-3 py-1.5 rounded-xl bg-[#07080C] border border-[#D4AF37]/35 hover:border-[#F5D061] text-xs text-[#E5E7EB] transition-colors cursor-pointer"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Conversation Feed */}
        <div className="bg-[#040507] border border-white/10 rounded-2xl p-4 space-y-3 max-h-[360px] overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-[#1D1708] border border-[#D4AF37]/50 text-[#FFF4CC] ms-6'
                  : 'bg-[#0C0E14] border border-white/10 text-[#E5E7EB] me-6'
              }`}
            >
              <div className="text-[11px] font-extrabold text-[#F5D061] mb-1">
                {m.role === 'user' ? 'أنت:' : 'المساعد الهندسي الذكي:'}
              </div>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#F5D061] p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>بيفكر ويراجع الحسابات بالذكاء الاصطناعي...</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="bg-[#230E12] border border-red-500/45 rounded-xl p-3 text-xs text-red-200 flex items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void askAssistant();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="اكتب سؤالك بالمصري هنا (مثال: عندي لوحة 3×1 متر كلادينج عايز أوزع الليد فيها)..."
            className="flex-1 bg-[#07080C] border border-white/15 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#6E7485] outline-none"
          />

          <label className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#090B10] border border-white/15 hover:border-[#D4AF37]/45 text-xs font-bold text-[#D4D7E0] cursor-pointer whitespace-nowrap">
            <Upload className="w-4 h-4 text-[#F5D061]" />
            <span>{imageName ? `صورة: ${imageName.slice(0, 14)}` : 'إرفاق صورة/مخطط'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImagePick}
              className="sr-only"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-sm font-extrabold hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>إرسال</span>
          </button>
        </form>
      </section>

      {/* Illustrated Learning Library */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
        <h3 className="text-base sm:text-lg font-extrabold text-[#F5D061] flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span>المكتبة التعليمية المصورة للمبتدئين والمحترفين</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LESSONS.map((lesson) => (
            <article
              key={lesson.title}
              className="bg-[#06070B] border border-white/10 hover:border-[#D4AF37]/45 rounded-xl overflow-hidden flex flex-col transition-colors"
            >
              <div className="h-44 bg-black overflow-hidden">
                <ImageWithFallback
                  src={lesson.image}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                  fallbackTitle={lesson.title}
                />
              </div>
              <div className="p-4 space-y-2 flex-1">
                <span className="inline-block text-[11px] font-extrabold text-[#F5D061]">
                  {lesson.level}
                </span>
                <h4 className="text-sm font-extrabold text-white leading-snug">{lesson.title}</h4>
                <p className="text-xs text-[#B5BAC7] leading-relaxed">{lesson.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Troubleshooting & Faults Section */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
        <h3 className="text-base sm:text-lg font-extrabold text-[#F5D061] flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          <span>قسم الأعطال والحلول العملية السريعة في الورشة</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TROUBLESHOOTING_FAULTS.map((item) => (
            <div
              key={item.fault}
              className="bg-[#06070B] border border-white/10 rounded-xl p-4 space-y-2"
            >
              <div className="text-sm font-extrabold text-white">{item.fault}</div>
              <div className="text-xs text-[#A1A6B3]">
                <strong className="text-[#F5D061]">السبب:</strong> {item.cause}
              </div>
              <div className="text-xs text-emerald-300 leading-relaxed">
                <strong>الحل الفوري:</strong> {item.fix}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free Internet Hosting & Open Source Architecture Info */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-6 space-y-3">
        <h3 className="text-base font-extrabold text-[#F5D061] flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>الجاهزية للنشر المجاني والأدوات مفتوحة المصدر</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed">
          تم بناء المنصة بالكامل بأدوات ومكتبات مجانية ومفتوحة المصدر (React · Tailwind CSS · Express · SQLite · SVG/DXF)، ويمكن نشرها مجاناً أو بتكلفة صفرية على Google Cloud Run / Render / Railway / Fly.io مع ضبط متغير <code className="text-[#F5D061]">GEMINI_API_KEY</code> في إعدادات الاستضافة، دون الحاجة لأي اشتراكات أو تطبيقات APK.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-[#D4D7E0]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>متجاوب 100% للهاتف والكمبيوتر</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>حفظ المشاريع في قاعدة بيانات SQLite</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>خالي تماماً من الاشتراكات والرسوم</span>
          </span>
        </div>
      </section>
    </div>
  );
}
