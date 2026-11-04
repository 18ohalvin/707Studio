export interface PresenceUser {
  userId: string;
  name: string;
  email: string;
  role: 'superadmin' | 'editor' | 'viewer' | 'gate';
  avatarUrl?: string;
  initials: string;
  color: string;
  projectId: string;
  activePageIndex: number;
  activePageTitle?: string;
  selectedWidgetId: string | null;
  selectedWidgetType?: string | null;
  isAdjustingWidget?: boolean;
  viewport?: {
    scrollLeft: number;
    scrollTop: number;
    zoom: number;
  };
  lastActiveAt: number;
}

export type PresenceClientMessage =
  | { type: 'join'; payload: PresenceUser }
  | { type: 'heartbeat'; payload: Partial<PresenceUser> }
  | { type: 'action'; action: 'navigate_page' | 'select_widget' | 'adjust_widget'; targetId?: string | number }
  | { type: 'leave' };

export type PresenceServerMessage =
  | { type: 'presence_state'; users: PresenceUser[] }
  | { type: 'user_joined'; user: PresenceUser }
  | { type: 'user_left'; userId: string }
  | { type: 'user_updated'; user: PresenceUser }
  | { type: 'user_action'; userId: string; action: string; targetId?: string | number };
