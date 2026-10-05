import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Brand, GlobalTemplate } from '../types/editor.ts';
import { apiJson } from '../services/apiClient.ts';

export const useBrandStore = defineStore('brand', () => {
  // Pure live state - no static mock data
  const brands = ref<Brand[]>([]);
  const activeBrand = ref<Brand | null>(null);
  const templates = ref<GlobalTemplate[]>([]);
  const isLoading = ref<boolean>(false);

  function setActiveBrand(brand: Brand | null) {
    activeBrand.value = brand;
  }

  async function loadBrands() {
    isLoading.value = true;
    try {
      const res = await apiJson<{ success: boolean; data: Brand[] }>('/api/brands');
      if (res && res.success && Array.isArray(res.data)) {
        brands.value = res.data;
      } else {
        brands.value = [];
      }
    } catch (err) {
      console.warn('[BrandStore] Error loading brands from cloud server:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addBrand(brand: Omit<Brand, 'id'> | Brand) {
    try {
      const res = await apiJson<{ success: boolean; data: Brand }>('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand)
      });
      if (res && res.success && res.data) {
        brands.value.unshift(res.data);
        if (!activeBrand.value) {
          activeBrand.value = res.data;
        }
        return res.data;
      }
    } catch (err) {
      console.error('[BrandStore] Failed to create brand on cloud server:', err);
      // Optimistic local add
      const fallbackBrand: Brand = {
        id: `brand-${Date.now()}`,
        ...brand
      };
      brands.value.unshift(fallbackBrand);
      return fallbackBrand;
    }
  }

  async function updateBrand(id: string, updates: Partial<Brand>) {
    const idx = brands.value.findIndex(b => b.id === id || b.slug === id);
    if (idx !== -1) {
      brands.value[idx] = { ...brands.value[idx], ...updates };
      if (activeBrand.value && (activeBrand.value.id === id || activeBrand.value.slug === id)) {
        activeBrand.value = { ...activeBrand.value, ...updates };
      }
    }
    try {
      await apiJson(`/api/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('[BrandStore] Failed to update brand on cloud server:', err);
    }
  }

  async function removeBrand(idOrSlug: string) {
    brands.value = brands.value.filter(b => b.id !== idOrSlug && b.slug !== idOrSlug);
    if (activeBrand.value && (activeBrand.value.id === idOrSlug || activeBrand.value.slug === idOrSlug)) {
      activeBrand.value = brands.value[0] || null;
    }
    try {
      await apiJson(`/api/brands/${idOrSlug}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('[BrandStore] Failed to delete brand on cloud server:', err);
    }
  }

  async function loadTemplates() {
    try {
      const res = await apiJson<{ success: boolean; data: GlobalTemplate[] }>('/api/templates');
      if (res && res.success && Array.isArray(res.data)) {
        templates.value = res.data;
      }
    } catch (err) {
      console.warn('[BrandStore] Error loading templates from cloud server:', err);
    }
  }

  async function addTemplate(template: GlobalTemplate) {
    templates.value.unshift(template);
    try {
      await apiJson('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
    } catch (err) {
      console.error('[BrandStore] Failed to save template to cloud server:', err);
    }
  }

  async function updateTemplate(id: string, updates: Partial<GlobalTemplate>) {
    const idx = templates.value.findIndex(t => t.id === id);
    if (idx !== -1) {
      templates.value[idx] = { 
        ...templates.value[idx], 
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
    try {
      await apiJson(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('[BrandStore] Failed to update template on cloud server:', err);
    }
  }

  async function removeTemplate(id: string) {
    templates.value = templates.value.filter(t => t.id !== id);
    try {
      await apiJson(`/api/templates/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[BrandStore] Failed to delete template on cloud server:', err);
    }
  }

  function toggleTemplateStatus(id: string) {
    const tpl = templates.value.find(t => t.id === id);
    if (tpl) {
      const nextStatus = (tpl.status === 'published' ? 'draft' : 'published') as 'published' | 'draft';
      updateTemplate(id, { status: nextStatus });
    }
  }

  // Load live cloud data on initialization
  loadBrands();
  loadTemplates();

  return {
    brands,
    activeBrand,
    templates,
    isLoading,
    setActiveBrand,
    loadBrands,
    addBrand,
    updateBrand,
    removeBrand,
    loadTemplates,
    addTemplate,
    updateTemplate,
    removeTemplate,
    toggleTemplateStatus
  };
});
