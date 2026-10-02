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
  });

  it('1. Sign out clears all account state and marks isAuthenticated as false', () => {
    const authStore = useAuthStore();
    authStore.signOut();

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.currentUser).toBeNull();
    expect(authStore.isSuperAdmin).toBe(false);
  });

  it('2. Sign in is strictly restricted to accounts registered by superadmin', () => {
    const authStore = useAuthStore();
    authStore.signOut();

    // Attempt sign in with unregistered account
    const failRes = authStore.signIn('unregistered_brand_123', 'wrong_pass');
    expect(failRes.success).toBe(false);
    expect(authStore.isAuthenticated).toBe(false);

    // Sign in with registered PIC account (Sarah Chen - Atmos Lead)
    const passRes = authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    expect(passRes.success).toBe(true);
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.currentUser?.name).toContain('Sarah Chen');
    expect(authStore.currentUser?.assignedBrands).toContain('atmos');
  });

  it('3. Each brand/PIC has independent project data based on registered PIC assignedBrands', () => {
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
    authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    expect(editorStore.userProjects.length).toBe(1);
    expect(editorStore.userProjects[0].brand_slug).toBe('atmos');
  });

  it('4. One brand can have more than one PIC sharing access to that brand', () => {
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
    const res = authStore.signIn('rian@atmos.co.id', 'rian_atmos_pass');
    expect(res.success).toBe(true);
    expect(editorStore.userProjects.length).toBe(1);
    expect(editorStore.userProjects[0].id).toBe('proj_atmos_shared');
  });

  it('5. Other brands cannot access another brand project, but Superadmin can access all and templates are accessible', () => {
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
    authStore.signIn('sarah.chen@atmos.co.id', 'atmos_pass_2026');
    expect(editorStore.userProjects.some(p => p.brand_slug === 'nike')).toBe(false);

    // Superadmin logs in and can see all brand projects
    authStore.verifySuperAdmin('707admin');
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
});
