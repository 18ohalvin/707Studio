import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';
import { normalizeExternalUrl, DUAL_BUTTON_PRESETS, normalizeCtaAction, getFunnelTargetPages, resolveTargetPageIndex } from '../components/editor/ctaActions.ts';
import {
  getExtensionsForCategories,
  resolveUploadExtensions,
  toggleUploadCategoryList,
  formatUploadHelperSummary
} from '../components/editor/uploadFieldConfig.ts';

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

    it('creates HeroDrop with dual-ready CTA defaults and no leading icon', () => {
      const editorStore = useEditorStore();
      const hero = editorStore.addWidget('HeroDrop', undefined, {
        isCtaEnabled: true,
        layoutMode: 'dual',
        dualOrientation: 'vertical',
        buttonText: 'YES',
        actionType: 'submit',
        secondaryLabel: 'NO',
        secondaryVariant: 'ghost',
        secondaryActionType: 'link',
        secondaryUrl: 'https://707.co.id/shop'
      });

      expect(hero.type).toBe('HeroDrop');
      expect(hero.props.showIcon).toBe(false);
      expect(hero.props.layoutMode).toBe('dual');
      expect(hero.props.dualOrientation).toBe('vertical');
      expect(hero.props.buttonText).toBe('YES');
      expect(hero.props.secondaryLabel).toBe('NO');
      expect(hero.props.secondaryVariant).toBe('ghost');
      expect(hero.props.secondaryActionType).toBe('link');
      expect(hero.props.secondaryUrl).toBe('https://707.co.id/shop');

      const btn = editorStore.addWidget('ActionButton');
      expect(btn.props.showIcon).toBe(false);
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

  describe('Target page navigation & skipping', () => {
    const pages = [
      { id: 'p1', title: 'Landing', kind: 'page' },
      { id: 'p2', title: 'Size Select', kind: 'page' },
      { id: 'p3', title: 'Registration', kind: 'page' },
      { id: 'p_ticket', title: 'E-Pass PDF', kind: 'ticket' }
    ];

    it('lists non-ticket funnel pages and flags the active page', () => {
      const options = getFunnelTargetPages(pages, 'p1');
      expect(options.map(o => o.id)).toEqual(['p1', 'p2', 'p3']);
      expect(options[0].isCurrent).toBe(true);
      expect(options[1].isCurrent).toBe(false);
      expect(options[2].label).toBe('Page 3: Registration');
    });

    it('advances sequentially when targetPageId is empty or "next"', () => {
      expect(resolveTargetPageIndex(pages, 0)).toBe(1);
      expect(resolveTargetPageIndex(pages, 0, '')).toBe(1);
      expect(resolveTargetPageIndex(pages, 0, 'next')).toBe(1);
    });

    it('skips intermediate pages when a specific targetPageId is configured', () => {
      expect(resolveTargetPageIndex(pages, 0, 'p3')).toBe(2);
    });

    it('falls back to sequential navigation when targetPageId does not exist or points to ticket page', () => {
      expect(resolveTargetPageIndex(pages, 0, 'missing_id')).toBe(1);
      expect(resolveTargetPageIndex(pages, 0, 'p_ticket')).toBe(1);
    });

    it('returns -1 at the end of the funnel or right before a ticket design page', () => {
      expect(resolveTargetPageIndex(pages, 2)).toBe(-1);
      expect(resolveTargetPageIndex(pages, 2, '')).toBe(-1);
    });
  });

  describe('Upload Field Config & UX Enhancements', () => {
    it('resolves allowed extensions and helper summary for RegistrationForm file fields', () => {
      const exts = getExtensionsForCategories(['images']);
      expect(exts).toContain('.jpg');
      expect(exts).toContain('.png');
      expect(exts).not.toContain('.pdf');

      expect(toggleUploadCategoryList(['images'], 'images')).toEqual(['images']);
      expect(toggleUploadCategoryList(['images'], 'documents')).toEqual(['images', 'documents']);

      expect(resolveUploadExtensions({ allowedExtensions: ['.png', '.jpg'] })).toEqual(['.png', '.jpg']);
      expect(formatUploadHelperSummary({ allowedExtensions: ['.png', '.jpg'], maxSizeMb: 5 })).toBe(
        'Tap to choose file (PNG, JPG up to 5MB)'
      );
    });

    it('supports Title & Body structured props on TextBanner widgets', () => {
      const editorStore = useEditorStore();
      const widget = editorStore.addWidget('TextBanner', undefined, {
        text: 'SECTION HEADING',
        bodyText: 'Supporting copy here',
        hasBody: true,
        typographyStyle: 'heading-3',
        bodyTypographyStyle: 'body-text',
        variant: 'title-body'
      });

      expect(widget.type).toBe('TextBanner');
      expect(widget.props.hasBody).toBe(true);
      expect(widget.props.text).toBe('SECTION HEADING');
      expect(widget.props.bodyText).toBe('Supporting copy here');
      expect(widget.props.bodyTypographyStyle).toBe('body-text');
    });

    it('exits hero inline reposition mode when deselecting widget or changing page', () => {
      const editorStore = useEditorStore();
      const hero = editorStore.addWidget('HeroDrop', undefined, { imageUrl: '/test.jpg', isSolidSpace: false });
      editorStore.selectWidget(hero.id);
      editorStore.toggleHeroFreeDrag(true);
      expect(editorStore.isHeroFreeDragActive).toBe(true);

      editorStore.selectWidget(null);
      expect(editorStore.isHeroFreeDragActive).toBe(false);

      editorStore.selectWidget(hero.id);
      editorStore.toggleHeroFreeDrag(true);
      editorStore.addPage();
      editorStore.selectPage(0);
      expect(editorStore.isHeroFreeDragActive).toBe(false);
    });
  });
});
