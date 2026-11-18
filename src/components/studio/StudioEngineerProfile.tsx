import { useEffect, useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  UserCheck,
  HeartHandshake,
  ArrowLeft,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../ImageWithFallback';
import { buildWhatsAppDirectUrl } from '../../shared/whatsapp';

interface EngineerPhotoItem {
  id: number;
  titleAr: string;
  captionAr: string;
  imageUrl: string;
}

export function StudioEngineerProfile() {
  const { data, navigate } = useApp();
  const projects = (data?.projects || []).slice(0, 4);
  const [personalPhotos, setPersonalPhotos] = useState<EngineerPhotoItem[]>([]);

  useEffect(() => {
    fetch('/api/engineer-photos')
      .then((r) => (r.ok ? r.json() : null))
      .then((res: { photos?: EngineerPhotoItem[] } | null) => {
        if (res?.photos) setPersonalPhotos(res.photos);
      })
      .catch(() => {
        // Fallback silently to default portrait
      });
  }, []);

  const phone = data?.contact?.phone || '01155709023';
  const whatsapp = data?.contact?.whatsapp || 'https://wa.me/201155709023?s=t';
  const email = data?.contact?.email || 'mahmoudgam03@gmail.com';
  const address =
    data?.contact?.addressAr || 'محافظة المنيا – مركز بني مزار (بجوار مدرسة السلام الخاصة)';

  const primaryPortrait =
    personalPhotos[0]?.imageUrl ||
    '/src/assets/images/engineer_mahmoud_portrait_1794875545412.jpg';

  return (
    <div className="space-y-6">
      {/* Personal Welcome & Profile Card */}
      <section className="glossy-black-card rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/75 border border-[#D4AF37]/45 text-xs font-extrabold text-[#F5D061]">
              <UserCheck className="w-4 h-4" />
              <span>مهندس محمود شعبان للدعاية والإعلان · المنيا - بني مزار</span>
            </div>

            <div className="text-xs sm:text-sm font-extrabold text-[#F5D061]">
              صلّوا على النبي ﷺ، وأكثروا من ذكر الله ❤️
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              <span className="gold-shimmer-text">مهندس محمود شعبان يرحب بكم</span> في المنصة المجانية للدعاية والإعلان
            </h2>

            <p className="text-sm sm:text-base text-[#D4D7E0] leading-relaxed">
              أهلاً وسهلاً بكم إخواني وأصدقائي في مجال الدعاية والإعلان وتصنيع اليفط والواجهات.
              هذه المنصة صُممت لتكون مرجعاً هندسياً وورشة ذكية بين يديك: لحساب خامات الكلادينج
              والأكريليك والاستانلس بأقل هالك، وبرمجة وترقيم الليد، والاستفادة من الذكاء الاصطناعي.
            </p>

            <div className="bg-[#120F07] border border-[#D4AF37]/45 rounded-xl p-4 flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-[#F4E3B2] leading-relaxed font-semibold">
                جميع الخدمات والأدوات الحسابية والبرمجية في هذا الموقع{' '}
                <strong className="text-white">مجانية بالكامل لوجه الله تعالى</strong> بدون أي
                اشتراكات أو رسوم — نسأل الله أن يجعلها علماً نافعاً وثواباً لنا جميعاً.
              </div>
            </div>
          </div>

          {/* Direct Call, WhatsApp & Address Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#06070B] border border-[#D4AF37]/50 hover:border-[#F5D061] transition-colors"
            >
              <div className="glossy-black-icon w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#F5D061]" />
              </div>
              <div>
                <div className="text-[11px] text-[#A1A6B3]">زر اتصال مباشر</div>
                <div dir="ltr" className="text-sm font-extrabold text-white font-mono-tabular">
                  {phone}
                </div>
              </div>
            </a>

            <a
              href={buildWhatsAppDirectUrl(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#06070B] border border-emerald-500/50 hover:border-emerald-400 transition-colors"
            >
              <div className="glossy-black-icon w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[11px] text-[#A1A6B3]">زر واتساب مباشر</div>
                <div dir="ltr" className="text-sm font-extrabold text-emerald-300 font-mono-tabular">
                  01155709023
                </div>
              </div>
            </a>

            <div className="sm:col-span-2 flex items-start gap-3 p-3.5 rounded-xl bg-[#06070B] border border-white/10">
              <div className="glossy-black-icon w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#F5D061]" />
              </div>
              <div>
                <div className="text-[11px] text-[#A1A6B3]">العنوان والمقر الرئيسي</div>
                <div className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  {address}
                </div>
              </div>
            </div>

            <a
              href={`mailto:${email}`}
              className="sm:col-span-2 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#06070B] border border-white/10 hover:border-[#D4AF37]/45 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="glossy-black-icon w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#F5D061]" />
                </div>
                <div>
                  <div className="text-[11px] text-[#A1A6B3]">البريد الإلكتروني</div>
                  <div dir="ltr" className="text-xs sm:text-sm font-bold text-white">
                    {email}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#F5D061]">مراسلة</span>
            </a>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#090B10] border border-[#D4AF37]/45 text-xs font-bold text-[#F5D061] hover:bg-[#141720] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>رفع صور الأعمال والصور الشخصية (لوحة التحكم)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs text-[#B5BAC7] hover:text-white cursor-pointer"
            >
              سياسة الخصوصية
            </button>
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs text-[#B5BAC7] hover:text-white cursor-pointer"
            >
              شروط الاستخدام
            </button>
          </div>
        </div>

        {/* Personal Photo Spotlight */}
        <div className="lg:col-span-5 bg-[#050608] p-4 sm:p-5 flex flex-col gap-4 justify-center border-t lg:border-t-0 lg:border-s border-white/10">
          <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/45 bg-black">
            <ImageWithFallback
              src={primaryPortrait}
              alt="الصورة الشخصية للمهندس محمود شعبان للدعاية والإعلان"
              className="w-full h-72 sm:h-80 object-cover object-top"
              fallbackTitle="مهندس محمود شعبان للدعاية والإعلان"
            />
            <div className="p-3 bg-[#090A0F] border-t border-white/10">
              <div className="text-xs font-extrabold text-[#F5D061]">
                مهندس محمود شعبان — SMART ADVERTISING ENGINEER
              </div>
              <div className="text-[11px] text-[#A1A6B3] mt-0.5">
                محافظة المنيا – مركز بني مزار · 01155709023
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal & Workshop Photos Album */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#F5D061]" />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                الصور الشخصية وصور المهندس والورشة
              </h3>
              <p className="text-xs text-[#A1A6B3]">
                يمكن إضافة وتحديث الصور الشخصية وصور المعرض في أي وقت من لوحة التحكم وعرضها للزوار فوراً
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="text-xs font-bold text-[#F5D061] hover:underline cursor-pointer"
          >
            إضافة صورة جديدة من الإدارة
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(personalPhotos.length > 0
            ? personalPhotos
            : [
                {
                  id: 1,
                  titleAr: 'المهندس محمود شعبان — المعرض',
                  captionAr: 'صورة شخصية للمهندس محمود شعبان للدعاية والإعلان',
                  imageUrl: '/src/assets/images/engineer_mahmoud_portrait_1794875545412.jpg',
                },
                {
                  id: 2,
                  titleAr: 'إشراف الورشة على الحروف الذهبية',
                  captionAr: 'تجهيز واجهات الكلادينج وحروف الاستانلس',
                  imageUrl: '/src/assets/images/studio_engineer_workshop_1794875056154.jpg',
                },
                {
                  id: 3,
                  titleAr: 'برمجة مصفوفة الليد والكنترولر',
                  captionAr: 'ضبط الإضاءة وبرامج السوفت',
                  imageUrl: '/src/assets/images/studio_led_controller_1794875056975.jpg',
                },
              ]
          ).map((ph) => (
            <div
              key={ph.id}
              className="bg-[#06070B] border border-white/10 hover:border-[#D4AF37]/45 rounded-xl overflow-hidden transition-colors"
            >
              <div className="h-52 bg-black overflow-hidden">
                <ImageWithFallback
                  src={ph.imageUrl}
                  alt={ph.titleAr}
                  className="w-full h-full object-cover object-top"
                  fallbackTitle={ph.titleAr}
                />
              </div>
              <div className="p-3 space-y-1">
                <div className="text-xs font-extrabold text-white">{ph.titleAr}</div>
                {ph.captionAr && <div className="text-[11px] text-[#A1A6B3]">{ph.captionAr}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio Works Showcase */}
      {projects.length > 0 && (
        <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-white">
                معرض صور الأعمال والتصميمات المنفذة
              </h3>
              <p className="text-xs text-[#A1A6B3]">
                تركيبات الكلادينج والاستانلس والأكريليك في المنيا وبني مزار
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/portfolio')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5D061] hover:underline cursor-pointer"
            >
              <span>عرض المعرض بالكامل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-[#06070B] border border-white/10 hover:border-[#D4AF37]/45 rounded-xl overflow-hidden transition-colors"
              >
                <div className="h-40 bg-black overflow-hidden">
                  <ImageWithFallback
                    src={p.imageUrl}
                    alt={p.titleAr}
                    className="w-full h-full object-cover"
                    fallbackTitle={p.titleAr}
                  />
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-xs font-extrabold text-white line-clamp-1">{p.titleAr}</div>
                  <div className="text-[11px] text-[#A1A6B3]">{p.locationAr}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
