import type { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import express, { Router } from 'express';

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

interface ClientSession {
  ws?: WebSocket;
  user: PresenceUser;
  lastHeartbeat: number;
}

// Map: projectId -> Map<userId, ClientSession>
const projectRooms = new Map<string, Map<string, ClientSession>>();

export function getProjectPresence(projectId: string): PresenceUser[] {
  const room = projectRooms.get(projectId);
  if (!room) return [];
  const now = Date.now();
  const active: PresenceUser[] = [];
  for (const [userId, session] of room.entries()) {
    // 15 seconds heartbeat timeout
    if (now - session.lastHeartbeat > 15000) {
      room.delete(userId);
    } else {
      active.push(session.user);
    }
  }
  return active;
}

function broadcastToProject(projectId: string, message: any, excludeUserId?: string) {
  const room = projectRooms.get(projectId);
  if (!room) return;
  const payload = JSON.stringify(message);
  for (const [userId, session] of room.entries()) {
    if (excludeUserId && userId === excludeUserId) continue;
    if (session.ws && session.ws.readyState === WebSocket.OPEN) {
      try {
        session.ws.send(payload);
      } catch (err) {
        console.warn('[Presence] Error sending to peer:', err);
      }
    }
  }
}

export function updatePresence(projectId: string, user: PresenceUser, ws?: WebSocket) {
  let room = projectRooms.get(projectId);
  if (!room) {
    room = new Map<string, ClientSession>();
    projectRooms.set(projectId, room);
  }

  const existing = room.get(user.userId);
  const updatedUser: PresenceUser = {
    ...(existing?.user || {}),
    ...user,
    projectId,
    lastActiveAt: Date.now()
  };

  room.set(user.userId, {
    ws: ws || existing?.ws,
    user: updatedUser,
    lastHeartbeat: Date.now()
  });

  // Broadcast to peers
  if (!existing) {
    broadcastToProject(projectId, { type: 'user_joined', user: updatedUser }, user.userId);
  } else {
    broadcastToProject(projectId, { type: 'user_updated', user: updatedUser }, user.userId);
  }

  return getProjectPresence(projectId);
}

export function removePresence(projectId: string, userId: string) {
  const room = projectRooms.get(projectId);
  if (!room) return;
  if (room.has(userId)) {
    room.delete(userId);
    broadcastToProject(projectId, { type: 'user_left', userId });
  }
  if (room.size === 0) {
    projectRooms.delete(projectId);
  }
}

export function setupPresenceWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({
    server,
    path: '/ws/presence'
  });

  wss.on('connection', (ws: WebSocket, _req: any) => {
    let currentProjectId: string | null = null;
    let currentUserId: string | null = null;

    ws.on('message', (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'join' && msg.payload) {
          const user: PresenceUser = msg.payload;
          currentProjectId = user.projectId;
          currentUserId = user.userId;

          updatePresence(user.projectId, user, ws);

          // Reply with current presence list
          const users = getProjectPresence(user.projectId);
          ws.send(JSON.stringify({ type: 'presence_state', users }));
        } else if (msg.type === 'heartbeat' && msg.payload && currentProjectId && currentUserId) {
          const room = projectRooms.get(currentProjectId);
          const session = room?.get(currentUserId);
          if (session) {
            const updatedUser: PresenceUser = {
              ...session.user,
              ...msg.payload,
              lastActiveAt: Date.now()
            };
            session.user = updatedUser;
            session.lastHeartbeat = Date.now();
            broadcastToProject(currentProjectId, { type: 'user_updated', user: updatedUser }, currentUserId);
          }
        } else if (msg.type === 'action' && currentProjectId && currentUserId) {
          broadcastToProject(currentProjectId, {
            type: 'user_action',
            userId: currentUserId,
            action: msg.action,
            targetId: msg.targetId
          }, currentUserId);
        } else if (msg.type === 'leave' && currentProjectId && currentUserId) {
          removePresence(currentProjectId, currentUserId);
        }
      } catch (err) {
        console.warn('[Presence WS] Error parsing message:', err);
      }
    });

    ws.on('close', () => {
      if (currentProjectId && currentUserId) {
        removePresence(currentProjectId, currentUserId);
      }
    });

    ws.on('error', (err: any) => {
      console.warn('[Presence WS] Socket error:', err);
      if (currentProjectId && currentUserId) {
        removePresence(currentProjectId, currentUserId);
      }
    });
  });

  // Background pruning interval every 10 seconds
  setInterval(() => {
    const now = Date.now();
    for (const [projectId, room] of projectRooms.entries()) {
      for (const [userId, session] of room.entries()) {
        if (now - session.lastHeartbeat > 15000) {
          room.delete(userId);
          broadcastToProject(projectId, { type: 'user_left', userId });
        }
      }
      if (room.size === 0) {
        projectRooms.delete(projectId);
      }
    }
  }, 10000);

  return wss;
}

// HTTP Fallback Router
export const presenceRouter = Router();

presenceRouter.get('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const users = getProjectPresence(projectId);
  res.json({ success: true, data: users });
});

presenceRouter.post('/:projectId/heartbeat', express.json(), (req, res) => {
  const { projectId } = req.params;
  const user = req.body as PresenceUser;
  if (!user || !user.userId) {
    res.status(400).json({ error: 'Invalid presence payload' });
    return;
  }
  const users = updatePresence(projectId, user);
  res.json({ success: true, data: users });
});

presenceRouter.post('/:projectId/leave', express.json(), (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;
  if (userId) {
    removePresence(projectId, userId);
  }
  res.json({ success: true });
});
