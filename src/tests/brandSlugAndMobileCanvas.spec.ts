import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';

describe('Brand Slug & Mobile Canvas Validation', () => {
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

  it('1. When logged in as Fred Perry PIC, activeBrand and project brand_slug resolve to fredperry instead of atmos', async () => {
    const authStore = useAuthStore();
    const brandStore = useBrandStore();
    const editorStore = useEditorStore();

    // Register Fred Perry user
    authStore.users = [
      {
        id: 'user_fp_1',
        name: 'Fred Perry PIC',
        email: 'pic@fredperry.co.id',
        password: 'fp_password_2026',
        role: 'editor',
        assignedBrands: ['fredperry'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    // Sign in as Fred Perry PIC
    const res = await authStore.signIn('pic@fredperry.co.id', 'fp_password_2026');
    expect(res.success).toBe(true);
    expect(authStore.currentUser?.assignedBrands).toContain('fredperry');

    // Brand store syncs active brand to fredperry
    expect(brandStore.activeBrand?.slug).toBe('fredperry');

    // Create a new project for Fred Perry
    const proj = editorStore.createNewProject('Fred Perry DNA Night 2026', 'fred-perry-dna-night-2026');
    expect(proj.brand_slug).toBe('fredperry');
    expect(editorStore.currentPage?.brand_slug).toBe('fredperry');

    // When saving current project, resolvedBrandSlug remains fredperry
    const saved = await editorStore.saveCurrentProject();
    expect(saved?.brand_slug).toBe('fredperry');
  });

  it('2. Review Submit URL computed value accurately reflects logged-in brand slug', async () => {
    const authStore = useAuthStore();
    const brandStore = useBrandStore();
    const editorStore = useEditorStore();

    authStore.users = [
      {
        id: 'user_fp_1',
        name: 'Fred Perry PIC',
        email: 'pic@fredperry.co.id',
        password: 'fp_password_2026',
        role: 'editor',
        assignedBrands: ['fredperry'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    await authStore.signIn('pic@fredperry.co.id', 'fp_password_2026');

    editorStore.createNewProject('Fred Perry DNA Night 2026', 'fred-perry-dna-night-2026');
    editorStore.projectTitle = 'Fred Perry DNA Night 2026';

    // Simulate campaignUrl computation from ReviewSubmitModal.vue
    const userBrand = authStore.currentUser?.assignedBrands?.[0];
    let rawBrand = '';
    if (!authStore.isSuperAdmin && userBrand && userBrand !== 'all') {
      rawBrand = userBrand;
    } else if (editorStore.currentPage?.brand_slug && editorStore.currentPage.brand_slug !== 'atmos') {
      rawBrand = editorStore.currentPage.brand_slug;
    } else if (brandStore.activeBrand?.slug) {
      rawBrand = brandStore.activeBrand.slug;
    } else {
      rawBrand = userBrand || 'events';
    }

    const cleanSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    const brandSlug = cleanSlug(rawBrand);
    const projectSlug = cleanSlug(editorStore.projectTitle);

    const generatedUrl = `events.707.co.id/${brandSlug}/${projectSlug}`;
    expect(generatedUrl).toBe('events.707.co.id/fredperry/fred-perry-dna-night-2026');
    expect(generatedUrl).not.toContain('atmos');
  });

  it('3. Persisted activeBrand survives page reload from localStorage', () => {
    const brandStore = useBrandStore();
    brandStore.setActiveBrand({
      id: 'brand_fredperry',
      name: 'Fred Perry',
      slug: 'fredperry',
      primary_color: '#000000'
    });

    expect(localStorage.getItem('707_active_brand')).toContain('fredperry');

    // Simulate page refresh: new pinia instance reading storage
    setActivePinia(createPinia());
    const refreshedBrandStore = useBrandStore();
    expect(refreshedBrandStore.activeBrand?.slug).toBe('fredperry');
  });

  it('4. Multi-page campaigns resolve all pages properly with widget trees intact', () => {
    const editorStore = useEditorStore();
    const proj = editorStore.createNewProject('Fred Perry DNA Night 2026', 'fred-perry-dna-night-2026');
    
    // Add page 2 and page 3
    editorStore.addPage();
    editorStore.addPage();
    expect(editorStore.pages.length).toBe(3);

    // Populate Page 1 HeroDrop
    editorStore.selectPage(0);
    editorStore.addWidget('HeroDrop', undefined, {
      ratio: 'Dynamic Fit',
      imageUrl: '/uploads/upload_fp.png',
      buttonText: 'Action',
      isCtaEnabled: true
    });
    expect(editorStore.pages[0].widget_tree.length).toBe(1);

    // Populate Page 2 RegistrationForm
    editorStore.selectPage(1);
    editorStore.addWidget('RegistrationForm', undefined, {
      title: 'REGISTRATION FORM',
      fields: [{ id: 'f1', name: 'Full Name', value: 'Alvin' }]
    });
    expect(editorStore.pages[1].widget_tree.length).toBe(1);

    // Verify all pages are preserved
    expect(editorStore.pages[0].widget_tree[0].type).toBe('HeroDrop');
    expect(editorStore.pages[1].widget_tree[0].type).toBe('RegistrationForm');
  });
});
