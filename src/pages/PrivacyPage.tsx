import { Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function PrivacyPage() {
  const { lang, navigate, data } = useApp();
  const isAr = lang === 'ar';
  const contact = data?.contact;
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const rawPolicy = isAr ? data?.seoLegal?.privacyPolicyAr : data?.seoLegal?.privacyPolicyEn;

  const defaultSections = isAr
    ? [
        {
          title: '1. البيانات التي نقوم بجمعها',
          body: 'عند إرسال طلب عرض سعر أو رسالة تواصل عبر الموقع، نقوم بجمع الاسم، رقم الهاتف، البريد الإلكتروني (إن وجد)، مواصفات اليافطة والمقاسات المطلوبة، بالإضافة إلى أي صورة مرفقة لموقع التركيب أو التصميم المبدئي.',
        },
        {
          title: '2. كيفية استخدام البيانات',
          body: 'تُستخدم جميع البيانات والصور حصرياً لإعداد المقايسات الهندسية، احتساب التكلفة الدقيقة، التواصل معكم عبر الهاتف أو واتساب لتحديد موعد المعاينة، وتنفيذ الطلب المتفق عليه. لا نقوم ببيع أو مشاركة بيانات العملاء مع أي جهات تسويقية خارجية.',
        },
        {
          title: '3. حفظ الصور والملفات المرفقة',
          body: 'يتم تخزين الصور المرفوعة لرفع المقاسات أو التصميمات بشكل آمن على خادم الشركة ولا يطلع عليها سوى فريق الهندسة والإدارة المختص بمراجعة الطلب.',
        },
        {
          title: '4. حقوق العميل وحذف البيانات',
          body: 'يحق لكم في أي وقت طلب تعديل بيانات طلبكم أو حذف صور الموقع المرفوعة وبيانات التواصل من سجلاتنا عبر مراسلتنا أو الاتصال المباشر بإدارة الشركة.',
        },
      ]
    : [
        {
          title: '1. Information We Collect',
          body: 'When you submit a quote request or contact inquiry, we collect your name, phone number, optional email address, signage specifications and dimensions, and any site photo or sketch you choose to upload.',
        },
        {
          title: '2. How We Use Your Information',
          body: 'Your information and uploaded photos are used strictly to prepare engineering estimates, coordinate site surveys via phone or WhatsApp, and execute contracted signage projects. We never sell or share client data with third-party marketers.',
        },
        {
          title: '3. Storage of Uploaded Site Photos',
          body: 'Uploaded site images and design references are stored securely on our server and accessed solely by authorized engineering and management staff reviewing your request.',
        },
        {
          title: '4. Data Access & Deletion Rights',
          body: 'You may request to update or remove your quote records, contact information, or uploaded site images at any time by contacting our management team directly.',
        },
      ];

  const sections = rawPolicy?.trim()
    ? rawPolicy
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
          <Shield className="w-4 h-4" />
          <span>{isAr ? 'الخصوصية وحماية البيانات' : 'Privacy & Data Protection'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F6] mb-3">
          {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        <p className="text-sm text-[#A1A6B3]">
          {isAr
            ? `${data?.content?.companyNameAr || 'شركة محمود شعبان للدعاية والإعلان'} · آخر تحديث: 2026`
            : `${data?.content?.companyNameEn || 'Mahmoud Shaaban Advertising'} · Last updated: 2026`}
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

      <div className="mt-8 bg-[#12141A] border border-[#1D6BFF]/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-[#B5BAC7]">
          <div className="font-bold text-white mb-1">
            {isAr ? 'استفسارات الخصوصية والتواصل المباشر' : 'Privacy Inquiries & Direct Contact'}
          </div>
          <div>
            {contact?.email || 'mahmoudgam03@gmail.com'} ·{' '}
            <span dir="ltr" className="font-mono-tabular">
              {contact?.phone || '01155709023'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/contact')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1D6BFF] hover:bg-[#3B82F6] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{isAr ? 'تواصل معنا' : 'Contact Us'}</span>
          <ArrowIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
