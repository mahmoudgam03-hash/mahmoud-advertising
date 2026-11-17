import { useEffect, useState } from 'react';
import { Sparkles, Phone, MessageCircle, X, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppDirectUrl } from '../shared/whatsapp';

export function WelcomeModal() {
  const { navigate } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = window.sessionStorage.getItem('msa_welcome_seen');
      if (!seen) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const handleClose = (targetRoute?: string) => {
    try {
      window.sessionStorage.setItem('msa_welcome_seen', '1');
    } catch {
      // Ignore storage failure
    }
    setOpen(false);
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  if (!open) return null;

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="glossy-black-card relative w-full max-w-xl rounded-3xl p-6 sm:p-8 text-center space-y-5 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 5%, #D4AF37 35%, #FFF1B8 50%, #D4AF37 65%, transparent 95%)',
          }}
        />

        <button
          type="button"
          onClick={() => handleClose()}
          aria-label="إغلاق رسالة الترحيب"
          className="absolute top-4 start-4 w-9 h-9 rounded-xl bg-black/70 border border-white/15 hover:border-[#F5D061] text-[#D4D7E0] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="glossy-black-icon w-14 h-14 rounded-2xl mx-auto flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-[#F5D061]" />
        </div>

        <div className="space-y-2">
          <p className="text-sm sm:text-base font-extrabold text-[#F5D061]">
            بسم الله الرحمن الرحيم
          </p>
          <p className="text-base sm:text-lg font-extrabold text-white">
            صلّ على النبي ﷺ · واذكر الله ❤️
          </p>
          <h2 id="welcome-modal-title" className="text-xl sm:text-2xl font-extrabold gold-shimmer-text pt-1">
            أهلاً وسهلاً بكم — مهندس محمود شعبان يرحب بكم
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#A1A6B3] tracking-wider" dir="ltr">
            MAHMOUD SHAABAN – SMART ADVERTISING ENGINEER
          </p>
        </div>

        <div className="bg-[#06070B] border border-[#D4AF37]/35 rounded-2xl p-4 sm:p-5 space-y-2 text-xs sm:text-sm text-[#E4DFCE] leading-relaxed">
          <p>
            منصة متكاملة لخدمة أهل مجال الدعاية والإعلان، نتعلم ونبدع ونتطور معاً.
          </p>
          <p className="font-extrabold text-[#F5D061]">
            جميع الخدمات مجانية لوجه الله تعالى، ونسأل الله أن يجعلها علماً نافعاً وثواباً لنا جميعاً.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleClose('/studio')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-sm font-extrabold hover:brightness-110 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>دخول الاستوديو الذكي وحاسبة الليد</span>
          </button>

          <button
            type="button"
            onClick={() => handleClose()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#090B10] border border-white/15 hover:border-[#D4AF37]/55 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#F5D061]" />
            <span>تصفح الموقع بالكامل</span>
          </button>
        </div>

        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs text-[#B5BAC7]">
          <a
            href="tel:01155709023"
            className="inline-flex items-center gap-1.5 hover:text-[#F5D061] font-mono-tabular"
          >
            <Phone className="w-3.5 h-3.5 text-[#F5D061]" />
            <span dir="ltr">01155709023</span>
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={buildWhatsAppDirectUrl('https://wa.me/201155709023?s=t')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-300 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>واتساب مباشر</span>
          </a>
          <span aria-hidden="true">·</span>
          <span>محافظة المنيا – مركز بني مزار</span>
        </div>
      </div>
    </div>
  );
}
