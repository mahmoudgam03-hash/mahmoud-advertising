import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Language, PublicSiteData } from '../shared/types';

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  route: string;
  queryParams: URLSearchParams;
  navigate: (to: string) => void;
  data: PublicSiteData | null;
  loading: boolean;
  error: string | null;
  isPreview: boolean;
  exitPreview: () => void;
  refreshPublicData: (forcePreview?: boolean) => Promise<void>;
  getCategoryLabel: (category: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  all: { ar: 'الكل', en: 'All Works' },
  'stainless-letters': { ar: 'حروف استانلس', en: 'Stainless Letters' },
  'acrylic-letters': { ar: 'حروف أكريليك', en: 'Acrylic Letters' },
  'smart-letters': { ar: 'حروف سمارت', en: 'Smart Letters' },
  'cladding-facades': { ar: 'واجهات كلادينج', en: 'Cladding Facades' },
  'flex-signs': { ar: 'يفط فلكس', en: 'Flex Signs' },
  'mirror-signs': { ar: 'يفط مرايا', en: 'Mirror Signs' },
  'led-lighting': { ar: 'إضاءة LED', en: 'LED Lighting' },
  'commercial-storefronts': { ar: 'واجهات محلات تجارية', en: 'Commercial Storefronts' },
  letters: { ar: 'حروف بارزة', en: '3D Letters' },
  facades: { ar: 'واجهات كلادينج', en: 'Cladding Facades' },
  lighting: { ar: 'نيون وليد بروفايل', en: 'LED & Neon' },
  print: { ar: 'فلكس وبنرات', en: 'Flex & Banners' },
  interior: { ar: 'يفط مرايا ومكاتب', en: 'Mirror & Lobby' },
  design: { ar: 'شعارات وهويات', en: 'Brand Identity' },
};

function parseLocation(): { pathname: string; search: URLSearchParams } {
  const raw = window.location.pathname || '/';
  const normalized = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return {
    pathname: normalized,
    search: new URLSearchParams(window.location.search),
  };
}

function setMetaContent(selector: string, content: string) {
  if (!content) return;
  let el = document.querySelector(selector);
  if (!el && selector.startsWith('meta[')) {
    const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
    if (match) {
      el = document.createElement('meta');
      el.setAttribute(match[1], match[2]);
      document.head.appendChild(el);
    }
  }
  if (el) {
    el.setAttribute('content', content);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = window.localStorage.getItem('msa_lang');
    return saved === 'en' ? 'en' : 'ar';
  });
  const [loc, setLoc] = useState<{ pathname: string; search: URLSearchParams }>(() => parseLocation());
  const [data, setData] = useState<PublicSiteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isPreviewQuery = loc.search.get('preview') === '1';

  const applyThemeAndSeo = useCallback(
    (nextLang: Language, siteData: PublicSiteData | null) => {
      document.documentElement.lang = nextLang;
      document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';

      if (siteData?.theme) {
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--bg-primary', siteData.theme.primaryBg || '#0A0B0E');
        rootStyle.setProperty('--bg-surface', siteData.theme.surfaceBg || '#12141A');
        rootStyle.setProperty('--accent-blue', siteData.theme.accentBlue || '#1D6BFF');
        rootStyle.setProperty('--accent-gold', siteData.theme.accentGold || '#D4AF37');
        rootStyle.setProperty(
          '--font-ar',
          `"${siteData.theme.fontFamilyAr || 'Cairo'}", "Plus Jakarta Sans", system-ui, sans-serif`
        );
        rootStyle.setProperty(
          '--font-en',
          `"${siteData.theme.fontFamilyEn || 'Plus Jakarta Sans'}", "Cairo", system-ui, sans-serif`
        );
      }

      const seo = siteData?.seoLegal;
      const title =
        nextLang === 'ar'
          ? seo?.metaTitleAr || 'محمود شعبان للدعاية والإعلان | تصنيع اليفط والواجهات الإعلانية'
          : seo?.metaTitleEn || 'Mahmoud Shaaban Advertising | Architectural Signage & Cladding';
      const desc =
        nextLang === 'ar'
          ? seo?.metaDescriptionAr || ''
          : seo?.metaDescriptionEn || '';
      const keywords = nextLang === 'ar' ? seo?.metaKeywordsAr || '' : seo?.metaKeywordsEn || '';

      document.title = title;
      setMetaContent('meta[name="description"]', desc);
      setMetaContent('meta[name="keywords"]', keywords);
      setMetaContent('meta[property="og:title"]', title);
      setMetaContent('meta[property="og:description"]', desc);
      setMetaContent('meta[name="twitter:title"]', title);
      setMetaContent('meta[name="twitter:description"]', desc);

      const origin = window.location.origin;
      setMetaContent('meta[property="og:url"]', `${origin}${window.location.pathname}`);
      setMetaContent('meta[property="og:image"]', `${origin}/og-image.jpg`);
      setMetaContent('meta[name="twitter:image"]', `${origin}/og-image.jpg`);

      if (seo?.domainName) {
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        const cleanDomain = seo.domainName.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
        canonical.href = `https://${cleanDomain}${window.location.pathname}`;
      }
    },
    []
  );

  useEffect(() => {
    applyThemeAndSeo(lang, data);
  }, [lang, data, applyThemeAndSeo]);

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    window.localStorage.setItem('msa_lang', nextLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  const navigate = useCallback((to: string) => {
    if (to.startsWith('http://') || to.startsWith('https://')) {
      window.location.href = to;
      return;
    }
    window.history.pushState({}, '', to);
    setLoc(parseLocation());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const exitPreview = useCallback(() => {
    const nextUrl = `${loc.pathname}`;
    window.history.pushState({}, '', nextUrl);
    setLoc(parseLocation());
  }, [loc.pathname]);

  useEffect(() => {
    const onPopState = () => setLoc(parseLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const refreshPublicData = useCallback(
    async (forcePreview?: boolean) => {
      try {
        setError(null);
        const usePreview = typeof forcePreview === 'boolean' ? forcePreview : isPreviewQuery;
        const headers: Record<string, string> = {};
        const token = window.localStorage.getItem('msa_admin_token');
        if (usePreview && token) {
          headers.Authorization = `Bearer ${token}`;
        }

        let res = await fetch(usePreview ? '/api/public?preview=1' : '/api/public', {
          headers,
          credentials: 'include',
        });

        // If preview requested by unauthenticated visitor, fall back cleanly to published view
        if (usePreview && (res.status === 401 || res.status === 403)) {
          res = await fetch('/api/public');
        }

        if (!res.ok) throw new Error('Failed to load site data');
        const json = (await res.json()) as PublicSiteData;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    },
    [isPreviewQuery]
  );

  useEffect(() => {
    void refreshPublicData();
  }, [refreshPublicData]);

  const getCategoryLabel = useCallback(
    (category: string) => {
      const entry = CATEGORY_LABELS[category];
      if (entry) return entry[lang];
      return category;
    },
    [lang]
  );

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        route: loc.pathname,
        queryParams: loc.search,
        navigate,
        data,
        loading,
        error,
        isPreview: Boolean(data?.isPreview),
        exitPreview,
        refreshPublicData,
        getCategoryLabel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
