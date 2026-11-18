import React, { useCallback, useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Edit3,
  ImagePlus,
  Lock,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from './ImageWithFallback';
import type { AdminSessionUser, PortfolioProject } from '../shared/types';

export const PORTFOLIO_CATEGORIES = [
  'all',
  'stainless-letters',
  'acrylic-letters',
  'smart-letters',
  'cladding-facades',
  'flex-signs',
  'led-lighting',
  'commercial-storefronts',
  'before-after',
  'mirror-signs',
] as const;

export const MANAGEABLE_CATEGORIES = PORTFOLIO_CATEGORIES.filter((c) => c !== 'all');

export const DEFAULT_BRAND_FACE_IMAGE =
  '/src/assets/images/engineer_mahmoud_portrait_1794875545412.jpg';

interface ManagerFormState {
  titleAr: string;
  titleEn: string;
  category: string;
  clientName: string;
  locationAr: string;
  dimensions: string;
  descriptionAr: string;
  descriptionEn: string;
  completionYear: string;
  imageUrl: string;
}

const EMPTY_MANAGER_FORM: ManagerFormState = {
  titleAr: '',
  titleEn: '',
  category: 'stainless-letters',
  clientName: 'تنفيذ ميداني — المنيا',
  locationAr: 'المنيا - بني مزار',
  dimensions: '350 × 120 سم',
  descriptionAr: '',
  descriptionEn: '',
  completionYear: String(new Date().getFullYear()),
  imageUrl: '',
};

async function optimizeMobileImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to decode image'));
      el.src = dataUrl;
    });

    const maxEdge = 1800;
    const scale = Math.min(1, maxEdge / Math.max(img.width || 1, img.height || 1));
    const targetW = Math.max(1, Math.round((img.width || 800) * scale));
    const targetH = Math.max(1, Math.round((img.height || 600) * scale));

    if (scale === 1 && file.size < 1.8 * 1024 * 1024 && /^image\/(jpeg|webp)$/.test(file.type)) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.88)
    );
    if (!blob) return file;

    const cleanName = (file.name || 'mobile-work').replace(/\.[^.]+$/, '');
    return new File([blob], `${cleanName}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

interface PortfolioManagerModalProps {
  isOpen: boolean;
  initialTab?: 'form' | 'list' | 'brand';
  projectToEdit?: PortfolioProject | null;
  onClose: () => void;
  onSavedWork?: (category: string) => void;
}

export function PortfolioManagerModal({
  isOpen,
  initialTab = 'form',
  projectToEdit = null,
  onClose,
  onSavedWork,
}: PortfolioManagerModalProps) {
  const { lang, data, refreshPublicData, getCategoryLabel } = useApp();
  const isAr = lang === 'ar';

  const [managerTab, setManagerTab] = useState<'form' | 'list' | 'brand'>(initialTab);
  const [authToken, setAuthToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem('msa_admin_token') : null
  );
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<ManagerFormState>(EMPTY_MANAGER_FORM);
  const [brandImageUrl, setBrandImageUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const projects = data?.projects || [];

  const buildAuthHeaders = useCallback(
    (extra: Record<string, string> = {}) => {
      const headers: Record<string, string> = { ...extra };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      return headers;
    },
    [authToken]
  );

  const verifySession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const res = await fetch('/api/admin/session', {
        headers: buildAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const json = (await res.json()) as { user: AdminSessionUser | null };
        setAdminUser(json.user);
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setCheckingSession(false);
    }
  }, [buildAuthHeaders]);

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    setConfirmDeleteId(null);
    setBrandImageUrl(data?.content?.logoUrl || DEFAULT_BRAND_FACE_IMAGE);
    if (projectToEdit) {
      setEditingId(projectToEdit.id);
      setFormState({
        titleAr: projectToEdit.titleAr,
        titleEn: projectToEdit.titleEn,
        category: projectToEdit.category,
        clientName: projectToEdit.clientName || '',
        locationAr: projectToEdit.locationAr || 'المنيا - بني مزار',
        dimensions: projectToEdit.dimensions || '350 × 120 سم',
        descriptionAr: projectToEdit.descriptionAr || '',
        descriptionEn: projectToEdit.descriptionEn || '',
        completionYear: projectToEdit.completionYear || '2026',
        imageUrl: projectToEdit.imageUrl,
      });
      setManagerTab('form');
    } else {
      setEditingId(null);
      setFormState(EMPTY_MANAGER_FORM);
      setManagerTab(initialTab);
    }
    void verifySession();
  }, [isOpen, initialTab, projectToEdit, data?.content?.logoUrl, verifySession]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError(isAr ? 'أدخل البريد الإلكتروني وكلمة المرور أولاً.' : 'Email and password required.');
      return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const json = (await res.json()) as { user?: AdminSessionUser; token?: string; error?: string };
      if (!res.ok || !json.user || !json.token) {
        throw new Error(json.error || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
      }
      window.localStorage.setItem('msa_admin_token', json.token);
      setAuthToken(json.token);
      setAdminUser(json.user);
      setLoginPassword('');
      setFeedback({
        type: 'ok',
        text: isAr ? 'تم فتح لوحة إدارة المعرض بنجاح.' : 'Gallery manager unlocked.',
      });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const uploadMobileFile = async (file: File): Promise<string> => {
    const optimized = await optimizeMobileImageForUpload(file);
    const fd = new FormData();
    fd.append('image', optimized);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: buildAuthHeaders(),
      credentials: 'include',
      body: fd,
    });
    const json = (await res.json()) as { imageUrl?: string; error?: string };
    if (!res.ok || !json.imageUrl) {
      throw new Error(json.error || (isAr ? 'فشل رفع الصورة من الجهاز' : 'Photo upload failed'));
    }
    return json.imageUrl;
  };

  const handlePhonePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    e.target.value = '';
    if (!rawFile) return;

    setUploadingPhoto(true);
    setFeedback(null);
    try {
      const uploadedUrl = await uploadMobileFile(rawFile);
      setFormState((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      setFeedback({
        type: 'ok',
        text: isAr
          ? 'تم رفع الصورة وضغطها على الخادم بنجاح — اكتب اسم العمل واضغط حفظ ونشر.'
          : 'Photo uploaded and compressed. Fill details and save.',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Upload failed',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleBrandFaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    e.target.value = '';
    if (!rawFile) return;

    setUploadingPhoto(true);
    setFeedback(null);
    try {
      const uploadedUrl = await uploadMobileFile(rawFile);
      setBrandImageUrl(uploadedUrl);

      const saveRes = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ logoUrl: uploadedUrl }),
      });
      if (!saveRes.ok) throw new Error(isAr ? 'تعذر حفظ صورة وجه الموقع' : 'Failed to save face image');

      const pubRes = await fetch('/api/admin/cms/publish', {
        method: 'POST',
        headers: buildAuthHeaders(),
        credentials: 'include',
      });
      if (!pubRes.ok) throw new Error(isAr ? 'تعذر النشر المباشر للصورة' : 'Publish failed');

      await refreshPublicData(false);
      setFeedback({
        type: 'ok',
        text: isAr
          ? 'تم تحديث صورة وجه الموقع ونشرها في الصفحة الرئيسية وصفحات التواصل والهيدر بشكل دائم.'
          : 'Website face image updated across Home, Contact, and Header permanently.',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Upload failed',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveAndPublishProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formState.imageUrl.trim()) {
      setFeedback({
        type: 'err',
        text: isAr ? 'يرجى اختيار صورة من الهاتف أولاً.' : 'Please upload a photo first.',
      });
      return;
    }
    if (!formState.titleAr.trim()) {
      setFeedback({
        type: 'err',
        text: isAr ? 'يرجى كتابة اسم العمل.' : 'Please enter a work title.',
      });
      return;
    }

    setSavingProject(true);
    try {
      const safeTitleAr = formState.titleAr.trim();
      const safeTitleEn = formState.titleEn.trim() || safeTitleAr;
      const safeDescAr =
        formState.descriptionAr.trim() ||
        `تنفيذ ${safeTitleAr} بخامات عالية الجودة وإضاءة LED احترافية — ${getCategoryLabel(formState.category)}.`;
      const safeDescEn =
        formState.descriptionEn.trim() ||
        `${safeTitleEn} fabricated with durable materials and precision LED lighting.`;

      const payload = {
        titleAr: safeTitleAr,
        titleEn: safeTitleEn,
        category: formState.category,
        serviceSlug: formState.category,
        clientName: formState.clientName.trim() || 'مشروع منفذ',
        locationAr: formState.locationAr.trim() || 'المنيا - بني مزار',
        locationEn: 'Minya - Beni Mazar',
        dimensions: formState.dimensions.trim() || '350 × 120 سم',
        lightingAr: 'إضاءة LED احترافية عالية السطوع',
        lightingEn: 'High-lumen architectural LED lighting',
        materialsAr: getCategoryLabel(formState.category),
        materialsEn: formState.category,
        descriptionAr: safeDescAr,
        descriptionEn: safeDescEn,
        completionYear: formState.completionYear.trim() || String(new Date().getFullYear()),
        imageUrl: formState.imageUrl.trim(),
        featured: true,
      };

      const url = editingId ? `/api/admin/projects/${editingId}` : '/api/admin/projects';
      const method = editingId ? 'PUT' : 'POST';
      const saveRes = await fetch(url, {
        method,
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const saveJson = (await saveRes.json()) as { error?: string };
      if (!saveRes.ok) throw new Error(saveJson.error || 'Failed to save work');

      const pubRes = await fetch('/api/admin/cms/publish', {
        method: 'POST',
        headers: buildAuthHeaders(),
        credentials: 'include',
      });
      if (!pubRes.ok) {
        throw new Error(isAr ? 'تم الحفظ في المسودة ولكن تعذر النشر الفوري.' : 'Saved draft, failed to publish.');
      }

      await refreshPublicData(false);
      onSavedWork?.(formState.category);
      setEditingId(null);
      setFormState(EMPTY_MANAGER_FORM);
      setFeedback({
        type: 'ok',
        text: isAr
          ? 'تم حفظ العمل ونشره في المعرض بشكل دائم وسيظل محفوظاً بعد إغلاق الموقع.'
          : 'Work saved and published permanently.',
      });
      setManagerTab('list');
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Save failed',
      });
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    setDeletingId(id);
    setFeedback(null);
    try {
      const delRes = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
        credentials: 'include',
      });
      if (!delRes.ok) throw new Error(isAr ? 'تعذر حذف العمل.' : 'Delete failed');

      const pubRes = await fetch('/api/admin/cms/publish', {
        method: 'POST',
        headers: buildAuthHeaders(),
        credentials: 'include',
      });
      if (!pubRes.ok) throw new Error(isAr ? 'تعذر تحديث النشر بعد الحذف.' : 'Publish failed');

      await refreshPublicData(false);
      setConfirmDeleteId(null);
      setFeedback({
        type: 'ok',
        text: isAr ? 'تم حذف العمل وتحديث المعرض بنجاح.' : 'Work removed from live portfolio.',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Delete error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'لوحة إدارة معرض الأعمال' : 'Portfolio Gallery Manager'}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#12141A] border border-white/15 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {isAr ? 'لوحة إدارة معرض الأعمال وواجهة الموقع' : 'Portfolio & Brand Image Manager'}
            </h2>
            <p className="text-xs text-[#A1A6B3]">
              {isAr
                ? 'ارفع صور شغلك من معرض الهاتف، صنّفها واحفظها أو عدّلها واحذفها — تُحفظ فعلياً في قاعدة البيانات.'
                : 'Upload phone photos, edit, delete, or update the website face image permanently.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="p-2 rounded-lg bg-[#0A0B0E] text-[#B5BAC7] hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkingSession ? (
          <div className="py-10 text-center text-sm text-[#A1A6B3]">
            {isAr ? 'جاري التحقق من صلاحية الإدارة...' : 'Verifying session...'}
          </div>
        ) : !adminUser ? (
          <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto py-3">
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#F5D061]">
              <Lock className="w-4 h-4" />
              <span>
                {isAr
                  ? 'سجّل الدخول بحساب الإدارة لرفع وتعديل وحذف الصور'
                  : 'Sign in with administrator account to upload, edit, or delete photos'}
              </span>
            </div>

            {loginError && (
              <p className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {loginError}
              </p>
            )}

            <div>
              <label htmlFor="pm-email" className="block text-xs font-semibold text-[#D4D7E0] mb-1">
                {isAr ? 'البريد الإلكتروني' : 'Admin Email'}
              </label>
              <input
                id="pm-email"
                type="email"
                dir="ltr"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@mahmoudshaaban.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label htmlFor="pm-pass" className="block text-xs font-semibold text-[#D4D7E0] mb-1">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                id="pm-pass"
                type="password"
                dir="ltr"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 text-sm font-extrabold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
            >
              {loggingIn
                ? isAr
                  ? 'جاري الدخول...'
                  : 'Signing in...'
                : isAr
                  ? 'دخول وفتح لوحة إدارة المعرض'
                  : 'Unlock Gallery Manager'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Switch Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormState(EMPTY_MANAGER_FORM);
                  setManagerTab('form');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                  managerTab === 'form'
                    ? 'bg-[#D4AF37] text-[#0A0B0E]'
                    : 'bg-[#0A0B0E] text-[#B5BAC7] border border-white/10'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>
                  {editingId
                    ? isAr
                      ? 'تعديل العمل الحالي'
                      : 'Edit Work'
                    : isAr
                      ? 'إضافة صورة من الهاتف'
                      : 'Add Phone Photo'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setManagerTab('list')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                  managerTab === 'list'
                    ? 'bg-[#1D6BFF] text-white'
                    : 'bg-[#0A0B0E] text-[#B5BAC7] border border-white/10'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>
                  {isAr ? `كل الأعمال المنشورة (${projects.length})` : `All Published (${projects.length})`}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setManagerTab('brand')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                  managerTab === 'brand'
                    ? 'bg-emerald-500 text-[#050608]'
                    : 'bg-[#0A0B0E] text-[#B5BAC7] border border-white/10'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{isAr ? 'صورة وجه الموقع (الرئيسية والتواصل)' : 'Site Face Image'}</span>
              </button>
            </div>

            {feedback && (
              <div
                role="status"
                className={`flex items-center gap-2 p-3 rounded-lg text-xs font-semibold ${
                  feedback.type === 'ok'
                    ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300'
                    : 'bg-red-500/15 border border-red-500/35 text-red-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback.text}</span>
              </div>
            )}

            {managerTab === 'brand' ? (
              <div className="bg-[#0A0B0E] border border-[#D4AF37]/40 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-[#12141A] border-2 border-[#D4AF37]/70 shrink-0">
                  <ImageWithFallback
                    src={brandImageUrl || DEFAULT_BRAND_FACE_IMAGE}
                    alt={isAr ? 'صورة وجه الموقع' : 'Website Face Photo'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-start">
                  <h3 className="text-base font-extrabold text-white">
                    {isAr
                      ? 'صورة وجه الموقع (الصفحة الرئيسية وصفحات التواصل)'
                      : 'Website Face & Identity Image'}
                  </h3>
                  <p className="text-xs text-[#B5BAC7] leading-relaxed">
                    {isAr
                      ? 'اختر صورتك أو شعارك من معرض الهاتف لكي تظهر فوراً كوجه الموقع في الصفحة الرئيسية وصفحات التواصل والشريط العلوي وتبقى محفوظة دائماً.'
                      : 'Choose a photo from your mobile gallery to appear immediately on Home, Contact pages, and Header.'}
                  </p>
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0A0B0E] text-xs font-extrabold hover:brightness-110 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>
                      {uploadingPhoto
                        ? isAr
                          ? 'جاري رفع وحفظ الصورة...'
                          : 'Uploading...'
                        : isAr
                          ? 'اختيار صورة من الهاتف لوجه الموقع'
                          : 'Upload Face Photo from Phone'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPhoto}
                      onChange={handleBrandFaceUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            ) : managerTab === 'form' ? (
              <form onSubmit={handleSaveAndPublishProject} className="space-y-4">
                <div className="bg-[#0A0B0E] border border-dashed border-[#D4AF37]/50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-40 h-32 rounded-lg overflow-hidden bg-[#12141A] border border-white/10 shrink-0 flex items-center justify-center">
                    {formState.imageUrl ? (
                      <ImageWithFallback
                        src={formState.imageUrl}
                        alt={formState.titleAr || 'Preview'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="w-8 h-8 text-[#8C92A0]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5 w-full">
                    <p className="text-xs text-[#B5BAC7]">
                      {isAr
                        ? 'اضغط الزر بالأسفل لفتح معرض الصور في هاتفك أو جهازك واختيار صورة العمل:'
                        : 'Tap below to open your phone photo gallery and choose a work photo:'}
                    </p>
                    <label className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0A0B0E] text-xs font-extrabold hover:brightness-110 cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <span>
                        {uploadingPhoto
                          ? isAr
                            ? 'جاري ضغط ورفع الصورة...'
                            : 'Uploading photo...'
                          : isAr
                            ? 'إضافة صورة من الهاتف'
                            : 'Choose Photo from Phone'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingPhoto}
                        onChange={handlePhonePhotoSelect}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="pm-title-ar" className="block text-xs font-semibold text-[#D4D7E0] mb-1">
                      {isAr ? 'اسم العمل *' : 'Work Title *'}
                    </label>
                    <input
                      id="pm-title-ar"
                      type="text"
                      required
                      value={formState.titleAr}
                      onChange={(e) => setFormState((p) => ({ ...p, titleAr: e.target.value }))}
                      placeholder={isAr ? 'مثال: واجهة كلادينج وحروف استانلس ذهبي' : 'e.g. Gold Stainless Facade'}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white outline-none focus:border-[#1D6BFF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="pm-category" className="block text-xs font-semibold text-[#D4D7E0] mb-1">
                      {isAr ? 'التصنيف *' : 'Division / Category *'}
                    </label>
                    <select
                      id="pm-category"
                      value={formState.category}
                      onChange={(e) => setFormState((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white outline-none focus:border-[#1D6BFF]"
                    >
                      {MANAGEABLE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {getCategoryLabel(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pm-dims" className="block text-xs font-semibold text-[#D4D7E0] mb-1">
                      {isAr ? 'المقاسات والأبعاد' : 'Dimensions'}
                    </label>
                    <input
                      id="pm-dims"
                      type="text"
                      value={formState.dimensions}
                      onChange={(e) => setFormState((p) => ({ ...p, dimensions: e.target.value }))}
                      placeholder="400 × 120 سم"
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white outline-none focus:border-[#1D6BFF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="pm-location" className="block text-xs font-semibold text-[#D4D7E0] mb-1">
                      {isAr ? 'الموقع / العميل' : 'Location / Client'}
                    </label>
                    <input
                      id="pm-location"
                      type="text"
                      value={formState.locationAr}
                      onChange={(e) => setFormState((p) => ({ ...p, locationAr: e.target.value }))}
                      placeholder="المنيا - بني مزار"
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white outline-none focus:border-[#1D6BFF]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pm-desc-ar" className="block text-xs font-semibold text-[#D4D7E0] mb-1">
                    {isAr ? 'وصف العمل والخامات المستخدمة' : 'Work Description & Materials'}
                  </label>
                  <textarea
                    id="pm-desc-ar"
                    rows={2}
                    value={formState.descriptionAr}
                    onChange={(e) => setFormState((p) => ({ ...p, descriptionAr: e.target.value }))}
                    placeholder={
                      isAr
                        ? 'اكتب وصفاً مختصراً لنوع الخامة والإضاءة (اختياري)...'
                        : 'Optional fabrication details...'
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white outline-none focus:border-[#1D6BFF]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={savingProject || uploadingPhoto}
                    className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] disabled:opacity-60 cursor-pointer"
                  >
                    {savingProject
                      ? isAr
                        ? 'جاري الحفظ والنشر...'
                        : 'Saving...'
                      : editingId
                        ? isAr
                          ? 'حفظ التعديلات ونشرها'
                          : 'Save & Publish Updates'
                        : isAr
                          ? 'حفظ العمل ونشره في المعرض'
                          : 'Save & Publish to Gallery'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormState(EMPTY_MANAGER_FORM);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0A0B0E] text-[#B5BAC7] border border-white/15 cursor-pointer"
                    >
                      {isAr ? 'إلغاء التعديل' : 'Cancel Edit'}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pe-1">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0A0B0E] border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageWithFallback
                        src={p.imageUrl}
                        alt={p.titleAr}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {isAr ? p.titleAr : p.titleEn}
                        </div>
                        <div className="text-xs text-[#A1A6B3]">
                          {getCategoryLabel(p.category)} · {p.dimensions}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(p.id);
                          setFormState({
                            titleAr: p.titleAr,
                            titleEn: p.titleEn,
                            category: p.category,
                            clientName: p.clientName || '',
                            locationAr: p.locationAr || 'المنيا - بني مزار',
                            dimensions: p.dimensions || '350 × 120 سم',
                            descriptionAr: p.descriptionAr || '',
                            descriptionEn: p.descriptionEn || '',
                            completionYear: p.completionYear || '2026',
                            imageUrl: p.imageUrl,
                          });
                          setManagerTab('form');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161920] text-[#60A5FA] hover:bg-[#1D6BFF]/20 text-xs font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>

                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={deletingId === p.id}
                            onClick={() => void handleDeleteProject(p.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                          >
                            {deletingId === p.id ? '...' : isAr ? 'تأكيد الحذف' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-lg bg-[#161920] text-[#B5BAC7] text-xs cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(p.id)}
                          aria-label={isAr ? `حذف ${p.titleAr}` : `Delete ${p.titleEn}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161920] text-red-400 hover:bg-red-500/15 text-xs font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'حذف' : 'Delete'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
