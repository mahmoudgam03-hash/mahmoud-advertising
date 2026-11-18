import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  addEngineerPhoto,
  createStudioProject,
  db,
  deleteEngineerPhoto,
  deleteStudioProject,
  exportFullBackup,
  getAdminCmsBundle,
  getContactSettings,
  getMessages,
  getPublicSiteData,
  getQuotes,
  getSiteContent,
  importFullBackup,
  initializeDatabase,
  listEngineerPhotos,
  listStudioProjects,
  publishDraft,
  recordRevision,
  restoreRevisionById,
  undoLastRevision,
  updateStudioProject,
  type BackupArchive,
} from './server/db';
import { parseCookieHeader, signSessionToken, verifyPassword, verifySessionToken } from './server/auth';
import { validateBackupArchive, verifyImageMagicBytes } from './server/cms-utils';
import {
  AiServiceError,
  analyzeSignageWithGemini,
  askSignageAssistantWithGemini,
} from './server/ai';
import {
  isValidHexColor,
  isValidQuoteStatus,
  isValidUrlOrPath,
  slugifyCategory,
  validateContactInput,
  validateQuoteInput,
  validateSectionInput,
  validateServiceInput,
} from './src/shared/validation';
import { injectSeoMetaTags } from './src/shared/social-share';
import type { AdminSessionUser, QuoteStatus } from './src/shared/types';

initializeDatabase();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
  },
});

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
  },
});

function verifyAndValidateUploadedImage(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, buf, 0, 16, 0);
    fs.closeSync(fd);
    if (bytesRead < 12) return false;
    return verifyImageMagicBytes(buf) !== null;
  } catch {
    return false;
  }
}

const COOKIE_NAME = 'msa_admin_session';

// Simple in-memory login brute-force protection
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 15;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

function extractAdminUser(req: express.Request): AdminSessionUser | null {
  const cookies = parseCookieHeader(req.headers.cookie);
  if (cookies[COOKIE_NAME]) {
    const user = verifySessionToken(cookies[COOKIE_NAME]);
    if (user) return user;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    return verifySessionToken(token);
  }
  return null;
}

type AdminRequest = express.Request & { adminUser?: AdminSessionUser };

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const user = extractAdminUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please log in as administrator.' });
    return;
  }
  if (user.role && user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Administrator role required.' });
    return;
  }
  (req as AdminRequest).adminUser = user;
  next();
}

const ALLOWED_AR_FONTS = new Set(['Cairo', 'Tajawal', 'IBM Plex Sans Arabic']);
const ALLOWED_EN_FONTS = new Set(['Plus Jakarta Sans', 'Manrope', 'Outfit']);

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Stable OpenGraph image endpoint for Facebook / WhatsApp / X / Telegram link previews
  const DEFAULT_OG_IMAGE = path.resolve(
    process.cwd(),
    'src/assets/images/hero_luxury_signage_1794750813882.jpg'
  );
  const ASSETS_IMAGES_DIR = path.resolve(process.cwd(), 'src/assets/images');
  app.use('/src/assets/images', express.static(ASSETS_IMAGES_DIR, { maxAge: '7d' }));

  const handleOgImage = (_req: express.Request, res: express.Response) => {
    const pub = getPublicSiteData(false);
    const candidate = (pub.content.heroBgImageUrl || pub.content.logoUrl || '').trim();
    let targetPath = DEFAULT_OG_IMAGE;

    if (candidate.startsWith('/uploads/')) {
      const resolved = path.resolve(UPLOADS_DIR, path.basename(candidate));
      if (resolved.startsWith(UPLOADS_DIR + path.sep) && fs.existsSync(resolved)) {
        targetPath = resolved;
      }
    } else if (candidate.startsWith('/src/assets/images/')) {
      const resolved = path.resolve(ASSETS_IMAGES_DIR, path.basename(candidate));
      if (resolved.startsWith(ASSETS_IMAGES_DIR + path.sep) && fs.existsSync(resolved)) {
        targetPath = resolved;
      }
    }

    if (!fs.existsSync(targetPath)) {
      res.status(404).end();
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const mime =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(targetPath);
  };

  app.get('/og-image.jpg', handleOgImage);
  app.get('/og-image', handleOgImage);

  // Public data endpoint (supports authenticated ?preview=1 for Draft viewing)
  app.get('/api/public', (req, res) => {
    const wantPreview = req.query.preview === '1' || req.query.preview === 'true';
    if (wantPreview) {
      const user = extractAdminUser(req);
      if (!user || (user.role && user.role !== 'admin')) {
        res.status(401).json({ error: 'Unauthorized preview access. Admin login required.' });
        return;
      }
      res.json(getPublicSiteData(true));
      return;
    }
    res.json(getPublicSiteData(false));
  });

  // Public quote submission (with optional site/design photo upload)
  app.post('/api/quotes', (req, res) => {
    upload.single('image')(req, res, (uploadErr) => {
      if (uploadErr) {
        res.status(400).json({ error: uploadErr.message || 'Image upload failed' });
        return;
      }

      if (req.file && !verifyAndValidateUploadedImage(req.file.path)) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: 'Uploaded file is not a valid JPG, PNG, or WebP image' });
        return;
      }

      const body = req.body as Record<string, string>;
      const lang = body.lang === 'en' ? 'en' : 'ar';
      const widthCm = (body.widthCm || '').trim();
      const heightCm = (body.heightCm || '').trim();
      const materialType = (body.materialType || '').trim();
      const desiredColor = (body.desiredColor || '').trim();
      const lightingType = (body.lightingType || '').trim();
      const details = (body.details || '').trim();

      const validation = validateQuoteInput(
        {
          customerName: body.customerName || '',
          phone: body.phone || '',
          serviceType: body.serviceType || '',
          widthCm,
          heightCm,
          materialType,
          desiredColor,
          lightingType,
          details,
        },
        lang
      );

      if (!validation.valid) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ error: 'Validation failed', errors: validation.errors });
        return;
      }

      const refCode = `MSA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
      const computedDimensions =
        (body.dimensions || '').trim() ||
        (lang === 'ar' ? `${widthCm} × ${heightCm} سم` : `${widthCm} × ${heightCm} cm`);

      const info = db
        .prepare(
          `INSERT INTO quotes (
            reference_code, customer_name, phone, service_type,
            width_cm, height_cm, dimensions, material_type, desired_color, lighting_type,
            details, image_path, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`
        )
        .run(
          refCode,
          body.customerName.trim(),
          body.phone.trim(),
          body.serviceType.trim(),
          widthCm,
          heightCm,
          computedDimensions,
          materialType,
          desiredColor,
          lightingType,
          details,
          imagePath
        );

      res.status(201).json({
        id: Number(info.lastInsertRowid),
        referenceCode: refCode,
        imagePath,
      });
    });
  });

  // Public contact message submission
  app.post('/api/messages', (req, res) => {
    const body = req.body as Record<string, string>;
    const lang = body.lang === 'en' ? 'en' : 'ar';
    const validation = validateContactInput(
      {
        name: body.name || '',
        phone: body.phone || '',
        email: body.email || '',
        subject: body.subject || '',
        message: body.message || '',
      },
      lang
    );

    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const info = db
      .prepare('INSERT INTO messages (name, phone, email, subject, message, is_read) VALUES (?, ?, ?, ?, ?, 0)')
      .run(
        body.name.trim(),
        body.phone.trim(),
        (body.email || '').trim(),
        body.subject.trim(),
        body.message.trim()
      );

    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  // Free Public AI Signage & LED Error-Correction Advisor (Server-Side @google/genai)
  app.post('/api/ai/signage-advisor', (req, res) => {
    memoryUpload.single('image')(req, res, async (uploadErr) => {
      if (uploadErr) {
        res.status(400).json({ error: uploadErr.message || 'Image upload failed' });
        return;
      }

      let imageBuffer: Buffer | undefined;
      let imageMimeType: string | undefined;

      if (req.file) {
        const format = verifyImageMagicBytes(req.file.buffer);
        if (!format) {
          res.status(400).json({ error: 'الملف المرفوع ليس صورة JPG أو PNG أو WebP صالحة' });
          return;
        }
        imageBuffer = req.file.buffer;
        imageMimeType =
          format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      }

      const b = (req.body || {}) as Record<string, string>;
      try {
        const result = await analyzeSignageWithGemini({
          widthCm: Math.max(10, Number(b.widthCm) || 300),
          heightCm: Math.max(10, Number(b.heightCm) || 100),
          material: (b.material || 'كلادينج وحروف أكريليك').trim(),
          ledType: (b.ledType || 'ليد 3 عدسة 12V').trim(),
          letterDepthCm: Math.max(2, Number(b.letterDepthCm) || 7),
          estimatedCoveragePercent: Math.max(10, Math.min(100, Number(b.estimatedCoveragePercent) || 60)),
          calculatedLedCount: Math.max(1, Number(b.calculatedLedCount) || 120),
          calculatedPsuAmps: Math.max(5, Number(b.calculatedPsuAmps) || 20),
          userNotes: (b.userNotes || '').trim(),
          imageBuffer,
          imageMimeType,
        });
        res.json(result);
      } catch (err) {
        if (err instanceof AiServiceError) {
          res.status(err.status).json({ error: err.message });
          return;
        }
        res.status(500).json({
          error: err instanceof Error ? err.message : 'تعذر الاتصال بخدمة الذكاء الاصطناعي',
        });
      }
    });
  });

  // Free Public AI Signage Conversational Assistant (Egyptian Arabic + Image Analysis)
  app.post('/api/ai/assistant', (req, res) => {
    memoryUpload.single('image')(req, res, async (uploadErr) => {
      if (uploadErr) {
        res.status(400).json({ error: uploadErr.message || 'Image upload failed' });
        return;
      }

      let imageBuffer: Buffer | undefined;
      let imageMimeType: string | undefined;
      if (req.file) {
        const format = verifyImageMagicBytes(req.file.buffer);
        if (!format) {
          res.status(400).json({ error: 'الملف المرفوع ليس صورة JPG أو PNG أو WebP صالحة' });
          return;
        }
        imageBuffer = req.file.buffer;
        imageMimeType =
          format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      }

      const b = (req.body || {}) as Record<string, string>;
      try {
        const result = await askSignageAssistantWithGemini({
          question: b.question || '',
          contextSummary: b.contextSummary || '',
          imageBuffer,
          imageMimeType,
        });
        res.json(result);
      } catch (err) {
        if (err instanceof AiServiceError) {
          res.status(err.status).json({ error: err.message });
          return;
        }
        res.status(500).json({
          error: err instanceof Error ? err.message : 'تعذر الاتصال بالمساعد الذكي',
        });
      }
    });
  });

  // Saved Studio Projects CRUD (SQLite persistence)
  app.get('/api/studio/projects', (_req, res) => {
    res.json({ projects: listStudioProjects() });
  });

  app.post('/api/studio/projects', (req, res) => {
    const body = (req.body || {}) as {
      title?: string;
      boardInputJson?: string;
      ledConfigJson?: string;
      aiReportJson?: string;
      confirmedByUser?: boolean;
    };
    const title = (body.title || '').trim();
    if (!title || title.length < 2) {
      res.status(400).json({ error: 'يرجى إدخال اسم واضح للمشروع لحفظه.' });
      return;
    }
    const project = createStudioProject({
      title,
      boardInputJson: String(body.boardInputJson || '{}'),
      ledConfigJson: String(body.ledConfigJson || '{}'),
      aiReportJson: String(body.aiReportJson || ''),
      confirmedByUser: Boolean(body.confirmedByUser),
    });
    res.status(201).json({ project });
  });

  app.put('/api/studio/projects/:id', (req, res) => {
    const id = Number(req.params.id);
    const body = (req.body || {}) as {
      title?: string;
      boardInputJson?: string;
      ledConfigJson?: string;
      aiReportJson?: string;
      confirmedByUser?: boolean;
    };
    const title = (body.title || '').trim();
    if (!title || title.length < 2) {
      res.status(400).json({ error: 'يرجى إدخال اسم صالح للمشروع.' });
      return;
    }
    const updated = updateStudioProject(id, {
      title,
      boardInputJson: String(body.boardInputJson || '{}'),
      ledConfigJson: String(body.ledConfigJson || '{}'),
      aiReportJson: String(body.aiReportJson || ''),
      confirmedByUser: Boolean(body.confirmedByUser),
    });
    if (!updated) {
      res.status(404).json({ error: 'المشروع غير موجود.' });
      return;
    }
    res.json({ project: updated });
  });

  app.delete('/api/studio/projects/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!deleteStudioProject(id)) {
      res.status(404).json({ error: 'المشروع غير موجود.' });
      return;
    }
    res.json({ ok: true });
  });

  // Public Engineer Personal & Workshop Photos + Admin Upload/Delete
  app.get('/api/engineer-photos', (_req, res) => {
    res.json({ photos: listEngineerPhotos() });
  });

  app.post('/api/admin/engineer-photos', requireAdmin, (req, res) => {
    const body = (req.body || {}) as { titleAr?: string; captionAr?: string; imageUrl?: string };
    const titleAr = (body.titleAr || '').trim() || 'صورة المهندس محمود شعبان';
    const imageUrl = (body.imageUrl || '').trim();
    if (!isValidUrlOrPath(imageUrl)) {
      res.status(400).json({ error: 'يرجى رفع صورة صالحة أو إدخال رابط صورة صحيح.' });
      return;
    }
    const photo = addEngineerPhoto({
      titleAr,
      captionAr: body.captionAr || '',
      imageUrl,
    });
    res.status(201).json({ photo });
  });

  app.delete('/api/admin/engineer-photos/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!deleteEngineerPhoto(id)) {
      res.status(404).json({ error: 'الصورة غير موجودة.' });
      return;
    }
    res.json({ ok: true });
  });

  // Admin auth endpoints
  app.post('/api/admin/login', (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (!checkLoginRateLimit(clientIp)) {
      res.status(429).json({ error: 'Too many login attempts. Please wait a few minutes.' });
      return;
    }

    const { email, password } = (req.body || {}) as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const admin = db
      .prepare('SELECT id, email, name, password_hash, role FROM admins WHERE lower(email) = lower(?)')
      .get(email.trim()) as
      | { id: number; email: string; name: string; password_hash: string; role: string }
      | undefined;

    if (!admin || !verifyPassword(password, admin.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    loginAttempts.delete(clientIp);
    const user: AdminSessionUser = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || 'admin',
    };
    const token = signSessionToken(user);

    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );
    res.json({ user, token });
  });

  app.post('/api/admin/logout', (_req, res) => {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    res.json({ ok: true });
  });

  app.get('/api/admin/session', (req, res) => {
    const adminUser = extractAdminUser(req);
    res.json({ user: adminUser });
  });

  app.get('/api/admin/me', requireAdmin, (req, res) => {
    const adminUser = (req as AdminRequest).adminUser;
    res.json({ user: adminUser });
  });

  // Admin upload image endpoint for projects/services/logos/sections
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    upload.single('image')(req, res, (uploadErr) => {
      if (uploadErr) {
        res.status(400).json({ error: uploadErr.message || 'Image upload failed' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }
      if (!verifyAndValidateUploadedImage(req.file.path)) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: 'Invalid image file signature. Upload a valid JPG, PNG, or WebP.' });
        return;
      }
      res.status(201).json({ imageUrl: `/uploads/${req.file.filename}` });
    });
  });

  // Admin CMS Bundle & Publishing Lifecycle
  app.get('/api/admin/cms', requireAdmin, (_req, res) => {
    res.json(getAdminCmsBundle());
  });

  app.post('/api/admin/cms/publish', requireAdmin, (req, res) => {
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const { updatedAt } = publishDraft(adminEmail);
    res.json({ ok: true, publishedAt: updatedAt, bundle: getAdminCmsBundle() });
  });

  app.post('/api/admin/cms/undo', requireAdmin, (req, res) => {
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const result = undoLastRevision(adminEmail);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  app.post('/api/admin/cms/revisions/:id/restore', requireAdmin, (req, res) => {
    const revisionId = Number(req.params.id);
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const result = restoreRevisionById(revisionId, adminEmail);
    if (!result.ok) {
      res.status(404).json({ error: result.error });
      return;
    }
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  // Admin quotes & messages
  app.get('/api/admin/quotes', requireAdmin, (_req, res) => {
    res.json({ quotes: getQuotes(), messages: getMessages() });
  });

  app.patch('/api/admin/quotes/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const status = String((req.body || {}).status || '') as QuoteStatus;
    if (!isValidQuoteStatus(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }
    const result = db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Quote not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.delete('/api/admin/quotes/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  app.patch('/api/admin/messages/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const isRead = (req.body || {}).isRead ? 1 : 0;
    db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(isRead, id);
    res.json({ ok: true });
  });

  app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  // Admin Services CRUD & Reordering
  app.post('/api/admin/services', requireAdmin, (req, res) => {
    const b = req.body as Record<string, unknown>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const validation = validateServiceInput(
      {
        titleAr: String(b.titleAr || ''),
        titleEn: String(b.titleEn || ''),
        category: String(b.category || ''),
        descriptionAr: String(b.descriptionAr || ''),
        descriptionEn: String(b.descriptionEn || ''),
      },
      'ar'
    );
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const baseSlug = slugifyCategory(String(b.slug || b.titleEn || b.titleAr));
    const slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    const maxOrder =
      (db.prepare('SELECT MAX(sort_order) as maxOrder FROM services').get() as { maxOrder: number | null })
        .maxOrder || 0;

    const info = db
      .prepare(
        `INSERT INTO services (
          slug, category, title_ar, title_en, description_ar, description_en,
          specs_ar, specs_en, materials_ar, materials_en, price, show_price,
          image_url, featured, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        slug,
        String(b.category).trim(),
        String(b.titleAr).trim(),
        String(b.titleEn).trim(),
        String(b.descriptionAr).trim(),
        String(b.descriptionEn).trim(),
        String(b.specsAr || 'تصنيع حسب الطلب · إضاءة LED موفرة').trim(),
        String(b.specsEn || 'Custom Fabricated · High-Efficiency LED').trim(),
        String(b.materialsAr || '').trim(),
        String(b.materialsEn || '').trim(),
        String(b.price || '').trim(),
        b.showPrice ? 1 : 0,
        String(b.imageUrl || '/src/assets/images/service_stainless_letters_1794750814371.jpg').trim(),
        b.featured ? 1 : 0,
        Number(b.sortOrder) || maxOrder + 1
      );

    recordRevision('save_draft', `إضافة خدمة: ${String(b.titleAr).trim()}`, `Added service: ${String(b.titleEn).trim()}`, adminEmail);
    res.status(201).json({ id: Number(info.lastInsertRowid), bundle: getAdminCmsBundle() });
  });

  app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const b = req.body as Record<string, unknown>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const validation = validateServiceInput(
      {
        titleAr: String(b.titleAr || ''),
        titleEn: String(b.titleEn || ''),
        category: String(b.category || ''),
        descriptionAr: String(b.descriptionAr || ''),
        descriptionEn: String(b.descriptionEn || ''),
      },
      'ar'
    );
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const result = db
      .prepare(
        `UPDATE services SET
          category = ?, title_ar = ?, title_en = ?, description_ar = ?, description_en = ?,
          specs_ar = ?, specs_en = ?, materials_ar = ?, materials_en = ?, price = ?, show_price = ?,
          image_url = ?, featured = ?, sort_order = ?
         WHERE id = ?`
      )
      .run(
        String(b.category).trim(),
        String(b.titleAr).trim(),
        String(b.titleEn).trim(),
        String(b.descriptionAr).trim(),
        String(b.descriptionEn).trim(),
        String(b.specsAr || '').trim(),
        String(b.specsEn || '').trim(),
        String(b.materialsAr || '').trim(),
        String(b.materialsEn || '').trim(),
        String(b.price || '').trim(),
        b.showPrice ? 1 : 0,
        String(b.imageUrl || '/src/assets/images/service_stainless_letters_1794750814371.jpg').trim(),
        b.featured ? 1 : 0,
        Number(b.sortOrder) || 0,
        id
      );

    if (result.changes === 0) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    recordRevision('save_draft', `تعديل خدمة: ${String(b.titleAr).trim()}`, `Updated service: ${String(b.titleEn).trim()}`, adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  app.post('/api/admin/services/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray((req.body || {}).orderedIds)
      ? ((req.body as { orderedIds: number[] }).orderedIds)
      : [];
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const upd = db.prepare('UPDATE services SET sort_order = ? WHERE id = ?');
    const tx = db.transaction(() => {
      orderedIds.forEach((id, idx) => upd.run(idx + 1, Number(id)));
    });
    tx();
    recordRevision('save_draft', 'إعادة ترتيب الخدمات', 'Reordered services', adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const row = db.prepare('SELECT title_ar, title_en FROM services WHERE id = ?').get(id) as
      | { title_ar: string; title_en: string }
      | undefined;
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    if (row) {
      recordRevision('save_draft', `حذف خدمة: ${row.title_ar}`, `Deleted service: ${row.title_en}`, adminEmail);
    }
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  // Admin Portfolio Projects CRUD & Reordering
  app.post('/api/admin/projects', requireAdmin, (req, res) => {
    const b = req.body as Record<string, unknown>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    if (!b.titleAr || !b.titleEn || !b.category || !b.imageUrl) {
      res.status(400).json({ error: 'Arabic title, English title, category, and image URL are required' });
      return;
    }

    const minOrder =
      (db.prepare('SELECT MIN(sort_order) as minOrder FROM projects').get() as { minOrder: number | null })
        .minOrder ?? 1;

    const info = db
      .prepare(
        `INSERT INTO projects (
          title_ar, title_en, category, service_slug, client_name,
          location_ar, location_en, dimensions, lighting_ar, lighting_en,
          materials_ar, materials_en, description_ar, description_en,
          completion_year, image_url, featured, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        String(b.titleAr).trim(),
        String(b.titleEn).trim(),
        String(b.category).trim(),
        String(b.serviceSlug || b.category).trim(),
        String(b.clientName || 'عميل تجاري').trim(),
        String(b.locationAr || 'المنيا، مصر').trim(),
        String(b.locationEn || 'Minya, Egypt').trim(),
        String(b.dimensions || '300 × 120 سم').trim(),
        String(b.lightingAr || 'إضاءة LED موفرة').trim(),
        String(b.lightingEn || 'High-efficiency LED lighting').trim(),
        String(b.materialsAr || 'استانلس ستيل وأكريليك').trim(),
        String(b.materialsEn || 'Stainless steel & cast acrylic').trim(),
        String(b.descriptionAr || '').trim(),
        String(b.descriptionEn || '').trim(),
        String(b.completionYear || new Date().getFullYear()).trim(),
        String(b.imageUrl).trim(),
        b.featured ? 1 : 0,
        typeof b.sortOrder === 'number' ? b.sortOrder : minOrder - 1
      );

    recordRevision('save_draft', `إضافة مشروع: ${String(b.titleAr).trim()}`, `Added project: ${String(b.titleEn).trim()}`, adminEmail);
    res.status(201).json({ id: Number(info.lastInsertRowid), bundle: getAdminCmsBundle() });
  });

  app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const b = req.body as Record<string, unknown>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    if (!b.titleAr || !b.titleEn || !b.category || !b.imageUrl) {
      res.status(400).json({ error: 'Arabic title, English title, category, and image URL are required' });
      return;
    }

    const result = db
      .prepare(
        `UPDATE projects SET
          title_ar = ?, title_en = ?, category = ?, service_slug = ?, client_name = ?,
          location_ar = ?, location_en = ?, dimensions = ?, lighting_ar = ?, lighting_en = ?,
          materials_ar = ?, materials_en = ?, description_ar = ?, description_en = ?,
          completion_year = ?, image_url = ?, featured = ?, sort_order = COALESCE(?, sort_order)
         WHERE id = ?`
      )
      .run(
        String(b.titleAr).trim(),
        String(b.titleEn).trim(),
        String(b.category).trim(),
        String(b.serviceSlug || b.category).trim(),
        String(b.clientName || '').trim(),
        String(b.locationAr || '').trim(),
        String(b.locationEn || '').trim(),
        String(b.dimensions || '').trim(),
        String(b.lightingAr || '').trim(),
        String(b.lightingEn || '').trim(),
        String(b.materialsAr || '').trim(),
        String(b.materialsEn || '').trim(),
        String(b.descriptionAr || '').trim(),
        String(b.descriptionEn || '').trim(),
        String(b.completionYear || '2026').trim(),
        String(b.imageUrl).trim(),
        b.featured ? 1 : 0,
        typeof b.sortOrder === 'number' ? b.sortOrder : null,
        id
      );

    if (result.changes === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    recordRevision('save_draft', `تعديل مشروع: ${String(b.titleAr).trim()}`, `Updated project: ${String(b.titleEn).trim()}`, adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  app.post('/api/admin/projects/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray((req.body || {}).orderedIds)
      ? ((req.body as { orderedIds: number[] }).orderedIds)
      : [];
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const upd = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');
    const tx = db.transaction(() => {
      orderedIds.forEach((id, idx) => upd.run(idx + 1, Number(id)));
    });
    tx();
    recordRevision('save_draft', 'إعادة ترتيب مشاريع معرض الأعمال', 'Reordered portfolio projects', adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const row = db.prepare('SELECT title_ar, title_en FROM projects WHERE id = ?').get(id) as
      | { title_ar: string; title_en: string }
      | undefined;
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    if (row) {
      recordRevision('save_draft', `حذف مشروع: ${row.title_ar}`, `Deleted project: ${row.title_en}`, adminEmail);
    }
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  // Admin Site Content update
  app.put('/api/admin/content', requireAdmin, (req, res) => {
    const body = req.body as Record<string, string>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    for (const urlKey of ['heroPrimaryBtnUrl', 'heroSecondaryBtnUrl', 'ctaBannerBtnUrl']) {
      if (body[urlKey] && !isValidUrlOrPath(body[urlKey])) {
        res.status(400).json({ error: `Invalid URL/path for ${urlKey}` });
        return;
      }
    }

    const upsert = db.prepare(
      'INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );
    const tx = db.transaction((entries: [string, string][]) => {
      for (const [k, v] of entries) {
        if (typeof v === 'string') upsert.run(k, v.trim());
      }
    });
    tx(Object.entries(body));
    recordRevision('save_draft', 'تعديل محتوى الصفحة الرئيسية والشركة', 'Updated homepage & brand content', adminEmail);
    res.json({ ok: true, content: getSiteContent(), bundle: getAdminCmsBundle() });
  });

  // Admin Theme (Colors & Fonts) update
  app.put('/api/admin/theme', requireAdmin, (req, res) => {
    const body = (req.body || {}) as Record<string, string>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';

    for (const colorKey of ['primaryBg', 'surfaceBg', 'accentBlue', 'accentGold']) {
      if (body[colorKey] && !isValidHexColor(body[colorKey])) {
        res.status(400).json({ error: `Invalid hex color for ${colorKey}` });
        return;
      }
    }
    if (body.fontFamilyAr && !ALLOWED_AR_FONTS.has(body.fontFamilyAr)) {
      res.status(400).json({ error: 'Unsupported Arabic font family' });
      return;
    }
    if (body.fontFamilyEn && !ALLOWED_EN_FONTS.has(body.fontFamilyEn)) {
      res.status(400).json({ error: 'Unsupported English font family' });
      return;
    }

    const upsert = db.prepare(
      'INSERT INTO theme_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );
    const tx = db.transaction((entries: [string, string][]) => {
      for (const [k, v] of entries) {
        if (typeof v === 'string') upsert.run(k, v.trim());
      }
    });
    tx(Object.entries(body));
    recordRevision('save_draft', 'تحديث ألوان وخطوط المظهر العام', 'Updated theme colors & typography', adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  // Admin Custom Home Sections CRUD & Reordering
  app.post('/api/admin/sections', requireAdmin, (req, res) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const validation = validateSectionInput(
      {
        titleAr: String(b.titleAr || ''),
        titleEn: String(b.titleEn || ''),
        bodyAr: String(b.bodyAr || ''),
        bodyEn: String(b.bodyEn || ''),
        buttonUrl: String(b.buttonUrl || '/quote'),
      },
      'ar'
    );
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const maxOrder =
      (db.prepare('SELECT MAX(sort_order) as maxOrder FROM home_sections').get() as { maxOrder: number | null })
        .maxOrder || 0;
    const sectionKey = `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const layoutStyle = ['split', 'banner', 'cards'].includes(String(b.layoutStyle))
      ? String(b.layoutStyle)
      : 'split';

    const info = db
      .prepare(
        `INSERT INTO home_sections (
          section_key, title_ar, title_en, subtitle_ar, subtitle_en,
          body_ar, body_en, image_url, button_text_ar, button_text_en,
          button_url, layout_style, sort_order, visible
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        sectionKey,
        String(b.titleAr).trim(),
        String(b.titleEn).trim(),
        String(b.subtitleAr || '').trim(),
        String(b.subtitleEn || '').trim(),
        String(b.bodyAr).trim(),
        String(b.bodyEn).trim(),
        String(b.imageUrl || '').trim(),
        String(b.buttonTextAr || '').trim(),
        String(b.buttonTextEn || '').trim(),
        String(b.buttonUrl || '/quote').trim(),
        layoutStyle,
        Number(b.sortOrder) || maxOrder + 1,
        b.visible === false ? 0 : 1
      );

    recordRevision('save_draft', `إضافة قسم مخصص: ${String(b.titleAr).trim()}`, `Added home section: ${String(b.titleEn).trim()}`, adminEmail);
    res.status(201).json({ id: Number(info.lastInsertRowid), bundle: getAdminCmsBundle() });
  });

  app.put('/api/admin/sections/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const b = (req.body || {}) as Record<string, unknown>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const validation = validateSectionInput(
      {
        titleAr: String(b.titleAr || ''),
        titleEn: String(b.titleEn || ''),
        bodyAr: String(b.bodyAr || ''),
        bodyEn: String(b.bodyEn || ''),
        buttonUrl: String(b.buttonUrl || '/quote'),
      },
      'ar'
    );
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const layoutStyle = ['split', 'banner', 'cards'].includes(String(b.layoutStyle))
      ? String(b.layoutStyle)
      : 'split';

    const result = db
      .prepare(
        `UPDATE home_sections SET
          title_ar = ?, title_en = ?, subtitle_ar = ?, subtitle_en = ?,
          body_ar = ?, body_en = ?, image_url = ?, button_text_ar = ?, button_text_en = ?,
          button_url = ?, layout_style = ?, sort_order = COALESCE(?, sort_order), visible = ?
         WHERE id = ?`
      )
      .run(
        String(b.titleAr).trim(),
        String(b.titleEn).trim(),
        String(b.subtitleAr || '').trim(),
        String(b.subtitleEn || '').trim(),
        String(b.bodyAr).trim(),
        String(b.bodyEn).trim(),
        String(b.imageUrl || '').trim(),
        String(b.buttonTextAr || '').trim(),
        String(b.buttonTextEn || '').trim(),
        String(b.buttonUrl || '/quote').trim(),
        layoutStyle,
        typeof b.sortOrder === 'number' ? b.sortOrder : null,
        b.visible === false ? 0 : 1,
        id
      );

    if (result.changes === 0) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    recordRevision('save_draft', `تعديل قسم مخصص: ${String(b.titleAr).trim()}`, `Updated home section: ${String(b.titleEn).trim()}`, adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  app.post('/api/admin/sections/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray((req.body || {}).orderedIds)
      ? ((req.body as { orderedIds: number[] }).orderedIds)
      : [];
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const upd = db.prepare('UPDATE home_sections SET sort_order = ? WHERE id = ?');
    const tx = db.transaction(() => {
      orderedIds.forEach((id, idx) => upd.run(idx + 1, Number(id)));
    });
    tx();
    recordRevision('save_draft', 'إعادة ترتيب أقسام الصفحة الرئيسية', 'Reordered custom home sections', adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  app.delete('/api/admin/sections/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const row = db.prepare('SELECT title_ar, title_en FROM home_sections WHERE id = ?').get(id) as
      | { title_ar: string; title_en: string }
      | undefined;
    db.prepare('DELETE FROM home_sections WHERE id = ?').run(id);
    if (row) {
      recordRevision('save_draft', `حذف قسم: ${row.title_ar}`, `Deleted home section: ${row.title_en}`, adminEmail);
    }
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  // Admin Contact Settings update
  app.put('/api/admin/contact', requireAdmin, (req, res) => {
    const body = req.body as Record<string, string>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const upsert = db.prepare(
      'INSERT INTO contact_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );
    const tx = db.transaction((entries: [string, string][]) => {
      for (const [k, v] of entries) {
        if (typeof v === 'string') upsert.run(k, v.trim());
      }
    });
    tx(Object.entries(body));
    recordRevision('save_draft', 'تحديث بيانات التواصل والموقع الجغرافي', 'Updated contact & map settings', adminEmail);
    res.json({ ok: true, contact: getContactSettings(), bundle: getAdminCmsBundle() });
  });

  // Admin SEO, Domain & Legal Pages update
  app.put('/api/admin/seo-legal', requireAdmin, (req, res) => {
    const body = (req.body || {}) as Record<string, string>;
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const upsert = db.prepare(
      'INSERT INTO seo_legal_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );
    const tx = db.transaction((entries: [string, string][]) => {
      for (const [k, v] of entries) {
        if (typeof v === 'string') upsert.run(k, v.trim());
      }
    });
    tx(Object.entries(body));
    recordRevision('save_draft', 'تحديث إعدادات الدومين وSEO والصفحات القانونية', 'Updated SEO, domain & legal policies', adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  // Full Backup Export & Restore
  app.get('/api/admin/backup', requireAdmin, (_req, res) => {
    const archive = exportFullBackup(UPLOADS_DIR);
    const dateSlug = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="msa-backup-${dateSlug}.json"`);
    res.send(JSON.stringify(archive, null, 2));
  });

  app.post('/api/admin/restore', requireAdmin, (req, res) => {
    const adminEmail = (req as AdminRequest).adminUser?.email || 'admin';
    const check = validateBackupArchive(req.body);
    if (!check.valid) {
      res.status(400).json({ error: check.error || 'Invalid backup file' });
      return;
    }
    importFullBackup(req.body as BackupArchive, UPLOADS_DIR, adminEmail);
    res.json({ ok: true, bundle: getAdminCmsBundle() });
  });

  const resolveRequestOrigin = (req: express.Request): string => {
    const forwardedHost = req.headers['x-forwarded-host'];
    const hostHeader = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.get('host');
    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto || req.protocol || 'https';
    if (hostHeader && !hostHeader.includes('localhost') && !hostHeader.includes('127.0.0.1')) {
      return `${proto}://${hostHeader}`.replace(/\/+$/, '');
    }
    const envAppUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
    if (envAppUrl && envAppUrl.startsWith('http') && !envAppUrl.includes('MY_APP_URL')) {
      return envAppUrl;
    }
    return hostHeader ? `${proto}://${hostHeader}`.replace(/\/+$/, '') : '';
  };

  const applyPublishedSeoToHtml = (html: string, req: express.Request): string => {
    const pub = getPublicSiteData(false);
    const origin = resolveRequestOrigin(req);
    const reqPath = req.path && req.path !== '/' ? req.path : '';
    const pageUrl = origin ? `${origin}${reqPath}` : '/';
    const ogImageUrl = origin ? `${origin}/og-image.jpg` : '/og-image.jpg';

    return injectSeoMetaTags(html, {
      title:
        pub.seoLegal.metaTitleAr ||
        `${pub.content.companyNameAr} | ${pub.content.companyNameEn}`,
      description: pub.seoLegal.metaDescriptionAr || pub.content.heroSubtitleAr,
      siteName: `${pub.content.companyNameAr} | ${pub.content.companyNameEn}`,
      url: pageUrl,
      imageUrl: ogImageUrl,
    });
  };

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(async (req, res, next) => {
      const accept = req.headers.accept || '';
      const isHtmlNav =
        req.method === 'GET' &&
        accept.includes('text/html') &&
        !req.path.startsWith('/api') &&
        !req.path.startsWith('/uploads') &&
        !req.path.startsWith('/src') &&
        !req.path.startsWith('/@') &&
        !req.path.includes('.');

      if (!isHtmlNav) {
        next();
        return;
      }

      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const withSeo = applyPublishedSeoToHtml(transformed, req);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(withSeo);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const distIndex = path.join(distPath, 'index.html');
      if (!fs.existsSync(distIndex)) {
        res.status(404).send('Not found');
        return;
      }
      const rawHtml = fs.readFileSync(distIndex, 'utf-8');
      const withSeo = applyPublishedSeoToHtml(rawHtml, req);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(withSeo);
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mahmoud Shaaban Advertising server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
