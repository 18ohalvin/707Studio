import { defineStore } from 'pinia';
import { ref, computed, watch, onUnmounted } from 'vue';
import type { PresenceUser, PresenceServerMessage } from '../types/presence.ts';
import { useAuthStore } from './authStore.ts';
import { useEditorStore } from './editorStore.ts';

// Luxury 707 collaborator colors
const COLLABORATOR_COLORS = [
  '#000000', // Pure 707 Black
  '#7e2c32', // Deep Oxblood
  '#55633f', // Pale Moss
  '#8f7c50', // Muted Bronze
  '#2563eb', // Royal Blue
  '#7c3aed', // Editorial Purple
  '#667557', // Earthy Moss
];

function pickColorForUser(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length];
}

export const usePresenceStore = defineStore('presence', () => {
  const authStore = useAuthStore();
  const editorStore = useEditorStore();

  const isConnected = ref(false);
  const peers = ref<PresenceUser[]>([]);
  const followingUserId = ref<string | null>(null);
  let ws: WebSocket | null = null;
  let heartbeatTimer: any = null;
  let pollFallbackTimer: any = null;
  let currentProjectId = ref<string | null>(null);

  // User identity
  const currentPresenceUser = computed<PresenceUser>(() => {
    const u = authStore.currentUser;
    const isSuper = authStore.isSuperAdmin;
    const id = u?.id || (isSuper ? 'superadmin-master' : `guest-editor-${Math.random().toString(36).substring(2, 7)}`);
    const name = u?.name || (isSuper ? 'Superadmin' : 'Brand Editor');
    const email = u?.email || (isSuper ? 'admin@707.co.id' : 'editor@brand.com');
    const role = isSuper ? 'superadmin' : (u?.role || 'editor');
    
    // Initials
    const parts = name.trim().split(/\s+/);
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();

    const activePage = editorStore.currentPage;
    const selectedWidget = editorStore.selectedWidget;

    return {
      userId: id,
      name,
      email,
      role,
      avatarUrl: u?.avatarUrl,
      initials,
      color: pickColorForUser(id),
      projectId: currentProjectId.value || editorStore.currentProjectId || 'default-project',
      activePageIndex: editorStore.activePageIndex,
      activePageTitle: activePage?.title || activePage?.page_name || `Page ${editorStore.activePageIndex + 1}`,
      selectedWidgetId: editorStore.selectedWidgetId,
      selectedWidgetType: selectedWidget?.type || null,
      isAdjustingWidget: !!editorStore.selectedWidgetId,
      lastActiveAt: Date.now()
    };
  });

  // Active peers excluding myself
  const onlineCollaborators = computed(() => {
    const myId = currentPresenceUser.value.userId;
    return peers.value.filter(p => p.userId !== myId);
  });

  // Active superadmins reviewing/editing
  const activeSuperadmins = computed(() => {
    return onlineCollaborators.value.filter(p => p.role === 'superadmin');
  });

  const isSuperadminPresent = computed(() => {
    return activeSuperadmins.value.length > 0;
  });

  // User being followed
  const followingUser = computed(() => {
    if (!followingUserId.value) return null;
    return onlineCollaborators.value.find(p => p.userId === followingUserId.value) || null;
  });

  // Connect to room for a given projectId
  function connect(projectId: string) {
    if (currentProjectId.value === projectId && (isConnected.value || ws)) {
      return;
    }

    disconnect();
    currentProjectId.value = projectId;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/presence`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnected.value = true;
        sendJoin();
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const msg: PresenceServerMessage = JSON.parse(event.data);
          handleServerMessage(msg);
        } catch (e) {
          console.warn('[Presence] Error parsing server message:', e);
        }
      };

      ws.onclose = () => {
        isConnected.value = false;
        startHttpPolling();
      };

      ws.onerror = () => {
        isConnected.value = false;
        startHttpPolling();
      };
    } catch (e) {
      console.warn('[Presence] WebSocket failed to initialize, using HTTP polling fallback:', e);
      startHttpPolling();
    }
  }

  function sendJoin() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const payload = currentPresenceUser.value;
    ws.send(JSON.stringify({ type: 'join', payload }));
  }

  function sendHeartbeat() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = currentPresenceUser.value;
      ws.send(JSON.stringify({ type: 'heartbeat', payload }));
    } else if (currentProjectId.value) {
      // Fallback via HTTP
      fetch(`/api/presence/${encodeURIComponent(currentProjectId.value)}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPresenceUser.value)
      })
        .then(r => r.json())
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            peers.value = res.data;
          }
        })
        .catch(() => {});
    }
  }

  function startHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      sendHeartbeat();
    }, 2500);
  }

  function startHttpPolling() {
    if (pollFallbackTimer) return;
    pollFallbackTimer = setInterval(() => {
      if (!isConnected.value && currentProjectId.value) {
        sendHeartbeat();
      }
    }, 3000);
  }

  function handleServerMessage(msg: PresenceServerMessage) {
    if (msg.type === 'presence_state') {
      peers.value = msg.users;
    } else if (msg.type === 'user_joined') {
      const idx = peers.value.findIndex(p => p.userId === msg.user.userId);
      if (idx >= 0) {
        peers.value[idx] = msg.user;
      } else {
        peers.value.push(msg.user);
      }
    } else if (msg.type === 'user_updated') {
      const idx = peers.value.findIndex(p => p.userId === msg.user.userId);
      if (idx >= 0) {
        peers.value[idx] = msg.user;
      } else {
        peers.value.push(msg.user);
      }
    } else if (msg.type === 'user_left') {
      peers.value = peers.value.filter(p => p.userId !== msg.userId);
      if (followingUserId.value === msg.userId) {
        stopFollowing();
      }
    }
  }

  // --- Follow Mode Logic ---
  function startFollowing(userId: string) {
    if (followingUserId.value === userId) {
      stopFollowing();
      return;
    }
    const target = onlineCollaborators.value.find(p => p.userId === userId);
    if (!target) return;

    followingUserId.value = userId;
    syncWithFollowedUser(target);
  }

  function stopFollowing() {
    followingUserId.value = null;
  }

  function syncWithFollowedUser(target: PresenceUser) {
    // 1. Synchronize Page
    if (typeof target.activePageIndex === 'number' && target.activePageIndex >= 0) {
      if (editorStore.activePageIndex !== target.activePageIndex && target.activePageIndex < editorStore.pages.length) {
        editorStore.selectPage(target.activePageIndex);
      }
    }

    // 2. Synchronize Widget selection & auto-center
    if (target.selectedWidgetId) {
      if (editorStore.selectedWidgetId !== target.selectedWidgetId) {
        editorStore.selectWidget(target.selectedWidgetId);
      }
      // Scroll the widget into view
      setTimeout(() => {
        const el = document.querySelector(`[data-widget-id="${target.selectedWidgetId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  }

  // Watch for updates on the followed user
  watch(
    () => followingUser.value,
    (user) => {
      if (user && followingUserId.value) {
        syncWithFollowedUser(user);
      }
    },
    { deep: true }
  );

  // Broadcast local changes immediately
  watch(
    [
      () => editorStore.activePageIndex,
      () => editorStore.selectedWidgetId
    ],
    () => {
      sendHeartbeat();
    }
  );

  function disconnect() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (pollFallbackTimer) clearInterval(pollFallbackTimer);
    heartbeatTimer = null;
    pollFallbackTimer = null;

    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'leave' }));
        }
        ws.close();
      } catch (_) {}
      ws = null;
    }
    isConnected.value = false;
    followingUserId.value = null;
    peers.value = [];
  }

  return {
    isConnected,
    currentProjectId,
    currentPresenceUser,
    onlineCollaborators,
    activeSuperadmins,
    isSuperadminPresent,
    followingUserId,
    followingUser,
    connect,
    disconnect,
    startFollowing,
    stopFollowing
  };
});
