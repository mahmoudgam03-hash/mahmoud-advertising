export type SignMaterialKind =
  | 'cladding'
  | 'acrylic'
  | 'plastic'
  | 'stainless'
  | 'smart'
  | 'letters-3d'
  | 'letters-lit'
  | 'flex-banner';

export type LedCategoryId =
  | 'smd-2lens-12v'
  | 'smd-3lens-12v'
  | 'smd-4lens-12v'
  | 'pixel-ws2811-12mm'
  | 'pixel-ucs1903-12v'
  | 'digital-strip-ws2812b'
  | 'neon-flex-gen2'
  | 'cob-continuous-24v';

export type WiringPattern = 'snake-h' | 'reverse-snake-h' | 'snake-v' | 'raster-h';

export type SoftProgramId =
  | 'gold-wave'
  | 'royal-sparkle'
  | 'marquee-chase'
  | 'center-expand'
  | 'rainbow-flow'
  | 'comet-trail'
  | 'heartbeat-gold'
  | 'curtain-split'
  | 'dual-flash'
  | 'steady-warm-gold';

export interface LedSpec {
  id: LedCategoryId;
  generationOrder: number;
  generationLabelAr: string;
  nameAr: string;
  nameEn: string;
  voltage: 5 | 12 | 24;
  wattsPerUnit: number;
  recommendedSpacingCm: number;
  isAddressable: boolean;
  unitLabelAr: string;
  idealForAr: string;
}

export interface SoftProgramSpec {
  id: SoftProgramId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  defaultSpeed: number; // 1..10
}

export interface SheetOption {
  id: string;
  labelAr: string;
  widthCm: number;
  heightCm: number;
  defaultFor: SignMaterialKind[];
}

export interface BoardCalculationInput {
  widthCm: number;
  heightCm: number;
  material: SignMaterialKind;
  sheetWidthCm: number;
  sheetHeightCm: number;
  letterDepthCm: number;
  thicknessMm?: number;
  letterCount?: number;
  letterCoveragePercent: number;
  ledId: LedCategoryId;
  customSpacingCm?: number;
  sheetCostEgp?: number;
  ledUnitCostEgp?: number;
}

export interface BoardCalculationResult {
  areaSqm: number;
  effectiveIlluminatedSqm: number;
  sheetAreaSqm: number;
  sheetsNeeded: number;
  piecesCount: number;
  bestOrientation: 'horizontal' | 'vertical';
  wastePercent: number;
  wasteAreaSqm: number;
  ironFrameMeters: number;
  ironBars6m: number;
  returnStripMeters: number;
  estimatedLedCount: number;
  effectiveSpacingCm: number;
  totalWatts: number;
  totalAmps: number;
  recommendedPsuAmps: number;
  psuCountSuggestion: string;
  powerInjectionPoints: number;
  estimatedCostEgp: number;
  toolsListAr: string[];
  executionStepsAr: string[];
  warningsAr: string[];
}

export interface LedNode {
  index: number; // 1-based numbering
  code: string; // LED 001, LED 002, ...
  row: number;
  col: number;
  xPercent: number;
  yPercent: number;
  needsPowerInjection: boolean;
}

export const MATERIAL_CATALOG: Array<{
  id: SignMaterialKind;
  titleAr: string;
  subAr: string;
  recommendedSheetId: string;
  defaultSheetCostEgp: number;
  defaultThicknessMm: number;
}> = [
  {
    id: 'cladding',
    titleAr: 'واجهة كلادينج (ACP)',
    subAr: 'ألواح ألمنيوم 4 مم تفتيح وتكسيح',
    recommendedSheetId: 'cladding-122-244',
    defaultSheetCostEgp: 1950,
    defaultThicknessMm: 4,
  },
  {
    id: 'acrylic',
    titleAr: 'أكريليك مضيء (Cast)',
    subAr: 'وجه أكريليك كاست مستورد عالي النقاء',
    recommendedSheetId: 'cladding-122-244',
    defaultSheetCostEgp: 2450,
    defaultThicknessMm: 3,
  },
  {
    id: 'plastic',
    titleAr: 'بلاستيك وPVC مفرغ',
    subAr: 'ألواح فوريكس وبلاستيك خفيف للأجناب',
    recommendedSheetId: 'cladding-122-244',
    defaultSheetCostEgp: 1150,
    defaultThicknessMm: 8,
  },
  {
    id: 'stainless',
    titleAr: 'استانلس 304 عاكس',
    subAr: 'ذهبي / فضي ميرور قص فايبر ليزر',
    recommendedSheetId: 'stainless-100-200',
    defaultSheetCostEgp: 3600,
    defaultThicknessMm: 0.8,
  },
  {
    id: 'smart',
    titleAr: 'سمارت أكريليك مدمج',
    subAr: 'حروف بدون إطار مرئي بإضاءة محيطة',
    recommendedSheetId: 'cladding-122-244',
    defaultSheetCostEgp: 2700,
    defaultThicknessMm: 5,
  },
  {
    id: 'letters-3d',
    titleAr: 'حروف بارزة 3D مجمعة',
    subAr: 'وش أكريليك + جانب استانلس أو صاج',
    recommendedSheetId: 'cladding-122-244',
    defaultSheetCostEgp: 2600,
    defaultThicknessMm: 3,
  },
  {
    id: 'letters-lit',
    titleAr: 'حروف مضيئة (وجه + خلف)',
    subAr: 'إضاءة مزدوجة أمامية وهالة خلفية',
    recommendedSheetId: 'cladding-122-244',
    defaultSheetCostEgp: 2900,
    defaultThicknessMm: 4,
  },
  {
    id: 'flex-banner',
    titleAr: 'يفط فلكس وبنر مضيء',
    subAr: 'طباعة رول 320 سم + شاسيه حديد',
    recommendedSheetId: 'flex-roll-320',
    defaultSheetCostEgp: 950,
    defaultThicknessMm: 1,
  },
];

export const STANDARD_SHEETS: SheetOption[] = [
  {
    id: 'cladding-122-244',
    labelAr: 'لوح قياسي 122 × 244 سم (كلادينج / أكريليك / PVC)',
    widthCm: 122,
    heightCm: 244,
    defaultFor: ['cladding', 'acrylic', 'plastic', 'smart', 'letters-3d', 'letters-lit'],
  },
  {
    id: 'cladding-125-320',
    labelAr: 'لوح كلادينج جامبو 125 × 320 سم',
    widthCm: 125,
    heightCm: 320,
    defaultFor: ['cladding'],
  },
  {
    id: 'acrylic-200-300',
    labelAr: 'لوح أكريليك / PVC جامبو 200 × 300 سم',
    widthCm: 200,
    heightCm: 300,
    defaultFor: ['acrylic', 'plastic'],
  },
  {
    id: 'stainless-100-200',
    labelAr: 'لوح استانلس 304 صافي 100 × 200 سم',
    widthCm: 100,
    heightCm: 200,
    defaultFor: ['stainless'],
  },
  {
    id: 'flex-roll-320',
    labelAr: 'رول فلكس / بنر عرض 320 سم (بالطول المطلوب)',
    widthCm: 320,
    heightCm: 500,
    defaultFor: ['flex-banner'],
  },
];

export const LED_CATALOG: LedSpec[] = [
  {
    id: 'smd-2lens-12v',
    generationOrder: 1,
    generationLabelAr: 'الجيل الأول (أساسي)',
    nameAr: 'ليد 2 عدسة 12 فولت (1.2 وات)',
    nameEn: '2-Lens SMD LED Module 12V',
    voltage: 12,
    wattsPerUnit: 1.2,
    recommendedSpacingCm: 9,
    isAddressable: false,
    unitLabelAr: 'حبة',
    idealForAr: 'الحروف الرفيعة وعلب اللايت بوكس بعمق 5–8 سم',
  },
  {
    id: 'smd-3lens-12v',
    generationOrder: 2,
    generationLabelAr: 'الجيل الثاني (الأشهر)',
    nameAr: 'ليد 3 عدسة IP67 مقاوم للمطر (1.5 وات)',
    nameEn: '3-Lens High-Output IP67 12V',
    voltage: 12,
    wattsPerUnit: 1.5,
    recommendedSpacingCm: 11,
    isAddressable: false,
    unitLabelAr: 'حبة',
    idealForAr: 'حروف الأكريليك والسمارت ويفط الفلكس المضيئة',
  },
  {
    id: 'smd-4lens-12v',
    generationOrder: 3,
    generationLabelAr: 'الجيل الثالث (عمق كبير)',
    nameAr: 'ليد 4 عدسة عالي السطوع (2.0 وات)',
    nameEn: '4-Lens Deep Box LED 12V',
    voltage: 12,
    wattsPerUnit: 2.0,
    recommendedSpacingCm: 14,
    isAddressable: false,
    unitLabelAr: 'حبة',
    idealForAr: 'الحروف الكبيرة والعلب العميقة 12–20 سم',
  },
  {
    id: 'pixel-ws2811-12mm',
    generationOrder: 4,
    generationLabelAr: 'الجيل الرابع (بكسل سوفت)',
    nameAr: 'ليد بكسل سمارت WS2811 (5 فولت / 12mm)',
    nameEn: 'WS2811 Addressable Pixel 5V',
    voltage: 5,
    wattsPerUnit: 0.3,
    recommendedSpacingCm: 3.5,
    isAddressable: true,
    unitLabelAr: 'بكسل',
    idealForAr: 'يفط البكسل المبرمجة والحروف المتحركة والشعارات المتلألئة',
  },
  {
    id: 'pixel-ucs1903-12v',
    generationOrder: 5,
    generationLabelAr: 'الجيل الخامس (بكسل 12V)',
    nameAr: 'ليد بكسل UCS1903 احترافي 12 فولت',
    nameEn: 'UCS1903 High-Stability Pixel 12V',
    voltage: 12,
    wattsPerUnit: 0.72,
    recommendedSpacingCm: 4.5,
    isAddressable: true,
    unitLabelAr: 'بكسل',
    idealForAr: 'الواجهات الطويلة والمسافات البعيدة بأقل فقد جهد',
  },
  {
    id: 'digital-strip-ws2812b',
    generationOrder: 6,
    generationLabelAr: 'الجيل السادس (ديجيتال)',
    nameAr: 'شريط ديجيتال WS2812B سمارت (60 بكسل/م)',
    nameEn: 'WS2812B Digital RGB Strip 5V',
    voltage: 5,
    wattsPerUnit: 0.3,
    recommendedSpacingCm: 2.5,
    isAddressable: true,
    unitLabelAr: 'بكسل',
    idealForAr: 'الإطارات الهندسية وتأثيرات الإضاءة السائلة السلسة',
  },
  {
    id: 'neon-flex-gen2',
    generationOrder: 7,
    generationLabelAr: 'الجيل السابع (نيون مطور)',
    nameAr: 'نيون فلكس سيليكون جيل ثاني 6mm (12V)',
    nameEn: '2nd-Gen Silicone Neon Flex 12V',
    voltage: 12,
    wattsPerUnit: 9.6,
    recommendedSpacingCm: 10,
    isAddressable: false,
    unitLabelAr: 'متر',
    idealForAr: 'الكتابة اليدوية والشعارات المفرغة على الأكريليك الشفاف',
  },
  {
    id: 'cob-continuous-24v',
    generationOrder: 8,
    generationLabelAr: 'الجيل الثامن (الأحدث)',
    nameAr: 'ليد بروفايل COB مستمر بدون نقط (24V)',
    nameEn: 'Dotless High-CRI COB LED Strip 24V',
    voltage: 24,
    wattsPerUnit: 12,
    recommendedSpacingCm: 10,
    isAddressable: false,
    unitLabelAr: 'متر',
    idealForAr: 'واجهات الكلادينج الفاخرة وقنوات الليد بروفايل المعمارية',
  },
];

export const SOFT_PROGRAMS: SoftProgramSpec[] = [
  {
    id: 'gold-wave',
    nameAr: 'موجة ذهبية ملكية',
    nameEn: 'Royal Gold Wave',
    descriptionAr: 'تدرج ضوئي ناعم من الذهبي الدافئ إلى الأبيض اللامع عبر جميع الحبات بالتتابع.',
    defaultSpeed: 6,
  },
  {
    id: 'royal-sparkle',
    nameAr: 'تلألؤ الماس والذهب',
    nameEn: 'Diamond & Gold Sparkle',
    descriptionAr: 'وميض متناوب سريع يعطي بريقاً فاخراً للحروف الاستانلس والواجهات التجارية.',
    defaultSpeed: 7,
  },
  {
    id: 'marquee-chase',
    nameAr: 'مطاردة كلاسيكية (ماركيه)',
    nameEn: 'Classic Marquee Chase',
    descriptionAr: 'نقاط ضوئية متتالية مثالية لإطارات اللوحات والمطاعم والمحلات.',
    defaultSpeed: 5,
  },
  {
    id: 'center-expand',
    nameAr: 'تمدد من المنتصف للخارج',
    nameEn: 'Center Burst Expand',
    descriptionAr: 'تنطلق الإضاءة من قلب الشعار نحو الأطراف بشكل متماثل وجذاب.',
    defaultSpeed: 6,
  },
  {
    id: 'rainbow-flow',
    nameAr: 'تدرج قوس قزح ديجيتال',
    nameEn: 'Digital Rainbow Flow',
    descriptionAr: 'انسياب لوني كامل لطيف RGB مخصص لليدات السمارت وبرامج البيكسل.',
    defaultSpeed: 6,
  },
  {
    id: 'comet-trail',
    nameAr: 'ذيل المذنب السريع',
    nameEn: 'Comet Trail',
    descriptionAr: 'رأس مضيء شديد السطوع يتبعه ذيل خافت يتلاشى تدريجياً.',
    defaultSpeed: 8,
  },
  {
    id: 'heartbeat-gold',
    nameAr: 'نبض ذهبي هادئ',
    nameEn: 'Warm Gold Breath',
    descriptionAr: 'ارتفاع وانخفاض تدريجي للسطوع يناسب المكاتب الهندسية والعيادات.',
    defaultSpeed: 4,
  },
  {
    id: 'curtain-split',
    nameAr: 'فتح وإغلاق الستارة',
    nameEn: 'Curtain Split Reveal',
    descriptionAr: 'إضاءة تلتقي في المنتصف ثم تنسحب للأطراف بحركة متكررة.',
    defaultSpeed: 5,
  },
  {
    id: 'dual-flash',
    nameAr: 'فلاش مزدوج تنبيهي',
    nameEn: 'Dual Strobe Accent',
    descriptionAr: 'ومضة ثنائية خاطفة على نصف اللوحة بالتبادل للفت الانتباه ليلاً.',
    defaultSpeed: 7,
  },
  {
    id: 'steady-warm-gold',
    nameAr: 'ثابت ذهبي ورم فاخر (100%)',
    nameEn: 'Steady Luxury Warm Gold',
    descriptionAr: 'إضاءة ثابتة بكامل القوة لاختبار توازن السطوع وعدم وجود بقع داكنة.',
    defaultSpeed: 5,
  },
];

export function formatLedCode(index: number): string {
  const safe = Math.max(1, Math.floor(index));
  return `LED ${String(safe).padStart(3, '0')}`;
}

export function getLedById(id: LedCategoryId): LedSpec {
  return LED_CATALOG.find((item) => item.id === id) || LED_CATALOG[1];
}

export function getMaterialDefaults(material: SignMaterialKind) {
  return MATERIAL_CATALOG.find((m) => m.id === material) || MATERIAL_CATALOG[0];
}

export function pickRecommendedPsuAmps(requiredAmps: number): number {
  const safeTarget = requiredAmps * 1.25;
  const standardSizes = [5, 10, 15, 20, 30, 33, 40, 50, 60, 80, 100];
  for (const size of standardSizes) {
    if (safeTarget <= size) return size;
  }
  return Math.ceil(safeTarget / 33) * 33;
}

export function calculateMaterialsAndSheets(
  input: BoardCalculationInput
): BoardCalculationResult {
  const widthCm = Math.max(10, Math.min(5000, Number(input.widthCm) || 100));
  const heightCm = Math.max(10, Math.min(2000, Number(input.heightCm) || 100));
  const sheetW = Math.max(50, Number(input.sheetWidthCm) || 122);
  const sheetH = Math.max(50, Number(input.sheetHeightCm) || 244);
  const depthCm = Math.max(2, Math.min(40, Number(input.letterDepthCm) || 7));
  const thicknessMm = Math.max(0.4, Math.min(30, Number(input.thicknessMm) || 3));
  const letterCount = Math.max(0, Math.min(300, Number(input.letterCount) || 12));
  const coverageRatio = Math.max(0.15, Math.min(1, (Number(input.letterCoveragePercent) || 65) / 100));

  const areaSqm = Number(((widthCm * heightCm) / 10000).toFixed(2));
  const effectiveIlluminatedSqm = Number((areaSqm * coverageRatio).toFixed(2));
  const sheetAreaSqm = Number(((sheetW * sheetH) / 10000).toFixed(2));

  const colsH = Math.ceil(widthCm / sheetW);
  const rowsH = Math.ceil(heightCm / sheetH);
  const sheetsHoriz = colsH * rowsH;

  const colsV = Math.ceil(widthCm / sheetH);
  const rowsV = Math.ceil(heightCm / sheetW);
  const sheetsVert = colsV * rowsV;

  const bestOrientation: 'horizontal' | 'vertical' =
    sheetsHoriz <= sheetsVert ? 'horizontal' : 'vertical';
  const sheetsNeeded =
    input.material === 'flex-banner'
      ? Math.max(1, Math.ceil((widthCm / 320) * (heightCm / 500)))
      : Math.min(sheetsHoriz, sheetsVert);

  const piecesCount =
    input.material === 'letters-3d' ||
    input.material === 'letters-lit' ||
    input.material === 'stainless' ||
    input.material === 'smart'
      ? Math.max(sheetsNeeded, letterCount)
      : sheetsNeeded;

  const totalPurchasedArea = sheetsNeeded * sheetAreaSqm;
  const wasteAreaSqm = Number(Math.max(0, totalPurchasedArea - areaSqm).toFixed(2));
  const wastePercent =
    totalPurchasedArea > 0
      ? Number(((wasteAreaSqm / totalPurchasedArea) * 100).toFixed(1))
      : 0;

  const perimeterM = (2 * (widthCm + heightCm)) / 100;
  const verticalRibsCount = Math.max(0, Math.floor(widthCm / 100) - 1);
  const horizontalRibsCount = heightCm > 95 ? 1 : 0;
  const ironFrameMeters = Number(
    (
      perimeterM +
      (verticalRibsCount * heightCm) / 100 +
      (horizontalRibsCount * widthCm) / 100
    ).toFixed(1)
  );
  const ironBars6m = Math.max(1, Math.ceil(ironFrameMeters / 6));

  const isLetterMaterial =
    input.material === 'letters-3d' ||
    input.material === 'letters-lit' ||
    input.material === 'stainless' ||
    input.material === 'acrylic' ||
    input.material === 'smart';

  const returnStripMeters = Number(
    (
      isLetterMaterial
        ? Math.max(
            perimeterM,
            letterCount * 0.75 + (widthCm / 100) * 3.5 * coverageRatio
          )
        : perimeterM
    ).toFixed(1)
  );

  const led = getLedById(input.ledId);
  const effectiveSpacingCm = Math.max(
    1.5,
    Number(input.customSpacingCm) || Math.max(led.recommendedSpacingCm, depthCm * 1.15)
  );

  let estimatedLedCount = 0;
  if (led.id === 'neon-flex-gen2' || led.id === 'cob-continuous-24v') {
    estimatedLedCount = Math.max(1, Math.ceil(returnStripMeters));
  } else {
    const areaSqCm = widthCm * heightCm * coverageRatio;
    const perUnitSqCm = effectiveSpacingCm * effectiveSpacingCm;
    const densityMultiplier = input.material === 'letters-lit' ? 1.35 : 1;
    estimatedLedCount = Math.max(1, Math.ceil((areaSqCm / perUnitSqCm) * densityMultiplier));
  }

  const totalWatts = Number((estimatedLedCount * led.wattsPerUnit).toFixed(1));
  const totalAmps = Number((totalWatts / led.voltage).toFixed(1));
  const recommendedPsuAmps = pickRecommendedPsuAmps(totalAmps);

  const psuUnits = totalAmps > 30 ? Math.ceil((totalAmps * 1.25) / 33) : 1;
  const psuCountSuggestion =
    psuUnits > 1
      ? `${psuUnits} × ترانس 33 أمبير (${led.voltage}V)`
      : `1 × ترانس ${recommendedPsuAmps} أمبير (${led.voltage}V)`;

  const injectionStep = led.voltage === 5 ? 50 : led.voltage === 12 ? 100 : 150;
  const powerInjectionPoints = led.isAddressable
    ? Math.max(1, Math.ceil(estimatedLedCount / injectionStep))
    : Math.max(1, Math.ceil(estimatedLedCount / 40));

  // Manufacturing Cost Estimation (EGP workshop benchmark - fully customizable)
  const matMeta = getMaterialDefaults(input.material);
  const sheetCost = Math.max(100, Number(input.sheetCostEgp) || matMeta.defaultSheetCostEgp);
  const ledCostPerUnit =
    Number(input.ledUnitCostEgp) || (led.isAddressable ? 8.5 : led.id.includes('cob') ? 95 : 12);
  const ironCost = ironBars6m * 320;
  const psuCost = psuUnits * (recommendedPsuAmps >= 30 ? 480 : 280);
  const fabricationLaborCost = Math.round(areaSqm * (isLetterMaterial ? 650 : 350));
  const estimatedCostEgp = Math.round(
    sheetsNeeded * sheetCost + estimatedLedCount * ledCostPerUnit + ironCost + psuCost + fabricationLaborCost
  );

  const toolsListAr: string[] = [
    input.material === 'stainless'
      ? 'ماكينة فايبر ليزر لقص الاستانلس + جهاز لحام ليزر أو قصدير للأجناب'
      : 'راوتر CNC للتقطيع الدقيق + سكينة تفريغ V-Groove للكلادينج',
    'ماكينة لحام كهرباء وصاروخ لتجهيز شاسيه الحديد 2×2 سم',
    'مكواة لحام وقصدير وشيكارتون حراري (Heat Shrink) لعزل الأسلاك',
    'مسدس سيليكون متعادل (Neutral بدون خل) لتثبيت الوجه وعزل المطر',
    'أفوميتر لفحص خرج الباور سبلاي ومنع عكس القطبية قبل التركيب',
  ];

  const executionStepsAr: string[] = [
    `1. تجهيز شاسيه حديد بإجمالي ${ironFrameMeters} م طولي (${ironBars6m} ماسورة 6م) ودهانه برايمر ضد الصدأ.`,
    `2. تقطيع عدد ${sheetsNeeded} لوح على الاتجاه الـ${bestOrientation === 'horizontal' ? 'أفقي' : 'رأسي'} بسُمك ${thicknessMm} مم وتقسيم ${piecesCount} قطعة.`,
    `3. لف شريط التخانة (الرتيرن) بطول ${returnStripMeters} متر وبعمق بروز ${depthCm} سم وتجميع الحروف.`,
    `4. تثبيت ${estimatedLedCount} ${led.unitLabelAr} بتباعد ${effectiveSpacingCm.toFixed(1)} سم وتوصيل ${powerInjectionPoints} نقطة حقن كهرباء.`,
    `5. توصيل ${psuCountSuggestion} بسلك نحاس معزول واختبار اللوحة 24 ساعة في الورشة قبل التركيب.`,
  ];

  const warningsAr: string[] = [];
  if (depthCm < 5 && !led.isAddressable && led.id !== 'neon-flex-gen2') {
    warningsAr.push(
      'تنبيه هندسي: عمق البروز أقل من 5 سم قد يسبب ظهور نقاط الإضاءة (Hotspots)؛ يُنصح بتقليل تباعد الليد أو زيادة العمق إلى 6–8 سم.'
    );
  }
  if (led.voltage === 5 && estimatedLedCount > 100) {
    warningsAr.push(
      `ملاحظة كهربائية: ليدات 5 فولت تحتاج حقن تغذية (Power Injection) كل 50 بكسل (${powerInjectionPoints} نقاط) بسلك 1.5 مم على الأقل لتفادي اصفرار الإضاءة.`
    );
  }
  if (wastePercent > 35 && input.material !== 'flex-banner') {
    warningsAr.push(
      `نسبة الهالك مرتفعة (${wastePercent}%): يمكنك تعديل الارتفاع 5–10 سم أو استخدام مقاس اللوح الجامبو لتوفير لوح كامل.`
    );
  }

  return {
    areaSqm,
    effectiveIlluminatedSqm,
    sheetAreaSqm,
    sheetsNeeded,
    piecesCount,
    bestOrientation,
    wastePercent,
    wasteAreaSqm,
    ironFrameMeters,
    ironBars6m,
    returnStripMeters,
    estimatedLedCount,
    effectiveSpacingCm: Number(effectiveSpacingCm.toFixed(1)),
    totalWatts,
    totalAmps,
    recommendedPsuAmps,
    psuCountSuggestion,
    powerInjectionPoints,
    estimatedCostEgp,
    toolsListAr,
    executionStepsAr,
    warningsAr,
  };
}

/**
 * Generates an AutoCAD R12 ASCII DXF layout of the sign frame and sheet cut lines.
 */
export function exportBoardLayoutDxf(
  input: BoardCalculationInput,
  result: BoardCalculationResult
): string {
  const w = Math.max(10, Number(input.widthCm) || 100);
  const h = Math.max(10, Number(input.heightCm) || 100);
  const effSheetW =
    result.bestOrientation === 'horizontal' ? input.sheetWidthCm : input.sheetHeightCm;
  const effSheetH =
    result.bestOrientation === 'horizontal' ? input.sheetHeightCm : input.sheetWidthCm;

  const lines: string[] = [
    '0',
    'SECTION',
    '2',
    'HEADER',
    '9',
    '$ACADVER',
    '1',
    'AC1009',
    '0',
    'ENDSEC',
    '0',
    'SECTION',
    '2',
    'ENTITIES',
  ];

  const addDxfLine = (layer: string, x1: number, y1: number, x2: number, y2: number, color: number) => {
    lines.push(
      '0',
      'LINE',
      '8',
      layer,
      '62',
      String(color),
      '10',
      x1.toFixed(2),
      '20',
      y1.toFixed(2),
      '30',
      '0.0',
      '11',
      x2.toFixed(2),
      '21',
      y2.toFixed(2),
      '31',
      '0.0'
    );
  };

  // Outer Sign Frame Border (Layer: SIGN_BORDER, Color 2 = Yellow/Gold)
  addDxfLine('SIGN_BORDER', 0, 0, w, 0, 2);
  addDxfLine('SIGN_BORDER', w, 0, w, h, 2);
  addDxfLine('SIGN_BORDER', w, h, 0, h, 2);
  addDxfLine('SIGN_BORDER', 0, h, 0, 0, 2);

  // Sheet Cut Seams inside sign (Layer: SHEET_CUTS, Color 5 = Blue)
  const cols = Math.max(1, Math.ceil(w / effSheetW));
  const rows = Math.max(1, Math.ceil(h / effSheetH));
  for (let c = 1; c < cols; c++) {
    const x = c * effSheetW;
    if (x < w) addDxfLine('SHEET_CUTS', x, 0, x, h, 5);
  }
  for (let r = 1; r < rows; r++) {
    const y = r * effSheetH;
    if (y < h) addDxfLine('SHEET_CUTS', 0, y, w, y, 5);
  }

  // Structural Iron Frame Margin (10cm inset if big enough)
  if (w > 40 && h > 40) {
    addDxfLine('IRON_CHASSIS', 5, 5, w - 5, 5, 1);
    addDxfLine('IRON_CHASSIS', w - 5, 5, w - 5, h - 5, 1);
    addDxfLine('IRON_CHASSIS', w - 5, h - 5, 5, h - 5, 1);
    addDxfLine('IRON_CHASSIS', 5, h - 5, 5, 5, 1);
  }

  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}

/**
 * Builds deterministic LED node sequence (1..N, formatted LED 001..LED N)
 * with wiring order & power-injection indicators.
 */
export function generateLedGridNodes(
  rows: number,
  cols: number,
  pattern: WiringPattern = 'snake-h',
  voltage: 5 | 12 | 24 = 12
): LedNode[] {
  const safeRows = Math.max(1, Math.min(24, Math.floor(rows)));
  const safeCols = Math.max(1, Math.min(40, Math.floor(cols)));
  const injectionStep = voltage === 5 ? 50 : 100;
  const nodes: LedNode[] = [];

  if (pattern === 'snake-v') {
    let idx = 1;
    for (let c = 0; c < safeCols; c++) {
      const reverse = c % 2 === 1;
      for (let step = 0; step < safeRows; step++) {
        const r = reverse ? safeRows - 1 - step : step;
        nodes.push({
          index: idx,
          code: formatLedCode(idx),
          row: r,
          col: c,
          xPercent: safeCols === 1 ? 50 : ((c + 0.5) / safeCols) * 100,
          yPercent: safeRows === 1 ? 50 : ((r + 0.5) / safeRows) * 100,
          needsPowerInjection: idx === 1 || (idx - 1) % injectionStep === 0,
        });
        idx++;
      }
    }
    return nodes;
  }

  let idx = 1;
  for (let r = 0; r < safeRows; r++) {
    const reverse =
      (pattern === 'snake-h' && r % 2 === 1) ||
      (pattern === 'reverse-snake-h' && r % 2 === 0);
    for (let step = 0; step < safeCols; step++) {
      const c = reverse ? safeCols - 1 - step : step;
      nodes.push({
        index: idx,
        code: formatLedCode(idx),
        row: r,
        col: c,
        xPercent: safeCols === 1 ? 50 : ((c + 0.5) / safeCols) * 100,
        yPercent: safeRows === 1 ? 50 : ((r + 0.5) / safeRows) * 100,
        needsPowerInjection: idx === 1 || (idx - 1) % injectionStep === 0,
      });
      idx++;
    }
  }
  return nodes;
}

/**
 * Computes real-time CSS RGB color for an LED node in the active Soft Program simulation.
 */
export function computeLedProgramColor(
  programId: SoftProgramId,
  nodeIndex: number,
  totalNodes: number,
  tick: number
): { bg: string; glow: string; brightness: number } {
  const safeTotal = Math.max(1, totalNodes);
  const pos = (nodeIndex - 1) / safeTotal;

  switch (programId) {
    case 'steady-warm-gold':
      return { bg: '#F7D262', glow: '0 0 10px rgba(212,175,55,0.9)', brightness: 1 };

    case 'gold-wave': {
      const wave = (Math.sin((pos * Math.PI * 4) - tick * 0.35) + 1) / 2;
      const r = Math.round(140 + wave * 115);
      const g = Math.round(95 + wave * 125);
      const b = Math.round(20 + wave * 90);
      return {
        bg: `rgb(${r},${g},${b})`,
        glow: wave > 0.55 ? '0 0 12px rgba(245,208,97,0.95)' : 'none',
        brightness: 0.35 + wave * 0.65,
      };
    }

    case 'royal-sparkle': {
      const seed = (nodeIndex * 37 + tick * 13) % 19;
      const lit = seed < 5;
      return lit
        ? { bg: seed === 0 ? '#FFFFFF' : '#F7D262', glow: '0 0 12px rgba(255,230,130,0.95)', brightness: 1 }
        : { bg: '#473915', glow: 'none', brightness: 0.25 };
    }

    case 'marquee-chase': {
      const lit = (nodeIndex + tick) % 3 === 0;
      return lit
        ? { bg: '#F5CA4C', glow: '0 0 10px rgba(245,202,76,0.9)', brightness: 1 }
        : { bg: '#1F232D', glow: 'none', brightness: 0.2 };
    }

    case 'center-expand': {
      const dist = Math.abs(pos - 0.5) * 2;
      const ring = Math.abs(((tick * 0.08) % 1) - dist);
      const lit = ring < 0.22;
      return lit
        ? { bg: '#FFD86B', glow: '0 0 12px rgba(255,216,107,0.95)', brightness: 1 }
        : { bg: '#2C2617', glow: 'none', brightness: 0.25 };
    }

    case 'rainbow-flow': {
      const hue = Math.round(((pos * 360) + tick * 18) % 360);
      return {
        bg: `hsl(${hue}, 92%, 58%)`,
        glow: `0 0 10px hsla(${hue}, 92%, 58%, 0.75)`,
        brightness: 1,
      };
    }

    case 'comet-trail': {
      const head = tick % safeTotal;
      const diff = (head - (nodeIndex - 1) + safeTotal) % safeTotal;
      if (diff === 0) return { bg: '#FFFFFF', glow: '0 0 14px #FFF', brightness: 1 };
      if (diff < 6) {
        const fade = 1 - diff / 6;
        return {
          bg: `rgba(212,175,55,${fade.toFixed(2)})`,
          glow: `0 0 8px rgba(212,175,55,${fade.toFixed(2)})`,
          brightness: fade,
        };
      }
      return { bg: '#1D1F27', glow: 'none', brightness: 0.2 };
    }

    case 'heartbeat-gold': {
      const pulse = (Math.sin(tick * 0.25) + 1) / 2;
      return {
        bg: `rgba(232,188,62,${(0.25 + pulse * 0.75).toFixed(2)})`,
        glow: pulse > 0.6 ? '0 0 12px rgba(232,188,62,0.85)' : 'none',
        brightness: 0.25 + pulse * 0.75,
      };
    }

    case 'curtain-split': {
      const phase = Math.abs(Math.sin(tick * 0.14));
      const dist = Math.abs(pos - 0.5) * 2;
      const lit = dist <= phase;
      return lit
        ? { bg: '#F4C64D', glow: '0 0 10px rgba(244,198,77,0.85)', brightness: 1 }
        : { bg: '#1E212B', glow: 'none', brightness: 0.2 };
    }

    case 'dual-flash': {
      const half = nodeIndex <= safeTotal / 2;
      const phase = Math.floor(tick / 3) % 2 === 0;
      const lit = (half && phase) || (!half && !phase);
      return lit
        ? {
            bg: half ? '#F7D262' : '#3B82F6',
            glow: half ? '0 0 10px rgba(247,210,98,0.9)' : '0 0 10px rgba(59,130,246,0.9)',
            brightness: 1,
          }
        : { bg: '#181B23', glow: 'none', brightness: 0.2 };
    }
  }
}

export function exportLedCsvMap(nodes: LedNode[], led: LedSpec, program: SoftProgramSpec): string {
  const header = 'LED_Code,LED_Number,Row,Column,X_Percent,Y_Percent,Power_Injection,LED_Type,Program';
  const rows = nodes.map(
    (n) =>
      `${n.code},${n.index},${n.row + 1},${n.col + 1},${n.xPercent.toFixed(1)},${n.yPercent.toFixed(1)},${
        n.needsPowerInjection ? 'YES' : 'NO'
      },"${led.nameEn}","${program.nameEn}"`
  );
  return `\uFEFF${[header, ...rows].join('\n')}`;
}

export function exportLedWiringSvg(
  nodes: LedNode[],
  rows: number,
  cols: number,
  program: SoftProgramSpec
): string {
  const width = Math.max(600, cols * 58);
  const height = Math.max(320, rows * 58 + 50);
  const points = nodes
    .map((n) => `${((n.xPercent / 100) * width).toFixed(1)},${((n.yPercent / 100) * (height - 40) + 36).toFixed(1)}`)
    .join(' ');

  const circles = nodes
    .map((n) => {
      const cx = ((n.xPercent / 100) * width).toFixed(1);
      const cy = ((n.yPercent / 100) * (height - 40) + 36).toFixed(1);
      const fill = n.needsPowerInjection ? '#F5D061' : '#1E2430';
      const textFill = n.needsPowerInjection ? '#050608' : '#F4F4F6';
      return `<g>
  <circle cx="${cx}" cy="${cy}" r="18" fill="${fill}" stroke="#D4AF37" stroke-width="2" />
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${textFill}" font-family="monospace" font-size="9" font-weight="bold">${n.index}</text>
</g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#07080C" />
  <text x="18" y="24" fill="#F5D061" font-family="sans-serif" font-size="14" font-weight="bold">Mahmoud Shaaban LED Wiring Map — ${program.nameEn} (${nodes.length} LEDs)</text>
  <polyline fill="none" stroke="#D4AF37" stroke-width="2" stroke-dasharray="6 4" points="${points}" />
  ${circles}
</svg>`;
}

export function exportLedArduinoSketch(params: {
  ledCount: number;
  programId: SoftProgramId;
  speed: number;
  voltage: 5 | 12 | 24;
  chipset: string;
}): string {
  const delayMs = Math.max(15, 130 - params.speed * 11);
  return `// MAHMOUD SHAABAN - SMART ADVERTISING ENGINEER (01155709023)
// Free Educational & Workshop Tool (Minya - Beni Mazar)
#include <FastLED.h>

#define LED_PIN     6
#define NUM_LEDS    ${Math.max(1, Math.floor(params.ledCount))}
#define CHIPSET     ${params.chipset || 'WS2811'}
#define COLOR_ORDER RGB
#define BRIGHTNESS  230
#define STEP_MS     ${delayMs}

CRGB leds[NUM_LEDS];
uint16_t stepTick = 0;

void setup() {
  FastLED.addLeds<CHIPSET, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
}

void loop() {
  // Program: ${params.programId} (${params.voltage}V)
  for (int i = 0; i < NUM_LEDS; i++) {
    uint8_t wave = sin8((i * 12) - (stepTick * 8));
    leds[i] = CRGB(wave, (uint8_t)(wave * 0.75), (uint8_t)(wave * 0.15));
  }
  FastLED.show();
  stepTick++;
  delay(STEP_MS);
}
`;
}

export function exportRawFrameDataTxt(nodes: LedNode[], program: SoftProgramSpec): string {
  const header = `# Raw LED Coordinate & Frame Export (${program.nameEn})\n# Note: Open text table for compatible controller mappers / Arduino arrays.\n# Binary .led files for LED Edit require specific controller IC binary specs.\nLED_CODE\tROW\tCOL\tX_PCT\tY_PCT\tPWR_INJECT\n`;
  const lines = nodes.map(
    (n) =>
      `${n.code}\t${n.row + 1}\t${n.col + 1}\t${n.xPercent.toFixed(1)}\t${n.yPercent.toFixed(1)}\t${
        n.needsPowerInjection ? '1' : '0'
      }`
  );
  return header + lines.join('\n');
}

export function parseImportedLedFile(
  rawText: string
): { rows: number; cols: number; programId?: SoftProgramId; ledId?: LedCategoryId; pattern?: WiringPattern } | { error: string } {
  const trimmed = rawText.trim().replace(/^\uFEFF/, '');
  if (!trimmed) return { error: 'الملف المرفوع فارغ.' };

  if (trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(trimmed) as {
        rows?: number;
        cols?: number;
        program?: { id?: SoftProgramId };
        ledType?: { id?: LedCategoryId };
        wiringPattern?: WiringPattern;
      };
      const r = Number(json.rows);
      const c = Number(json.cols);
      if (!Number.isFinite(r) || !Number.isFinite(c) || r < 1 || c < 1) {
        return { error: 'ملف JSON لا يحتوي على عدد الصفوف والأعمدة (rows / cols) بشكل صحيح.' };
      }
      return {
        rows: Math.min(16, Math.max(1, Math.floor(r))),
        cols: Math.min(24, Math.max(1, Math.floor(c))),
        programId: json.program?.id,
        ledId: json.ledType?.id,
        pattern: json.wiringPattern,
      };
    } catch {
      return { error: 'تعذر قراءة ملف JSON — تأكد من سلامة تنسيق الملف.' };
    }
  }

  // Parse CSV lines
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('LED_Code') && !l.startsWith('LED_Number'));
  if (lines.length === 0) {
    return { error: 'ملف CSV لا يحتوي على صفوف بيانات ليد صالحة.' };
  }
  let maxRow = 1;
  let maxCol = 1;
  for (const line of lines) {
    const cols = line.split(',');
    // Supports both new (LED_Code, LED_Number, Row, Column...) and old (LED_Number, Row, Column...)
    const isCodeFirst = cols[0]?.trim().startsWith('LED');
    const rowVal = Number(cols[isCodeFirst ? 2 : 1]);
    const colVal = Number(cols[isCodeFirst ? 3 : 2]);
    if (Number.isFinite(rowVal) && rowVal > maxRow) maxRow = rowVal;
    if (Number.isFinite(colVal) && colVal > maxCol) maxCol = colVal;
  }
  return {
    rows: Math.min(16, Math.max(1, maxRow)),
    cols: Math.min(24, Math.max(1, maxCol)),
  };
}

export type PsuMountSide = 'bottom' | 'top' | 'left' | 'right' | 'distributed';

export interface PsuPlacement {
  id: string;
  index: number;
  labelAr: string;
  ampsRating: number;
  voltage: 5 | 12 | 24;
  xCm: number;
  yCm: number;
  assignedNodeStart: number;
  assignedNodeEnd: number;
  estimatedWatts: number;
  estimatedAmps: number;
}

export interface PowerBranch {
  psuId: string;
  targetNodeIndex: number;
  targetCode: string;
  fromXCm: number;
  fromYCm: number;
  toXCm: number;
  toYCm: number;
  cableLengthMeters: number;
  wireGaugeMm2: '1.5mm²' | '2.5mm²' | '4mm²';
}

export interface LedCanvasNodeCoord {
  index: number;
  code: string;
  row: number;
  col: number;
  xCm: number;
  yCm: number;
  xPercent: number;
  yPercent: number;
  needsPowerInjection: boolean;
  assignedPsuIndex: number;
}

export interface LedCanvasWiringPlan {
  widthCm: number;
  heightCm: number;
  rows: number;
  cols: number;
  totalNodes: number;
  pitchXCm: number;
  pitchYCm: number;
  nodeCoords: LedCanvasNodeCoord[];
  psuUnits: PsuPlacement[];
  powerBranches: PowerBranch[];
  totalWatts: number;
  totalAmps: number;
  totalFeederCableMeters: number;
  injectionEveryNodes: number;
}

/**
 * Suggests clean LED matrix rows/cols proportional to entered board dimensions and LED pitch.
 */
export function suggestGridFromDimensions(
  widthCm: number,
  heightCm: number,
  led: LedSpec
): {
  rows: number;
  cols: number;
  pitchXCm: number;
  pitchYCm: number;
  estimatedFullBoardLeds: number;
} {
  const safeW = Math.max(30, Math.min(5000, Number(widthCm) || 300));
  const safeH = Math.max(20, Math.min(2000, Number(heightCm) || 100));
  const spacing = Math.max(3, led.recommendedSpacingCm);

  const rawCols = Math.max(2, Math.round(safeW / spacing));
  const rawRows = Math.max(1, Math.round(safeH / spacing));
  const estimatedFullBoardLeds = rawCols * rawRows;

  // Keep interactive grid readable while preserving true physical aspect ratio
  const ratio = safeW / safeH;
  const rows = Math.max(2, Math.min(14, Math.round(safeH / Math.max(spacing, safeH / 10))));
  const cols = Math.max(3, Math.min(28, Math.round(rows * ratio)));

  return {
    rows,
    cols,
    pitchXCm: Number((safeW / cols).toFixed(1)),
    pitchYCm: Number((safeH / rows).toFixed(1)),
    estimatedFullBoardLeds,
  };
}

/**
 * Computes physical LED coordinates, optimal PSU mounting points, and feeder wire paths.
 */
export function computeLedCanvasWiringPlan(params: {
  widthCm: number;
  heightCm: number;
  rows: number;
  cols: number;
  pattern: WiringPattern;
  ledId: LedCategoryId;
  mountSide: PsuMountSide;
  customPsuPositions?: Record<string, { xCm: number; yCm: number }>;
}): LedCanvasWiringPlan {
  const widthCm = Math.max(20, Math.min(5000, Number(params.widthCm) || 300));
  const heightCm = Math.max(20, Math.min(2000, Number(params.heightCm) || 100));
  const led = getLedById(params.ledId);
  const rawNodes = generateLedGridNodes(params.rows, params.cols, params.pattern, led.voltage);

  const safeRows = Math.max(1, Math.min(24, Math.floor(params.rows)));
  const safeCols = Math.max(1, Math.min(40, Math.floor(params.cols)));
  const pitchXCm = Number((widthCm / safeCols).toFixed(1));
  const pitchYCm = Number((heightCm / safeRows).toFixed(1));

  const totalNodes = rawNodes.length;
  const injectionEveryNodes = led.voltage === 5 ? 50 : led.voltage === 12 ? 100 : 150;

  const totalWatts = Number((totalNodes * led.wattsPerUnit).toFixed(1));
  const totalAmps = Number((totalWatts / led.voltage).toFixed(2));
  const safeAmps = totalAmps * 1.25;
  const psuCount = safeAmps > 33 ? Math.ceil(safeAmps / 33) : 1;
  const nodesPerPsu = Math.ceil(totalNodes / psuCount);

  const nodeCoords: LedCanvasNodeCoord[] = rawNodes.map((n) => {
    const psuIdx = Math.min(psuCount, Math.floor((n.index - 1) / nodesPerPsu) + 1);
    return {
      index: n.index,
      code: n.code,
      row: n.row,
      col: n.col,
      xCm: Number(((n.xPercent / 100) * widthCm).toFixed(1)),
      yCm: Number(((n.yPercent / 100) * heightCm).toFixed(1)),
      xPercent: n.xPercent,
      yPercent: n.yPercent,
      needsPowerInjection: n.needsPowerInjection,
      assignedPsuIndex: psuIdx,
    };
  });

  const edgeOffsetY = Math.max(12, Math.round(heightCm * 0.14));
  const edgeOffsetX = Math.max(14, Math.round(widthCm * 0.08));

  const psuUnits: PsuPlacement[] = [];
  for (let i = 1; i <= psuCount; i++) {
    const startIdx = (i - 1) * nodesPerPsu + 1;
    const endIdx = Math.min(totalNodes, i * nodesPerPsu);
    const segmentNodes = nodeCoords.filter((n) => n.index >= startIdx && n.index <= endIdx);
    const segWatts = Number((segmentNodes.length * led.wattsPerUnit).toFixed(1));
    const segAmps = Number((segWatts / led.voltage).toFixed(2));
    const ampsRating = pickRecommendedPsuAmps(segAmps);

    const avgX =
      segmentNodes.length > 0
        ? segmentNodes.reduce((acc, n) => acc + n.xCm, 0) / segmentNodes.length
        : (widthCm * i) / (psuCount + 1);
    const avgY =
      segmentNodes.length > 0
        ? segmentNodes.reduce((acc, n) => acc + n.yCm, 0) / segmentNodes.length
        : (heightCm * i) / (psuCount + 1);

    let defaultX = avgX;
    let defaultY = heightCm + edgeOffsetY;

    switch (params.mountSide) {
      case 'bottom':
        defaultX = psuCount === 1 ? widthCm / 2 : (widthCm * (i - 0.5)) / psuCount;
        defaultY = heightCm + edgeOffsetY;
        break;
      case 'top':
        defaultX = psuCount === 1 ? widthCm / 2 : (widthCm * (i - 0.5)) / psuCount;
        defaultY = -edgeOffsetY;
        break;
      case 'left':
        defaultX = -edgeOffsetX;
        defaultY = psuCount === 1 ? heightCm / 2 : (heightCm * (i - 0.5)) / psuCount;
        break;
      case 'right':
        defaultX = widthCm + edgeOffsetX;
        defaultY = psuCount === 1 ? heightCm / 2 : (heightCm * (i - 0.5)) / psuCount;
        break;
      case 'distributed':
        defaultX = avgX;
        defaultY = avgY;
        break;
    }

    const psuId = `PSU-${i}`;
    const custom = params.customPsuPositions?.[psuId];

    psuUnits.push({
      id: psuId,
      index: i,
      labelAr: `باور سبلاي #${i}`,
      ampsRating,
      voltage: led.voltage,
      xCm: Number((custom ? custom.xCm : defaultX).toFixed(1)),
      yCm: Number((custom ? custom.yCm : defaultY).toFixed(1)),
      assignedNodeStart: startIdx,
      assignedNodeEnd: endIdx,
      estimatedWatts: segWatts,
      estimatedAmps: segAmps,
    });
  }

  const powerBranches: PowerBranch[] = [];
  for (const psu of psuUnits) {
    const segNodes = nodeCoords.filter(
      (n) => n.index >= psu.assignedNodeStart && n.index <= psu.assignedNodeEnd
    );
    const targets = segNodes.filter(
      (n) => n.index === psu.assignedNodeStart || n.needsPowerInjection
    );

    for (const target of targets) {
      const manhattanCm = Math.abs(target.xCm - psu.xCm) + Math.abs(target.yCm - psu.yCm);
      const cableLengthMeters = Number((manhattanCm / 100 + 0.35).toFixed(2));
      const wireGaugeMm2: '1.5mm²' | '2.5mm²' | '4mm²' =
        psu.estimatedAmps > 24 || cableLengthMeters > 6
          ? '4mm²'
          : psu.estimatedAmps > 12 || cableLengthMeters > 3
          ? '2.5mm²'
          : '1.5mm²';

      powerBranches.push({
        psuId: psu.id,
        targetNodeIndex: target.index,
        targetCode: target.code,
        fromXCm: psu.xCm,
        fromYCm: psu.yCm,
        toXCm: target.xCm,
        toYCm: target.yCm,
        cableLengthMeters,
        wireGaugeMm2,
      });
    }
  }

  const totalFeederCableMeters = Number(
    powerBranches.reduce((sum, b) => sum + b.cableLengthMeters, 0).toFixed(2)
  );

  return {
    widthCm,
    heightCm,
    rows: safeRows,
    cols: safeCols,
    totalNodes,
    pitchXCm,
    pitchYCm,
    nodeCoords,
    psuUnits,
    powerBranches,
    totalWatts,
    totalAmps,
    totalFeederCableMeters,
    injectionEveryNodes,
  };
}

