import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidHexColor,
  isValidPhone,
  isValidQuoteStatus,
  isValidUrlOrPath,
  normalizePhone,
  slugifyCategory,
  validateContactInput,
  validateQuoteInput,
  validateSectionInput,
  validateServiceInput,
} from './validation';
import {
  buildWhatsAppDirectUrl,
  buildWhatsAppQuoteUrl,
  sanitizeWhatsAppDigits,
} from './whatsapp';

test('phone normalization and validation handle international and local formats', () => {
  assert.equal(normalizePhone('+20 100-555-0192'), '+201005550192');
  assert.equal(isValidPhone('+20 100 555 0192'), true);
  assert.equal(isValidPhone('01005550192'), true);
  assert.equal(isValidPhone('123'), false);
  assert.equal(isValidPhone('abc123456'), false);
});

test('email validation rejects malformed addresses', () => {
  assert.equal(isValidEmail('client@company.com'), true);
  assert.equal(isValidEmail('bad-email@'), false);
  assert.equal(isValidEmail('no-domain'), false);
});

test('quote validation catches missing fields and accepts complete valid payloads', () => {
  const invalid = validateQuoteInput(
    {
      customerName: 'م',
      phone: '12',
      serviceType: '',
      widthCm: '0',
      heightCm: '-5',
      materialType: '',
      desiredColor: '',
      lightingType: '',
      details: '',
    },
    'ar'
  );
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.customerName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.serviceType);
  assert.ok(invalid.errors.widthCm);
  assert.ok(invalid.errors.heightCm);
  assert.ok(invalid.errors.materialType);
  assert.ok(invalid.errors.desiredColor);
  assert.ok(invalid.errors.lightingType);

  const valid = validateQuoteInput(
    {
      customerName: 'أحمد منصور',
      phone: '01012345678',
      serviceType: 'حروف استانلس',
      widthCm: '400',
      heightCm: '120',
      materialType: 'استانلس 304',
      desiredColor: 'ذهبي لامع',
      lightingType: 'إضاءة خلفية هالة LED',
      details: 'تركيب يافطة واجهة محل تجاري بارتفاع 4 متر بإضاءة خلفية دافئة',
    },
    'ar'
  );
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('contact validation enforces subject, message length, and optional email format', () => {
  const invalid = validateContactInput(
    {
      name: 'S',
      phone: '01012345678',
      email: 'not-an-email',
      subject: 'Hi',
      message: 'Short',
    },
    'en'
  );
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.message);

  const valid = validateContactInput(
    {
      name: 'Karim Adel',
      phone: '+201012345678',
      email: '',
      subject: 'Showroom Facade Inquiry',
      message: 'We need an inspection for a 12-meter ACP cladding storefront.',
    },
    'en'
  );
  assert.equal(valid.valid, true);
});

test('service validation checks bilingual titles and descriptions', () => {
  const res = validateServiceInput(
    {
      titleAr: 'حروف استانلس',
      titleEn: 'Stainless Letters',
      category: 'letters',
      descriptionAr: 'تصنيع حروف استانلس ذهبي وفضي بالليزر',
      descriptionEn: 'Precision laser-cut gold and silver stainless letters',
    },
    'ar'
  );
  assert.equal(res.valid, true);
});

test('WhatsApp URL builder normalizes local numbers and encodes quote details', () => {
  assert.equal(sanitizeWhatsAppDigits('01155709023'), '201155709023');
  assert.equal(sanitizeWhatsAppDigits('+20 100 555 0192'), '201005550192');
  assert.equal(buildWhatsAppDirectUrl('01155709023'), 'https://wa.me/201155709023?s=t');

  const url = buildWhatsAppQuoteUrl({
    whatsappNumber: '01155709023',
    customerName: 'طارق السيد',
    phone: '01155709023',
    serviceType: 'واجهات كلادينج',
    widthCm: '600',
    heightCm: '250',
    materialType: 'كلادينج 4 مم',
    desiredColor: 'أسود فحمي',
    lightingType: 'ليد بروفايل',
    details: 'تكسية واجهة معرض سيارات مع ليد بروفايل',
    referenceCode: 'MSA-1042',
    lang: 'ar',
  });
  assert.ok(url.startsWith('https://wa.me/201155709023?s=t&text='));
  assert.ok(decodeURIComponent(url).includes('MSA-1042'));
  assert.ok(decodeURIComponent(url).includes('600 × 250 سم'));
  assert.ok(decodeURIComponent(url).includes('كلادينج 4 مم'));
});

test('slugifyCategory handles Arabic and English text cleanly', () => {
  assert.equal(slugifyCategory('LED Neon & Profile'), 'led-neon-profile');
  assert.equal(slugifyCategory('حروف استانلس'), 'حروف-استانلس');
});

test('CMS validators enforce hex colors, safe links, quote statuses, and sections', () => {
  assert.equal(isValidHexColor('#D4AF37'), true);
  assert.equal(isValidHexColor('gold'), false);
  assert.equal(isValidUrlOrPath('/quote'), true);
  assert.equal(isValidUrlOrPath('https://wa.me/201155709023'), true);
  assert.equal(isValidUrlOrPath('javascript:alert(1)'), false);
  assert.equal(isValidQuoteStatus('in_progress'), true);
  assert.equal(isValidQuoteStatus('cancelled'), true);
  assert.equal(isValidQuoteStatus('unknown_status'), false);

  const sec = validateSectionInput(
    {
      titleAr: 'ضمان هندسي',
      titleEn: 'Engineering Warranty',
      bodyAr: 'ضمان شامل لمدة خمس سنوات على الإضاءة والخامات',
      bodyEn: 'Full five-year warranty on LEDs and fabrication finishes.',
      buttonUrl: '/quote',
    },
    'ar'
  );
  assert.equal(sec.valid, true);
});
