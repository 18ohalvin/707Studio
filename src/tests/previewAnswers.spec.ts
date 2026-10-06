import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';
import { stripTextAnswers } from '../components/editor/guestAnswers.ts';
import * as apiClient from '../services/apiClient.ts';

describe('Editor designs, Preview tests — answers never become the design', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; }
    };
    setActivePinia(createPinia());
  });

  it('restores the design when leaving Preview, pre-selected options included', () => {
    const store = useEditorStore();
    const field = store.addWidget('FieldInput', undefined, { label: 'Email' })!;
    const choice = store.addWidget('MultipleChoice', undefined, {
      options: [{ id: 'a', label: 'Day 1' }, { id: 'b', label: 'Day 2' }],
      selectedValues: ['a'] // designer's pre-selection
    })!;

    store.openPreviewMode();
    // A test run: type and change the selection
    store.currentPage.widget_tree.find(w => w.id === field.id)!.props.value = 'tester@example.com';
    store.updateWidgetProps(choice.id, { selectedValues: ['b'] });
    store.closePreviewMode();

    const after = store.currentPage.widget_tree;
    expect(after.find(w => w.id === field.id)!.props.value || '').toBe('');
    expect(after.find(w => w.id === choice.id)!.props.selectedValues).toEqual(['a']);
  });

  it('never sends typed answers to the server', async () => {
    const posted: any[] = [];
    vi.spyOn(apiClient, 'apiFetch').mockImplementation(async (path: string, options: any = {}) => {
      if (path === '/api/pages' && options.method === 'POST') posted.push(JSON.parse(options.body));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });
    const store = useEditorStore();
    const field = store.addWidget('FieldInput', undefined, { label: 'Name' })!;
    store.currentPage.widget_tree.find(w => w.id === field.id)!.props.value = 'Typed In Canvas';

    await store.saveCurrentProject();

    const sent = posted[posted.length - 1];
    const sentField = sent.pages[0].widget_tree.find((w: any) => w.id === field.id);
    expect(sentField.props.value).toBe('');
  });

  it('clears text answers but keeps choice pre-selections', () => {
    const pages = [{
      widget_tree: [
        { type: 'FieldInput', props: { value: 'x' } },
        { type: 'RegistrationForm', props: { fields: [{ value: 'y', errorMessage: 'bad' }] } },
        { type: 'MultipleChoice', props: { selectedValues: ['a'] } },
        { type: 'ActionButton', props: { modalProps: { fieldValue: 'z', options: [{ selected: true }] } } }
      ]
    }];
    stripTextAnswers(pages);
    const [f, r, c, b] = pages[0].widget_tree as any[];
    expect(f.props.value).toBe('');
    expect(r.props.fields[0].value).toBe('');
    expect(r.props.fields[0].errorMessage).toBeUndefined();
    expect(c.props.selectedValues).toEqual(['a']);
    expect(b.props.modalProps.fieldValue).toBe('');
    expect(b.props.modalProps.options[0].selected).toBe(true);
  });
});
