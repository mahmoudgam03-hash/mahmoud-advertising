import type { Language } from './types';

export interface ValidationResult<T extends string = string> {
  valid: boolean;
  errors: Partial<Record<T, string>>;
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, '').trim();
}

export function isValidPhone(raw: string): boolean {
  const cleaned = normalizePhone(raw);
  return /^\+?[0-9]{8,15}$/.test(cleaned);
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

export function validateQuoteInput(
  input: {
    customerName: string;
    phone: string;
    serviceType: string;
    widthCm: string;
    heightCm: string;
    materialType: string;
    desiredColor: string;
    lightingType: string;
    details?: string;
  },
  lang: Language = 'ar'
): ValidationResult<
  | 'customerName'
  | 'phone'
  | 'serviceType'
  | 'widthCm'
  | 'heightCm'
  | 'materialType'
  | 'desiredColor'
  | 'lightingType'
  | 'details'
> {
  const errors: Partial<
    Record<
      | 'customerName'
      | 'phone'
      | 'serviceType'
      | 'widthCm'
      | 'heightCm'
      | 'materialType'
      | 'desiredColor'
      | 'lightingType'
      | 'details',
      string
    >
  > = {};
  const isAr = lang === 'ar';

  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = isAr ? 'يرجى إدخال اسم العميل (حرفان على الأقل)' : 'Please enter your name (at least 2 characters)';
  } else if (input.customerName.trim().length > 100) {
    errors.customerName = isAr ? 'الاسم طويل جداً' : 'Name is too long';
  }

  if (!input.phone || !isValidPhone(input.phone)) {
    errors.phone = isAr ? 'يرجى إدخال رقم هاتف صحيح (8 إلى 15 رقماً)' : 'Please enter a valid phone number (8–15 digits)';
  }

  if (!input.serviceType || input.serviceType.trim().length < 2) {
    errors.serviceType = isAr ? 'يرجى اختيار نوع اليافطة أو الخدمة' : 'Please select a sign or service type';
  }

  const widthNum = Number(input.widthCm);
  if (!input.widthCm || Number.isNaN(widthNum) || widthNum <= 0 || widthNum > 20000) {
    errors.widthCm = isAr ? 'أدخل العرض بالسنتيمتر (أكبر من 0)' : 'Enter valid width in cm (> 0)';
  }

  const heightNum = Number(input.heightCm);
  if (!input.heightCm || Number.isNaN(heightNum) || heightNum <= 0 || heightNum > 10000) {
    errors.heightCm = isAr ? 'أدخل الارتفاع بالسنتيمتر (أكبر من 0)' : 'Enter valid height in cm (> 0)';
  }

  if (!input.materialType || input.materialType.trim().length < 2) {
    errors.materialType = isAr ? 'يرجى اختيار نوع الخامة' : 'Please select a material type';
  }

  if (!input.desiredColor || input.desiredColor.trim().length < 2) {
    errors.desiredColor = isAr ? 'يرجى تحديد اللون المطلوب' : 'Please specify the desired color';
  }

  if (!input.lightingType || input.lightingType.trim().length < 2) {
    errors.lightingType = isAr ? 'يرجى اختيار نوع الإضاءة' : 'Please select a lighting type';
  }

  if (input.details && input.details.trim().length > 2000) {
    errors.details = isAr ? 'التفاصيل تتجاوز الحد المسموح (2000 حرف)' : 'Details exceed 2000 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateContactInput(
  input: {
    name: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
  },
  lang: Language = 'ar'
): ValidationResult<'name' | 'phone' | 'email' | 'subject' | 'message'> {
  const errors: Partial<Record<'name' | 'phone' | 'email' | 'subject' | 'message', string>> = {};
  const isAr = lang === 'ar';

  if (!input.name || input.name.trim().length < 2) {
    errors.name = isAr ? 'يرجى إدخال الاسم بالكامل' : 'Please enter your full name';
  }

  if (!input.phone || !isValidPhone(input.phone)) {
    errors.phone = isAr ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';
  }

  if (input.email && input.email.trim().length > 0 && !isValidEmail(input.email)) {
    errors.email = isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email address format';
  }

  if (!input.subject || input.subject.trim().length < 3) {
    errors.subject = isAr ? 'يرجى إدخال عنوان الرسالة' : 'Please enter a message subject';
  }

  if (!input.message || input.message.trim().length < 10) {
    errors.message = isAr ? 'يرجى كتابة نص الرسالة (10 أحرف على الأقل)' : 'Please enter your message (at least 10 characters)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateServiceInput(
  input: {
    titleAr: string;
    titleEn: string;
    category: string;
    descriptionAr: string;
    descriptionEn: string;
  },
  lang: Language = 'ar'
): ValidationResult<'titleAr' | 'titleEn' | 'category' | 'descriptionAr' | 'descriptionEn'> {
  const errors: Partial<Record<'titleAr' | 'titleEn' | 'category' | 'descriptionAr' | 'descriptionEn', string>> = {};
  const isAr = lang === 'ar';

  if (!input.titleAr || input.titleAr.trim().length < 2) {
    errors.titleAr = isAr ? 'اسم الخدمة بالعربية مطلوب' : 'Arabic service title is required';
  }
  if (!input.titleEn || input.titleEn.trim().length < 2) {
    errors.titleEn = isAr ? 'اسم الخدمة بالإنجليزية مطلوب' : 'English service title is required';
  }
  if (!input.category || input.category.trim().length < 2) {
    errors.category = isAr ? 'التصنيف مطلوب' : 'Category is required';
  }
  if (!input.descriptionAr || input.descriptionAr.trim().length < 8) {
    errors.descriptionAr = isAr ? 'الوصف العربي مطلوب' : 'Arabic description is required';
  }
  if (!input.descriptionEn || input.descriptionEn.trim().length < 8) {
    errors.descriptionEn = isAr ? 'الوصف الإنجليزي مطلوب' : 'English description is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function slugifyCategory(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'service';
}

export function isValidHexColor(raw: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(raw.trim());
}

export function isValidUrlOrPath(raw: string): boolean {
  const val = raw.trim();
  if (!val) return false;
  if (val.startsWith('/') && !val.startsWith('//')) return true;
  return /^https?:\/\/[^\s]+$/i.test(val);
}

export function isValidQuoteStatus(status: string): boolean {
  return ['new', 'in_progress', 'reviewing', 'quoted', 'completed', 'cancelled'].includes(status);
}

export function validateSectionInput(
  input: {
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    buttonUrl?: string;
  },
  lang: Language = 'ar'
): ValidationResult<'titleAr' | 'titleEn' | 'bodyAr' | 'bodyEn' | 'buttonUrl'> {
  const errors: Partial<Record<'titleAr' | 'titleEn' | 'bodyAr' | 'bodyEn' | 'buttonUrl', string>> = {};
  const isAr = lang === 'ar';

  if (!input.titleAr || input.titleAr.trim().length < 2) {
    errors.titleAr = isAr ? 'عنوان القسم بالعربية مطلوب' : 'Arabic section title is required';
  }
  if (!input.titleEn || input.titleEn.trim().length < 2) {
    errors.titleEn = isAr ? 'عنوان القسم بالإنجليزية مطلوب' : 'English section title is required';
  }
  if (!input.bodyAr || input.bodyAr.trim().length < 5) {
    errors.bodyAr = isAr ? 'محتوى القسم بالعربية مطلوب' : 'Arabic section content is required';
  }
  if (!input.bodyEn || input.bodyEn.trim().length < 5) {
    errors.bodyEn = isAr ? 'محتوى القسم بالإنجليزية مطلوب' : 'English section content is required';
  }
  if (input.buttonUrl && input.buttonUrl.trim().length > 0 && !isValidUrlOrPath(input.buttonUrl)) {
    errors.buttonUrl = isAr ? 'رابط الزر يجب أن يبدأ بـ / أو https://' : 'Link must start with / or https://';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
