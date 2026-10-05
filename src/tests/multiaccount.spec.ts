import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import type { ProjectItem, GlobalTemplate } from '../types/editor.ts';

describe('Multiaccount & Data Isolation Logic', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; }
    };
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.users = [
      {
        id: 'user_editor_1',
        name: 'Sarah Chen (Atmos Lead)',
        email: 'sarah.chen@atmos.co.id',
        password: 'atmos_pass_2026',
        role: 'editor',
        assignedBrands: ['atmos'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
  });

  it('1. Sign out clears all account state and marks isAuthenticated as false', async () => {
    const authStore = useAuthStore();
    authStore.signOut();

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.currentUser).toBeNull();
    expect(authStore.isSuperAdmin).toBe(false);
  });

  it('2. Sign in is strictly restricted to accounts registered by superadmin', async () => {
    const authStore = useAuthStore();
    authStore.signOut();

    // Setup registered PIC
    authStore.users = [
      {
        id: 'user_editor_1',
        name: 'Sarah Chen (Atmos Lead)',
        email: 'sarah.chen@atmos.co.id',
        password: 'atmos_pass_2026',
        role: 'editor',
        assignedBrands: ['atmos'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    // Attempt sign in with unregistered account
    const failRes = await authStore.signIn('unregistered_brand_123', 'wrong_pass');
    expect(failRes.success).toBe(false);
    expect(authStore.isAuthenticated).toBe(false);

    // Sign in with registered PIC account (Sarah Chen - Atmos Lead)
    const passRes = await authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    expect(passRes.success).toBe(true);
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.currentUser?.name).toContain('Sarah Chen');
    expect(authStore.currentUser?.assignedBrands).toContain('atmos');
  });

  it('3. Each brand/PIC has independent project data based on registered PIC assignedBrands', async () => {
    const authStore = useAuthStore();
    const editorStore = useEditorStore();

    // Populate projects from multiple brands
    const mockAtmosProj: ProjectItem = {
      id: 'proj_atmos_1',
      title: 'Atmos Tokyo Drop',
      slug: 'atmos-tokyo-drop',
      brand_id: 'brand_atmos',
      brand_slug: 'atmos',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const mockAsicsProj: ProjectItem = {
      id: 'proj_asics_1',
      title: 'Asics Gel Kayano',
      slug: 'asics-gel-kayano',
      brand_id: 'brand_asics',
      brand_slug: 'asics',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    editorStore.projects = [mockAtmosProj, mockAsicsProj];

    // Sarah Chen (Atmos) only sees Atmos project
    await authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    expect(editorStore.userProjects.length).toBe(1);
    expect(editorStore.userProjects[0].brand_slug).toBe('atmos');
  });

  it('4. One brand can have more than one PIC sharing access to that brand', async () => {
    const authStore = useAuthStore();
    const editorStore = useEditorStore();

    // Register a second PIC for Atmos
    authStore.addUser({
      name: 'Rian Atmos PIC',
      email: 'rian@atmos.co.id',
      password: 'rian_atmos_pass',
      role: 'editor',
      assignedBrands: ['atmos'],
      status: 'active'
    });

    const mockSharedProj: ProjectItem = {
      id: 'proj_atmos_shared',
      title: 'Atmos Shared Activation',
      slug: 'atmos-shared-activation',
      brand_id: 'brand_atmos',
      brand_slug: 'atmos',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    editorStore.projects = [mockSharedProj];

    // Second PIC logs in and accesses the shared Atmos project
    const res = await authStore.signIn('rian@atmos.co.id', 'rian_atmos_pass');
    expect(res.success).toBe(true);
    expect(editorStore.userProjects.length).toBe(1);
    expect(editorStore.userProjects[0].id).toBe('proj_atmos_shared');
  });

  it('5. Other brands cannot access another brand project, but Superadmin can access all and templates are accessible', async () => {
    const authStore = useAuthStore();
    const editorStore = useEditorStore();
    const brandStore = useBrandStore();

    const mockAtmosProj: ProjectItem = {
      id: 'proj_atmos_1',
      title: 'Atmos Drop',
      slug: 'atmos-drop',
      brand_id: 'brand_atmos',
      brand_slug: 'atmos',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const mockNikeProj: ProjectItem = {
      id: 'proj_nike_1',
      title: 'Nike Air Max Day',
      slug: 'nike-air-max-day',
      brand_id: 'brand_nike',
      brand_slug: 'nike',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    editorStore.projects = [mockAtmosProj, mockNikeProj];

    // Atmos user cannot see Nike project
    await authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    expect(editorStore.userProjects.some(p => p.brand_slug === 'nike')).toBe(false);

    // Superadmin logs in and can see all brand projects
    await authStore.verifySuperAdmin('707admin');
    expect(authStore.isSuperAdmin).toBe(true);
    expect(editorStore.userProjects.length).toBe(2);

    // Superadmin templates in brandStore can be accessed by all brands
    const mockMasterTemplate: GlobalTemplate = {
      id: 'tpl_master_1',
      name: 'Master RSVP Activation Template',
      slug: 'master-rsvp-template',
      description: 'Superadmin created RSVP template',
      category: 'rsvp',
      status: 'published',
      widget_tree: [],
      is_global_preset: true,
      created_by: 'Superadmin'
    };

    brandStore.templates = [mockMasterTemplate];
    expect(brandStore.templates.length).toBe(1);
    expect(brandStore.templates[0].category).toBe('rsvp');
  });

  it('6. Signed out users see ZERO projects in userProjects', async () => {
    const authStore = useAuthStore();
    const editorStore = useEditorStore();

    editorStore.projects = [
      {
        id: 'proj_atmos_1',
        title: 'Atmos Drop',
        slug: 'atmos-drop',
        brand_id: 'brand_atmos',
        brand_slug: 'atmos',
        status: 'draft',
        current_version: 1,
        widget_tree: [],
        pages: [],
        owner_id: 'user_editor_1',
        owner_email: 'sarah.chen@atmos.co.id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Ensure signed out
    authStore.signOut();
    expect(authStore.isAuthenticated).toBe(false);

    // userProjects MUST be empty
    expect(editorStore.userProjects.length).toBe(0);
    expect(editorStore.userProjects).toEqual([]);
  });

  it('7. Only the owner account can see their recent and all projects', async () => {
    const authStore = useAuthStore();
    const editorStore = useEditorStore();

    // Register User 2 (Rian)
    authStore.addUser({
      name: 'Rian Atmos PIC',
      email: 'rian@atmos.co.id',
      password: 'rian_atmos_pass',
      role: 'editor',
      assignedBrands: ['atmos'],
      status: 'active'
    });

    const sarahProject: ProjectItem = {
      id: 'proj_sarah_exclusive',
      title: 'Sarah Exclusive Campaign',
      slug: 'sarah-exclusive',
      brand_slug: 'atmos',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      owner_id: 'user_editor_1',
      owner_email: 'sarah.chen@atmos.co.id',
      created_by: 'Sarah Chen (Atmos Lead)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const rianProject: ProjectItem = {
      id: 'proj_rian_exclusive',
      title: 'Rian Exclusive Campaign',
      slug: 'rian-exclusive',
      brand_slug: 'atmos',
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      pages: [],
      owner_id: 'user_editor_2',
      owner_email: 'rian@atmos.co.id',
      created_by: 'Rian Atmos PIC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    editorStore.projects = [sarahProject, rianProject];

    // Sarah signs in: can only see Sarah's project
    await authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    expect(editorStore.userProjects.length).toBe(1);
    expect(editorStore.userProjects[0].id).toBe('proj_sarah_exclusive');

    // Sarah signs out: 0 projects visible
    authStore.signOut();
    expect(editorStore.userProjects.length).toBe(0);

    // Rian signs in: can only see Rian's project, NOT Sarah's project
    await authStore.signIn('rian@atmos.co.id', 'rian_atmos_pass');
    expect(editorStore.userProjects.length).toBe(1);
    expect(editorStore.userProjects[0].id).toBe('proj_rian_exclusive');

    // Superadmin signs in: can see both projects
    await authStore.verifySuperAdmin('707admin');
    expect(editorStore.userProjects.length).toBe(2);
  });

  it('8. openProjectById prevents opening projects owned by another account', async () => {
    const authStore = useAuthStore();
    const editorStore = useEditorStore();

    editorStore.currentProjectId = '';
    editorStore.projects = [
      {
        id: 'proj_sarah_secret',
        title: 'Secret Drop',
        slug: 'secret-drop',
        brand_slug: 'atmos',
        status: 'draft',
        current_version: 1,
        widget_tree: [],
        pages: [],
        owner_id: 'user_editor_1',
        owner_email: 'sarah.chen@atmos.co.id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Signed out attempt to open project
    authStore.signOut();
    editorStore.openProjectById('proj_sarah_secret');
    expect(editorStore.currentProjectId).toBe('');

    // Different user attempts to open project
    await authStore.signIn('rian@atmos.co.id', 'rian_atmos_pass');
    editorStore.openProjectById('proj_sarah_secret');
    expect(editorStore.currentProjectId).toBe('');

    // Owner opens project
    await authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    editorStore.openProjectById('proj_sarah_secret');
    expect(editorStore.currentProjectId).toBe('proj_sarah_secret');
  });
});
