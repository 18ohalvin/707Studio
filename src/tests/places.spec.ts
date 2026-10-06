import { describe, it, expect } from 'vitest';
import { placeStatus, collectPicks, wantsWaitlist, configuredLimit, isRunningLow, placeKey, type PlacesInfo } from '../services/places.ts';

const none = { limited: false, capacity: null, closed: false, waitlist: true };
const info = (over: Partial<PlacesInfo>): PlacesInfo => ({ capacity: 100, taken: 0, remaining: 100, closed: false, waitlist: true, ...over });

describe('placeStatus', () => {
  it('says nothing about an option with no limit', () => {
    expect(placeStatus(undefined, none).label).toBe('');
    expect(placeStatus(info({ capacity: null, remaining: null }), none)).toMatchObject({ label: '', selectable: true });
  });

  it('words live numbers quietly, and flags the last places', () => {
    expect(placeStatus(info({ remaining: 60 }), none)).toMatchObject({ state: 'open', label: '60 places remaining' });
    expect(placeStatus(info({ remaining: 3 }), none)).toMatchObject({ state: 'few', label: 'Last 3 places' });
    expect(placeStatus(info({ remaining: 1 }), none).label).toBe('Last place');
  });

  it('a full option offers the waitlist, or is simply fully reserved', () => {
    expect(placeStatus(info({ remaining: 0 }), none)).toMatchObject({ state: 'full', selectable: true, waitlist: true });
    expect(placeStatus(info({ remaining: 0, waitlist: false }), none)).toMatchObject({ label: 'Fully reserved', selectable: false });
  });

  it('a closed option cannot be picked', () => {
    expect(placeStatus(info({ closed: true }), none)).toMatchObject({ state: 'closed', selectable: false });
  });

  it('previews the configured limit in the editor', () => {
    expect(placeStatus(undefined, { ...none, limited: true, capacity: 500 }).label).toBe('500 places available');
    expect(placeStatus(undefined, { ...none, limited: true, capacity: 0, waitlist: false }).selectable).toBe(false);
  });

  it('running low is the last tenth, never above 5', () => {
    expect(isRunningLow(5, 500)).toBe(true);
    expect(isRunningLow(6, 500)).toBe(false);
    expect(isRunningLow(1, 5)).toBe(true);
    expect(isRunningLow(0, 5)).toBe(false);
  });
});

describe('picks and limits', () => {
  it('a number alone is not a limit', () => {
    expect(configuredLimit({ globalSlotsCapacity: 25 }, {})).toBeNull();
    expect(configuredLimit({ limitPlaces: true, globalSlotsCapacity: '40' }, {})).toBe(40);
    expect(configuredLimit({ limitPlaces: true, globalSlotsCapacity: '40' }, { slotsCapacity: '10' })).toBe(10);
  });

  it('collects ticked options of every choice block, ignoring stale ids', () => {
    const pages = [{ widget_tree: [
      { id: 'w1', type: 'MultipleChoice', props: { options: [{ id: 'a' }, { id: 'b' }], selectedValues: ['b', 'gone'] } },
      { id: 'w2', type: 'TextBanner', props: {} }
    ] }];
    expect(collectPicks(pages)).toEqual([{ widget: 'w1', option: 'b' }]);
  });

  it('asks for the waitlist only when a ticked option is full', () => {
    const map = { [placeKey('w1', 'a')]: info({ remaining: 0 }), [placeKey('w1', 'b')]: info({ remaining: 4 }) };
    expect(wantsWaitlist([{ widget: 'w1', option: 'a' }], map)).toBe(true);
    expect(wantsWaitlist([{ widget: 'w1', option: 'b' }], map)).toBe(false);
  });
});
