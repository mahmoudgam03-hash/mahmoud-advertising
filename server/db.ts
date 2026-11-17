import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { hashPassword } from './auth';
import { sanitizeBackupFilename, verifyImageMagicBytes } from './cms-utils';
import type {
  AdminCmsBundle,
  CmsRevision,
  CmsSnapshotPayload,
  ContactMessage,
  ContactSettings,
  HomeCustomSection,
  PortfolioProject,
  PublicSiteData,
  QuoteRequest,
  QuoteStatus,
  SeoAndLegalSettings,
  ServiceItem,
  SiteContent,
  ThemeSettings,
} from '../src/shared/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'app.db');
export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const DEFAULT_THEME: ThemeSettings = {
  primaryBg: '#0A0B0E',
  surfaceBg: '#12141A',
  accentBlue: '#1D6BFF',
  accentGold: '#D4AF37',
  fontFamilyAr: 'Cairo',
  fontFamilyEn: 'Plus Jakarta Sans',
};

export const DEFAULT_SEO_LEGAL: SeoAndLegalSettings = {
  domainName: 'mahmoudshaaban.com',
  metaTitleAr: 'محمود شعبان للدعاية والإعلان | تصنيع اليفط والواجهات الإعلانية',
  metaTitleEn: 'Mahmoud Shaaban Advertising | Architectural Signage & Cladding',
  metaDescriptionAr:
    'شركة محمود شعبان للدعاية والإعلان: تصنيع الحروف البارزة الاستانلس والأكريليك، واجهات الكلادينج، النيون LED، الليد بروفايل، والهويات التجارية باحترافية.',
  metaDescriptionEn:
    'Mahmoud Shaaban Advertising: Precision 3D stainless & acrylic letters, ACP cladding facades, LED neon, LED profiles, and brand identity fabrication.',
  metaKeywordsAr: 'حروف استانلس, حروف أكريليك, واجهات كلادينج, يفط مضيئة, نيون LED, المنيا, بني مزار',
  metaKeywordsEn: '3D stainless letters, acrylic signage, ACP cladding, LED neon, Egypt signage',
  privacyPolicyAr: `1. البيانات التي نقوم بجمعها
عند إرسال طلب عرض سعر أو رسالة تواصل عبر الموقع، نقوم بجمع الاسم، رقم الهاتف، البريد الإلكتروني (إن وجد)، مواصفات اليافطة والمقاسات المطلوبة، بالإضافة إلى أي صورة مرفقة لموقع التركيب أو التصميم المبدئي.

2. كيفية استخدام البيانات
تُستخدم جميع البيانات والصور حصرياً لإعداد المقايسات الهندسية، احتساب التكلفة الدقيقة، التواصل معكم عبر الهاتف أو واتساب لتحديد موعد المعاينة، وتنفيذ الطلب المتفق عليه. لا نقوم ببيع أو مشاركة بيانات العملاء مع أي جهات تسويقية خارجية.

3. حفظ الصور والملفات المرفقة
يتم تخزين الصور المرفوعة لرفع المقاسات أو التصميمات بشكل آمن على خادم الشركة ولا يطلع عليها سوى فريق الهندسة والإدارة المختص بمراجعة الطلب.

4. حقوق العميل وحذف البيانات
يحق لكم في أي وقت طلب تعديل بيانات طلبكم أو حذف صور الموقع المرفوعة وبيانات التواصل من سجلاتنا عبر مراسلتنا أو الاتصال المباشر بإدارة الشركة.`,
  privacyPolicyEn: `1. Information We Collect
When you submit a quote request or contact inquiry, we collect your name, phone number, optional email address, signage specifications and dimensions, and any site photo or sketch you choose to upload.

2. How We Use Your Information
Your information and uploaded photos are used strictly to prepare engineering estimates, coordinate site surveys via phone or WhatsApp, and execute contracted signage projects. We never sell or share client data with third-party marketers.

3. Storage of Uploaded Site Photos
Uploaded site images and design references are stored securely on our server and accessed solely by authorized engineering and management staff reviewing your request.

4. Data Access & Deletion Rights
You may request to update or remove your quote records, contact information, or uploaded site images at any time by contacting our management team directly.`,
  termsConditionsAr: `1. المقايسات وعروض الأسعار
تعتبر عروض الأسعار المقدمة عبر الموقع استرشادية بناءً على المقاسات والمواصفات المرسلة من العميل، ويتم تأكيد السعر النهائي ومواعيد التسليم بعد المعاينة الهندسية والمطابقة على أرض الواقع.

2. اعتماد التصميم والخامات
لا يبدأ التصنيع داخل الورشة إلا بعد اعتماد التصميم النهائي وألوان الخامات (الاستانلس، الأكريليك، الكلادينج، أو الفلكس) ونوع الإضاءة كتابياً أو عبر قناة التواصل المعتمدة.

3. مدة التنفيذ والتركيب الميداني
تلتزم شركة محمود شعبان للدعاية والإعلان بالجدول الزمني المتفق عليه في أمر التشغيل، مع توفير فرق تركيب متخصصة ومجهزة لأعمال التثبيت والتوصيلات الكهربائية الآمنة في الموقع.

4. الضمان والصيانة
تخضع أعمال الحروف البارزة والكلادينج ووحدات الإضاءة LED لضمان الشركة المتفق عليه ضد عيوب التصنيع أو الإضاءة، ولا يشمل الضمان الأعطال الناتجة عن تذبذب التيار الكهربائي الخارجي أو الكسر المتعمد.

5. التعديلات وتراخيص الواجهات
يتحمل العميل مسؤولية استخراج تصاريح الإعلان والحي المختصة لموقع التركيب، ما لم يُنص في الاتفاق على غير ذلك.`,
  termsConditionsEn: `1. Quotes & Site Measurements
Quotes generated from online submissions are preliminary estimates based on client-provided measurements. Final pricing and fabrication schedules are confirmed following an on-site engineering survey.

2. Design & Material Approval
Workshop fabrication begins only after written confirmation of the final artwork, material gauges (304 stainless steel, cast acrylic, ACP cladding, or flex), colors, and LED lighting setup.

3. Fabrication & On-Site Installation
Mahmoud Shaaban Advertising commits to the agreed production timeline and deploys equipped installation crews for structural mounting and weather-sealed electrical commissioning.

4. Warranty Coverage
3D lettering, ACP cladding assemblies, and IP67 LED modules carry the stated fabrication warranty against manufacturing defects. Warranty excludes damage from external power surges or physical impact.

5. Municipal Permits
Obtaining local municipal signage permits for the storefront or building facade remains the client’s responsibility unless explicitly contracted otherwise.`,
};

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      description_en TEXT NOT NULL,
      specs_ar TEXT NOT NULL,
      specs_en TEXT NOT NULL,
      materials_ar TEXT NOT NULL DEFAULT '',
      materials_en TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL DEFAULT '',
      show_price INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      category TEXT NOT NULL,
      service_slug TEXT NOT NULL,
      client_name TEXT NOT NULL,
      location_ar TEXT NOT NULL,
      location_en TEXT NOT NULL,
      dimensions TEXT NOT NULL,
      lighting_ar TEXT NOT NULL,
      lighting_en TEXT NOT NULL,
      materials_ar TEXT NOT NULL,
      materials_en TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      description_en TEXT NOT NULL,
      completion_year TEXT NOT NULL,
      image_url TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service_type TEXT NOT NULL,
      width_cm TEXT NOT NULL DEFAULT '',
      height_cm TEXT NOT NULL DEFAULT '',
      dimensions TEXT NOT NULL,
      material_type TEXT NOT NULL DEFAULT '',
      desired_color TEXT NOT NULL DEFAULT '',
      lighting_type TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT '',
      image_path TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS theme_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS home_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT UNIQUE NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      subtitle_ar TEXT NOT NULL DEFAULT '',
      subtitle_en TEXT NOT NULL DEFAULT '',
      body_ar TEXT NOT NULL,
      body_en TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT '',
      button_text_ar TEXT NOT NULL DEFAULT '',
      button_text_en TEXT NOT NULL DEFAULT '',
      button_url TEXT NOT NULL DEFAULT '/quote',
      layout_style TEXT NOT NULL DEFAULT 'split',
      sort_order INTEGER NOT NULL DEFAULT 0,
      visible INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS seo_legal_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cms_snapshots (
      key TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cms_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      summary_ar TEXT NOT NULL,
      summary_en TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS studio_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      board_input_json TEXT NOT NULL,
      led_config_json TEXT NOT NULL,
      ai_report_json TEXT NOT NULL DEFAULT '',
      confirmed_by_user INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS engineer_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_ar TEXT NOT NULL,
      caption_ar TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  migrateSchemaColumns();
  seedAdminIfEmpty();
  seedServicesIfEmpty();
  seedProjectsIfEmpty();
  seedEngineerPhotosIfEmpty();
  seedContentIfEmpty();
  seedContactIfEmpty();
  seedThemeIfEmpty();
  seedSeoLegalIfEmpty();
  seedQuotesIfEmpty();
  ensureInitialPublishedSnapshot();
}

function addColumnIfMissing(table: string, col: string, def: string): boolean {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  const names = new Set(columns.map((c) => c.name));
  if (!names.has(col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    return true;
  }
  return false;
}

function migrateSchemaColumns(): void {
  addColumnIfMissing('admins', 'role', "TEXT NOT NULL DEFAULT 'admin'");

  addColumnIfMissing('quotes', 'width_cm', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('quotes', 'height_cm', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('quotes', 'material_type', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('quotes', 'desired_color', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('quotes', 'lighting_type', "TEXT NOT NULL DEFAULT ''");

  addColumnIfMissing('services', 'materials_ar', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('services', 'materials_en', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('services', 'price', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('services', 'show_price', 'INTEGER NOT NULL DEFAULT 0');

  const addedProjectSort = addColumnIfMissing('projects', 'sort_order', 'INTEGER NOT NULL DEFAULT 0');
  if (addedProjectSort) {
    const existing = db
      .prepare('SELECT id FROM projects ORDER BY featured DESC, id DESC')
      .all() as { id: number }[];
    const upd = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');
    existing.forEach((row, idx) => {
      upd.run(idx + 1, row.id);
    });
  }
}

function seedAdminIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number }).count;
  if (count === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@mahmoudshaaban.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@2026';
    db.prepare('INSERT INTO admins (email, name, password_hash, role) VALUES (?, ?, ?, ?)').run(
      email,
      'محمود شعبان',
      hashPassword(password),
      'admin'
    );
  }
}

function seedServicesIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }).count;
  if (count > 0) return;

  const initialServices: Omit<ServiceItem, 'id'>[] = [
    {
      slug: 'stainless-letters',
      category: 'letters',
      titleAr: 'حروف استانلس',
      titleEn: 'Stainless Steel 3D Letters',
      descriptionAr: 'تصنيع حروف بارزة من الاستانلس ستيل المقاوم للصدأ (ذهبي لامع، مطفي، وفضي) بقص ليزر دقيق ولحام غير مرئي مع إضاءة خلفية Halo LED.',
      descriptionEn: 'Precision fiber-laser cut 304 stainless steel 3D letters in brushed gold, mirror gold, and chrome finishes with warm Halo LED backlighting.',
      specsAr: 'استانلس 304 · سماكة 1.2 مم · إضاءة IP67 · ضمان 5 سنوات',
      specsEn: '304 Stainless Steel · 1.2mm Gauge · IP67 LEDs · 5-Year Warranty',
      materialsAr: 'استانلس ستيل 304 مقاوم للصدأ · محولات 12V',
      materialsEn: '304 Marine-Grade Stainless Steel · 12V Drivers',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_stainless_letters_1794750814371.jpg',
      featured: true,
      sortOrder: 1,
    },
    {
      slug: 'acrylic-smart',
      category: 'letters',
      titleAr: 'حروف أكريليك وسمارت',
      titleEn: 'Acrylic & Smart Channel Letters',
      descriptionAr: 'حروف أكريليك مستوردة وحروف سمارت مدمجة بإضاءة أمامية وجانبية عالية السطوع وتوزيع ضوئي متجانس بدون بقع داكنة.',
      descriptionEn: 'Imported cast acrylic and smart channel letters delivering crisp front and edge-lit illumination with uniform zero-hotspot light diffusion.',
      specsAr: 'أكريليك 10 مم · شرائح سامسونج LED · ألوان متعددة',
      specsEn: '10mm Cast Acrylic · Samsung LED Modules · Custom Colorways',
      materialsAr: 'أكريليك كاست تايواني · إطارات ألومنيوم سمارت',
      materialsEn: 'Imported Cast Acrylic · Slim Smart Aluminum Returns',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_acrylic_smart_1794750814442.jpg',
      featured: true,
      sortOrder: 2,
    },
    {
      slug: 'illuminated-3d',
      category: 'letters',
      titleAr: 'حروف بارزة مضيئة',
      titleEn: 'Illuminated 3D Channel Signage',
      descriptionAr: 'حلول متكاملة للحروف المجسمة ثلاثية الأبعاد بإطارات ألومنيوم أو صاج مجلفن وإضاءة ليلية قوية تمنح واجهتك حضوراً بارزاً.',
      descriptionEn: 'Heavy-duty illuminated 3D channel letters engineered with weatherproof aluminum returns and high-lumen night visibility.',
      specsAr: 'إضاءة أمامية وخلفية · محولات 12V معزولة · مقاوم للأمطار',
      specsEn: 'Front & Halo Lit · Sealed 12V Drivers · All-Weather Rated',
      materialsAr: 'صاج مجلفن / ألومنيوم + واجهة أكريليك',
      materialsEn: 'Galvanized / Aluminum Returns + Cast Acrylic Face',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_acrylic_smart_1794750814442.jpg',
      featured: false,
      sortOrder: 3,
    },
    {
      slug: 'cladding-facades',
      category: 'facades',
      titleAr: 'واجهات كلادينج',
      titleEn: 'ACP Cladding Facades',
      descriptionAr: 'تكسية واجهات المباني والمعارض التجارية بألواح الألومنيوم المركب (كلادينج) المقاومة للحريق والعوامل الجوية مع شاسيهات حديد مجلفن.',
      descriptionEn: 'Architectural aluminum composite panel (ACP) facade cladding mounted on structural galvanized steel sub-frames with fire-retardant cores.',
      specsAr: 'ألواح 4 مم PVDF · شاسيه حديد معالج · عزل حراري ومطري',
      specsEn: '4mm PVDF ACP · Galvanized Subframe · Thermal & Weather Seal',
      materialsAr: 'ألواح كلادينج 4 مم PVDF · شاسيه حديد 4×4',
      materialsEn: '4mm PVDF ACP Panels · Galvanized Steel Subframe',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_cladding_facade_1794750815768.jpg',
      featured: true,
      sortOrder: 4,
    },
    {
      slug: 'flex-signs',
      category: 'print',
      titleAr: 'يفط فلكس',
      titleEn: 'Backlit Flex-Face Lightboxes',
      descriptionAr: 'تصنيع علب إعلانية مضيئة بواجهات فلكس مشدودة بدقة عالية مع طباعة UV مقاومة لأشعة الشمس وإضاءة LED داخلية موفرة للطاقة.',
      descriptionEn: 'Tensioned backlit flex-face lightboxes featuring UV-resistant high-DPI printing and energy-efficient internal LED arrays.',
      specsAr: 'فلكس كوري 510 جم · طباعة UV · هيكل ألومنيوم أو حديد',
      specsEn: '510gsm Korea Flex · UV Print · Heavy-Duty Box Frame',
      materialsAr: 'فلكس كوري مستورد · طباعة UV ثابتة',
      materialsEn: '510gsm Korean Backlit Flex · UV-Cured Inks',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_flex_banners_1794750816387.jpg',
      featured: false,
      sortOrder: 5,
    },
    {
      slug: 'mirror-signs',
      category: 'interior',
      titleAr: 'يفط مرايا',
      titleEn: 'Mirror Finish Reception Signs',
      descriptionAr: 'يفط استقبال ومكاتب فاخرة من الأكريليك المرايا الذهبي والفضي والاستانلس المصقول بقطع ليزر فائق الدقة للمقرات والشركات.',
      descriptionEn: 'Executive lobby and reception signage precision-cut from mirror-gold acrylic and polished steel for corporate headquarters and clinics.',
      specsAr: 'أكريليك مرايا ذهبي وفضي · تثبيت مسامير استانلس أو مخفي',
      specsEn: 'Mirror Gold & Silver Acrylic · Concealed or Standoff Mounts',
      materialsAr: 'أكريليك مرايا 5 مم + قاعدة كلير أو فوم PVC',
      materialsEn: '5mm Mirror Acrylic + Clear / PVC Backplate',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_mirror_signs_1794750817941.jpg',
      featured: true,
      sortOrder: 6,
    },
    {
      slug: 'led-profile',
      category: 'lighting',
      titleAr: 'ليد بروفايل',
      titleEn: 'Architectural LED Profile',
      descriptionAr: 'توريد وتركيب خطوط إضاءة ليد بروفايل الغاطسة والبارزة داخل واجهات الكلادينج والأسقف لإبراز الخطوط المعمارية للواجهة.',
      descriptionEn: 'Recessed and surface-mounted aluminum LED profile linear lighting integrated seamlessly into cladding joints and architectural cornices.',
      specsAr: 'بروفايل ألومنيوم مؤكسد · ناشر ضوئي Opalescent · CRI > 90',
      specsEn: 'Anodized Aluminum Channel · Opal Diffuser · High CRI > 90',
      materialsAr: 'قطاعات ألومنيوم مؤكسدة + شريط LED عالي الكثافة',
      materialsEn: 'Anodized Aluminum Profile + High-CRI LED Strip',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/hero_luxury_signage_1794750813882.jpg',
      featured: false,
      sortOrder: 7,
    },
    {
      slug: 'led-neon',
      category: 'lighting',
      titleAr: 'نيون LED',
      titleEn: 'Flexible LED Neon Signage',
      descriptionAr: 'تشكيل شعارات وعبارات فنية بإضاءة نيون LED السيليكوني الآمن على قواعد أكريليك شفافة أو داكنة للمحلات والكافيهات والمعارض.',
      descriptionEn: 'Hand-shaped silicone flexible LED neon artworks mounted on CNC-routed clear or matte charcoal acrylic backplates.',
      specsAr: 'سيليكون مرن غير قابل للكسر · 12 فولت آمن · تحكم بالسطوع',
      specsEn: 'Shatterproof Silicone Neon · Safe 12V · Dimmable Control',
      materialsAr: 'نيون سيليكون مرن IP65 + أكريليك CNC 8 مم',
      materialsEn: 'Flexible Silicone Neon + 8mm CNC Acrylic Backing',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_neon_led_1794750816695.jpg',
      featured: true,
      sortOrder: 8,
    },
    {
      slug: 'banner-printing',
      category: 'print',
      titleAr: 'طباعة بنرات',
      titleEn: 'Large-Format Banner Printing',
      descriptionAr: 'طباعة إعلانية واسعة التنسيق للبنرات والفينيل والسي ثرو بأحبار ثابتة عالية الدقة مع خدمات التشطيب والحلقات المعدنية.',
      descriptionEn: 'High-resolution outdoor banner, vinyl, and perforated window graphics printing with weather-resistant inks and reinforced hems.',
      specsAr: 'دقة 1440 DPI · أحبار مقاومة للشمس والمطر · جميع المقاسات',
      specsEn: '1440 DPI Resolution · Weatherproof Inks · Seamless Oversize',
      materialsAr: 'بنر كوري 440 جم / فينيل ألماني / سي ثرو',
      materialsEn: '440gsm Banner / Cast Vinyl / One-Way Vision',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_flex_banners_1794750816387.jpg',
      featured: false,
      sortOrder: 9,
    },
    {
      slug: 'brand-identity',
      category: 'design',
      titleAr: 'تصميم الشعارات والهويات التجارية',
      titleEn: 'Logo & Brand Identity Design',
      descriptionAr: 'بناء الهوية البصرية الكاملة للشركات من تصميم الشعار ودليل الهوية إلى تطبيقاتها على الواجهات والمطبوعات التجارية الفاخرة.',
      descriptionEn: 'End-to-end corporate identity systems covering bespoke logo marks, brand guidelines, luxury print stationery, and signage adaptation.',
      specsAr: 'ملفات فيكتور 3D/2D · دليل استخدام كامل · تصورات واقعية للواجهة',
      specsEn: 'Vector & 3D Mockups · Brand Book · Facade Visualization',
      materialsAr: 'تسليم AI / PDF / EPS + محاكاة 3D للواجهة',
      materialsEn: 'Vector AI / PDF Deliverables + 3D Facade Render',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_brand_identity_1794750817794.jpg',
      featured: false,
      sortOrder: 10,
    },
    {
      slug: 'facade-installation',
      category: 'facades',
      titleAr: 'تنفيذ وتركيب الواجهات',
      titleEn: 'Turnkey Facade Fabrication & Installation',
      descriptionAr: 'إشراف هندسي وتنفيذ ميداني متكامل من المعاينة والرفع المساحي حتى التركيب بالرافعات والاختبار الكهربائي النهائي في الموقع.',
      descriptionEn: 'Complete site survey, structural engineering, heavy-lift rigging, electrical wiring, and final commissioning by certified installation crews.',
      specsAr: 'معاينة ميدانية · سقالات وأوناش · صيانة دورية وضمان معتمد',
      specsEn: 'On-Site Survey · Rigging & Wiring · Post-Install Maintenance',
      materialsAr: 'أعمال حدادة وتشطيب وكهرباء كاملة',
      materialsEn: 'Full Structural Steel, Electrical & Rigging Works',
      price: '',
      showPrice: false,
      imageUrl: '/src/assets/images/service_cladding_facade_1794750815768.jpg',
      featured: false,
      sortOrder: 11,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO services (
      slug, category, title_ar, title_en, description_ar, description_en,
      specs_ar, specs_en, materials_ar, materials_en, price, show_price,
      image_url, featured, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of initialServices) {
    insert.run(
      s.slug,
      s.category,
      s.titleAr,
      s.titleEn,
      s.descriptionAr,
      s.descriptionEn,
      s.specsAr,
      s.specsEn,
      s.materialsAr,
      s.materialsEn,
      s.price,
      s.showPrice ? 1 : 0,
      s.imageUrl,
      s.featured ? 1 : 0,
      s.sortOrder
    );
  }
}

function seedProjectsIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
  const legacySample = db
    .prepare('SELECT id FROM projects WHERE title_ar = ?')
    .get('واجهة برج أرسيلور الإداري بالكلادينج والليد بروفايل') as { id: number } | undefined;

  if (count > 0 && !legacySample) return;
  if (legacySample && count <= 8) {
    db.prepare('DELETE FROM projects').run();
  } else if (count > 0) {
    return;
  }

  const initialProjects: Omit<PortfolioProject, 'id'>[] = [
    {
      titleAr: 'نموذج استرشادي — حروف استانلس ذهبي بإضاءة خلفية',
      titleEn: 'Category Sample — Gold 304 Stainless Halo Letters',
      category: 'stainless-letters',
      serviceSlug: 'stainless-letters',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '380 × 150 سم',
      lightingAr: 'إضاءة LED خلفية دافئة 2700K بهالة ضوئية ناعمة',
      lightingEn: '2700K Warm Halo Backlight Projection',
      materialsAr: 'استانلس ستيل 304 ذهبي مصقول بسماكة 1.2 مم وعمق 6 سم',
      materialsEn: 'Brushed Gold 304 Stainless Steel (1.2mm Gauge, 6cm Return)',
      descriptionAr: 'نموذج استرشادي يوضح تشطيب حروف الاستانلس المقاومة للصدأ والمقصوصة بالليزر مع تثبيت مخفي وإضاءة خلفية فاخرة.',
      descriptionEn: 'Category showcase sample illustrating precision laser-cut 304 stainless steel 3D letters with concealed standoffs and warm halo backlighting.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/service_stainless_letters_1794750814371.jpg',
      featured: true,
      sortOrder: 1,
    },
    {
      titleAr: 'نموذج استرشادي — حروف أكريليك مجسمة مضيئة',
      titleEn: 'Category Sample — Illuminated Cast Acrylic Letters',
      category: 'acrylic-letters',
      serviceSlug: 'acrylic-smart',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '320 × 130 سم',
      lightingAr: 'إضاءة LED أمامية متجانسة بدون بقع داكنة',
      lightingEn: 'Uniform Zero-Hotspot Front-Lit LED Illumination',
      materialsAr: 'أكريليك كاست مستورد 10 مم + شرائط LED معزولة IP67',
      materialsEn: '10mm Imported Cast Acrylic + IP67 Sealed LED Modules',
      descriptionAr: 'نموذج استرشادي لتصميم وتصنيع الحروف الأكريليك المضيئة بسطوع ليلي عالٍ وألوان متعددة للواجهات التجارية.',
      descriptionEn: 'Category showcase sample for cast acrylic illuminated channel letters engineered for crisp daytime edges and bright nighttime legibility.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/service_acrylic_smart_1794750814442.jpg',
      featured: true,
      sortOrder: 2,
    },
    {
      titleAr: 'نموذج استرشادي — حروف سمارت بإضاءة مزدوجة',
      titleEn: 'Category Sample — Smart Edge-Lit Channel Letters',
      category: 'smart-letters',
      serviceSlug: 'illuminated-3d',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '300 × 120 سم',
      lightingAr: 'إضاءة سمارت أمامية وجانبية باللون الأزرق الكهربائي والأبيض',
      lightingEn: 'Dual Front & Electric Blue Edge-Lit Smart LED Array',
      materialsAr: 'وجه أكريليك مع إطارات ألومنيوم أنحف وإضاءة عالية الكثافة',
      materialsEn: 'Slim Aluminum Trim + Cast Acrylic Diffuser Face',
      descriptionAr: 'نموذج استرشادي لحروف السمارت الحديثة ذات الحواف المضيئة الدقيقة والتشطيب المتقن للعيادات والمعارض الفاخرة.',
      descriptionEn: 'Category showcase sample demonstrating slim-profile smart letters combining crisp white faces with electric blue ambient edge illumination.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/service_acrylic_smart_1794750814442.jpg',
      featured: true,
      sortOrder: 3,
    },
    {
      titleAr: 'نموذج استرشادي — واجهات كلادينج فاخرة وخطوط ضوئية',
      titleEn: 'Category Sample — Luxury Charcoal ACP Cladding Facade',
      category: 'cladding-facades',
      serviceSlug: 'cladding-facades',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '1200 × 450 سم',
      lightingAr: 'تكامل خطوط ليد بروفايل غاطسة باللون الأزرق والذهبي',
      lightingEn: 'Recessed Electric Blue & Warm Gold Linear LED Channels',
      materialsAr: 'ألواح كلادينج 4 مم PVDF فحمي مطفي + شاسيه حديد مجلفن',
      materialsEn: '4mm Matte Charcoal PVDF ACP + Galvanized Steel Subframe',
      descriptionAr: 'نموذج استرشادي لتكسية الواجهات التجارية بألواح الكلادينج المقاومة للعوامل الجوية مع دمج إضاءة معمارية خطية.',
      descriptionEn: 'Category showcase sample for architectural aluminum composite panel cladding mounted on galvanized steel framing with linear lighting.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/service_cladding_facade_1794750815768.jpg',
      featured: true,
      sortOrder: 4,
    },
    {
      titleAr: 'نموذج استرشادي — يفط فلكس مضيئة وبنرات واسعة',
      titleEn: 'Category Sample — Backlit Tensioned Flex Lightbox',
      category: 'flex-signs',
      serviceSlug: 'flex-signs',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '600 × 200 سم',
      lightingAr: 'إضاءة LED داخلية متوزعة بالتساوي 6500K',
      lightingEn: 'Balanced Internal 6500K Backlit LED Matrix',
      materialsAr: 'فلكس كوري 510 جم بطباعة UV + علبة صاج مجلفن وألومنيوم',
      materialsEn: '510gsm Korean Backlit Flex + UV Ink + Aluminum Frame',
      descriptionAr: 'نموذج استرشادي لعلب الفلكس المضيئة ذات الشد المحكم والطباعة عالية الدقة المقاومة لأشعة الشمس والأمطار.',
      descriptionEn: 'Category showcase sample for weather-resistant tensioned flex-face lightboxes engineered for crisp high-contrast visibility.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/service_flex_banners_1794750816387.jpg',
      featured: false,
      sortOrder: 5,
    },
    {
      titleAr: 'نموذج استرشادي — يفط مرايا ذهبية وفضية للاستقبال',
      titleEn: 'Category Sample — Mirror Gold & Silver Reception Signage',
      category: 'mirror-signs',
      serviceSlug: 'mirror-signs',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '240 × 120 سم',
      lightingAr: 'سبوت لايت معماري موجه يبرز الانعكاس المعدني',
      lightingEn: 'Directional Architectural Wash on Mirror Acrylic',
      materialsAr: 'أكريليك مرايا ذهبي وفضي 5 مم مقصوص بالليزر على قاعدة داكنة',
      materialsEn: '5mm Laser-Cut Mirror Gold & Chrome Acrylic',
      descriptionAr: 'نموذج استرشادي ليفط المكاتب وبهو الاستقبال المنفذة بأكريليك المرايا العاكس لإضفاء طابع فخم على المساحات الداخلية.',
      descriptionEn: 'Category showcase sample for executive lobby and clinic reception signs crafted from precision-cut mirror gold and chrome acrylic.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/service_mirror_signs_1794750817941.jpg',
      featured: false,
      sortOrder: 6,
    },
    {
      titleAr: 'نموذج استرشادي — إضاءة LED ونيون سيليكوني احترافي',
      titleEn: 'Category Sample — Architectural LED Profile & Silicone Neon',
      category: 'led-lighting',
      serviceSlug: 'led-neon',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '260 × 110 سم',
      lightingAr: 'نيون LED مرن ثنائي اللون (أزرق كهربائي + ذهبي دافئ)',
      lightingEn: 'Dual-Color Flexible 12V Silicone LED Neon',
      materialsAr: 'سيليكون مرن غير قابل للكسر + قاعدة أكريليك CNC شفافة',
      materialsEn: 'Shatterproof Silicone Neon on 8mm CNC Clear Acrylic',
      descriptionAr: 'نموذج استرشادي لتشكيل الشعارات والعبارات المضيئة بالنيون السيليكوني وخطوط الليد بروفايل عالية الأمان.',
      descriptionEn: 'Category showcase sample for bespoke silicone LED neon typography and anodized aluminum LED profile illumination.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/service_neon_led_1794750816695.jpg',
      featured: true,
      sortOrder: 7,
    },
    {
      titleAr: 'نموذج استرشادي — واجهات محلات تجارية متكاملة',
      titleEn: 'Category Sample — Complete Commercial Storefront Facade',
      category: 'commercial-storefronts',
      serviceSlug: 'facade-installation',
      clientName: 'نموذج استرشادي للتصنيف',
      locationAr: 'المنيا · مواصفات قياسية',
      locationEn: 'Minya · Standard Fabrication Spec',
      dimensions: '1000 × 380 سم',
      lightingAr: 'توليفة ليد بروفايل مع حروف بارزة مضيئة مزدوجة',
      lightingEn: 'Integrated Facade LED Profile + Halo Channel Letters',
      materialsAr: 'تكسية كلادينج + حروف استانلس وأكريليك بارزة',
      materialsEn: 'ACP Storefront Cladding + Illuminated 3D Lettering',
      descriptionAr: 'نموذج استرشادي لتنفيذ واجهة محل تجاري متكاملة تشمل التصميم ثلاثي الأبعاد والكلادينج والحروف البارزة والتركيب الميداني.',
      descriptionEn: 'Category showcase sample for turnkey commercial storefront transformation uniting cladding, 3D lettering, and night illumination.',
      completionYear: '2026',
      imageUrl: '/src/assets/images/hero_luxury_signage_1794750813882.jpg',
      featured: true,
      sortOrder: 8,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO projects (
      title_ar, title_en, category, service_slug, client_name,
      location_ar, location_en, dimensions, lighting_ar, lighting_en,
      materials_ar, materials_en, description_ar, description_en,
      completion_year, image_url, featured, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of initialProjects) {
    insert.run(
      p.titleAr,
      p.titleEn,
      p.category,
      p.serviceSlug,
      p.clientName,
      p.locationAr,
      p.locationEn,
      p.dimensions,
      p.lightingAr,
      p.lightingEn,
      p.materialsAr,
      p.materialsEn,
      p.descriptionAr,
      p.descriptionEn,
      p.completionYear,
      p.imageUrl,
      p.featured ? 1 : 0,
      p.sortOrder
    );
  }
}

function seedContentIfEmpty(): void {
  const defaults: SiteContent = {
    companyNameAr: 'محمود شعبان للدعاية والإعلان',
    companyNameEn: 'Mahmoud Shaaban Advertising',
    logoUrl: '',
    heroKickerAr: 'محمود شعبان للدعاية والإعلان · Luxury Architectural Signage',
    heroKickerEn: 'Mahmoud Shaaban Advertising · Luxury Architectural Signage',
    heroTitleAr: 'نصنع لك حضوراً لا يُنسى',
    heroTitleEn: 'We Craft an Unforgettable Presence',
    heroSubtitleAr: 'نحول أفكارك إلى واجهات إعلانية استثنائية',
    heroSubtitleEn: 'Transforming your ideas into extraordinary illuminated signage',
    heroBgImageUrl: '/src/assets/images/hero_luxury_signage_1794750813882.jpg',
    heroPrimaryBtnTextAr: 'استكشف أعمالنا',
    heroPrimaryBtnTextEn: 'Explore Portfolio',
    heroPrimaryBtnUrl: '/portfolio',
    heroSecondaryBtnTextAr: 'اطلب عرض سعر',
    heroSecondaryBtnTextEn: 'Request a Quote',
    heroSecondaryBtnUrl: '/quote',
    ctaBannerTitleAr: 'هل لديك واجهة محل أو مقر شركة جاهز للتنفيذ؟',
    ctaBannerTitleEn: 'Ready to Fabricate Your Commercial Facade or Sign?',
    ctaBannerSubtitleAr:
      'أرسل المقاسات وصورة الموقع الآن للحصول على مقايسة فنية وعرض سعر مفصل خلال 24 ساعة.',
    ctaBannerSubtitleEn:
      'Send your dimensions and site photo today to receive a detailed fabrication quote within 24 hours.',
    ctaBannerBtnTextAr: 'اطلب عرض سعر الآن',
    ctaBannerBtnTextEn: 'Request a Quote Now',
    ctaBannerBtnUrl: '/quote',
    aboutTitleAr: 'خبرة ميدانية وهندسية في تصنيع اليفط والواجهات منذ أكثر من 12 عاماً',
    aboutTitleEn: 'Over 12 Years of Precision Signage & Architectural Facade Fabrication',
    aboutStoryAr:
      'تأسست شركة محمود شعبان للدعاية والإعلان لتقديم حلول تصنيع متكاملة تجمع بين دقة الورش الهندسية الحديثة وجماليات التصميم التجاري الفاخر. نعتمد على خامات معتمدة، قص ليزر وCNC فائق الدقة، وأنظمة إضاءة LED موفرة وعالية العمر الافتراضي.',
    aboutStoryEn:
      'Mahmoud Shaaban Advertising delivers end-to-end signage fabrication uniting modern CNC & laser workshops with luxury architectural aesthetics. Every facade is built with certified metals, cast acrylics, and weather-sealed LED modules.',
    qualityPromiseAr:
      'نلتزم بضمان فعلي على الإضاءة والخامات، مع تسليم هندسي دقيق ومطابق للمعايير الكهربائية والأمان الإنشائي.',
    qualityPromiseEn:
      'Every project is backed by a written warranty covering structural mounting, metal finishes, and IP67-rated LED electrical systems.',
    yearsExperience: '12+',
    completedProjectsCount: '850+',
    warrantyYears: '5',
  };

  const insert = db.prepare('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaults)) {
    insert.run(k, v);
  }
}

function seedContactIfEmpty(): void {
  const defaults: ContactSettings = {
    phone: '01155709023',
    whatsapp: '01155709023',
    email: 'mahmoudgam03@gmail.com',
    facebookUrl: 'https://www.facebook.com',
    addressAr: 'محافظة المنيا، بني مزار، بجوار مدرسة السلام الخاصة',
    addressEn: 'Beni Mazar, Minya Governorate, next to El-Salam Private School',
    mapLat: '28.4967',
    mapLng: '30.8003',
    workingHoursAr: 'السبت – الخميس: 9:00 صباحاً – 8:00 مساءً',
    workingHoursEn: 'Saturday – Thursday: 9:00 AM – 8:00 PM',
  };

  const insert = db.prepare('INSERT OR IGNORE INTO contact_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaults)) {
    insert.run(k, v);
  }
}

function seedThemeIfEmpty(): void {
  const insert = db.prepare('INSERT OR IGNORE INTO theme_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(DEFAULT_THEME)) {
    insert.run(k, v);
  }
}

function seedSeoLegalIfEmpty(): void {
  const insert = db.prepare('INSERT OR IGNORE INTO seo_legal_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(DEFAULT_SEO_LEGAL)) {
    insert.run(k, v);
  }
}

function seedQuotesIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) as count FROM quotes').get() as { count: number }).count;
  if (count === 0) {
    db.prepare(`
      INSERT INTO quotes (
        reference_code, customer_name, phone, service_type,
        width_cm, height_cm, dimensions, material_type, desired_color, lighting_type,
        details, image_path, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'MSA-2026-101',
      'طلب استرشادي للنظام',
      '01155709023',
      'حروف استانلس',
      '500',
      '140',
      '500 × 140 سم',
      'استانلس 304 + كلادينج',
      'ذهبي لامع على خلفية فحمية',
      'إضاءة خلفية هالة LED دافئة',
      'طلب استرشادي مبدئي لتوضيح عرض الطلبات داخل لوحة التحكم.',
      null,
      'in_progress'
    );
  }
}

function ensureInitialPublishedSnapshot(): void {
  const existing = db.prepare('SELECT key FROM cms_snapshots WHERE key = ?').get('published');
  const draft = getFullDraftSnapshot();
  if (!existing) {
    db.prepare('INSERT INTO cms_snapshots (key, payload_json, updated_at) VALUES (?, ?, ?)').run(
      'published',
      JSON.stringify(draft),
      new Date().toISOString()
    );
  }

  const revCount = (db.prepare('SELECT COUNT(*) as count FROM cms_revisions').get() as { count: number }).count;
  if (revCount === 0) {
    db.prepare(
      'INSERT INTO cms_revisions (action_type, summary_ar, summary_en, admin_email, snapshot_json) VALUES (?, ?, ?, ?, ?)'
    ).run(
      'publish',
      'النسخة الأساسية المعتمدة للموقع',
      'Initial published site baseline',
      process.env.ADMIN_EMAIL || 'admin@mahmoudshaaban.com',
      JSON.stringify(draft)
    );
  }
}

export function getServices(): ServiceItem[] {
  const rows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC').all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    slug: String(r.slug),
    category: String(r.category),
    titleAr: String(r.title_ar),
    titleEn: String(r.title_en),
    descriptionAr: String(r.description_ar),
    descriptionEn: String(r.description_en),
    specsAr: String(r.specs_ar),
    specsEn: String(r.specs_en),
    materialsAr: String(r.materials_ar || ''),
    materialsEn: String(r.materials_en || ''),
    price: String(r.price || ''),
    showPrice: Boolean(r.show_price),
    imageUrl: String(r.image_url),
    featured: Boolean(r.featured),
    sortOrder: Number(r.sort_order),
  }));
}

export function getProjects(): PortfolioProject[] {
  const rows = db
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC, featured DESC, id DESC')
    .all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    titleAr: String(r.title_ar),
    titleEn: String(r.title_en),
    category: String(r.category),
    serviceSlug: String(r.service_slug),
    clientName: String(r.client_name),
    locationAr: String(r.location_ar),
    locationEn: String(r.location_en),
    dimensions: String(r.dimensions),
    lightingAr: String(r.lighting_ar),
    lightingEn: String(r.lighting_en),
    materialsAr: String(r.materials_ar),
    materialsEn: String(r.materials_en),
    descriptionAr: String(r.description_ar),
    descriptionEn: String(r.description_en),
    completionYear: String(r.completion_year),
    imageUrl: String(r.image_url),
    featured: Boolean(r.featured),
    sortOrder: Number(r.sort_order || 0),
  }));
}

export function getSiteContent(): SiteContent {
  const rows = db.prepare('SELECT key, value FROM site_content').all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map as unknown as SiteContent;
}

export function getContactSettings(): ContactSettings {
  const rows = db.prepare('SELECT key, value FROM contact_settings').all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map as unknown as ContactSettings;
}

export function getThemeSettings(): ThemeSettings {
  const rows = db.prepare('SELECT key, value FROM theme_settings').all() as { key: string; value: string }[];
  const map: Record<string, string> = { ...DEFAULT_THEME };
  for (const row of rows) map[row.key] = row.value;
  return map as unknown as ThemeSettings;
}

export function getHomeSections(): HomeCustomSection[] {
  const rows = db
    .prepare('SELECT * FROM home_sections ORDER BY sort_order ASC, id ASC')
    .all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    sectionKey: String(r.section_key),
    titleAr: String(r.title_ar),
    titleEn: String(r.title_en),
    subtitleAr: String(r.subtitle_ar || ''),
    subtitleEn: String(r.subtitle_en || ''),
    bodyAr: String(r.body_ar),
    bodyEn: String(r.body_en),
    imageUrl: String(r.image_url || ''),
    buttonTextAr: String(r.button_text_ar || ''),
    buttonTextEn: String(r.button_text_en || ''),
    buttonUrl: String(r.button_url || '/quote'),
    layoutStyle: (['split', 'banner', 'cards'].includes(String(r.layout_style))
      ? String(r.layout_style)
      : 'split') as 'split' | 'banner' | 'cards',
    sortOrder: Number(r.sort_order || 0),
    visible: Boolean(r.visible),
  }));
}

export function getSeoAndLegalSettings(): SeoAndLegalSettings {
  const rows = db.prepare('SELECT key, value FROM seo_legal_settings').all() as { key: string; value: string }[];
  const map: Record<string, string> = { ...DEFAULT_SEO_LEGAL };
  for (const row of rows) map[row.key] = row.value;
  return map as unknown as SeoAndLegalSettings;
}

export function getFullDraftSnapshot(): CmsSnapshotPayload {
  return {
    services: getServices(),
    projects: getProjects(),
    content: getSiteContent(),
    contact: getContactSettings(),
    theme: getThemeSettings(),
    sections: getHomeSections(),
    seoLegal: getSeoAndLegalSettings(),
  };
}

export function getPublishedSnapshot(): { payload: CmsSnapshotPayload; updatedAt: string } {
  const row = db
    .prepare('SELECT payload_json, updated_at FROM cms_snapshots WHERE key = ?')
    .get('published') as { payload_json: string; updated_at: string } | undefined;

  if (!row) {
    const draft = getFullDraftSnapshot();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO cms_snapshots (key, payload_json, updated_at) VALUES (?, ?, ?)').run(
      'published',
      JSON.stringify(draft),
      now
    );
    return { payload: draft, updatedAt: now };
  }

  return {
    payload: JSON.parse(row.payload_json) as CmsSnapshotPayload,
    updatedAt: row.updated_at,
  };
}

export function getPublicSiteData(useDraft: boolean): PublicSiteData {
  if (useDraft) {
    return {
      ...getFullDraftSnapshot(),
      isPreview: true,
    };
  }
  const { payload, updatedAt } = getPublishedSnapshot();
  return {
    ...payload,
    isPreview: false,
    publishedAt: updatedAt,
  };
}

export function recordRevision(
  actionType: CmsRevision['actionType'],
  summaryAr: string,
  summaryEn: string,
  adminEmail: string
): void {
  const snapshotJson = JSON.stringify(getFullDraftSnapshot());
  db.prepare(
    'INSERT INTO cms_revisions (action_type, summary_ar, summary_en, admin_email, snapshot_json) VALUES (?, ?, ?, ?, ?)'
  ).run(actionType, summaryAr, summaryEn, adminEmail, snapshotJson);

  // Retain latest 50 revisions to keep DB compact
  db.prepare(
    'DELETE FROM cms_revisions WHERE id NOT IN (SELECT id FROM cms_revisions ORDER BY id DESC LIMIT 50)'
  ).run();
}

export function getRevisions(limit = 40): CmsRevision[] {
  const rows = db
    .prepare('SELECT id, action_type, summary_ar, summary_en, admin_email, created_at FROM cms_revisions ORDER BY id DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[];

  return rows.map((r) => ({
    id: Number(r.id),
    actionType: String(r.action_type) as CmsRevision['actionType'],
    summaryAr: String(r.summary_ar),
    summaryEn: String(r.summary_en),
    adminEmail: String(r.admin_email),
    createdAt: String(r.created_at),
  }));
}

export function publishDraft(adminEmail: string): { updatedAt: string } {
  const draft = getFullDraftSnapshot();
  const updatedAt = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO cms_snapshots (key, payload_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET payload_json = excluded.payload_json, updated_at = excluded.updated_at'
    ).run('published', JSON.stringify(draft), updatedAt);

    db.prepare(
      'INSERT INTO cms_revisions (action_type, summary_ar, summary_en, admin_email, snapshot_json) VALUES (?, ?, ?, ?, ?)'
    ).run('publish', 'نشر التعديلات على الموقع المباشر', 'Published draft changes live', adminEmail, JSON.stringify(draft));
  });
  tx();
  return { updatedAt };
}

export function restoreSnapshotToDraft(snapshot: CmsSnapshotPayload): void {
  const tx = db.transaction(() => {
    // 1. Services
    db.prepare('DELETE FROM services').run();
    const insService = db.prepare(`
      INSERT INTO services (
        id, slug, category, title_ar, title_en, description_ar, description_en,
        specs_ar, specs_en, materials_ar, materials_en, price, show_price,
        image_url, featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of snapshot.services || []) {
      insService.run(
        s.id,
        s.slug,
        s.category,
        s.titleAr,
        s.titleEn,
        s.descriptionAr,
        s.descriptionEn,
        s.specsAr,
        s.specsEn,
        s.materialsAr || '',
        s.materialsEn || '',
        s.price || '',
        s.showPrice ? 1 : 0,
        s.imageUrl,
        s.featured ? 1 : 0,
        s.sortOrder || 0
      );
    }

    // 2. Projects
    db.prepare('DELETE FROM projects').run();
    const insProject = db.prepare(`
      INSERT INTO projects (
        id, title_ar, title_en, category, service_slug, client_name,
        location_ar, location_en, dimensions, lighting_ar, lighting_en,
        materials_ar, materials_en, description_ar, description_en,
        completion_year, image_url, featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of snapshot.projects || []) {
      insProject.run(
        p.id,
        p.titleAr,
        p.titleEn,
        p.category,
        p.serviceSlug,
        p.clientName,
        p.locationAr,
        p.locationEn,
        p.dimensions,
        p.lightingAr,
        p.lightingEn,
        p.materialsAr,
        p.materialsEn,
        p.descriptionAr,
        p.descriptionEn,
        p.completionYear,
        p.imageUrl,
        p.featured ? 1 : 0,
        p.sortOrder || 0
      );
    }

    // 3. Site Content
    db.prepare('DELETE FROM site_content').run();
    const insContent = db.prepare('INSERT INTO site_content (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(snapshot.content || {})) {
      if (typeof v === 'string') insContent.run(k, v);
    }

    // 4. Contact Settings
    db.prepare('DELETE FROM contact_settings').run();
    const insContact = db.prepare('INSERT INTO contact_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(snapshot.contact || {})) {
      if (typeof v === 'string') insContact.run(k, v);
    }

    // 5. Theme Settings
    db.prepare('DELETE FROM theme_settings').run();
    const insTheme = db.prepare('INSERT INTO theme_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(snapshot.theme || DEFAULT_THEME)) {
      if (typeof v === 'string') insTheme.run(k, v);
    }

    // 6. Custom Sections
    db.prepare('DELETE FROM home_sections').run();
    const insSection = db.prepare(`
      INSERT INTO home_sections (
        id, section_key, title_ar, title_en, subtitle_ar, subtitle_en,
        body_ar, body_en, image_url, button_text_ar, button_text_en,
        button_url, layout_style, sort_order, visible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const sec of snapshot.sections || []) {
      insSection.run(
        sec.id,
        sec.sectionKey,
        sec.titleAr,
        sec.titleEn,
        sec.subtitleAr || '',
        sec.subtitleEn || '',
        sec.bodyAr,
        sec.bodyEn,
        sec.imageUrl || '',
        sec.buttonTextAr || '',
        sec.buttonTextEn || '',
        sec.buttonUrl || '/quote',
        sec.layoutStyle || 'split',
        sec.sortOrder || 0,
        sec.visible ? 1 : 0
      );
    }

    // 7. SEO & Legal
    db.prepare('DELETE FROM seo_legal_settings').run();
    const insSeo = db.prepare('INSERT INTO seo_legal_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(snapshot.seoLegal || DEFAULT_SEO_LEGAL)) {
      if (typeof v === 'string') insSeo.run(k, v);
    }
  });
  tx();
}

export function undoLastRevision(adminEmail: string): { ok: boolean; error?: string } {
  const currentJson = JSON.stringify(getFullDraftSnapshot());
  const rows = db
    .prepare('SELECT id, snapshot_json FROM cms_revisions ORDER BY id DESC LIMIT 15')
    .all() as { id: number; snapshot_json: string }[];

  const target = rows.find((r) => r.snapshot_json !== currentJson) || rows[1];
  if (!target) {
    return { ok: false, error: 'No previous revision available to undo' };
  }

  const parsed = JSON.parse(target.snapshot_json) as CmsSnapshotPayload;
  restoreSnapshotToDraft(parsed);
  recordRevision(
    'undo',
    'التراجع عن آخر تعديل واستعادة النسخة السابقة',
    'Undid last edit and restored previous snapshot',
    adminEmail
  );
  return { ok: true };
}

export function restoreRevisionById(revisionId: number, adminEmail: string): { ok: boolean; error?: string } {
  const row = db
    .prepare('SELECT id, snapshot_json, summary_ar FROM cms_revisions WHERE id = ?')
    .get(revisionId) as { id: number; snapshot_json: string; summary_ar: string } | undefined;

  if (!row) {
    return { ok: false, error: 'Revision not found' };
  }

  const parsed = JSON.parse(row.snapshot_json) as CmsSnapshotPayload;
  restoreSnapshotToDraft(parsed);
  recordRevision(
    'restore',
    `استعادة النسخة #${row.id}: ${row.summary_ar}`,
    `Restored revision #${row.id}`,
    adminEmail
  );
  return { ok: true };
}

export function getAdminCmsBundle(): AdminCmsBundle {
  const draft = getFullDraftSnapshot();
  const { payload: published, updatedAt } = getPublishedSnapshot();
  const revisions = getRevisions(40);
  const draftJson = JSON.stringify(draft);
  const canUndo = revisions.some((r) => {
    const row = db.prepare('SELECT snapshot_json FROM cms_revisions WHERE id = ?').get(r.id) as
      | { snapshot_json: string }
      | undefined;
    return row ? row.snapshot_json !== draftJson : false;
  });

  return {
    draft,
    published,
    hasUnpublishedChanges: draftJson !== JSON.stringify(published),
    canUndo,
    publishedAt: updatedAt,
    revisions,
  };
}

export interface BackupArchive {
  version: number;
  exportedAt: string;
  cms: {
    draft: CmsSnapshotPayload;
    published: CmsSnapshotPayload;
    publishedAt: string;
  };
  quotes: QuoteRequest[];
  messages: ContactMessage[];
  uploads: Record<string, string>;
}

export function exportFullBackup(uploadsDir: string): BackupArchive {
  const draft = getFullDraftSnapshot();
  const { payload: published, updatedAt: publishedAt } = getPublishedSnapshot();
  const uploads: Record<string, string> = {};

  if (fs.existsSync(uploadsDir)) {
    for (const file of fs.readdirSync(uploadsDir)) {
      const safe = sanitizeBackupFilename(file);
      if (!safe) continue;
      const fullPath = path.join(uploadsDir, safe);
      if (fs.statSync(fullPath).isFile()) {
        uploads[safe] = fs.readFileSync(fullPath).toString('base64');
      }
    }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    cms: {
      draft,
      published,
      publishedAt,
    },
    quotes: getQuotes(),
    messages: getMessages(),
    uploads,
  };
}

export function importFullBackup(
  archive: BackupArchive,
  uploadsDir: string,
  adminEmail: string
): void {
  const tx = db.transaction(() => {
    const draftSnapshot = archive.cms.draft || (archive.cms as unknown as CmsSnapshotPayload);
    restoreSnapshotToDraft(draftSnapshot);

    if (archive.cms.published) {
      db.prepare(
        'INSERT INTO cms_snapshots (key, payload_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET payload_json = excluded.payload_json, updated_at = excluded.updated_at'
      ).run('published', JSON.stringify(archive.cms.published), archive.cms.publishedAt || new Date().toISOString());
    }

    if (Array.isArray(archive.quotes)) {
      db.prepare('DELETE FROM quotes').run();
      const insQuote = db.prepare(`
        INSERT INTO quotes (
          id, reference_code, customer_name, phone, service_type,
          width_cm, height_cm, dimensions, material_type, desired_color, lighting_type,
          details, image_path, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const q of archive.quotes) {
        insQuote.run(
          q.id,
          q.referenceCode,
          q.customerName,
          q.phone,
          q.serviceType,
          q.widthCm || '',
          q.heightCm || '',
          q.dimensions || '',
          q.materialType || '',
          q.desiredColor || '',
          q.lightingType || '',
          q.details || '',
          q.imagePath || null,
          q.status || 'new',
          q.createdAt || new Date().toISOString()
        );
      }
    }

    if (Array.isArray(archive.messages)) {
      db.prepare('DELETE FROM messages').run();
      const insMsg = db.prepare(`
        INSERT INTO messages (id, name, phone, email, subject, message, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of archive.messages) {
        insMsg.run(
          m.id,
          m.name,
          m.phone,
          m.email || '',
          m.subject,
          m.message,
          m.isRead ? 1 : 0,
          m.createdAt || new Date().toISOString()
        );
      }
    }
  });
  tx();

  if (archive.uploads && typeof archive.uploads === 'object') {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    for (const [rawName, b64] of Object.entries(archive.uploads)) {
      const safeName = sanitizeBackupFilename(rawName);
      if (!safeName || typeof b64 !== 'string') continue;
      const buf = Buffer.from(b64, 'base64');
      if (buf.length > 6 * 1024 * 1024) continue;
      if (!verifyImageMagicBytes(buf)) continue;
      fs.writeFileSync(path.join(uploadsDir, safeName), buf);
    }
  }

  recordRevision(
    'backup_restore',
    'استعادة نسخة احتياطية كاملة للموقع والصور',
    'Restored full site & images backup archive',
    adminEmail
  );
}

export function getQuotes(): QuoteRequest[] {
  const rows = db.prepare('SELECT * FROM quotes ORDER BY id DESC').all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    referenceCode: String(r.reference_code),
    customerName: String(r.customer_name),
    phone: String(r.phone),
    serviceType: String(r.service_type),
    widthCm: String(r.width_cm || ''),
    heightCm: String(r.height_cm || ''),
    dimensions: String(r.dimensions),
    materialType: String(r.material_type || ''),
    desiredColor: String(r.desired_color || ''),
    lightingType: String(r.lighting_type || ''),
    details: String(r.details || ''),
    imagePath: r.image_path ? String(r.image_path) : null,
    status: String(r.status) as QuoteStatus,
    createdAt: String(r.created_at),
  }));
}

export function getMessages(): ContactMessage[] {
  const rows = db.prepare('SELECT * FROM messages ORDER BY id DESC').all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    phone: String(r.phone),
    email: String(r.email),
    subject: String(r.subject),
    message: String(r.message),
    isRead: Boolean(r.is_read),
    createdAt: String(r.created_at),
  }));
}

export interface StudioSavedProjectRecord {
  id: number;
  title: string;
  boardInputJson: string;
  ledConfigJson: string;
  aiReportJson: string;
  confirmedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EngineerPhotoRecord {
  id: number;
  titleAr: string;
  captionAr: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

function seedEngineerPhotosIfEmpty(): void {
  const countRow = db.prepare('SELECT COUNT(*) as c FROM engineer_photos').get() as { c: number };
  if (countRow.c > 0) return;
  const ins = db.prepare(
    'INSERT INTO engineer_photos (title_ar, caption_ar, image_url, sort_order) VALUES (?, ?, ?, ?)'
  );
  ins.run(
    'المهندس محمود شعبان — المعرض التكنولوجي',
    'صورة شخصية لمهندس محمود شعبان للدعاية والإعلان',
    '/src/assets/images/engineer_mahmoud_portrait_1794875545412.jpg',
    1
  );
  ins.run(
    'إشراف الورشة على الحروف الذهبية',
    'مراجعة جودة حروف الاستانلس والكلادينج الأسود اللامع',
    '/src/assets/images/studio_engineer_workshop_1794875056154.jpg',
    2
  );
  ins.run(
    'برمجة مصفوفة الليد والكنترولر',
    'تجهيز وبرامج السوفت للوحات المضيئة',
    '/src/assets/images/studio_led_controller_1794875056975.jpg',
    3
  );
}

export function listStudioProjects(): StudioSavedProjectRecord[] {
  const rows = db
    .prepare('SELECT * FROM studio_projects ORDER BY updated_at DESC, id DESC')
    .all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    title: String(r.title),
    boardInputJson: String(r.board_input_json),
    ledConfigJson: String(r.led_config_json),
    aiReportJson: String(r.ai_report_json || ''),
    confirmedByUser: Boolean(r.confirmed_by_user),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}

export function createStudioProject(data: {
  title: string;
  boardInputJson: string;
  ledConfigJson: string;
  aiReportJson?: string;
  confirmedByUser?: boolean;
}): StudioSavedProjectRecord {
  const info = db
    .prepare(
      `INSERT INTO studio_projects (title, board_input_json, led_config_json, ai_report_json, confirmed_by_user)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      data.title.trim(),
      data.boardInputJson,
      data.ledConfigJson,
      data.aiReportJson || '',
      data.confirmedByUser ? 1 : 0
    );
  const row = db
    .prepare('SELECT * FROM studio_projects WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as Record<string, unknown>;
  return {
    id: Number(row.id),
    title: String(row.title),
    boardInputJson: String(row.board_input_json),
    ledConfigJson: String(row.led_config_json),
    aiReportJson: String(row.ai_report_json || ''),
    confirmedByUser: Boolean(row.confirmed_by_user),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function updateStudioProject(
  id: number,
  data: {
    title: string;
    boardInputJson: string;
    ledConfigJson: string;
    aiReportJson?: string;
    confirmedByUser?: boolean;
  }
): StudioSavedProjectRecord | null {
  const res = db
    .prepare(
      `UPDATE studio_projects
       SET title = ?, board_input_json = ?, led_config_json = ?, ai_report_json = ?, confirmed_by_user = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(
      data.title.trim(),
      data.boardInputJson,
      data.ledConfigJson,
      data.aiReportJson || '',
      data.confirmedByUser ? 1 : 0,
      id
    );
  if (res.changes === 0) return null;
  const row = db.prepare('SELECT * FROM studio_projects WHERE id = ?').get(id) as Record<string, unknown>;
  return {
    id: Number(row.id),
    title: String(row.title),
    boardInputJson: String(row.board_input_json),
    ledConfigJson: String(row.led_config_json),
    aiReportJson: String(row.ai_report_json || ''),
    confirmedByUser: Boolean(row.confirmed_by_user),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function deleteStudioProject(id: number): boolean {
  const res = db.prepare('DELETE FROM studio_projects WHERE id = ?').run(id);
  return res.changes > 0;
}

export function listEngineerPhotos(): EngineerPhotoRecord[] {
  const rows = db
    .prepare('SELECT * FROM engineer_photos ORDER BY sort_order ASC, id DESC')
    .all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: Number(r.id),
    titleAr: String(r.title_ar),
    captionAr: String(r.caption_ar || ''),
    imageUrl: String(r.image_url),
    sortOrder: Number(r.sort_order || 0),
    createdAt: String(r.created_at),
  }));
}

export function addEngineerPhoto(data: {
  titleAr: string;
  captionAr?: string;
  imageUrl: string;
}): EngineerPhotoRecord {
  const info = db
    .prepare(
      'INSERT INTO engineer_photos (title_ar, caption_ar, image_url, sort_order) VALUES (?, ?, ?, 0)'
    )
    .run(data.titleAr.trim(), (data.captionAr || '').trim(), data.imageUrl.trim());
  const row = db
    .prepare('SELECT * FROM engineer_photos WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as Record<string, unknown>;
  return {
    id: Number(row.id),
    titleAr: String(row.title_ar),
    captionAr: String(row.caption_ar || ''),
    imageUrl: String(row.image_url),
    sortOrder: Number(row.sort_order || 0),
    createdAt: String(row.created_at),
  };
}

export function deleteEngineerPhoto(id: number): boolean {
  const res = db.prepare('DELETE FROM engineer_photos WHERE id = ?').run(id);
  return res.changes > 0;
}

