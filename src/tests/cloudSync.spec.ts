import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import type { ProjectItem } from '../types/editor.ts';
import * as apiClient from '../services/apiClient.ts';

describe('Cross-Device & Cross-Browser Cloud Synchronization Pipeline', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; }
    };
    setActivePinia(createPinia());
  });

  it('1. Fresh browser / second device with empty localStorage receives cloud projects', async () => {
    const mockCloudProjects: ProjectItem[] = [
      {
        id: 'proj_cloud_101',
        title: 'Cloud Activation Drop',
        slug: 'cloud-activation-drop',
        brand_slug: 'atmos',
        status: 'draft',
        current_version: 1,
        widget_tree: [],
        pages: [],
        created_at: '2026-10-05T09:00:00.000Z',
        updated_at: '2026-10-05T09:00:00.000Z'
      }
    ];

    vi.spyOn(apiClient, 'apiFetch').mockImplementation(async (path: string, options: any = {}) => {
      if (path === '/api/pages' && (!options.method || options.method === 'GET')) {
        return new Response(JSON.stringify({ success: true, data: mockCloudProjects }), { status: 200 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    const authStore = useAuthStore();
    const editorStore = useEditorStore();

    // Verify localStorage is completely blank on Device 2
    expect(localStorage.getItem('707_cloud_projects')).toBeNull();

    // Load projects from cloud on Device 2
    await editorStore.loadProjects();

    // Device 2 Pinia store & local cache now have the cloud project
    expect(editorStore.projects.length).toBe(1);
    expect(editorStore.projects[0].id).toBe('proj_cloud_101');
    expect(editorStore.projects[0].title).toBe('Cloud Activation Drop');

    // When Atmos user logs in on Device 2, they see the project in userProjects
    authStore.currentUser = {
      id: 'user_rian_1',
      name: 'Rian Atmos PIC',
      email: 'rian@atmos.co.id',
      role: 'editor',
      assignedBrands: ['atmos'],
      status: 'active',
      createdAt: '2026-10-05T09:00:00.000Z'
    };

    expect(editorStore.userProjects.length).toBe(1);
    expect(editorStore.userProjects[0].title).toBe('Cloud Activation Drop');
  });

  it('2. Local drafts created offline or before server was reachable are automatically synced to cloud upon loadProjects', async () => {
    const localDraft: ProjectItem = {
      id: 'proj_offline_1',
      title: 'Offline Draft Drop',
      slug: 'offline-draft-drop',
      brand_slug: 'atmos',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      created_at: '2026-10-05T09:10:00.000Z',
      updated_at: '2026-10-05T09:10:00.000Z'
    };

    // Pre-populate localStorage with offline project
    localStorage.setItem('707_cloud_projects', JSON.stringify([localDraft]));

    const postedToCloud: any[] = [];
    vi.spyOn(apiClient, 'apiFetch').mockImplementation(async (path: string, options: any = {}) => {
      if (path === '/api/pages' && (!options.method || options.method === 'GET')) {
        // Cloud server is empty initially
        return new Response(JSON.stringify({ success: true, data: [] }), { status: 200 });
      }
      if (path === '/api/pages' && options.method === 'POST') {
        postedToCloud.push(JSON.parse(options.body));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    const editorStore = useEditorStore();
    await editorStore.loadProjects();

    // Verify the offline draft was pushed to the cloud server
    expect(postedToCloud.length).toBe(1);
    expect(postedToCloud[0].id).toBe('proj_offline_1');
    expect(postedToCloud[0].title).toBe('Offline Draft Drop');
  });

  it('3. saveCurrentProject updates both local cache and sends mutation with keepalive', async () => {
    const postCalls: any[] = [];
    vi.spyOn(apiClient, 'apiFetch').mockImplementation(async (path: string, options: any = {}) => {
      if (path === '/api/pages' && options.method === 'POST') {
        postCalls.push(options);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      return new Response(JSON.stringify({ success: true, data: [] }), { status: 200 });
    });

    const editorStore = useEditorStore();
    editorStore.currentProjectId = 'proj_save_test';
    editorStore.projectTitle = 'Test Save Across Devices';

    const saved = await editorStore.saveCurrentProject();
    expect(saved).not.toBeNull();
    expect(saved?.title).toBe('Test Save Across Devices');

    // Verify HTTP POST request was made with keepalive enabled
    expect(postCalls.length).toBe(1);
    expect(postCalls[0].keepalive).toBe(true);

    // Verify localStorage was updated
    const cached = JSON.parse(localStorage.getItem('707_cloud_projects') || '[]');
    expect(cached.some((p: any) => p.id === 'proj_save_test')).toBe(true);
  });
});
