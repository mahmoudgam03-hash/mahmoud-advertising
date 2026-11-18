import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  History,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Lock,
  LogOut,
  Plus,
  Rocket,
  Search,
  Settings,
  Share2,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type {
  AdminCmsBundle,
  AdminSessionUser,
  ContactMessage,
  ContactSettings,
  HomeCustomSection,
  PortfolioProject,
  QuoteRequest,
  QuoteStatus,
  SeoAndLegalSettings,
  ServiceItem,
  SiteContent,
  ThemeSettings,
} from '../shared/types';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { CmsHomepageTab } from '../components/admin/CmsHomepageTab';
import { CmsSettingsTab } from '../components/admin/CmsSettingsTab';
import { CmsRevisionsTab } from '../components/admin/CmsRevisionsTab';
import { CmsPublishShareTab } from '../components/admin/CmsPublishShareTab';
import { CmsEngineerPhotosPanel } from '../components/admin/CmsEngineerPhotosPanel';

type AdminTab = 'quotes' | 'homepage' | 'services' | 'projects' | 'settings' | 'publish' | 'revisions';

const EMPTY_SERVICE_FORM = {
  titleAr: '',
  titleEn: '',
  category: 'letters',
  descriptionAr: '',
  descriptionEn: '',
  specsAr: '',
  specsEn: '',
  materialsAr: '',
  materialsEn: '',
  price: '',
  showPrice: false,
  imageUrl: '/src/assets/images/service_stainless_letters_1794750814371.jpg',
  featured: true,
  sortOrder: 12,
};

const EMPTY_PROJECT_FORM = {
  titleAr: '',
  titleEn: '',
  category: 'stainless-letters',
  serviceSlug: 'stainless-letters',
  clientName: '',
  locationAr: 'المنيا، مصر',
  locationEn: 'Minya, Egypt',
  dimensions: '350 × 120 سم',
  lightingAr: 'إضاءة LED خلفية دافئة',
  lightingEn: 'Warm Halo LED Backlight',
  materialsAr: 'استانلس ستيل 304 وأكريليك',
  materialsEn: '304 Stainless Steel & Cast Acrylic',
  descriptionAr: '',
  descriptionEn: '',
  completionYear: '2026',
  imageUrl: '/src/assets/images/service_stainless_letters_1794750814371.jpg',
  featured: true,
};

export function AdminPage() {
  const { lang, navigate, refreshPublicData, getCategoryLabel } = useApp();
  const isAr = lang === 'ar';

  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(() =>
    window.localStorage.getItem('msa_admin_token')
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>('quotes');
  const [cmsBundle, setCmsBundle] = useState<AdminCmsBundle | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [undoing, setUndoing] = useState(false);

  // Inline Delete Confirmations
  const [confirmDeleteQuoteId, setConfirmDeleteQuoteId] = useState<number | null>(null);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<number | null>(null);
  const [confirmDeleteServiceId, setConfirmDeleteServiceId] = useState<number | null>(null);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<number | null>(null);

  // Editors State
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);

  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);

  const [contentForm, setContentForm] = useState<SiteContent | null>(null);
  const [contactForm, setContactForm] = useState<ContactSettings | null>(null);
  const [themeForm, setThemeForm] = useState<ThemeSettings | null>(null);
  const [seoLegalForm, setSeoLegalForm] = useState<SeoAndLegalSettings | null>(null);

  const authHeaders = useCallback(
    (extra: Record<string, string> = {}) => {
      const headers: Record<string, string> = { ...extra };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      return headers;
    },
    [authToken]
  );

  const syncBundleToForms = useCallback((bundle: AdminCmsBundle) => {
    setCmsBundle(bundle);
    setContentForm(bundle.draft.content);
    setContactForm(bundle.draft.contact);
    setThemeForm(bundle.draft.theme);
    setSeoLegalForm(bundle.draft.seoLegal);
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const [quotesRes, cmsRes] = await Promise.all([
        fetch('/api/admin/quotes', { headers: authHeaders(), credentials: 'include' }),
        fetch('/api/admin/cms', { headers: authHeaders(), credentials: 'include' }),
      ]);
      if (quotesRes.ok) {
        const qJson = (await quotesRes.json()) as { quotes: QuoteRequest[]; messages: ContactMessage[] };
        setQuotes(qJson.quotes);
        setMessages(qJson.messages);
      }
      if (cmsRes.ok) {
        const cJson = (await cmsRes.json()) as AdminCmsBundle;
        syncBundleToForms(cJson);
      }
    } catch {
      // handled cleanly
    }
  }, [authHeaders, syncBundleToForms]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session', {
          headers: authHeaders(),
          credentials: 'include',
        });
        if (res.ok) {
          const json = (await res.json()) as { user: AdminSessionUser | null };
          setUser(json.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    void checkSession();
  }, [authHeaders]);

  useEffect(() => {
    if (user) {
      void fetchAdminData();
    }
  }, [user, fetchAdminData]);

  const notify = (msg: string) => {
    setErrorMessage(null);
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Email and password are required');
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
      setUser(json.user);
      setLoginPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    window.localStorage.removeItem('msa_admin_token');
    setAuthToken(null);
    setUser(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: formData,
    });
    const json = (await res.json()) as { imageUrl?: string; error?: string };
    if (!res.ok || !json.imageUrl) {
      setErrorMessage(json.error || 'Upload failed');
      return null;
    }
    notify(isAr ? 'تم رفع الصورة وحفظها على الخادم' : 'Image uploaded to server');
    return json.imageUrl;
  };

  const handlePublish = async () => {
    setPublishing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/cms/publish', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });
      const json = (await res.json()) as { ok?: boolean; bundle?: AdminCmsBundle; error?: string };
      if (!res.ok || !json.bundle) {
        throw new Error(json.error || 'Failed to publish');
      }
      syncBundleToForms(json.bundle);
      await refreshPublicData(false);
      notify(isAr ? 'تم نشر جميع التغييرات على الموقع المباشر بنجاح' : 'All draft changes published live');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleUndo = async () => {
    setUndoing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/cms/undo', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });
      const json = (await res.json()) as { ok?: boolean; bundle?: AdminCmsBundle; error?: string };
      if (!res.ok || !json.bundle) {
        throw new Error(json.error || 'Nothing to undo');
      }
      syncBundleToForms(json.bundle);
      notify(isAr ? 'تم التراجع عن آخر تعديل واستعادة الحالة السابقة في المسودة' : 'Undid last edit in draft');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Undo failed');
    } finally {
      setUndoing(false);
    }
  };

  // Quote & Message actions
  const updateQuoteStatus = async (id: number, status: QuoteStatus) => {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
      notify(isAr ? 'تم تحديث حالة الطلب' : 'Quote status updated');
    }
  };

  const deleteQuote = async (id: number) => {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      setConfirmDeleteQuoteId(null);
      notify(isAr ? 'تم حذف الطلب نهائياً' : 'Quote deleted');
    }
  };

  const deleteMessage = async (id: number) => {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setConfirmDeleteMessageId(null);
      notify(isAr ? 'تم حذف الرسالة' : 'Message deleted');
    }
  };

  // Service CRUD & Reorder
  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const url = editingServiceId ? `/api/admin/services/${editingServiceId}` : '/api/admin/services';
    const method = editingServiceId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(serviceForm),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok) {
      setErrorMessage(json.error || 'Failed to save service');
      return;
    }
    if (json.bundle) syncBundleToForms(json.bundle);
    setEditingServiceId(null);
    setServiceForm(EMPTY_SERVICE_FORM);
    notify(isAr ? 'تم حفظ الخدمة في المسودة (اضغط نشر لتظهر للزوار)' : 'Service saved in draft');
  };

  const editService = (s: ServiceItem) => {
    setEditingServiceId(s.id);
    setServiceForm({
      titleAr: s.titleAr,
      titleEn: s.titleEn,
      category: s.category,
      descriptionAr: s.descriptionAr,
      descriptionEn: s.descriptionEn,
      specsAr: s.specsAr,
      specsEn: s.specsEn,
      materialsAr: s.materialsAr || '',
      materialsEn: s.materialsEn || '',
      price: s.price || '',
      showPrice: Boolean(s.showPrice),
      imageUrl: s.imageUrl,
      featured: s.featured,
      sortOrder: s.sortOrder,
    });
  };

  const deleteService = async (id: number) => {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle };
    if (res.ok && json.bundle) {
      syncBundleToForms(json.bundle);
      setConfirmDeleteServiceId(null);
      notify(isAr ? 'تم حذف الخدمة من المسودة' : 'Service deleted from draft');
    }
  };

  const moveService = async (idx: number, dir: -1 | 1) => {
    const list = cmsBundle?.draft.services || [];
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= list.length) return;
    const copy = [...list];
    const [item] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, item);
    const res = await fetch('/api/admin/services/reorder', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ orderedIds: copy.map((s) => s.id) }),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle };
    if (res.ok && json.bundle) {
      syncBundleToForms(json.bundle);
      notify(isAr ? 'تم تحديث ترتيب الخدمات' : 'Services reordered');
    }
  };

  // Project CRUD & Reorder
  const submitProject = async (publishNow: boolean) => {
    setErrorMessage(null);
    const safeTitleAr = projectForm.titleAr.trim();
    const safeTitleEn = projectForm.titleEn.trim() || safeTitleAr;
    const safeDescAr = projectForm.descriptionAr.trim();
    const safeDescEn = projectForm.descriptionEn.trim() || safeDescAr;
    const payload = {
      ...projectForm,
      titleAr: safeTitleAr,
      titleEn: safeTitleEn,
      descriptionAr: safeDescAr,
      descriptionEn: safeDescEn,
    };

    const url = editingProjectId ? `/api/admin/projects/${editingProjectId}` : '/api/admin/projects';
    const method = editingProjectId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok) {
      setErrorMessage(json.error || 'Failed to save project');
      return;
    }

    if (publishNow) {
      const pubRes = await fetch('/api/admin/cms/publish', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });
      const pubJson = (await pubRes.json()) as { bundle?: AdminCmsBundle; error?: string };
      if (!pubRes.ok || !pubJson.bundle) {
        setErrorMessage(pubJson.error || 'Saved draft, but publish failed');
        return;
      }
      syncBundleToForms(pubJson.bundle);
      await refreshPublicData(false);
      notify(isAr ? 'تم حفظ العمل ونشره مباشرة في معرض الموقع' : 'Project saved and published live');
    } else {
      if (json.bundle) syncBundleToForms(json.bundle);
      notify(isAr ? 'تم حفظ المشروع في المسودة (اضغط نشر لتحديث المعرض)' : 'Project saved in draft');
    }

    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT_FORM);
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitProject(false);
  };

  const editProject = (p: PortfolioProject) => {
    setEditingProjectId(p.id);
    setProjectForm({
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      category: p.category,
      serviceSlug: p.serviceSlug,
      clientName: p.clientName,
      locationAr: p.locationAr,
      locationEn: p.locationEn,
      dimensions: p.dimensions,
      lightingAr: p.lightingAr,
      lightingEn: p.lightingEn,
      materialsAr: p.materialsAr,
      materialsEn: p.materialsEn,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      completionYear: p.completionYear,
      imageUrl: p.imageUrl,
      featured: p.featured,
    });
  };

  const deleteProject = async (id: number) => {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle };
    if (res.ok && json.bundle) {
      syncBundleToForms(json.bundle);
      setConfirmDeleteProjectId(null);
      notify(isAr ? 'تم حذف المشروع من المسودة' : 'Project deleted from draft');
    }
  };

  const moveProject = async (idx: number, dir: -1 | 1) => {
    const list = cmsBundle?.draft.projects || [];
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= list.length) return;
    const copy = [...list];
    const [item] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, item);
    const res = await fetch('/api/admin/projects/reorder', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ orderedIds: copy.map((p) => p.id) }),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle };
    if (res.ok && json.bundle) {
      syncBundleToForms(json.bundle);
      notify(isAr ? 'تم تحديث ترتيب مشاريع المعرض' : 'Portfolio order updated');
    }
  };

  // Homepage / Theme / Custom Sections / Settings handlers
  const saveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm) return;
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(contentForm),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok) {
      setErrorMessage(json.error || 'Failed to save content');
      return;
    }
    if (json.bundle) syncBundleToForms(json.bundle);
    notify(isAr ? 'تم حفظ تعديلات الصفحة الرئيسية في المسودة' : 'Homepage draft saved');
  };

  const saveThemeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeForm) return;
    const res = await fetch('/api/admin/theme', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(themeForm),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok) {
      setErrorMessage(json.error || 'Failed to save theme');
      return;
    }
    if (json.bundle) syncBundleToForms(json.bundle);
    notify(isAr ? 'تم حفظ الألوان والخطوط في المسودة' : 'Theme saved in draft');
  };

  const saveCustomSection = async (sec: Partial<HomeCustomSection>, editingId: number | null) => {
    const url = editingId ? `/api/admin/sections/${editingId}` : '/api/admin/sections';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(sec),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok) {
      setErrorMessage(json.error || 'Failed to save section');
      return false;
    }
    if (json.bundle) syncBundleToForms(json.bundle);
    notify(isAr ? 'تم حفظ القسم المخصص في المسودة' : 'Section saved in draft');
    return true;
  };

  const deleteCustomSection = async (id: number) => {
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle };
    if (res.ok && json.bundle) {
      syncBundleToForms(json.bundle);
      notify(isAr ? 'تم حذف القسم المخصص' : 'Section deleted');
    }
  };

  const reorderCustomSections = async (orderedIds: number[]) => {
    const res = await fetch('/api/admin/sections/reorder', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ orderedIds }),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle };
    if (res.ok && json.bundle) {
      syncBundleToForms(json.bundle);
      notify(isAr ? 'تم تحديث ترتيب الأقسام' : 'Sections reordered');
    }
  };

  const toggleSectionVisibility = async (sec: HomeCustomSection) => {
    await saveCustomSection({ ...sec, visible: !sec.visible }, sec.id);
  };

  const saveContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm) return;
    const res = await fetch('/api/admin/contact', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(contactForm),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok) {
      setErrorMessage(json.error || 'Failed to save contact settings');
      return;
    }
    if (json.bundle) syncBundleToForms(json.bundle);
    notify(isAr ? 'تم حفظ بيانات التواصل في المسودة' : 'Contact settings saved in draft');
  };

  const saveSeoLegalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoLegalForm) return;
    const res = await fetch('/api/admin/seo-legal', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(seoLegalForm),
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok) {
      setErrorMessage(json.error || 'Failed to save SEO & policies');
      return;
    }
    if (json.bundle) syncBundleToForms(json.bundle);
    notify(isAr ? 'تم حفظ إعدادات SEO والسياسات القانونية في المسودة' : 'SEO & policies saved in draft');
  };

  const restoreRevision = async (id: number) => {
    const res = await fetch(`/api/admin/cms/revisions/${id}/restore`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
    });
    const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
    if (!res.ok || !json.bundle) {
      setErrorMessage(json.error || 'Failed to restore revision');
      return;
    }
    syncBundleToForms(json.bundle);
    notify(isAr ? 'تمت استعادة النسخة المحددة إلى المسودة' : 'Revision restored to draft');
  };

  const downloadBackup = async () => {
    const res = await fetch('/api/admin/backup', {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      setErrorMessage(isAr ? 'تعذر تصدير النسخة الاحتياطية' : 'Backup download failed');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify(isAr ? 'تم تنزيل النسخة الاحتياطية الكاملة بنجاح' : 'Full backup downloaded');
  };

  const restoreBackupFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(parsed),
      });
      const json = (await res.json()) as { bundle?: AdminCmsBundle; error?: string };
      if (!res.ok || !json.bundle) {
        throw new Error(json.error || 'Restore failed');
      }
      syncBundleToForms(json.bundle);
      await fetchAdminData();
      await refreshPublicData(false);
      notify(isAr ? 'تمت استعادة النسخة الاحتياطية الكاملة بنجاح' : 'Full backup restored successfully');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid backup JSON file');
    }
  };

  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-[#A1A6B3]">
        {isAr ? 'جاري التحقق من جلسة المدير...' : 'Verifying administrator session...'}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-[#12141A] border border-white/15 rounded-xl p-7 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#1D6BFF]/15 border border-[#1D6BFF]/30 text-[#60A5FA]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">
                {isAr ? 'تسجيل دخول المدير' : 'Administrator Login'}
              </h1>
              <p className="text-xs text-[#A1A6B3]">
                {isAr ? 'نظام إدارة المحتوى — محمود شعبان للدعاية والإعلان' : 'Mahmoud Shaaban CMS Console'}
              </p>
            </div>
          </div>

          {loginError && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-[#F4F4F6] mb-1.5">
                {isAr ? 'البريد الإلكتروني' : 'Admin Email'}
              </label>
              <input
                id="admin-email"
                type="email"
                dir="ltr"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@mahmoudshaaban.com"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-[#F4F4F6] mb-1.5">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                id="admin-password"
                type="password"
                dir="ltr"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 focus:border-[#1D6BFF] focus:outline-none text-sm text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {loggingIn
                ? isAr
                  ? 'جاري الدخول...'
                  : 'Signing in...'
                : isAr
                  ? 'دخول إلى لوحة التحكم'
                  : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="text-xs text-[#8C92A0] pt-3 border-t border-white/10">
            {isAr
              ? 'هذه المنطقة محمية ومخصصة لإدارة الشركة فقط.'
              : 'Protected console restricted to authorized administrators.'}
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'quotes', labelAr: 'الطلبات والرسائل', labelEn: 'Quotes & Messages', icon: <FileText className="w-4 h-4" /> },
    { id: 'homepage', labelAr: 'الرئيسية والمظهر', labelEn: 'Homepage & Theme', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'services', labelAr: 'إدارة الخدمات', labelEn: 'Services', icon: <Layers className="w-4 h-4" /> },
    { id: 'projects', labelAr: 'معرض الأعمال', labelEn: 'Portfolio', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'settings', labelAr: 'الإعدادات و SEO', labelEn: 'Settings & SEO', icon: <Settings className="w-4 h-4" /> },
    { id: 'publish', labelAr: 'الحفظ والنشر الاجتماعي', labelEn: 'Save & Social Share', icon: <Share2 className="w-4 h-4" /> },
    { id: 'revisions', labelAr: 'السجل والنسخ الاحتياطي', labelEn: 'History & Backup', icon: <History className="w-4 h-4" /> },
  ];

  const statusLabels: Record<QuoteStatus, { ar: string; en: string }> = {
    new: { ar: 'جديد', en: 'New' },
    in_progress: { ar: 'قيد التنفيذ', en: 'In Progress' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    reviewing: { ar: 'قيد المراجعة', en: 'Reviewing' },
    quoted: { ar: 'تم التسعير', en: 'Quoted' },
  };

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.customerName.toLowerCase().includes(s) ||
      q.phone.toLowerCase().includes(s) ||
      q.serviceType.toLowerCase().includes(s) ||
      q.referenceCode.toLowerCase().includes(s)
    );
  });

  const draftServices = cmsBundle?.draft.services || [];
  const draftProjects = cmsBundle?.draft.projects || [];
  const draftSections = cmsBundle?.draft.sections || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top CMS Publishing Control Bar */}
      <div className="bg-[#12141A] border border-white/15 rounded-xl p-4 sm:p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#D4AF37] font-bold">
              {isAr ? `نظام إدارة المحتوى / ${user.name}` : `CMS Console / ${user.name}`}
            </span>
            <span aria-hidden="true">·</span>
            <span className={cmsBundle?.hasUnpublishedChanges ? 'text-amber-300 font-semibold' : 'text-emerald-300 font-semibold'}>
              {cmsBundle?.hasUnpublishedChanges
                ? isAr
                  ? 'توجد تعديلات في المسودة لم تُنشر بعد'
                  : 'Unpublished Draft Changes'
                : isAr
                  ? 'الموقع المباشر محدّث بالكامل'
                  : 'Live Site Up To Date'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {isAr ? 'لوحة تحكم محمود شعبان للدعاية والإعلان' : 'CMS Management Dashboard'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={!cmsBundle?.canUndo || undoing}
            onClick={() => void handleUndo()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F4F4F6] bg-[#161920] hover:bg-[#1E222B] disabled:opacity-40 border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-300" />
            <span>{undoing ? (isAr ? 'جاري التراجع...' : 'Undoing...') : isAr ? 'التراجع عن آخر تعديل' : 'Undo Last Edit'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/?preview=1')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1D6BFF]/20 hover:bg-[#1D6BFF] border border-[#1D6BFF]/50 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاينة قبل النشر' : 'Preview Draft'}</span>
          </button>

          <button
            type="button"
            disabled={publishing}
            onClick={() => void handlePublish()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{publishing ? (isAr ? 'جاري النشر...' : 'Publishing...') : isAr ? 'نشر التغييرات' : 'Publish Changes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-500/20 hover:bg-emerald-600 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'نشر ومشاركة' : 'Share Site'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F4F4F6] bg-[#161920] hover:bg-red-500/20 hover:text-red-300 border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isAr ? 'خروج' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#12141A] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-[#A1A6B3]">{isAr ? 'طلبات عرض السعر' : 'Quote Requests'}</div>
          <div className="text-2xl font-extrabold text-[#D4AF37] font-mono-tabular mt-1">{quotes.length}</div>
        </div>
        <div className="bg-[#12141A] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-[#A1A6B3]">{isAr ? 'رسائل التواصل' : 'Contact Messages'}</div>
          <div className="text-2xl font-extrabold text-[#60A5FA] font-mono-tabular mt-1">{messages.length}</div>
        </div>
        <div className="bg-[#12141A] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-[#A1A6B3]">{isAr ? 'الخدمات (المسودة)' : 'Services (Draft)'}</div>
          <div className="text-2xl font-extrabold text-white font-mono-tabular mt-1">{draftServices.length}</div>
        </div>
        <div className="bg-[#12141A] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-[#A1A6B3]">{isAr ? 'مشاريع المعرض (المسودة)' : 'Projects (Draft)'}</div>
          <div className="text-2xl font-extrabold text-white font-mono-tabular mt-1">{draftProjects.length}</div>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 bg-[#12141A] border border-white/10 rounded-xl p-2 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1D6BFF] text-white'
                  : 'text-[#B5BAC7] hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          ))}
        </aside>

        <div className="lg:col-span-9 space-y-8">
          {/* TAB 1: QUOTES & MESSAGES */}
          {activeTab === 'quotes' && (
            <div className="space-y-8">
              <div className="bg-[#12141A] border border-white/10 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-bold text-white">
                    {isAr ? 'إدارة طلبات عروض الأسعار' : 'Client Quote Requests'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={isAr ? 'تصفية حسب الحالة' : 'Filter by status'}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | QuoteStatus)}
                      className="px-3 py-2 text-xs rounded-lg bg-[#0A0B0E] border border-white/15 text-white"
                    >
                      <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
                      {(Object.keys(statusLabels) as QuoteStatus[]).map((st) => (
                        <option key={st} value={st}>
                          {statusLabels[st][lang]}
                        </option>
                      ))}
                    </select>
                    <div className="relative w-full sm:w-56">
                      <Search className="w-4 h-4 text-[#8C92A0] absolute top-2.5 start-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isAr ? 'بحث بالاسم أو الهاتف...' : 'Search name or phone...'}
                        className="w-full ps-9 pe-3 py-2 text-xs rounded-lg bg-[#0A0B0E] border border-white/15 text-white focus:border-[#1D6BFF] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {filteredQuotes.length === 0 ? (
                  <p className="text-sm text-[#8C92A0] py-6 text-center">
                    {isAr ? 'لا توجد طلبات مطابقة.' : 'No matching quote requests.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredQuotes.map((q) => (
                      <div
                        key={q.id}
                        className="bg-[#0A0B0E] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A6B3]">
                            <span className="font-mono-tabular text-[#D4AF37] font-bold">
                              {q.referenceCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-white font-semibold">{q.customerName}</span>
                            <span aria-hidden="true">·</span>
                            <span dir="ltr" className="font-mono-tabular">
                              {q.phone}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-[#60A5FA]">
                            {q.serviceType} —{' '}
                            <span className="font-mono-tabular text-white">
                              {q.widthCm && q.heightCm ? `${q.widthCm} × ${q.heightCm} سم` : q.dimensions}
                            </span>
                          </div>
                          {(q.materialType || q.desiredColor || q.lightingType) && (
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A6B3]">
                              {q.materialType && <span>{q.materialType}</span>}
                              {q.desiredColor && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{q.desiredColor}</span>
                                </>
                              )}
                              {q.lightingType && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#D4AF37]">{q.lightingType}</span>
                                </>
                              )}
                            </div>
                          )}
                          {q.details && <p className="text-xs text-[#B5BAC7] leading-relaxed">{q.details}</p>}
                          {q.imagePath && (
                            <a
                              href={q.imagePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs text-[#D4AF37] hover:underline pt-1"
                            >
                              <img
                                src={q.imagePath}
                                alt={q.customerName}
                                loading="lazy"
                                className="w-12 h-12 rounded object-cover border border-white/15"
                              />
                              <span>{isAr ? 'معاينة الصورة المرفقة' : 'View Attached Photo'}</span>
                            </a>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <select
                            aria-label={isAr ? `تحديث حالة طلب ${q.customerName}` : `Status for ${q.customerName}`}
                            value={q.status}
                            onChange={(e) => void updateQuoteStatus(q.id, e.target.value as QuoteStatus)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#161920] border border-white/15 text-white"
                          >
                            {(Object.keys(statusLabels) as QuoteStatus[]).map((st) => (
                              <option key={st} value={st}>
                                {statusLabels[st][lang]}
                              </option>
                            ))}
                          </select>

                          {confirmDeleteQuoteId === q.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => void deleteQuote(q.id)}
                                className="px-2.5 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg cursor-pointer"
                              >
                                {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteQuoteId(null)}
                                className="px-2 py-1.5 text-xs bg-[#161920] text-[#B5BAC7] rounded-lg cursor-pointer"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteQuoteId(q.id)}
                              aria-label={isAr ? `حذف طلب ${q.customerName}` : `Delete quote ${q.referenceCode}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/15 rounded-lg cursor-pointer"
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

              {/* Contact Messages */}
              <div className="bg-[#12141A] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  {isAr ? 'رسائل نموذج اتصل بنا' : 'Contact Form Messages'}
                </h2>
                {messages.length === 0 ? (
                  <p className="text-sm text-[#8C92A0] py-4 text-center">
                    {isAr ? 'لا توجد رسائل واردة بعد.' : 'No contact messages yet.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className="bg-[#0A0B0E] border border-white/10 rounded-xl p-4 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="text-xs text-[#A1A6B3] flex flex-wrap gap-2">
                            <span className="text-white font-semibold">{m.name}</span>
                            <span aria-hidden="true">·</span>
                            <span dir="ltr" className="font-mono-tabular">{m.phone}</span>
                            {m.email && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{m.email}</span>
                              </>
                            )}
                          </div>
                          <div className="text-sm font-bold text-[#D4AF37]">{m.subject}</div>
                          <p className="text-xs text-[#B5BAC7]">{m.message}</p>
                        </div>

                        {confirmDeleteMessageId === m.id ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => void deleteMessage(m.id)}
                              className="px-2.5 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg cursor-pointer"
                            >
                              {isAr ? 'تأكيد' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMessageId(null)}
                              className="px-2 py-1.5 text-xs bg-[#161920] text-[#B5BAC7] rounded-lg cursor-pointer"
                            >
                              {isAr ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteMessageId(m.id)}
                            aria-label={isAr ? `حذف رسالة ${m.name}` : `Delete message from ${m.name}`}
                            className="p-2 text-red-400 hover:bg-red-500/15 rounded-lg cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HOMEPAGE, THEME & CUSTOM SECTIONS */}
          {activeTab === 'homepage' && contentForm && themeForm && (
            <CmsHomepageTab
              isAr={isAr}
              contentForm={contentForm}
              setContentForm={setContentForm}
              themeForm={themeForm}
              setThemeForm={setThemeForm}
              sections={draftSections}
              onSaveContent={saveSiteContent}
              onSaveTheme={saveThemeSettings}
              onUploadImage={uploadImage}
              onSaveSection={saveCustomSection}
              onDeleteSection={deleteCustomSection}
              onReorderSections={reorderCustomSections}
              onToggleSectionVisibility={toggleSectionVisibility}
            />
          )}

          {/* TAB 3: SERVICES MANAGER */}
          {activeTab === 'services' && (
            <div className="space-y-8">
              <form
                onSubmit={saveService}
                className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#D4AF37]" />
                  <span>
                    {editingServiceId
                      ? isAr
                        ? 'تعديل الخدمة المحددة'
                        : 'Edit Selected Service'
                      : isAr
                        ? 'إضافة خدمة جديدة'
                        : 'Add New Service'}
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم الخدمة بالعربية' : 'Service Title (Arabic)'}
                    value={serviceForm.titleAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, titleAr: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder={isAr ? 'اسم الخدمة بالإنجليزية' : 'Service Title (English)'}
                    value={serviceForm.titleEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  >
                    <option value="letters">{getCategoryLabel('letters')}</option>
                    <option value="facades">{getCategoryLabel('facades')}</option>
                    <option value="lighting">{getCategoryLabel('lighting')}</option>
                    <option value="print">{getCategoryLabel('print')}</option>
                    <option value="interior">{getCategoryLabel('interior')}</option>
                    <option value="design">{getCategoryLabel('design')}</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Image URL"
                      value={serviceForm.imageUrl}
                      onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161920] hover:bg-[#1E222B] border border-white/15 text-xs text-white cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isAr ? 'رفع صورة' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const url = await uploadImage(f);
                            if (url) setServiceForm((prev) => ({ ...prev, imageUrl: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'الوصف بالعربية' : 'Description (Arabic)'}
                    value={serviceForm.descriptionAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <textarea
                    rows={2}
                    dir="ltr"
                    placeholder={isAr ? 'الوصف بالإنجليزية' : 'Description (English)'}
                    value={serviceForm.descriptionEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'المواصفات والمميزات بالعربية (افصل بـ ·)' : 'Specs Arabic (separate with ·)'}
                    value={serviceForm.specsAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, specsAr: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder={isAr ? 'المواصفات بالإنجليزية (افصل بـ ·)' : 'Specs English (separate with ·)'}
                    value={serviceForm.specsEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, specsEn: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'تفاصيل الخامات المستخدمة (عربي)' : 'Materials Detail (Arabic)'}
                    value={serviceForm.materialsAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, materialsAr: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder={isAr ? 'تفاصيل الخامات (إنجليزي)' : 'Materials Detail (English)'}
                    value={serviceForm.materialsEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, materialsEn: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'السعر الاسترشادي (مثال: يبدأ من 2500 ج.م)' : 'Price (e.g. From 2,500 EGP)'}
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceForm.showPrice}
                      onChange={(e) => setServiceForm({ ...serviceForm, showPrice: e.target.checked })}
                      className="w-4 h-4 accent-[#D4AF37]"
                    />
                    <span>{isAr ? 'إظهار السعر للزوار (أو إلغاء التحديد لإخفائه)' : 'Show price to visitors'}</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
                  >
                    {editingServiceId
                      ? isAr
                        ? 'حفظ تعديل الخدمة'
                        : 'Update Service'
                      : isAr
                        ? 'إضافة الخدمة للمسودة'
                        : 'Add Service'}
                  </button>
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setServiceForm(EMPTY_SERVICE_FORM);
                      }}
                      className="px-4 py-2.5 text-sm text-[#B5BAC7] bg-[#161920] rounded-lg cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  )}
                </div>
              </form>

              <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white mb-3">
                  {isAr ? 'الخدمات المسجلة (اسحب أو رتّب بالأسهم)' : 'Registered Services'}
                </h3>
                {draftServices.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-[#0A0B0E] border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageWithFallback
                        src={s.imageUrl}
                        alt={s.titleAr}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {isAr ? s.titleAr : s.titleEn}
                        </div>
                        <div className="text-xs text-[#8C92A0] flex flex-wrap items-center gap-2">
                          <span>{getCategoryLabel(s.category)}</span>
                          {s.showPrice && s.price && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#D4AF37]">{s.price}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => void moveService(idx, -1)}
                        aria-label={`Move ${s.titleEn} up`}
                        className="p-2 text-[#B5BAC7] hover:text-white disabled:opacity-30 rounded-lg bg-[#161920] cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === draftServices.length - 1}
                        onClick={() => void moveService(idx, 1)}
                        aria-label={`Move ${s.titleEn} down`}
                        className="p-2 text-[#B5BAC7] hover:text-white disabled:opacity-30 rounded-lg bg-[#161920] cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editService(s)}
                        aria-label={`Edit ${s.titleEn}`}
                        className="p-2 text-[#60A5FA] hover:bg-[#1D6BFF]/15 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {confirmDeleteServiceId === s.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void deleteService(s.id)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-red-600 text-white rounded cursor-pointer"
                          >
                            {isAr ? 'تأكيد' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteServiceId(null)}
                            className="px-2 py-1.5 text-xs bg-[#161920] text-[#B5BAC7] rounded cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteServiceId(s.id)}
                          aria-label={`Delete ${s.titleEn}`}
                          className="p-2 text-red-400 hover:bg-red-500/15 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PORTFOLIO PROJECTS MANAGER */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <form
                onSubmit={saveProject}
                className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#D4AF37]" />
                  <span>
                    {editingProjectId
                      ? isAr
                        ? 'تعديل بيانات المشروع'
                        : 'Edit Project'
                      : isAr
                        ? 'إضافة مشروع أو رفع صورة من الهاتف/الكمبيوتر'
                        : 'Add New Portfolio Project'}
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={isAr ? 'عنوان المشروع بالعربية' : 'Project Title (Arabic)'}
                    value={projectForm.titleAr}
                    onChange={(e) => setProjectForm({ ...projectForm, titleAr: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder={isAr ? 'عنوان المشروع بالإنجليزية' : 'Project Title (English)'}
                    value={projectForm.titleEn}
                    onChange={(e) => setProjectForm({ ...projectForm, titleEn: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <select
                    aria-label={isAr ? 'تصنيف المشروع' : 'Project Category'}
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  >
                    <option value="stainless-letters">{getCategoryLabel('stainless-letters')}</option>
                    <option value="acrylic-letters">{getCategoryLabel('acrylic-letters')}</option>
                    <option value="smart-letters">{getCategoryLabel('smart-letters')}</option>
                    <option value="cladding-facades">{getCategoryLabel('cladding-facades')}</option>
                    <option value="flex-signs">{getCategoryLabel('flex-signs')}</option>
                    <option value="mirror-signs">{getCategoryLabel('mirror-signs')}</option>
                    <option value="led-lighting">{getCategoryLabel('led-lighting')}</option>
                    <option value="commercial-storefronts">{getCategoryLabel('commercial-storefronts')}</option>
                    <option value="before-after">{getCategoryLabel('before-after')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم العميل' : 'Client Name'}
                    value={projectForm.clientName}
                    onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'المقاسات (مثال: 400 × 120 سم)' : 'Dimensions'}
                    value={projectForm.dimensions}
                    onChange={(e) => setProjectForm({ ...projectForm, dimensions: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <div className="flex items-center gap-2">
                    <ImageWithFallback
                      src={projectForm.imageUrl}
                      alt={projectForm.titleAr || 'Preview'}
                      className="w-10 h-10 rounded-lg object-cover border border-white/15 shrink-0"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Image URL"
                      value={projectForm.imageUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#161920] hover:bg-[#1E222B] border border-[#D4AF37]/40 text-xs font-semibold text-[#F5D061] cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة صورة من الهاتف' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const url = await uploadImage(f);
                            if (url) setProjectForm((prev) => ({ ...prev, imageUrl: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'وصف المشروع بالعربية' : 'Description (Arabic)'}
                    value={projectForm.descriptionAr}
                    onChange={(e) => setProjectForm({ ...projectForm, descriptionAr: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                  <textarea
                    rows={2}
                    dir="ltr"
                    placeholder={isAr ? 'وصف المشروع بالإنجليزية (اختياري)' : 'Description (English)'}
                    value={projectForm.descriptionEn}
                    onChange={(e) => setProjectForm({ ...projectForm, descriptionEn: e.target.value })}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => void submitProject(true)}
                    className="px-5 py-2.5 text-sm font-extrabold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
                  >
                    {editingProjectId
                      ? isAr
                        ? 'حفظ التعديل ونشره فوراً'
                        : 'Update & Publish Live'
                      : isAr
                        ? 'حفظ ونشر فوراً للمعرض'
                        : 'Save & Publish Live'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-[#161920] hover:bg-[#1E222B] border border-white/15 rounded-lg cursor-pointer"
                  >
                    {editingProjectId
                      ? isAr
                        ? 'حفظ التعديل في المسودة'
                        : 'Update Draft'
                      : isAr
                        ? 'حفظ في المسودة فقط'
                        : 'Save to Draft Only'}
                  </button>
                  {editingProjectId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProjectId(null);
                        setProjectForm(EMPTY_PROJECT_FORM);
                      }}
                      className="px-4 py-2.5 text-sm text-[#B5BAC7] bg-[#161920] rounded-lg cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  )}
                </div>
              </form>

              <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white mb-3">
                  {isAr ? 'مشاريع معرض الأعمال (رتّب بالأسهم)' : 'Portfolio Projects'}
                </h3>
                {draftProjects.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-[#0A0B0E] border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageWithFallback
                        src={p.imageUrl}
                        alt={p.titleAr}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {isAr ? p.titleAr : p.titleEn}
                        </div>
                        <div className="text-xs text-[#8C92A0]">
                          {getCategoryLabel(p.category)} · {p.dimensions}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => void moveProject(idx, -1)}
                        aria-label={`Move ${p.titleEn} up`}
                        className="p-2 text-[#B5BAC7] hover:text-white disabled:opacity-30 rounded-lg bg-[#161920] cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === draftProjects.length - 1}
                        onClick={() => void moveProject(idx, 1)}
                        aria-label={`Move ${p.titleEn} down`}
                        className="p-2 text-[#B5BAC7] hover:text-white disabled:opacity-30 rounded-lg bg-[#161920] cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editProject(p)}
                        aria-label={`Edit ${p.titleEn}`}
                        className="p-2 text-[#60A5FA] hover:bg-[#1D6BFF]/15 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {confirmDeleteProjectId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void deleteProject(p.id)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-red-600 text-white rounded cursor-pointer"
                          >
                            {isAr ? 'تأكيد' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteProjectId(null)}
                            className="px-2 py-1.5 text-xs bg-[#161920] text-[#B5BAC7] rounded cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteProjectId(p.id)}
                          aria-label={`Delete ${p.titleEn}`}
                          className="p-2 text-red-400 hover:bg-red-500/15 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <CmsEngineerPhotosPanel
                isAr={isAr}
                authHeaders={authHeaders}
                onUploadImage={uploadImage}
              />
            </div>
          )}

          {/* TAB 5: SITE SETTINGS (CONTACT, DOMAIN/SEO, LEGAL) */}
          {activeTab === 'settings' && contactForm && seoLegalForm && (
            <CmsSettingsTab
              isAr={isAr}
              contactForm={contactForm}
              setContactForm={setContactForm}
              seoLegalForm={seoLegalForm}
              setSeoLegalForm={setSeoLegalForm}
              onSaveContact={saveContactSettings}
              onSaveSeoLegal={saveSeoLegalSettings}
            />
          )}

          {/* TAB 6: SAVE & SOCIAL SHARE */}
          {activeTab === 'publish' && cmsBundle?.published && (
            <CmsPublishShareTab
              isAr={isAr}
              published={cmsBundle.published}
              hasUnpublishedChanges={cmsBundle.hasUnpublishedChanges}
              publishing={publishing}
              onPublish={handlePublish}
              onDownloadBackup={downloadBackup}
            />
          )}

          {/* TAB 7: REVISION HISTORY & BACKUP/RESTORE */}
          {activeTab === 'revisions' && (
            <CmsRevisionsTab
              isAr={isAr}
              revisions={cmsBundle?.revisions || []}
              onRestoreRevision={restoreRevision}
              onDownloadBackup={downloadBackup}
              onRestoreBackupFile={restoreBackupFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
