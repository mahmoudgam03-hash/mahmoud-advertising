export type Language = 'ar' | 'en';

export type QuoteStatus =
  | 'new'
  | 'in_progress'
  | 'reviewing'
  | 'quoted'
  | 'completed'
  | 'cancelled';

export interface ServiceItem {
  id: number;
  slug: string;
  category: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  specsAr: string;
  specsEn: string;
  materialsAr: string;
  materialsEn: string;
  price: string;
  showPrice: boolean;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
}

export interface PortfolioProject {
  id: number;
  titleAr: string;
  titleEn: string;
  category: string;
  serviceSlug: string;
  clientName: string;
  locationAr: string;
  locationEn: string;
  dimensions: string;
  lightingAr: string;
  lightingEn: string;
  materialsAr: string;
  materialsEn: string;
  descriptionAr: string;
  descriptionEn: string;
  completionYear: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
}

export interface QuoteRequest {
  id: number;
  referenceCode: string;
  customerName: string;
  phone: string;
  serviceType: string;
  widthCm: string;
  heightCm: string;
  dimensions: string;
  materialType: string;
  desiredColor: string;
  lightingType: string;
  details: string;
  imagePath: string | null;
  status: QuoteStatus;
  createdAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SiteContent {
  companyNameAr: string;
  companyNameEn: string;
  logoUrl: string;
  heroKickerAr: string;
  heroKickerEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroBgImageUrl: string;
  heroPrimaryBtnTextAr: string;
  heroPrimaryBtnTextEn: string;
  heroPrimaryBtnUrl: string;
  heroSecondaryBtnTextAr: string;
  heroSecondaryBtnTextEn: string;
  heroSecondaryBtnUrl: string;
  ctaBannerTitleAr: string;
  ctaBannerTitleEn: string;
  ctaBannerSubtitleAr: string;
  ctaBannerSubtitleEn: string;
  ctaBannerBtnTextAr: string;
  ctaBannerBtnTextEn: string;
  ctaBannerBtnUrl: string;
  aboutTitleAr: string;
  aboutTitleEn: string;
  aboutStoryAr: string;
  aboutStoryEn: string;
  qualityPromiseAr: string;
  qualityPromiseEn: string;
  yearsExperience: string;
  completedProjectsCount: string;
  warrantyYears: string;
}

export interface ThemeSettings {
  primaryBg: string;
  surfaceBg: string;
  accentBlue: string;
  accentGold: string;
  fontFamilyAr: string;
  fontFamilyEn: string;
}

export interface HomeCustomSection {
  id: number;
  sectionKey: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  bodyAr: string;
  bodyEn: string;
  imageUrl: string;
  buttonTextAr: string;
  buttonTextEn: string;
  buttonUrl: string;
  layoutStyle: 'split' | 'banner' | 'cards';
  sortOrder: number;
  visible: boolean;
}

export interface SeoAndLegalSettings {
  domainName: string;
  metaTitleAr: string;
  metaTitleEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  metaKeywordsAr: string;
  metaKeywordsEn: string;
  privacyPolicyAr: string;
  privacyPolicyEn: string;
  termsConditionsAr: string;
  termsConditionsEn: string;
}

export interface ContactSettings {
  phone: string;
  whatsapp: string;
  email: string;
  facebookUrl: string;
  addressAr: string;
  addressEn: string;
  mapLat: string;
  mapLng: string;
  workingHoursAr: string;
  workingHoursEn: string;
}

export interface CmsSnapshotPayload {
  services: ServiceItem[];
  projects: PortfolioProject[];
  content: SiteContent;
  contact: ContactSettings;
  theme: ThemeSettings;
  sections: HomeCustomSection[];
  seoLegal: SeoAndLegalSettings;
}

export interface CmsRevision {
  id: number;
  actionType: 'save_draft' | 'publish' | 'undo' | 'restore' | 'backup_restore';
  summaryAr: string;
  summaryEn: string;
  adminEmail: string;
  createdAt: string;
}

export interface PublicSiteData extends CmsSnapshotPayload {
  isPreview?: boolean;
  publishedAt?: string;
}

export interface AdminCmsBundle {
  draft: CmsSnapshotPayload;
  published: CmsSnapshotPayload;
  hasUnpublishedChanges: boolean;
  canUndo: boolean;
  publishedAt: string | null;
  revisions: CmsRevision[];
}

export interface AdminSessionUser {
  id: number;
  email: string;
  name: string;
  role?: string;
}
