import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import type { GlobalTemplate } from '../types/editor.ts';

describe('Template Studio Mode (Option A)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockTemplate: GlobalTemplate = {
    id: 'tpl-vip-rsvp',
    name: 'VIP RSVP Master Preset',
    slug: 'vip-rsvp-master-preset',
    description: 'Exclusive preset for VIP brand drops',
    category: 'rsvp',
    status: 'published',
    is_global_preset: true,
    created_by: 'Superadmin',
    widget_tree: [
      {
        id: 'widget_text_1',
        type: 'text',
        props: { content: 'Exclusive Access' }
      }
    ]
  };

  it('openTemplateInStudio initializes template mode without adding a campaign project', () => {
    const editorStore = useEditorStore();
    const initialProjectsCount = editorStore.projects.length;

    editorStore.openTemplateInStudio(mockTemplate);

    expect(editorStore.isTemplateMode).toBe(true);
    expect(editorStore.activeTemplateId).toBe('tpl-vip-rsvp');
    expect(editorStore.projectTitle).toBe('VIP RSVP Master Preset');
    expect(editorStore.pages.length).toBe(1);
    expect(editorStore.pages[0].widget_tree.length).toBe(1);
    expect(editorStore.pages[0].widget_tree[0].id).toBe('widget_text_1');

    // Should NOT create or prepend a project to projects list
    expect(editorStore.projects.length).toBe(initialProjectsCount);
  });

  it('saveCurrentProject in template mode calls brandStore.updateTemplate', async () => {
    const editorStore = useEditorStore();
    const brandStore = useBrandStore();

    editorStore.openTemplateInStudio(mockTemplate);

    const updateSpy = vi.spyOn(brandStore, 'updateTemplate').mockResolvedValue(undefined as any);

    editorStore.projectTitle = 'Updated VIP Master Preset';
    editorStore.pages[0].widget_tree.push({
      id: 'widget_btn_1',
      type: 'button',
      props: { label: 'Claim Pass' }
    });

    await editorStore.saveCurrentProject();

    expect(updateSpy).toHaveBeenCalledWith('tpl-vip-rsvp', {
      name: 'Updated VIP Master Preset',
      widget_tree: expect.arrayContaining([
        expect.objectContaining({ id: 'widget_text_1' }),
        expect.objectContaining({ id: 'widget_btn_1' })
      ])
    });
    expect(editorStore.saveFailed).toBe(false);
  });

  it('createNewProject and openProjectById automatically exit template mode', () => {
    const editorStore = useEditorStore();

    editorStore.openTemplateInStudio(mockTemplate);
    expect(editorStore.isTemplateMode).toBe(true);

    editorStore.createNewProject('New Campaign Drop');
    expect(editorStore.isTemplateMode).toBe(false);
    expect(editorStore.activeTemplateId).toBeNull();

    // Re-enter template mode
    editorStore.openTemplateInStudio(mockTemplate);
    expect(editorStore.isTemplateMode).toBe(true);

    editorStore.exitTemplateMode();
    expect(editorStore.isTemplateMode).toBe(false);
    expect(editorStore.activeTemplateId).toBeNull();
  });
});
