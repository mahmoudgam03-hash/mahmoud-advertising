import type { Language } from './types';

export interface WhatsAppQuotePayload {
  whatsappNumber: string;
  customerName: string;
  phone: string;
  serviceType: string;
  widthCm?: string;
  heightCm?: string;
  dimensions?: string;
  materialType?: string;
  desiredColor?: string;
  lightingType?: string;
  details: string;
  referenceCode?: string;
  lang?: Language;
}

export function sanitizeWhatsAppDigits(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) {
    return digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `2${digits}`;
  }
  return digits;
}

export function buildWhatsAppDirectUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const target = sanitizeWhatsAppDigits(trimmed);
  return `https://wa.me/${target}?s=t`;
}

export function buildWhatsAppQuoteUrl(payload: WhatsAppQuotePayload): string {
  const target = sanitizeWhatsAppDigits(payload.whatsappNumber);
  const isAr = (payload.lang ?? 'ar') === 'ar';
  const dimText =
    payload.widthCm && payload.heightCm
      ? isAr
        ? `${payload.widthCm} × ${payload.heightCm} سم`
        : `${payload.widthCm} × ${payload.heightCm} cm`
      : (payload.dimensions || '-').trim();

  const lines = isAr
    ? [
        'طلب عرض سعر جديد — شركة محمود شعبان للدعاية والإعلان',
        payload.referenceCode ? `رقم المرجع: ${payload.referenceCode}` : '',
        `الاسم: ${payload.customerName.trim()}`,
        `رقم الهاتف: ${payload.phone.trim()}`,
        `نوع اليافطة / الخدمة: ${payload.serviceType.trim()}`,
        `المقاس (العرض × الارتفاع): ${dimText}`,
        payload.materialType ? `نوع الخامة: ${payload.materialType.trim()}` : '',
        payload.desiredColor ? `اللون المطلوب: ${payload.desiredColor.trim()}` : '',
        payload.lightingType ? `نوع الإضاءة: ${payload.lightingType.trim()}` : '',
        payload.details.trim() ? `تفاصيل إضافية: ${payload.details.trim()}` : '',
      ]
    : [
        'New Quote Request — Mahmoud Shaaban Advertising',
        payload.referenceCode ? `Reference: ${payload.referenceCode}` : '',
        `Client Name: ${payload.customerName.trim()}`,
        `Phone: ${payload.phone.trim()}`,
        `Sign / Service Type: ${payload.serviceType.trim()}`,
        `Dimensions (W × H): ${dimText}`,
        payload.materialType ? `Material: ${payload.materialType.trim()}` : '',
        payload.desiredColor ? `Color: ${payload.desiredColor.trim()}` : '',
        payload.lightingType ? `Lighting: ${payload.lightingType.trim()}` : '',
        payload.details.trim() ? `Additional Details: ${payload.details.trim()}` : '',
      ];

  const text = encodeURIComponent(lines.filter(Boolean).join('\n'));
  return `https://wa.me/${target}?s=t&text=${text}`;
}
