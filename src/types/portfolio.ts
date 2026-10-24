/**
 * Complete Data Model for Muhammad Akram Portfolio & Visual Studio Builder
 * Structured for modular rendering, live previews, and private visual Admin Studio editing.
 * Version 3.0: Elementor/Webflow-grade Visual Styling & Box Model Engine.
 */

export type IntroDisplayMode = 'first_visit' | 'always' | 'on_request' | 'disabled';
export type ViewMode = 'published' | 'preview' | 'draft';
export type ThemePreset = 'obsidian' | 'titanium' | 'amber-gold' | 'emerald' | 'minimal-light';
export type StudioViewport = 'desktop' | 'tablet' | 'mobile';

export type SectionType =
  | 'hero'
  | 'about'
  | 'education'
  | 'skills'
  | 'services'
  | 'projects'
  | 'experience'
  | 'contact'
  | 'custom';

// ==========================================
// Advanced Visual Styling Engine Models
// ==========================================

export interface SpacingSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: 'px' | 'rem' | '%' | 'em';
  isLinked: boolean;
}

export interface SizeConfig {
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface TypographyConfig {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface LayoutConfig {
  display?: 'block' | 'flex' | 'grid' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  flexWrap?: 'nowrap' | 'wrap';
  gap?: string;
  gridColumns?: string;
  overflow?: 'visible' | 'hidden' | 'auto';
}

export interface PositionConfig {
  position?: 'static' | 'relative' | 'absolute' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
}

export interface BackgroundConfig {
  type?: 'color' | 'gradient' | 'image' | 'transparent';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle: number;
    from: string;
    to: string;
    stops?: string;
  };
  image?: {
    url: string;
    size: string;
    position: string;
    repeat: string;
    attachment: string;
  };
}

export interface BorderCornerRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  unit: 'px' | 'rem' | '%';
  isLinked: boolean;
}

export interface BorderConfig {
  style?: 'none' | 'solid' | 'dashed' | 'dotted';
  width?: string;
  color?: string;
  radius?: BorderCornerRadius;
}

export interface ShadowConfig {
  preset?: 'none' | 'soft' | 'medium' | 'strong' | 'custom';
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  color?: string;
  opacity?: number;
}

export interface AnimationConfig {
  entrance?: 'none' | 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur-reveal';
  duration?: number;
  delay?: number;
  easing?: string;
}

export interface HoverConfig {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  shadow?: string;
  scale?: number;
  translateY?: number;
}

export interface TransformConfig {
  translateX?: number;
  translateY?: number;
  scale?: number;
  rotate?: number;
}

export interface ResponsiveOverrides {
  typography?: TypographyConfig;
  margin?: SpacingSides;
  padding?: SpacingSides;
  size?: SizeConfig;
  layout?: LayoutConfig;
}

export interface ResponsiveVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface ElementStyleConfig {
  margin?: SpacingSides;
  padding?: SpacingSides;
  size?: SizeConfig;
  typography?: TypographyConfig;
  layout?: LayoutConfig;
  position?: PositionConfig;
  background?: BackgroundConfig;
  border?: BorderConfig;
  shadow?: ShadowConfig;
  opacity?: number;
  backdropBlur?: string;
  animation?: AnimationConfig;
  hover?: HoverConfig;
  transform?: TransformConfig;
  tabletOverrides?: ResponsiveOverrides;
  mobileOverrides?: ResponsiveOverrides;
  visibility?: ResponsiveVisibility;
  customClass?: string;
  customId?: string;
}

export interface CanvasElement {
  id: string;
  type: 'heading' | 'paragraph' | 'button' | 'image' | 'divider' | 'card' | 'container' | 'badge' | 'social';
  parentId: string;
  content: {
    text?: string;
    headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    url?: string;
    target?: '_self' | '_blank';
    imageUrl?: string;
    altText?: string;
    iconName?: string;
    badgeText?: string;
  };
  style?: ElementStyleConfig;
  order: number;
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  internalId: string;
  isVisible: boolean;
  order: number;
  customTitle?: string;
  customSubtitle?: string;
  customContent?: string;
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  backgroundImageUrl?: string;
  animationStyle?: 'fade' | 'slide' | 'scale' | 'none';
  customClass?: string;
  style?: ElementStyleConfig;
  elements?: CanvasElement[];
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  isPrimary?: boolean;
}

export interface PersonalInfo {
  fullName: string;
  firstName: string;
  lastName: string;
  roles: string[];
  headline: string;
  tagline: string;
  shortBio: string;
  detailedBio: string[];
  location: string;
  email: string;
  phonePlaceholder?: string;
  isAvailableForWork: boolean;
  availabilityNote: string;
  avatarUrl: string;
  socials: SocialLink[];
  headingStyle?: ElementStyleConfig;
  bioStyle?: ElementStyleConfig;
  avatarStyle?: ElementStyleConfig;
  heroBackgroundImageUrl?: string;
  heroPortraitUrl?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  aboutSectionTitle?: string;
  aboutQuote?: string;
  aboutQuoteAuthor?: string;
  aboutImageUrl?: string;
  aboutStats?: { label: string; value: string }[];
}

export interface IntroSettings {
  mode: IntroDisplayMode;
  greetingText: string;
  brandMonogram: string;
  durationSeconds: number;
  showSkipButton: boolean;
  enableSoundFx: boolean;
  animationStyle?: 'minimal' | 'cinematic' | 'technical';
}

export interface ThemeSettings {
  preset: ThemePreset;
  accentColor: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'none';
  animationsEnabled: boolean;
  gridBackground: boolean;
  headingFont?: string;
  bodyFont?: string;
  monoFont?: string;
  maxWidth?: '1200px' | '1440px' | '1600px' | 'full';
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
  order: number;
  isDynamic?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Web Development' | 'CMS & Platforms' | 'UI/UX & Design' | 'Media & Motion' | 'AI & SEO' | string;
  proficiencyPercentage: number;
  description: string;
  iconName: string;
  badgeText?: string;
  isVisible: boolean;
  order: number;
  visualStyle?: 'bar' | 'circle' | 'minimal';
  style?: ElementStyleConfig;
}

export interface ServiceItem {
  id: string;
  title: string;
  editorialNumber: string;
  description: string;
  category: string;
  iconName: string;
  features: string[];
  ctaLabel: string;
  ctaUrl?: string;
  isVisible: boolean;
  order: number;
  style?: ElementStyleConfig;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'Web Applications' | 'UI/UX Design' | '3D & Branding' | 'Video & Motion' | 'AI Solutions' | string;
  shortDescription: string;
  fullDescription?: string;
  technologies: string[];
  skillsUsed?: string[];
  imageUrl: string;
  fullWebsitePreviewUrl?: string;
  hasFullPagePreview?: boolean;
  galleryImages?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  githubUrl?: string;
  clientName?: string;
  completionDate?: string;
  isFeatured: boolean;
  isPopular: boolean;
  isVisible: boolean;
  previewEmbedAllowed: boolean;
  order: number;
  metricsOrHighlight?: string;
  projectStatus?: 'Completed' | 'In Development' | 'Live Production' | 'Case Study Ready';
  projectScope?: 'Frontend' | 'Backend' | 'Full Stack' | 'E-commerce' | 'Graphic Design' | 'UI/UX' | 'SEO' | 'Other' | string;
  developmentMethod?: 'Custom Code' | 'WordPress' | 'Shopify' | 'Elementor' | 'WPBakery' | 'Drag & Drop' | 'AI Generated / AI-Assisted' | 'Custom + AI' | 'Other' | string;
  dragAndDropBuilder?: 'Elementor' | 'Webflow' | 'Wix' | 'Framer' | 'Divi' | 'Other' | string;
  servicesPerformed?: string[];
  style?: ElementStyleConfig;
}

export interface ExperienceItem {
  id: string;
  role: string;
  type: string;
  period: string;
  description: string;
  highlights: string[];
  technologies?: string[];
  location?: string;
  isVisible: boolean;
  order: number;
  style?: ElementStyleConfig;
}

export interface EducationSemester {
  id: string;
  name: string;
  shortName: string;
  status: 'Completed' | 'In Progress';
  completionNote?: string;
  modules: string[];
}

export interface EducationData {
  institute: string;
  location: string;
  program: string;
  currentStatus: string;
  progressNote: string;
  semesters: EducationSemester[];
}

export interface ContactSettings {
  sectionTitle: string;
  sectionSubtitle: string;
  availableForWork: boolean;
  availableBadgeText: string;
  hiringCtaTitle: string;
  hiringCtaDescription: string;
  email: string;
  whatsappUrl: string;
  responseTime: string;
  formServices: string[];
  showContactForm?: boolean;
  submitButtonText?: string;
  successMessage?: string;
  nameFieldLabel?: string;
  emailFieldLabel?: string;
  messageFieldLabel?: string;
}

export interface FooterSettings {
  brandStatement: string;
  copyrightText: string;
  showBackToTop: boolean;
  showSocials?: boolean;
  showQuickLinks?: boolean;
}

export interface SeoSettings {
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface MediaUsageRef {
  type: 'hero-avatar' | 'project-image' | 'project-gallery' | 'section-bg' | 'custom-element' | 'seo-og' | 'other';
  entityId: string;
  entityTitle: string;
  field: string;
}

export interface MediaItem {
  id: string;
  filename?: string;
  originalFilename?: string;
  name: string;
  url: string;
  alt: string;
  altText?: string;
  caption?: string;
  description?: string;
  mediaType?: MediaType;
  mimeType?: string;
  fileSize?: string;
  fileSizeBytes?: number;
  dimensions?: string;
  width?: number;
  height?: number;
  usedIn?: string[];
  createdAt: string;
  updatedAt?: string;
  source?: 'local-asset' | 'upload' | 'external-url';
  isBroken?: boolean;
}

export interface PortfolioData {
  schemaVersion: number;
  version: number;
  lastUpdated: string;
  personal: PersonalInfo;
  intro: IntroSettings;
  theme: ThemeSettings;
  navigation: NavigationItem[];
  sections: SectionConfig[];
  skills: SkillItem[];
  services: ServiceItem[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  education?: EducationData;
  contact: ContactSettings;
  footer: FooterSettings;
  seo: SeoSettings;
  media: MediaItem[];
  projectCategories?: string[];
  customTechnologies?: string[];
}

export type SelectedElementType =
  | 'section'
  | 'hero'
  | 'about'
  | 'education'
  | 'skill'
  | 'service'
  | 'project'
  | 'experience'
  | 'contact'
  | 'navigation'
  | 'theme'
  | 'intro'
  | 'text'
  | 'image'
  | 'button'
  | 'element'
  | 'container';

export interface BreadcrumbItem {
  id: string;
  label: string;
  type: SelectedElementType;
  parentId?: string;
}

export interface SelectedElement {
  type: SelectedElementType;
  id: string;
  sectionId?: string;
  parentId?: string;
  field?: string;
  label: string;
  sublabel?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export type StudioSidebarTab =
  | 'sections'
  | 'elements'
  | 'navigator'
  | 'managers'
  | 'media'
  | 'styles';

export type ContentManagerSubtab =
  | 'projects'
  | 'skills'
  | 'services'
  | 'experience'
  | 'navigation'
  | 'hero'
  | 'contact'
  | 'intro';

export interface StudioAuthState {
  isAuthenticated: boolean;
  userEmail: string;
  role: 'super_admin' | 'editor';
}

export interface ClipboardItem {
  type: 'element' | 'section';
  data: any;
}
