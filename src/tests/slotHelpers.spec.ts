import { describe, it, expect } from 'vitest';
import {
  parseCapacity, slotDefsFromDesign, normalizePicks, availabilityOf, decidePlaces, picksFromLabels, slotKey
} from '../../server/src/slotHelpers.ts';

const choice = (props: Record<string, any>, options: any[], id = 'mc1') => ({ id, type: 'MultipleChoice', props: { options, ...props } });
const design = (...widgets: any[]) => ({ pages: [{ id: 'p1', widget_tree: widgets }] });

describe('reading limits from a design', () => {
  it('a number alone is not a limit — only "Limit places" switched on makes it one', () => {
    // The editor used to stamp 25 on every new choice block as a label. It must not start refusing guests.
    const defs = slotDefsFromDesign(design(choice({ globalSlotsCapacity: 25, showSlotsCapacity: true }, [{ id: 'a', label: 'Day 1' }])));
    expect(defs.get(slotKey('mc1', 'a'))?.capacity).toBeNull();
  });

  it('applies the shared limit, and an option\'s own limit over it', () => {
    const defs = slotDefsFromDesign(design(choice({ limitPlaces: true, globalSlotsCapacity: '500' }, [
      { id: 'a', label: 'Day 1' }, { id: 'b', label: 'Day 2', slotsCapacity: 300 }
    ])));
    expect(defs.get(slotKey('mc1', 'a'))?.capacity).toBe(500);
    expect(defs.get(slotKey('mc1', 'b'))?.capacity).toBe(300);
  });

  it('leaves an option without any number unlimited, even in a limited block', () => {
    const defs = slotDefsFromDesign(design(choice({ limitPlaces: true }, [{ id: 'a', label: 'Open' }])));
    expect(defs.get(slotKey('mc1', 'a'))?.capacity).toBeNull();
  });

  it('knows closed options and the waitlist setting', () => {
    const defs = slotDefsFromDesign(design(
      choice({ limitPlaces: true, globalSlotsCapacity: 10, waitlistEnabled: false }, [{ id: 'a', label: 'A', disabled: true }, { id: 'b', label: 'B' }])
    ));
    expect(defs.get(slotKey('mc1', 'a'))).toMatchObject({ closed: true, waitlist: false });
    expect(defs.get(slotKey('mc1', 'b'))).toMatchObject({ closed: false, waitlist: false });
    expect(slotDefsFromDesign(design(choice({ limitPlaces: true, globalSlotsCapacity: 3 }, [{ id: 'a', label: 'A' }]))).get(slotKey('mc1', 'a'))?.waitlist).toBe(true);
  });

  it('reads every page of the campaign and ignores other block types', () => {
    const defs = slotDefsFromDesign({ pages: [
      { widget_tree: [choice({ limitPlaces: true, globalSlotsCapacity: 5 }, [{ id: 'a', label: 'A' }], 'mc1'), { id: 'x', type: 'TextBanner', props: {} }] },
      { widget_tree: [choice({ limitPlaces: true, globalSlotsCapacity: 7 }, [{ id: 'a', label: 'A' }], 'mc2')] }
    ] });
    expect(defs.size).toBe(2);
    expect(defs.get(slotKey('mc2', 'a'))?.capacity).toBe(7);
  });

  it('copes with a missing or odd design', () => {
    expect(slotDefsFromDesign(null).size).toBe(0);
    expect(slotDefsFromDesign({}).size).toBe(0);
    expect(slotDefsFromDesign({ widget_tree: [choice({ limitPlaces: true, globalSlotsCapacity: 2 }, [{ id: 'a', label: 'A' }])] }).size).toBe(1);
  });

  it('parses capacities leniently but never invents one', () => {
    expect(parseCapacity('500')).toBe(500);
    expect(parseCapacity(' 40 ')).toBe(40);
    expect(parseCapacity(0)).toBe(0);
    expect(parseCapacity('12.9')).toBe(12);
    for (const bad of ['', '  ', 'many', null, undefined, -3, NaN]) expect(parseCapacity(bad as any)).toBeNull();
  });
});

describe('what a guest picked', () => {
  it('keeps valid ids, drops repeats and junk', () => {
    expect(normalizePicks([
      { widget: 'mc1', option: 'a' }, { widget: 'mc1', option: 'a' }, { widget: 'mc1', option: 'b' },
      { widget: '', option: 'x' }, { widget: 'bad id!', option: 'x' }, null, 'str', { widget: 'mc2' }
    ])).toEqual([{ widget: 'mc1', option: 'a' }, { widget: 'mc1', option: 'b' }]);
    expect(normalizePicks('nope')).toEqual([]);
    expect(normalizePicks(undefined)).toEqual([]);
  });

  it('is bounded', () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ widget: 'mc1', option: `o${i}` }));
    expect(normalizePicks(many).length).toBe(50);
  });
});

describe('numbers shown to guests', () => {
  const def = (capacity: number | null) => ({ widget: 'w', option: 'o', label: 'L', capacity, closed: false, waitlist: true });
  it('counts places left and never goes below zero', () => {
    expect(availabilityOf(def(500), 312)).toMatchObject({ capacity: 500, taken: 312, remaining: 188 });
    expect(availabilityOf(def(500), 500).remaining).toBe(0);
    expect(availabilityOf(def(500), 530).remaining).toBe(0); // staff added guests by hand
    expect(availabilityOf(def(null), 12).remaining).toBeNull();
  });
});

describe('who gets the last places', () => {
  const lim = (n: number, waitlist = true, option = 'o') => ({ widget: 'w', option, label: option, capacity: n, closed: false, waitlist });
  it('takes everyone while there is room', () => {
    expect(decidePlaces([lim(5)], () => 4, false)).toMatchObject({ ok: true, waitlisted: false });
  });
  it('turns the guest away when full and they did not ask for the waitlist', () => {
    expect(decidePlaces([lim(5)], () => 5, false)).toMatchObject({ ok: false });
  });
  it('waitlists the guest when full and they asked for it', () => {
    const d: any = decidePlaces([lim(5)], () => 5, true);
    expect(d).toMatchObject({ ok: true, waitlisted: true });
    expect(d.full.length).toBe(1);
  });
  it('never waitlists a block that has no waitlist', () => {
    expect(decidePlaces([lim(5, false)], () => 5, true)).toMatchObject({ ok: false });
  });
  it('one full option among several decides for the whole registration', () => {
    const taken = (d: any) => (d.option === 'b' ? 5 : 1);
    expect(decidePlaces([lim(5, true, 'a'), lim(5, true, 'b')], taken, false)).toMatchObject({ ok: false });
    expect(decidePlaces([lim(5, true, 'a'), lim(5, true, 'b')], taken, true)).toMatchObject({ ok: true, waitlisted: true });
  });
  it('a guest who asks for the waitlist when places have opened simply gets one', () => {
    expect(decidePlaces([lim(5)], () => 2, true)).toMatchObject({ ok: true, waitlisted: false });
  });
  it('a limit of zero is full from the start', () => {
    expect(decidePlaces([lim(0)], () => 0, false)).toMatchObject({ ok: false });
  });
});

describe('matching older entries to options by label', () => {
  const defs = [
    { widget: 'w1', option: 'a', label: 'DNA NIGHT 2026', capacity: null, closed: false, waitlist: true },
    { widget: 'w1', option: 'b', label: 'After Party', capacity: null, closed: false, waitlist: true },
    { widget: 'w2', option: 'c', label: 'Shared', capacity: null, closed: false, waitlist: true },
    { widget: 'w3', option: 'd', label: 'shared', capacity: null, closed: false, waitlist: true }
  ];
  it('matches the labels printed on the pass, ignoring case and spaces', () => {
    expect(picksFromLabels([{ label: ' dna night 2026 ' }, { label: 'AFTER PARTY' }], defs)).toEqual([{ widget: 'w1', option: 'a' }, { widget: 'w1', option: 'b' }]);
    expect(picksFromLabels(['After Party'], defs)).toEqual([{ widget: 'w1', option: 'b' }]);
  });
  it('skips a label that fits two options, and one that fits none', () => {
    expect(picksFromLabels([{ label: 'Shared' }, { label: 'Something else' }], defs)).toEqual([]);
  });
  it('copes with a non-list', () => {
    expect(picksFromLabels(null, defs)).toEqual([]);
    expect(picksFromLabels('x', defs)).toEqual([]);
  });
});
