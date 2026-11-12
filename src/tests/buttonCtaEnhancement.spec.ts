import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';
import { normalizeExternalUrl, DUAL_BUTTON_PRESETS, normalizeCtaAction } from '../components/editor/ctaActions.ts';

describe('Button CTA Enhancement (Dual Action Buttons & External Link)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('normalizeExternalUrl', () => {
    it('prepends https:// to domain names without protocol', () => {
      expect(normalizeExternalUrl('google.com')).toBe('https://google.com');
      expect(normalizeExternalUrl('events.707.co.id/terms')).toBe('https://events.707.co.id/terms');
      expect(normalizeExternalUrl('www.instagram.com')).toBe('https://www.instagram.com');
    });

    it('preserves existing https:// and http:// protocols', () => {
      expect(normalizeExternalUrl('https://google.com')).toBe('https://google.com');
      expect(normalizeExternalUrl('http://insecure.test')).toBe('http://insecure.test');
    });

    it('preserves mailto: and tel: schemes', () => {
      expect(normalizeExternalUrl('mailto:concierge@707.co.id')).toBe('mailto:concierge@707.co.id');
      expect(normalizeExternalUrl('tel:+6281234567890')).toBe('tel:+6281234567890');
    });

    it('handles empty and whitespace-only strings safely', () => {
      expect(normalizeExternalUrl('')).toBe('');
      expect(normalizeExternalUrl('   ')).toBe('');
      expect(normalizeExternalUrl(undefined)).toBe('');
      expect(normalizeExternalUrl(null)).toBe('');
    });
  });

  describe('Dual Button Presets', () => {
    it('provides standard paired presets', () => {
      const ids = DUAL_BUTTON_PRESETS.map(p => p.id);
      expect(ids).toContain('agree-disagree');
      expect(ids).toContain('yes-no');
      expect(ids).toContain('accept-decline');
      expect(ids).toContain('confirm-cancel');

      const agreePreset = DUAL_BUTTON_PRESETS.find(p => p.id === 'agree-disagree');
      expect(agreePreset?.primaryLabel).toBe('I AGREE');
      expect(agreePreset?.secondaryLabel).toBe('I DISAGREE');

      const yesPreset = DUAL_BUTTON_PRESETS.find(p => p.id === 'yes-no');
      expect(yesPreset?.primaryLabel).toBe('YES');
      expect(yesPreset?.secondaryLabel).toBe('NO');
    });
  });

  describe('ActionButton Dual Mode in Editor Store', () => {
    it('creates single ActionButton with default dual-ready props', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('ActionButton', undefined, {
        label: 'SUBMIT RSVP'
      });

      expect(widget.type).toBe('ActionButton');
      expect(widget.props.layoutMode).toBe('single');
      expect(widget.props.label).toBe('SUBMIT RSVP');
      expect(widget.props.secondaryLabel).toBe('DISAGREE');
      expect(widget.props.secondaryVariant).toBe('white');
      expect(widget.props.secondaryActionType).toBe('link');
      expect(widget.props.openInNewTab).toBe(false);
      expect(widget.props.secondaryOpenInNewTab).toBe(true);
    });

    it('creates dual ActionButton with customized agree and disagree options', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('ActionButton', undefined, {
        layoutMode: 'dual',
        label: 'I ACCEPT',
        variant: 'black',
        actionType: 'submit',
        secondaryLabel: 'I DECLINE',
        secondaryVariant: 'ghost',
        secondaryActionType: 'link',
        secondaryUrl: 'https://707.co.id/exit',
        secondaryOpenInNewTab: true
      });

      expect(widget.props.layoutMode).toBe('dual');
      expect(widget.props.label).toBe('I ACCEPT');
      expect(widget.props.secondaryLabel).toBe('I DECLINE');
      expect(widget.props.secondaryVariant).toBe('ghost');
      expect(widget.props.secondaryActionType).toBe('link');
      expect(widget.props.secondaryUrl).toBe('https://707.co.id/exit');
    });

    it('can update secondary button properties seamlessly', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('ActionButton', undefined, {
        layoutMode: 'dual',
        label: 'YES',
        secondaryLabel: 'NO'
      });

      editorStore.updateWidgetProps(widget.id, {
        secondaryLabel: 'NOT NOW',
        secondaryVariant: 'white',
        secondaryUrl: '707.co.id/cancel'
      });

      const updated = editorStore.currentPage.widget_tree.find(w => w.id === widget.id);
      expect(updated?.props.secondaryLabel).toBe('NOT NOW');
      expect(updated?.props.secondaryVariant).toBe('white');
      expect(updated?.props.secondaryUrl).toBe('707.co.id/cancel');
      expect(normalizeExternalUrl(updated?.props.secondaryUrl)).toBe('https://707.co.id/cancel');
    });

    it('normalizes action types for both buttons', () => {
      expect(normalizeCtaAction('submit')).toBe('submit');
      expect(normalizeCtaAction('next_page')).toBe('submit');
      expect(normalizeCtaAction('link')).toBe('link');
      expect(normalizeCtaAction('modal')).toBe('modal');
      expect(normalizeCtaAction('download-pass')).toBe('download-pass');
    });
  });
});
