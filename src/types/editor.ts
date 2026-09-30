export type WidgetType = 
  | 'HeroDrop'
  | 'CountdownTimer'
  | 'RaffleForm'
  | 'RsvpForm'
  | 'LookbookCarousel'
  | 'ProductGrid'
  | 'RulesAccordion'
  | 'LocationCard'
  | 'StickyCtaDrawer'
  | 'VideoPlayer'
  | 'FieldInput'
  | 'ActionButton'
  | 'TextBanner'
  | 'MultipleChoice'
  /* Used by the ticket landing page. No renderer case exists for it yet, so a
     PassCTA widget currently displays nothing — needs a display built before
     it is used on a live page. */
  | 'PassCTA';

export type ChoiceVariant = 'detailed-card' | 'simple-row' | 'horizontal-block' | 'image-grid';

export interface ChoiceOption {
  id: string;
  label: string;
  sublabel?: string;
  description?: string;
  imageUrl?: string;
  disabled?: boolean;
}

export interface WidgetItem {
  id: string;
  type: WidgetType;
  props: Record<string, any>;
  customStyles?: Record<string, any>;
  isLocked?: boolean;
  isHidden?: boolean;
}

export type PageStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
}

export interface PageSettings {
  seoTitle: string;
  seoDescription: string;
  ogImage?: string;
  favicon?: string;
  theme: 'the-707-standard';
  backgroundColor?: string;
  customCss?: string;
}

export interface ActivationPage {
  id: string;
  brand_id: string;
  brand_slug: string;
  title: string;
  page_name?: string;
  slug: string;
  description?: string;
  status: PageStatus;
  current_version: number;
  widget_tree: WidgetItem[];
  page_settings: PageSettings;
  reviewed_by?: string;
  review_notes?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'raffle' | 'rsvp' | 'hype_drop' | 'lookbook' | 'custom';
  thumbnail_url?: string;
  widget_tree: WidgetItem[];
  is_global_preset: boolean;
  created_by: string;
}

export interface ProjectItem {
  id: string;
  brand_id?: string;
  brand_slug: string;
  title: string;
  slug: string;
  description?: string;
  status: PageStatus;
  current_version: number;
  widget_tree: WidgetItem[];
  pages?: ActivationPage[];
  page_settings?: PageSettings;
  created_at: string;
  updated_at: string;
}

export type ViewportMode = 'iphone-16-pro' | 'iphone-17-pro' | 'android-standard' | 'responsive';
