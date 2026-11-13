import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';
import { normalizeExternalUrl, DUAL_BUTTON_PRESETS, normalizeCtaAction } from '../components/editor/ctaActions.ts';

describe('Button CTA Enhancement (Dual Action Buttons & Independent Actions)', () => {
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

  describe('Dual Button Presets & Orientation', () => {
    it('provides standard paired presets', () => {
      const ids = DUAL_BUTTON_PRESETS.map(p => p.id);
      expect(ids).toContain('agree-disagree');
      expect(ids).toContain('yes-no');
      expect(ids).toContain('accept-decline');
      expect(ids).toContain('confirm-cancel');

      const yesPreset = DUAL_BUTTON_PRESETS.find(p => p.id === 'yes-no');
      expect(yesPreset?.primaryLabel).toBe('YES');
      expect(yesPreset?.secondaryLabel).toBe('NO');
    });

    it('supports horizontal (side-by-side) and vertical (stacked) grid orientation', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('ActionButton', undefined, {
        layoutMode: 'dual',
        dualOrientation: 'vertical',
        label: 'YES',
        secondaryLabel: 'NO'
      });

      expect(widget.props.dualOrientation).toBe('vertical');
      editorStore.updateWidgetProps(widget.id, { dualOrientation: 'horizontal' });
      expect(widget.props.dualOrientation).toBe('horizontal');
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
      expect(widget.props.secondaryLabel).toBe('NO');
      expect(widget.props.secondaryVariant).toBe('white');
      expect(widget.props.secondaryActionType).toBe('modal');
      expect(widget.props.dualOrientation).toBe('horizontal');
    });

    it('creates dual ActionButton with independent actions (link + modal)', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('ActionButton', undefined, {
        layoutMode: 'dual',
        label: 'YES (VISIT STORE)',
        variant: 'black',
        actionType: 'link',
        url: 'https://707.co.id/store',
        openInNewTab: true,
        secondaryLabel: 'NO (CANCEL)',
        secondaryVariant: 'ghost',
        secondaryActionType: 'modal',
        secondaryModalProps: {
          variant: 'message-alert',
          title: 'Action Cancelled',
          subtitle: 'You chose not to continue.',
          buttonText: 'Close',
          buttonVariant: 'black'
        }
      });

      expect(widget.props.layoutMode).toBe('dual');
      expect(widget.props.actionType).toBe('link');
      expect(widget.props.url).toBe('https://707.co.id/store');
      expect(widget.props.secondaryActionType).toBe('modal');
      expect(widget.props.secondaryModalProps.title).toBe('Action Cancelled');
    });

    it('tracks activeModalKey to independently configure primary vs secondary modals', () => {
      const editorStore = useEditorStore();
      expect(editorStore.activeModalKey).toBe('modalProps');

      editorStore.activeModalKey = 'secondaryModalProps';
      expect(editorStore.activeModalKey).toBe('secondaryModalProps');

      editorStore.activeModalKey = 'modalProps';
      expect(editorStore.activeModalKey).toBe('modalProps');
    });

    it('normalizes action types for both buttons', () => {
      expect(normalizeCtaAction('submit')).toBe('submit');
      expect(normalizeCtaAction('next_page')).toBe('submit');
      expect(normalizeCtaAction('link')).toBe('link');
      expect(normalizeCtaAction('modal')).toBe('modal');
      expect(normalizeCtaAction('download-pass')).toBe('download-pass');
    });
  });

  describe('Gender Dropdown Presets', () => {
    it('standard Google gender presets include Female, Male, Custom (no Rather not say)', () => {
      const GOOGLE_GENDER_PRESETS = ['Female', 'Male', 'Custom'] as const;
      expect(GOOGLE_GENDER_PRESETS).toContain('Female');
      expect(GOOGLE_GENDER_PRESETS).toContain('Male');
      expect(GOOGLE_GENDER_PRESETS).not.toContain('Rather not say');
      expect(GOOGLE_GENDER_PRESETS).toContain('Custom');
      expect(GOOGLE_GENDER_PRESETS.length).toBe(3);
    });
  });

  describe('Document Upload & Sharp 707 Form Tokens', () => {
    it('creates DocumentUpload widget with default configuration', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('DocumentUpload', undefined, {
        title: 'UPLOAD ID / KTP',
        required: true
      });

      expect(widget.type).toBe('DocumentUpload');
      expect(widget.props.title).toBe('UPLOAD ID / KTP');
      expect(widget.props.required).toBe(true);
    });

    it('creates RegistrationForm with file field and gender field', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('RegistrationForm', undefined, {
        fields: [
          { id: 'f_name', name: 'Full Name', type: 'text', required: true, value: '' },
          { id: 'f_gender', name: 'Gender', type: 'gender', required: true, value: '' },
          { id: 'f_file', name: 'Upload ID', type: 'file', required: true, value: '' }
        ]
      });

      expect(widget.type).toBe('RegistrationForm');
      expect(widget.props.fields.length).toBe(3);
      expect(widget.props.fields[1].type).toBe('gender');
      expect(widget.props.fields[2].type).toBe('file');
    });
  });
});
