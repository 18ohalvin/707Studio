import { describe, expect, it } from 'vitest';
import { resolveChoiceRouteOverride } from '../components/editor/ctaActions.ts';
import { normalizeStatus, statusLabel } from '../components/hub/hubUtils.ts';
import { DEFAULT_QUEUE_SETTINGS } from '../../server/src/queueHelpers.ts';

describe('Curated approval mode & conditional choice branching', () => {
  it('resolves MultipleChoice option-level link redirect when selected', () => {
    const tree = [
      {
        type: 'MultipleChoice',
        props: {
          selectedValues: ['opt_no'],
          options: [
            { id: 'opt_yes', label: 'Yes', routeAction: 'page', routeTargetPageId: 'page_form' },
            { id: 'opt_no', label: 'No', routeAction: 'link', routeUrl: 'orpcatalog.com/shop' }
          ]
        }
      }
    ];
    expect(resolveChoiceRouteOverride(tree)).toEqual({
      kind: 'link',
      url: 'https://orpcatalog.com/shop'
    });
  });

  it('resolves MultipleChoice option-level page jump when selected', () => {
    const tree = [
      {
        type: 'MultipleChoice',
        props: {
          selectedValues: ['opt_yes'],
          options: [
            { id: 'opt_yes', label: 'Yes', routeAction: 'page', routeTargetPageId: 'page_form' },
            { id: 'opt_no', label: 'No', routeAction: 'link', routeUrl: 'orpcatalog.com/shop' }
          ]
        }
      }
    ];
    expect(resolveChoiceRouteOverride(tree)).toEqual({
      kind: 'page',
      targetPageId: 'page_form'
    });
  });

  it('returns null when selected option uses default flow', () => {
    const tree = [
      {
        type: 'MultipleChoice',
        props: {
          selectedValues: ['opt_a'],
          options: [{ id: 'opt_a', label: '3x a week', routeAction: 'default' }]
        }
      }
    ];
    expect(resolveChoiceRouteOverride(tree)).toBeNull();
  });

  it('keeps pending distinct from legacy submitted status', () => {
    expect(normalizeStatus('pending')).toBe('pending');
    expect(statusLabel('pending')).toBe('Pending Review');
    expect(normalizeStatus('submitted')).toBe('registered');
  });

  it('provides safe defaults for requireApproval, applicationReceived email, and approved WA', () => {
    expect(DEFAULT_QUEUE_SETTINGS.requireApproval).toBe(false);
    expect(DEFAULT_QUEUE_SETTINGS.emailTemplates?.applicationReceived?.heading).toBe('Application received.');
    expect(DEFAULT_QUEUE_SETTINGS.waTemplates.approved).toContain('{{link}}');
  });
});
