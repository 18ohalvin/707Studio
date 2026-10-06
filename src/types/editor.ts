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
  | 'RegistrationForm'
  | 'ActionButton'
  | 'TextBanner'
  | 'MultipleChoice'
  | 'ModalOverlay'
  | 'GuestEPass'
  /* A guest-data block on the Ticket page (name, Access ID, QR, sessions…). */
  | 'TicketField'
  /* Used by the ticket landing page. No renderer case exists for it yet, so a
     PassCTA widget currently displays nothing — needs a display built before
     it is used on a live page. */
  | 'PassCTA';

export interface FormFieldItem {
  id: string;
  name: string;
  placeholder?: string;
  type?: string;
  countryCode?: string;
  required?: boolean;
  value?: string;
  errorMessage?: string;
}

export type ChoiceVariant = 'detailed-card' | 'simple-row' | 'horizontal-block' | 'image-grid';

export type ModalVariant = 'message-alert' | 'message-field' | 'choice-detailed' | 'choice-simple' | 'image-matrix';

export interface ModalOption {
  id: string;
  label: string;
  sublabel?: string;
  description?: string;
  slotsCapacity?: number | string;
  selected?: boolean;
}

export interface ModalImageSlot {
  id: string;
  url: string;
  label?: string;
  selected?: boolean;
}

export interface ChoiceOption {
  id: string;
  label: string;
  sublabel?: string;
  description?: string;
  slotsCapacity?: number | string;
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
  /**
   * 'ticket' marks the page that designs the downloadable PDF ticket. It is
   * never part of the guest funnel; unset means a normal funnel page.
   */
  kind?: 'ticket';
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
  category: 'raffle' | 'rsvp' | 'hype_drop' | 'lookbook' | 'pass' | 'custom';
  status?: 'published' | 'draft';
  thumbnail_url?: string;
  widget_tree: WidgetItem[];
  is_global_preset: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
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
  owner_id?: string;
  owner_email?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  /** Live version number; 0 = never published. Set by the server. */
  live_version?: number;
  published_at?: string | null;
  published_by?: string;
  /** Set while a submission waits for the superadmin. */
  pending_update_at?: string | null;
  /** The working copy differs from what visitors see. */
  has_unpublished_changes?: boolean;
}

/** One entry in a project's build history. */
export interface ProjectHistoryEntry {
  id: string;
  page_id: string;
  revision: number;
  kind: 'submitted' | 'published' | 'declined' | 'discarded' | 'restored';
  live_version?: number | null;
  note?: string;
  created_by?: string;
  created_at: string;
}

export type ViewportMode = 'iphone-16-pro' | 'iphone-17-pro' | 'android-standard' | 'responsive';
