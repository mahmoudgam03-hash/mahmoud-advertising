import React, { useState } from 'react';
import { Phone, MessageCircle, Facebook, MapPin, Mail, Clock, CheckCircle2, AlertCircle, ExternalLink, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  PortfolioManagerModal,
  DEFAULT_BRAND_FACE_IMAGE,
} from '../components/PortfolioManagerModal';
import { validateContactInput } from '../shared/validation';
import { buildWhatsAppDirectUrl } from '../shared/whatsapp';

export function ContactPage() {
  const { lang, data } = useApp();
  const isAr = lang === 'ar';
  const contact = data?.contact;
  const brandFaceImage = data?.content?.logoUrl || DEFAULT_BRAND_FACE_IMAGE;
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validation = validateContactInput({ name, phone, email, subject, message }, lang);
    if (!validation.valid) {
      setFieldErrors(validation.errors as Record<string, string>);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, subject, message, lang }),
      });
      const json = (await res.json()) as { error?: string; errors?: Record<string, string> };
      if (!res.ok) {
        if (json.errors) setFieldErrors(json.errors);
        throw new Error(json.error || (isAr ? 'تعذر إرسال الرسالة' : 'Failed to send message'));
      }
      setSent(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappHref = buildWhatsAppDirectUrl(contact?.whatsapp || '01155709023');
  const mapDirectionsUrl = contact
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.addressAr)}`
    : 'https://www.google.com/maps';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold text-[#D4AF37] mb-2">
          {isAr ? 'تواصل مباشر' : 'Direct Channels'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F6] mb-3">
          {isAr ? 'اتصل بنا أو زر مقر الشركة والورشة' : 'Contact Us or Visit Our Fabrication Workshop'}
        </h1>
        <p className="text-base text-[#B5BAC7]">
          {isAr
            ? 'فريقنا متاح للرد على استفسارات المعاينات والمقاسات وتنفيذ الواجهات الإعلانية.'
            : 'Reach our engineering and production desk for consultations, surveys, or quotation follow-ups.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Brand Face Card, Contact Details & Map Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-[#131722] via-[#12141A] to-[#17140E] border border-[#D4AF37]/40 rounded-xl p-5 flex items-center gap-4 shadow-[0_0_24px_rgba(29,107,255,0.16)]">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/75 bg-[#0A0B0E] shrink-0">
              <ImageWithFallback
                src={brandFaceImage}
                alt={isAr ? 'م. محمود شعبان — وجه الموقع للدعاية والإعلان' : 'Eng. Mahmoud Shaaban'}
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h2 className="text-base font-extrabold text-white truncate">
                  {isAr ? 'م. محمود شعبان للدعاية والإعلان' : 'Eng. Mahmoud Shaaban Advertising'}
                </h2>
                <p className="text-xs text-[#B5BAC7]">
                  {isAr ? 'المنيا – بني مزار · حروف بارزة وكلادينج' : 'Minya - Beni Mazar · Signage & Cladding'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFaceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#F5D061] transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isAr ? 'تغيير صورة وجه الموقع' : 'Change Site Face Photo'}</span>
              </button>
            </div>
          </div>

          <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#F4F4F6]">
              {isAr ? 'بيانات الاتصال الرسمية' : 'Official Contact Channels'}
            </h2>

            <div className="space-y-4 text-sm">
              <a
                href={`tel:${(contact?.phone || '').replace(/\s+/g, '')}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0B0E] border border-white/10 hover:border-[#1D6BFF]/50 transition-colors"
              >
                <Phone className="w-5 h-5 text-[#1D6BFF] shrink-0" />
                <div>
                  <div className="text-xs text-[#8C92A0]">{isAr ? 'رقم الهاتف' : 'Phone'}</div>
                  <div dir="ltr" className="text-white font-semibold font-mono-tabular">
                    {contact?.phone || '01155709023'}
                  </div>
                </div>
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0B0E] border border-white/10 hover:border-emerald-500/50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs text-[#8C92A0]">{isAr ? 'واتساب المباشر' : 'WhatsApp'}</div>
                  <div dir="ltr" className="text-white font-semibold font-mono-tabular">
                    {contact?.whatsapp || '01155709023'}
                  </div>
                </div>
              </a>

              <a
                href={contact?.facebookUrl || 'https://www.facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0A0B0E] border border-white/10 hover:border-[#1D6BFF]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-[#60A5FA] shrink-0" />
                  <div>
                    <div className="text-xs text-[#8C92A0]">{isAr ? 'صفحة فيسبوك' : 'Facebook Page'}</div>
                    <div className="text-white font-semibold">
                      {isAr ? 'محمود شعبان للدعاية والإعلان' : 'Mahmoud Shaaban Advertising'}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8C92A0]" />
              </a>

              <a
                href={`mailto:${contact?.email || 'mahmoudgam03@gmail.com'}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0B0E] border border-white/10 hover:border-[#D4AF37]/50 transition-colors"
              >
                <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <div>
                  <div className="text-xs text-[#8C92A0]">{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
                  <div className="text-white font-semibold">{contact?.email || 'mahmoudgam03@gmail.com'}</div>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0B0E] border border-white/10">
                <Clock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-[#8C92A0]">{isAr ? 'ساعات العمل' : 'Working Hours'}</div>
                  <div className="text-white">
                    {isAr ? contact?.workingHoursAr : contact?.workingHoursEn}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Location Card */}
          <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-[#F4F4F6]">
                  {isAr ? 'الموقع الجغرافي' : 'Geographic Location'}
                </h2>
                <p className="text-sm text-[#B5BAC7] mt-1">
                  {isAr ? contact?.addressAr : contact?.addressEn}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8C92A0] bg-[#0A0B0E] border border-white/10 rounded-lg px-4 py-3">
              <span className="font-mono-tabular" dir="ltr">
                {contact?.mapLat}, {contact?.mapLng}
              </span>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#60A5FA] hover:text-white font-semibold"
              >
                <span>{isAr ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-[#12141A] border border-white/10 rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#F4F4F6] mb-6">
            {isAr ? 'أرسل رسالة أو استفساراً' : 'Send Us a Message'}
          </h2>

          {sent && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                {isAr
                  ? 'تم إرسال رسالتك بنجاح! سيتواصل معك فريقنا في أقرب وقت.'
                  : 'Your message has been sent successfully. Our team will respond promptly.'}
              </span>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                  {isAr ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
                />
                {fieldErrors.name && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="contact-phone" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                  {isAr ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white font-mono-tabular"
                />
                {fieldErrors.phone && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                  {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
                />
                {fieldErrors.email && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                  {isAr ? 'موضوع الرسالة' : 'Subject'}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
                />
                {fieldErrors.subject && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.subject}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-[#F4F4F6] mb-2">
                {isAr ? 'نص الرسالة' : 'Message'}
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              />
              {fieldErrors.message && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3.5 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {submitting
                ? isAr
                  ? 'جاري الإرسال...'
                  : 'Sending...'
                : isAr
                  ? 'إرسال الرسالة'
                  : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
      <PortfolioManagerModal
        isOpen={faceModalOpen}
        initialTab="brand"
        onClose={() => setFaceModalOpen(false)}
      />
    </div>
  );
}

